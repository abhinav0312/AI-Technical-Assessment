import sys
import os
import time
import asyncio
import tempfile
import shutil
from typing import Optional, Dict
from dataclasses import dataclass
from app.core.logging import logger

MAX_OUTPUT_BYTES = 64 * 1024  # 64 KB limit to prevent output bombs
DEFAULT_TIMEOUT_SECONDS = 3.0
MAX_TIMEOUT_SECONDS = 10.0


@dataclass
class SubprocessResult:
    stdout: str
    stderr: str
    exit_code: int
    execution_time_ms: float
    is_timed_out: bool = False
    is_memory_exceeded: bool = False
    compilation_error: Optional[str] = None


def get_sterile_env(temp_dir: str) -> Dict[str, str]:
    """
    Constructs a minimal, sterile environment dictionary for untrusted subprocess execution.
    Deliberately excludes all server secrets, database URLs, auth keys, and AWS/cloud credentials.
    """
    allowed_keys = {
        "PATH",
        "SYSTEMROOT",
        "COMSPEC",
        "PATHEXT",
        "WINDIR",
        "SYSTEMDRIVE",
        "NODE_PATH",
    }
    sterile = {}
    for k in allowed_keys:
        val = os.environ.get(k)
        if val is not None:
            sterile[k] = val

    # Direct temporary file writes inside the ephemeral execution workspace
    sterile["TEMP"] = temp_dir
    sterile["TMP"] = temp_dir
    sterile["PYTHONDONTWRITEBYTECODE"] = "1"
    sterile["PYTHONUNBUFFERED"] = "1"
    sterile["PYTHONHASHSEED"] = "42"  # Deterministic hash seed
    return sterile


class SubprocessRunner:
    @staticmethod
    async def execute_code(
        language: str,
        source_code: str,
        stdin_data: str = "",
        timeout_seconds: float = DEFAULT_TIMEOUT_SECONDS,
    ) -> SubprocessResult:
        timeout = min(max(0.5, timeout_seconds), MAX_TIMEOUT_SECONDS)
        temp_dir = tempfile.mkdtemp(prefix="devmind_sandbox_")

        try:
            sterile_env = get_sterile_env(temp_dir)
            lang = language.lower()

            if lang == "python":
                file_name = "solution.py"
                cmd = [sys.executable, "-u", file_name]
            elif lang in ("typescript", "javascript", "node"):
                file_name = "solution.js"
                cmd = ["node", file_name]
            else:
                return SubprocessResult(
                    stdout="",
                    stderr=f"Unsupported runtime environment: '{language}'",
                    exit_code=-1,
                    execution_time_ms=0.0,
                    compilation_error=f"Unsupported runtime environment: '{language}'",
                )

            # Write untrusted source code to ephemeral sandbox directory
            file_path = os.path.join(temp_dir, file_name)
            with open(file_path, "w", encoding="utf-8") as f:
                f.write(source_code)

            # Pre-compilation / syntax validation for Python
            if lang == "python":
                try:
                    compile(source_code, file_name, "exec")
                except SyntaxError as syn_err:
                    return SubprocessResult(
                        stdout="",
                        stderr=str(syn_err),
                        exit_code=1,
                        execution_time_ms=0.0,
                        compilation_error=f"SyntaxError on line {syn_err.lineno}: {syn_err.msg}\n{syn_err.text or ''}",
                    )

            # Launch isolated subprocess
            stdin_bytes = stdin_data.encode("utf-8")
            start_time = time.perf_counter()

            try:
                proc = await asyncio.create_subprocess_exec(
                    *cmd,
                    stdin=asyncio.subprocess.PIPE,
                    stdout=asyncio.subprocess.PIPE,
                    stderr=asyncio.subprocess.PIPE,
                    cwd=temp_dir,
                    env=sterile_env,
                )
            except Exception as e:
                logger.error(f"Failed to spawn isolated subprocess: {e}")
                return SubprocessResult(
                    stdout="",
                    stderr=f"Execution launch failed: {e}",
                    exit_code=-1,
                    execution_time_ms=0.0,
                )

            try:
                raw_stdout, raw_stderr = await asyncio.wait_for(
                    proc.communicate(input=stdin_bytes),
                    timeout=timeout,
                )
                duration_ms = (time.perf_counter() - start_time) * 1000.0
                exit_code = proc.returncode or 0

                # Truncate output to avoid memory exhaust
                if len(raw_stdout) > MAX_OUTPUT_BYTES:
                    raw_stdout = raw_stdout[:MAX_OUTPUT_BYTES] + b"\n... [Output truncated: buffer cap exceeded]"
                if len(raw_stderr) > MAX_OUTPUT_BYTES:
                    raw_stderr = raw_stderr[:MAX_OUTPUT_BYTES] + b"\n... [Error log truncated: buffer cap exceeded]"

                stdout_str = raw_stdout.decode("utf-8", errors="replace")
                stderr_str = raw_stderr.decode("utf-8", errors="replace")

                return SubprocessResult(
                    stdout=stdout_str,
                    stderr=stderr_str,
                    exit_code=exit_code,
                    execution_time_ms=round(duration_ms, 2),
                    is_timed_out=False,
                )

            except asyncio.TimeoutError:
                duration_ms = (time.perf_counter() - start_time) * 1000.0
                # Forcefully terminate untrusted process
                try:
                    proc.kill()
                    await asyncio.sleep(0.05)
                except Exception:
                    pass

                return SubprocessResult(
                    stdout="",
                    stderr=f"Execution timed out after {timeout} seconds.",
                    exit_code=-9,
                    execution_time_ms=round(duration_ms, 2),
                    is_timed_out=True,
                )

        finally:
            # Thorough cleanup of ephemeral sandbox directory
            try:
                shutil.rmtree(temp_dir, ignore_errors=True)
            except Exception as clean_err:
                logger.warning(f"Error cleaning sandbox directory {temp_dir}: {clean_err}")
