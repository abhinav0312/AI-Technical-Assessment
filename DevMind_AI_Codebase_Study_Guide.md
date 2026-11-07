# DevMind AI — Codebase & Technical Architecture Study Guide

> **Generated**: November 2026  
> **PDF Version**: [DevMind_AI_Codebase_Study_Guide.pdf](file:///c:/Users/abhin/OneDrive/Desktop/Technical%20Assessment-/DevMind_AI_Codebase_Study_Guide.pdf)  
> **HTML Version**: [DevMind_AI_Codebase_Study_Guide.html](file:///c:/Users/abhin/OneDrive/Desktop/Technical%20Assessment-/DevMind_AI_Codebase_Study_Guide.html)  

---

## 1. Executive Overview

**DevMind AI** is an intelligent technical assessment platform built for developers, students, and hiring teams. Rather than relying on simple multiple-choice quizzes, DevMind AI pairs **real-time sandboxed code execution** with **ThinkTrace AI** (cognitive reasoning and algorithmic audit) and an interactive **SkillGraph** (competency DAG).

### The 3 Core Pillars:
1. **Coding Arena**: Interactive problem solving in Python and TypeScript with live test-runner feedback.
2. **BugHunter**: Real-world incident reproduction and root-cause debugging with streak tracking.
3. **Skill Progress (SkillGraph)**: Visual competence graph that unlocks as verified problem-solving evidence is recorded.

---

## 2. Languages & Tech Stack

| Domain | Language / Engine | Frameworks & Libraries | Role in Application |
| :--- | :--- | :--- | :--- |
| **Frontend** | **TypeScript 5.7** / JavaScript | React 18.3, Vite 6, Tailwind CSS 3.4, Lucide React, Recharts | Single Page Application (SPA), responsive UI, interactive SVG canvas. |
| **Code Editor** | **Monaco Editor** | `@monaco-editor/react` (VS Code core) | In-browser IDE with syntax highlighting, auto-complete, and indentation. |
| **Backend API**| **Python 3.12+** | FastAPI 0.115, Uvicorn 0.34, Pydantic v2.10 | High-performance async REST API, validation, rate limiting, and dependency injection. |
| **Database** | **SQL (SQLite 3)** | SQLAlchemy 2.0 (async), `aiosqlite`, Alembic | Relational storage (`devmind.db`) with WAL journal mode. |
| **Security** | **Argon2id** & HMAC-SHA256 | `argon2-cffi` 23.1, `pyjwt` 2.10 | Memory-hard cryptographic password hashing & stateless JWT auth tokens. |
| **Sandboxes** | Python 3 & Node.js | Subprocess runner, AST parser, comparator | Isolated test-suite execution with 5-second timeouts and memory limits. |

---

## 3. Architecture & Directory Map

```text
DevMind-AI/
├── backend/                             # FastAPI Backend Application
│   ├── app/
│   │   ├── api/                         # API Layer
│   │   │   ├── v1/endpoints/            # Endpoints: auth, challenges, bughunter, skillgraph, thinktrace, submissions
│   │   │   └── dependencies.py          # Session injection, get_current_user, require_role
│   │   ├── core/                        # Core configuration: config.py, security.py (Argon2), rate_limiter.py
│   │   ├── db/                          # Database connection (database.py) & seeds (init_db.py)
│   │   ├── models/                      # SQLAlchemy ORM Entities (User, Challenge, Submission, etc.)
│   │   ├── repositories/                # Data Access Layer (challenge_repo, submission_repo, user_repo, etc.)
│   │   ├── schemas/                     # Pydantic input/output validation models & DTOs
│   │   ├── services/                    # Business Logic:
│   │   │   ├── evaluator/               # Subprocess code sandbox runner, queue, and output comparator
│   │   │   ├── thinktrace/              # Multi-dimensional cognitive AI auditor
│   │   │   ├── bughunter/               # Bug incident reproduction engine
│   │   │   └── skillgraph/              # Skill DAG traversal & competency calculation
│   │   └── main.py                      # FastAPI app entry point & CORS configuration
│   ├── devmind.db                       # Active SQLite database file
│   └── requirements.txt                 # Backend Python dependencies
│
├── frontend/                            # React + TypeScript Frontend Application
│   ├── src/
│   │   ├── components/layout/           # Navbar.tsx, Sidebar.tsx, AppShell.tsx, Footer.tsx
│   │   ├── components/ui/               # Button, Card, Badge, Input, GoogleIcon
│   │   ├── features/                    # Feature modules:
│   │   │   ├── auth/                    # AuthContext.tsx (user state, JWT storage, login/logout)
│   │   │   ├── skillgraph/              # SkillGraphCanvas.tsx (SVG graph), SkillDetailPanel.tsx
│   │   │   └── thinktrace/              # ThinkTracePanel.tsx, ThinkTraceReportModal.tsx
│   │   ├── pages/                       # Route views:
│   │   │   ├── LandingPage.tsx          # Spacious SaaS landing page
│   │   │   ├── CodingArena.tsx          # Code editor + problem specs + test execution console
│   │   │   ├── BugHunterPage.tsx        # Bug challenges list & streak overview
│   │   │   ├── BugHunterArena.tsx       # Bug reproduction workspace & stack trace viewer
│   │   │   ├── SkillGraphPage.tsx       # Interactive skill competency map
│   │   │   ├── SubmissionsPage.tsx      # Submission telemetry & historical audit inspector
│   │   │   ├── DashboardOverview.tsx    # Developer metrics, recommended challenge, skill snapshot
│   │   │   ├── SettingsPage.tsx         # Account preferences & security options
│   │   │   └── LoginPage.tsx / RegisterPage.tsx # Auth screens with quick-demo credentials
│   │   ├── lib/api-client.ts            # Authenticated fetch wrapper (auto JWT headers)
│   │   └── types/                       # TypeScript interfaces (Challenge, Submission, User, etc.)
│   ├── tailwind.config.js               # Theme configuration (Warm Indigo, Emerald, Amber, Rose, Pearl)
│   └── package.json                     # Frontend dependencies & build scripts
```

---

## 4. Database Models & Repositories ("Depositries")

The backend uses the **Repository Pattern** to cleanly separate database SQL operations from API route handlers:

### Core Database Models (`backend/app/models/`):
* **`User` (`user.py`)**: Stores user credentials with Argon2id password hash, role (`candidate`, `creator`, `recruiter`, `admin`), and timestamps.
* **`Challenge` (`challenge.py`)**: Stores title, slug, description, difficulty (`easy`, `medium`, `hard`), category, and starter code.
* **`TestCase` (`test_case.py`)**: Input data and expected output pairs. Differentiates between sample visible tests and hidden edge-case tests.
* **`Submission` (`submission.py`)**: Stores user code, language, status (`accepted`, `wrong_answer`, etc.), score, passed test count, and runtime in milliseconds.
* **`ThinkTraceReport` (`thinktrace.py`)**: Stores AI audit scores across time complexity, space complexity, maintainability, and edge-case handling.
* **`BugHunterChallenge` (`bughunter.py`)**: Real-world buggy code snippets, error traces, and reproduction test suites.
* **`SkillNode` & `SkillEdge` (`skillgraph.py`)**: Nodes and prerequisite dependency edges forming the competency DAG.
* **`CodeDraft` (`code_draft.py`)**: Saves in-progress candidate editor code per challenge to prevent data loss.

### Repositories (`backend/app/repositories/`):
* `challenge_repo.py`: Queries challenges with keyword search, difficulty, topic filters, and pagination.
* `submission_repo.py`: Inserts execution records and queries user submission history.
* `user_repo.py`: User retrieval, registration, and Argon2 credential verification.
* `thinktrace_repo.py`: Persists and retrieves cognitive evaluation reports.
* `activity_repo.py`: Event logging for solved challenges, earned badges, and streaks.

---

## 5. REST API Reference

All endpoints are hosted at `http://127.0.0.1:8000/api/v1`:

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/auth/register` | Create a new user account with role selection | Public |
| `POST` | `/auth/login` | Authenticate with email/password and obtain JWT token | Public |
| `POST` | `/auth/google` | Quick-demo or OAuth sign-in | Public |
| `GET` | `/auth/me` | Fetch active user profile and role | Bearer JWT |
| `GET` | `/challenges` | List challenges with pagination, keyword search, difficulty filters | Public |
| `GET` | `/challenges/{slug}` | Get full problem specs, test cases, and starter code | Public |
| `POST` | `/challenges/{id}/run-tests` | Run candidate code against sample test cases in sandbox | Bearer JWT |
| `POST` | `/challenges/{id}/submit` | Complete evaluation against all test cases + generate ThinkTrace | Bearer JWT |
| `GET` | `/submissions` | Retrieve user submission history with pass ratios and execution times | Bearer JWT |
| `GET` | `/bughunter/challenges` | List available debugging scenarios and severity levels | Public |
| `POST` | `/bughunter/challenges/{id}/submit` | Verify bug fix by executing reproduction suite | Bearer JWT |
| `GET` | `/bughunter/streak` | Retrieve daily debugging streak and earned badges | Bearer JWT |
| `GET` | `/skillgraph` | Retrieve full skill taxonomy nodes, prerequisite edges, and mastery % | Bearer JWT |
| `GET` | `/skillgraph/skills/{slug}` | Inspect specific skill node history, evidence, and related challenges | Bearer JWT |
| `GET` | `/thinktrace/reports/{sub_id}` | Retrieve AI cognitive feedback and rubric breakdown | Bearer JWT |

---

## 6. How to Run the Platform

### Start Backend API Server:
```powershell
cd "backend"
.\venv\Scripts\uvicorn.exe app.main:app --host 127.0.0.1 --port 8000
# Backend running at: http://127.0.0.1:8000
# Interactive Swagger Docs: http://127.0.0.1:8000/docs
```

### Start Frontend Client:
```powershell
cd "frontend"
npm run dev
# Frontend running at: http://localhost:3000
```

### Default Demo Credentials:
* **Email**: `candidate@devmind.ai`
* **Password**: `Password123!`
