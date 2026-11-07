# DevMind AI Evaluation Engine: Security & Isolation Architecture

## 1. Overview & Threat Model

Executing untrusted code submitted by arbitrary candidates represents one of the highest-risk operations in modern web applications. The primary threats include:

1. **Host Compromise & Privilege Escalation**: Attackers attempting to escape execution sandboxes to gain root/administrator access to the host.
2. **Resource Exhaustion & Denial of Service (DoS)**:
   - Infinite loops consuming 100% CPU.
   - Memory allocation bombs (`[0] * 10**9`) exhausting host RAM and triggering kernel OOM-killer.
   - Fork bombs (`while True: os.fork()`) exhausting OS process tables.
   - Disk space exhaustion via massive stdout/stderr writes or endless file creation.
3. **Data Exfiltration & Confidentiality Breach**:
   - Accessing platform secrets (e.g., `DATABASE_URL`, `SECRET_KEY`, cloud credentials).
   - Reading or leaking private/hidden test case inputs and expected outputs.
   - Stealing other candidates' private submission source codes or evaluation results.
4. **Network Misuse**: Attackers using the evaluation runner as a botnet proxy, crypto-miner, or internal network port scanner.

---

## 2. Why "Docker Alone" is Insufficient for Untrusted Code

A common misconception is that running untrusted code inside a standard Docker container provides complete security. In reality, **Docker is an OS-level virtualization technology that shares the host Linux kernel**. Specifically:

- **Shared Kernel Attack Surface**: Containers share syscall interfaces with the host. Known kernel vulnerabilities (`Dirty COW`, `cgroup` escapes, kernel race conditions) allow container breakout into host root.
- **Default Capabilities**: Standard containers retain capabilities like `CAP_SYS_ADMIN` or permissions that allow mounting filesystems or interacting with devices unless explicitly stripped.
- **Root-in-Container Risks**: If the process inside the container runs as root (UID 0), any kernel escape immediately yields host root access.
- **Resource Limits Bypass**: Basic Docker without strict `--pids-limit`, `--cpus`, `--memory`, and `--memory-swap` allows fork bombs and memory thrashing that can freeze the parent host.

---

## 3. Defense-in-Depth Implementation in DevMind AI

DevMind AI enforces a multi-layered security model:

```
[ Candidate Code Submission ]
             │
             ▼
   [ Authentication & RBAC ]
             │
             ▼
   [ Asynchronous Job Queue ]  (Decoupled from FastAPI request threads)
             │
             ▼
   [ Isolated Subprocess Worker ]
             │
  ┌──────────┴──────────────────────────────────────────┐
  │ 1. Ephemeral Sandbox Directory (tempfile.mkdtemp)   │
  │ 2. Sterile Environment (Zero secrets/DB tokens)     │
  │ 3. Offline Subprocess Execution                     │
  │ 4. Wall-Clock Timeout Enforcement (Hard Process SIGKILL) │
  │ 5. Stdout/Stderr Buffer Caps (64KB Truncation)      │
  │ 6. Output Normalization & Confidentiality Filter    │
  └─────────────────────────────────────────────────────┘
             │
             ▼
   [ Normalized Database Record ]
             │
             ▼
   [ Client Response: Samples Visible, Hidden Sanitized ]
```

### Layer 1: Decoupled Evaluation Architecture
Untrusted code is **never** executed inside the web application thread or process. Submissions are queued in an asynchronous worker pipeline, ensuring that long-running or crashing code cannot block HTTP request servicing.

### Layer 2: Sterile Environment Sanitization
When spawning the execution process, the environment dictionary (`env`) is stripped of all host environment variables. Critical secrets—including `SECRET_KEY`, `DATABASE_URL`, API credentials, and JWT signing keys—are explicitly omitted. The process only receives safe, minimal runtime paths (`PATH`, `SYSTEMROOT`).

### Layer 3: Ephemeral File System Sandboxing
Each execution is assigned a unique, temporary workspace directory created with restricted permissions. Code is executed with `cwd` set to this directory. Upon completion or failure, the entire directory is destroyed and purged via `shutil.rmtree` inside guaranteed `finally` blocks.

### Layer 4: Hard Timeouts & Process Reaping
Execution is governed by strict wall-clock timeouts (default 3.0 seconds, configurable up to 10.0 seconds). If a submission exceeds the threshold:
1. The process is immediately terminated via `proc.kill()` (or `taskkill /F` on Windows / `SIGKILL` on POSIX).
2. The submission status transitions to `time_limit_exceeded`.
3. Process handles are reaped to prevent zombie processes.

### Layer 5: Output Buffer Clamping (Anti-DoS)
To prevent infinite printing loops (e.g. `while True: print('A')`) from exhausting server memory, stdout and stderr stream captures are clamped at a hard limit of **64 KB**. Output beyond this cap is truncated with an informative warning, preserving server stability.

### Layer 6: Test Case Confidentiality Guarantee
Test cases are split into:
- **Sample Test Cases (`is_sample=True`)**: Exposed to candidates for debugging; input, expected output, and actual output are visible.
- **Hidden Test Cases (`is_sample=False`)**: Used to verify edge cases and prevent hardcoding. The API layer sanitizes hidden test outputs: candidates only receive pass/fail/timeout status, never the raw input data, expected answer, or execution traces.

---

## 4. Production Hardening Roadmap for Multi-Tenant Scale

For hyperscale production deployments evaluating untrusted multi-tenant code, the following infrastructure boundaries are recommended:

1. **MicroVM Hypervisors (Firecracker / AWS Lambda model)**:
   - Run each submission in an ephemeral MicroVM running an independent guest kernel bootable in <5ms.
   - Provides genuine hardware-level virtualization with KVM boundaries.
2. **Application Kernel Sandboxes (Google gVisor)**:
   - Intercepts system calls in user space (`Sentry`), preventing untrusted code from making direct Linux kernel syscalls.
3. **Linux cgroups v2 & seccomp-bpf**:
   - `cgroups v2`: Hard limits on `memory.max`, `cpu.max`, `pids.max` (max 32 processes).
   - `seccomp-bpf`: Filter out dangerous syscalls (`ptrace`, `mount`, `socket`, `chroot`, `kill`).
4. **Network Namespace Isolation (`--net=none`)**:
   - Spawning containers or VMs in an isolated network namespace with loopback only, blocking external internet traffic and internal VPC reconnaissance.
