import os
import subprocess

html_content = """<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>DevMind AI - Codebase Study Guide & Technical Architecture</title>
  <style>
    @page {
      size: A4;
      margin: 14mm 12mm 14mm 12mm;
    }
    *, *::before, *::after {
      box-sizing: border-box;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      color: #0f172a;
      background: #ffffff;
      line-height: 1.45;
      font-size: 11pt;
      margin: 0;
      padding: 0;
    }
    .header-banner {
      border-bottom: 2px solid #4f46e5;
      padding-bottom: 12px;
      margin-bottom: 18px;
    }
    .badge {
      display: inline-block;
      font-size: 8.5pt;
      font-weight: 700;
      padding: 2px 8px;
      border-radius: 9999px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .badge-primary { background: #eef2ff; color: #4338ca; border: 1px solid #c7d2fe; }
    .badge-emerald { background: #ecfdf5; color: #047857; border: 1px solid #a7f3d0; }
    .badge-amber { background: #fffbeb; color: #b45309; border: 1px solid #fde68a; }
    .badge-rose { background: #fff1f2; color: #be123c; border: 1px solid #fecdd3; }
    .badge-slate { background: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; }

    h1 {
      font-size: 20pt;
      font-weight: 800;
      color: #0f172a;
      margin: 6px 0 4px 0;
      letter-spacing: -0.02em;
    }
    .subtitle {
      font-size: 10.5pt;
      color: #475569;
      margin: 0;
    }
    h2 {
      font-size: 13pt;
      font-weight: 700;
      color: #1e1b4b;
      border-left: 4px solid #4f46e5;
      padding-left: 8px;
      margin: 18px 0 8px 0;
      page-break-after: avoid;
    }
    h3 {
      font-size: 11pt;
      font-weight: 700;
      color: #334155;
      margin: 12px 0 4px 0;
      page-break-after: avoid;
    }
    p {
      margin: 0 0 8px 0;
      color: #334155;
      font-size: 10pt;
    }
    ul {
      margin: 4px 0 10px 18px;
      padding: 0;
      font-size: 10pt;
      color: #334155;
    }
    li {
      margin-bottom: 3px;
    }
    .grid-2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
      margin-bottom: 12px;
    }
    .card {
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 10px 12px;
      background: #fafafc;
      page-break-inside: avoid;
    }
    .card-title {
      font-weight: 700;
      font-size: 10.5pt;
      color: #0f172a;
      margin-bottom: 4px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 8px 0 14px 0;
      font-size: 9pt;
      page-break-inside: avoid;
    }
    th {
      background: #f8fafc;
      color: #475569;
      font-weight: 700;
      text-transform: uppercase;
      font-size: 8pt;
      letter-spacing: 0.04em;
      border-bottom: 2px solid #e2e8f0;
      padding: 6px 8px;
      text-align: left;
    }
    td {
      padding: 6px 8px;
      border-bottom: 1px solid #f1f5f9;
      color: #1e293b;
      vertical-align: top;
    }
    tr:nth-child(even) td {
      background: #fafafc;
    }
    code, pre {
      font-family: "SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace;
      font-size: 8.5pt;
      background: #f1f5f9;
      padding: 1px 4px;
      border-radius: 4px;
      color: #0f172a;
    }
    .endpoint-method {
      display: inline-block;
      font-weight: 800;
      font-size: 7.5pt;
      padding: 2px 5px;
      border-radius: 4px;
      font-family: monospace;
    }
    .get { background: #ecfdf5; color: #047857; border: 1px solid #a7f3d0; }
    .post { background: #eef2ff; color: #4338ca; border: 1px solid #c7d2fe; }
    .put { background: #fffbeb; color: #b45309; border: 1px solid #fde68a; }
    .delete { background: #fff1f2; color: #be123c; border: 1px solid #fecdd3; }

    .callout {
      background: #f0fdf4;
      border-left: 3px solid #10b981;
      padding: 8px 12px;
      border-radius: 0 6px 6px 0;
      margin: 10px 0;
      font-size: 9.5pt;
    }
    .callout-title {
      font-weight: 700;
      color: #065f46;
      margin-bottom: 2px;
    }
    .page-break {
      page-break-before: always;
    }
    .tag-pill {
      font-size: 7.5pt;
      background: #e2e8f0;
      color: #334155;
      padding: 1px 5px;
      border-radius: 3px;
      display: inline-block;
      margin-right: 2px;
    }
    .footer-meta {
      margin-top: 18px;
      border-top: 1px solid #e2e8f0;
      padding-top: 8px;
      font-size: 8pt;
      color: #94a3b8;
      display: flex;
      justify-content: space-between;
    }
  </style>
</head>
<body>

  <!-- ================= PAGE 1 ================= -->
  <div class="header-banner">
    <div style="display: flex; justify-content: space-between; align-items: center;">
      <span class="badge badge-primary">Technical Architecture & Study Guide</span>
      <span style="font-size: 8.5pt; color: #64748b; font-family: monospace;">DevMind AI v1.0.0</span>
    </div>
    <h1>DevMind AI — Codebase & System Study Guide</h1>
    <p class="subtitle">Complete technical reference of languages, REST APIs, repositories, database models, sandbox evaluators, and architecture.</p>
  </div>

  <h2>1. Executive Summary & Purpose</h2>
  <p>
    <strong>DevMind AI</strong> is an intelligent engineering assessment platform. Unlike traditional multiple-choice or simple LeetCode clones, DevMind AI pairs real-time sandboxed code execution with <strong>ThinkTrace AI</strong> (deep algorithmic reasoning audit) and an interactive <strong>SkillGraph</strong> (DAG competency map).
  </p>
  
  <div class="grid-2">
    <div class="card">
      <div class="card-title"><span>Core Value Pillars</span> <span class="badge badge-emerald">Active</span></div>
      <ul>
        <li><strong>Live Coding Arena:</strong> Real-time code execution in Python & TypeScript with test cases.</li>
        <li><strong>BugHunter:</strong> Debug broken real-world services, fix root causes, and build daily streaks.</li>
        <li><strong>SkillGraph:</strong> Directed Acyclic Graph (DAG) visualizing verified competencies.</li>
        <li><strong>ThinkTrace:</strong> Multi-dimensional reasoning audit (Complexity, Correctness, Maintainability).</li>
      </ul>
    </div>
    <div class="card">
      <div class="card-title"><span>System Topology</span> <span class="badge badge-primary">SPA + REST</span></div>
      <ul>
        <li><strong>Frontend Client:</strong> React 18 SPA served via Vite on port <code>3000</code>.</li>
        <li><strong>Backend API:</strong> FastAPI ASGI application served via Uvicorn on port <code>8000</code>.</li>
        <li><strong>Database Layer:</strong> SQLite 3 (<code>devmind.db</code>) with WAL journal mode.</li>
        <li><strong>Execution Sandboxes:</strong> Subprocess isolation with strict timeouts and memory constraints.</li>
      </ul>
    </div>
  </div>

  <h2>2. Languages & Technology Stack</h2>
  <table>
    <thead>
      <tr>
        <th style="width: 18%;">Domain</th>
        <th style="width: 28%;">Primary Language / Engine</th>
        <th style="width: 28%;">Frameworks & Libraries</th>
        <th style="width: 26%;">Key Role</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>Frontend</strong></td>
        <td><strong>TypeScript 5.7</strong><br>JavaScript (ESNext)</td>
        <td>React 18.3, Vite 6, Tailwind CSS 3.4, Lucide React, Monaco Editor</td>
        <td>Single Page Application (SPA), interactive SVG graphs, responsive UI.</td>
      </tr>
      <tr>
        <td><strong>Code Editor</strong></td>
        <td><strong>Monaco Editor</strong> (VS Code core)</td>
        <td><code>@monaco-editor/react</code></td>
        <td>In-browser IDE with syntax highlighting, IntelliSense, and keyboard shortcuts.</td>
      </tr>
      <tr>
        <td><strong>Backend API</strong></td>
        <td><strong>Python 3.12+</strong></td>
        <td>FastAPI 0.115, Uvicorn 0.34, Pydantic v2.10</td>
        <td>Async REST API, data validation, rate limiting, and dependency injection.</td>
      </tr>
      <tr>
        <td><strong>Database & ORM</strong></td>
        <td><strong>SQL</strong> (SQLite 3 dialect)</td>
        <td>SQLAlchemy 2.0 (asyncio), <code>aiosqlite</code>, Alembic 1.14</td>
        <td>Relational database, entity relationships, query abstractions.</td>
      </tr>
      <tr>
        <td><strong>Security & Auth</strong></td>
        <td><strong>Argon2id</strong> & HMAC-SHA256</td>
        <td><code>argon2-cffi</code> 23.1, <code>pyjwt</code> 2.10</td>
        <td>Memory-hard cryptographic password hashing and Stateless JWT auth.</td>
      </tr>
      <tr>
        <td><strong>Execution Sandboxes</strong></td>
        <td>Python 3 & Node.js / ts-node</td>
        <td>Python <code>subprocess</code>, AST parser, Comparator</td>
        <td>Safely executes candidate code against sample and hidden edge test suites.</td>
      </tr>
    </tbody>
  </table>

  <h2>3. High-Level Architecture & Directory Structure</h2>
  <div class="card" style="margin-bottom: 12px;">
    <div style="font-family: monospace; font-size: 8pt; line-height: 1.35; color: #1e293b;">
      <strong>DevMind-AI/</strong><br>
      ├── <strong>backend/</strong> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<em>(FastAPI Backend Application)</em><br>
      │&nbsp;&nbsp; ├── <strong>app/</strong><br>
      │&nbsp;&nbsp; │&nbsp;&nbsp; ├── <strong>api/</strong> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<em>(REST Router & Endpoints)</em><br>
      │&nbsp;&nbsp; │&nbsp;&nbsp; │&nbsp;&nbsp; ├── <strong>v1/endpoints/</strong> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<em>(auth.py, challenges.py, bughunter.py, skillgraph.py, thinktrace.py, submissions.py)</em><br>
      │&nbsp;&nbsp; │&nbsp;&nbsp; │&nbsp;&nbsp; └── dependencies.py &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<em>(get_current_user, get_db, require_role)</em><br>
      │&nbsp;&nbsp; │&nbsp;&nbsp; ├── <strong>core/</strong> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<em>(Security, JWT, rate_limiter.py, config.py)</em><br>
      │&nbsp;&nbsp; │&nbsp;&nbsp; ├── <strong>db/</strong> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<em>(database.py, init_db.py, SQLite connection setup)</em><br>
      │&nbsp;&nbsp; │&nbsp;&nbsp; ├── <strong>models/</strong> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<em>(SQLAlchemy ORM Entities: User, Challenge, Submission, TestCase, ThinkTrace)</em><br>
      │&nbsp;&nbsp; │&nbsp;&nbsp; ├── <strong>repositories/</strong> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<em>(Data Access Layer: challenge_repo, submission_repo, user_repo, thinktrace_repo)</em><br>
      │&nbsp;&nbsp; │&nbsp;&nbsp; ├── <strong>schemas/</strong> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<em>(Pydantic input/output schemas & DTOs)</em><br>
      │&nbsp;&nbsp; │&nbsp;&nbsp; ├── <strong>services/</strong> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<em>(evaluator/ [sandbox runner], thinktrace/ [AI auditor], bughunter/, skillgraph/)</em><br>
      │&nbsp;&nbsp; │&nbsp;&nbsp; └── main.py &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<em>(FastAPI app factory, CORS middleware, global exception handlers)</em><br>
      │&nbsp;&nbsp; ├── devmind.db &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<em>(SQLite Database file with seeded problems & users)</em><br>
      │&nbsp;&nbsp; └── requirements.txt &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<em>(Python backend package dependencies)</em><br>
      ├── <strong>frontend/</strong> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<em>(Vite + React + TypeScript SPA)</em><br>
      │&nbsp;&nbsp; ├── <strong>src/</strong><br>
      │&nbsp;&nbsp; │&nbsp;&nbsp; ├── <strong>components/layout/</strong> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<em>(Navbar.tsx, Sidebar.tsx, AppShell.tsx, Footer.tsx)</em><br>
      │&nbsp;&nbsp; │&nbsp;&nbsp; ├── <strong>components/ui/</strong> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<em>(Button, Card, Badge, Input, GoogleIcon)</em><br>
      │&nbsp;&nbsp; │&nbsp;&nbsp; ├── <strong>features/</strong> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<em>(auth/ [AuthContext.tsx], skillgraph/ [Canvas & Detail], thinktrace/ [Modal & Panel])</em><br>
      │&nbsp;&nbsp; │&nbsp;&nbsp; ├── <strong>pages/</strong> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<em>(LandingPage, CodingArena, BugHunterPage, SkillGraphPage, SubmissionsPage, Settings)</em><br>
      │&nbsp;&nbsp; │&nbsp;&nbsp; ├── <strong>lib/</strong> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<em>(api-client.ts - authenticated fetch client with token interceptors)</em><br>
      │&nbsp;&nbsp; │&nbsp;&nbsp; └── <strong>types/</strong> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<em>(TypeScript interfaces for Challenge, Submission, SkillGraph, ThinkTrace, User)</em><br>
      │&nbsp;&nbsp; ├── tailwind.config.js &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<em>(Custom design system colors: Indigo, Emerald, Amber, Rose, Pearl Off-White)</em><br>
      │&nbsp;&nbsp; └── package.json &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<em>(Frontend NPM dependencies & build scripts)</em>
    </div>
  </div>

  <!-- ================= PAGE 2 ================= -->
  <div class="page-break"></div>

  <h2>4. Database Architecture & Repositories ("Depositries")</h2>
  <p>The persistence layer implements the <strong>Repository Pattern</strong>, decoupling the FastAPI endpoints from SQLAlchemy queries.</p>

  <h3>A. Key Database Models (SQLAlchemy ORM)</h3>
  <table>
    <thead>
      <tr>
        <th style="width: 20%;">Model / Table</th>
        <th style="width: 32%;">Key Attributes / Columns</th>
        <th style="width: 48%;">Purpose & Relationships</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><code>User</code><br><code>(users)</code></td>
        <td><code>id, email, hashed_password, display_name, role, created_at</code></td>
        <td>System actors. <code>role</code> is an enum: <code>candidate</code>, <code>creator</code>, <code>recruiter</code>, <code>admin</code>. Has many Submissions & Bookmarks.</td>
      </tr>
      <tr>
        <td><code>Challenge</code><br><code>(challenges)</code></td>
        <td><code>id, slug, title, description, difficulty, category, initial_code, time_limit_ms, memory_limit_mb</code></td>
        <td>Coding problem specification. Categorized by <em>Algorithms</em>, <em>System Design</em>, <em>Concurrency</em>, <em>Data Structures</em>. Has many TestCases.</td>
      </tr>
      <tr>
        <td><code>TestCase</code><br><code>(test_cases)</code></td>
        <td><code>id, challenge_id, input_data, expected_output, is_sample, is_hidden</code></td>
        <td>Input/output pairs. <code>is_sample=True</code> are visible in the Arena; hidden cases prevent hardcoded submissions.</td>
      </tr>
      <tr>
        <td><code>Submission</code><br><code>(submissions)</code></td>
        <td><code>id, user_id, challenge_id, language, source_code, status, score, passed_tests, total_tests, execution_time_ms</code></td>
        <td>Candidate solution execution record. <code>status</code>: <code>accepted</code>, <code>wrong_answer</code>, <code>time_limit_exceeded</code>, <code>runtime_error</code>.</td>
      </tr>
      <tr>
        <td><code>ThinkTraceReport</code><br><code>(thinktrace_reports)</code></td>
        <td><code>id, submission_id, score, reasoning_score, complexity_score, ai_feedback, rubric_breakdown</code></td>
        <td>Automated cognitive audit evaluating candidate's algorithmic complexity, edge case handling, and code clean-ness.</td>
      </tr>
      <tr>
        <td><code>BugHunterChallenge</code><br><code>(bughunter_challenges)</code></td>
        <td><code>id, slug, title, symptom, broken_code, stack_trace, fixed_code, difficulty, domain</code></td>
        <td>Real-world bug reproduction challenges. Candidates must isolate the defect and make failing test suites pass.</td>
      </tr>
      <tr>
        <td><code>SkillNode</code> & <code>Edge</code><br><code>(skill_graph)</code></td>
        <td><code>slug, name, domain, tier, mastery_level, proficiency, prerequisites</code></td>
        <td>Directed Acyclic Graph (DAG) for tracking technical mastery (<em>Mastered</em>, <em>Proficient</em>, <em>Developing</em>, <em>Unassessed</em>).</td>
      </tr>
      <tr>
        <td><code>CodeDraft</code><br><code>(code_drafts)</code></td>
        <td><code>user_id, challenge_id, code, language, updated_at</code></td>
        <td>Auto-saves candidate work-in-progress code in the Monaco Editor to prevent data loss.</td>
      </tr>
    </tbody>
  </table>

  <h3>B. Repositories Layer (Data Access Layer)</h3>
  <ul>
    <li><code>user_repo.py</code>: Manages user creation, Argon2 password verification, email uniqueness lookups, and profile queries.</li>
    <li><code>challenge_repo.py</code>: Handles challenge pagination, filtering by difficulty/topic/tag, search query matching, and draft retrieval.</li>
    <li><code>submission_repo.py</code>: Inserts test telemetry, computes pass ratios, updates leaderboard stats, and retrieves user history.</li>
    <li><code>thinktrace_repo.py</code>: Persists AI telemetry audits, rubric scores, and code comprehension breakdown per submission.</li>
    <li><code>activity_repo.py</code>: Tracks timestamped candidate events (solving problems, debugging incidents, earning badges).</li>
  </ul>

  <h2>5. Comprehensive REST API Reference</h2>
  <p>All endpoints are prefixed with <code>/api/v1</code>. Protected routes require the <code>Authorization: Bearer &lt;JWT&gt;</code> header.</p>

  <table>
    <thead>
      <tr>
        <th style="width: 10%;">Method</th>
        <th style="width: 32%;">Endpoint</th>
        <th style="width: 38%;">Functionality & Payload</th>
        <th style="width: 20%;">Auth Required</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><span class="endpoint-method post">POST</span></td>
        <td><code>/auth/register</code></td>
        <td>Register candidate/creator with Argon2id encrypted password.</td>
        <td><span class="badge badge-slate">Public</span></td>
      </tr>
      <tr>
        <td><span class="endpoint-method post">POST</span></td>
        <td><code>/auth/login</code></td>
        <td>Validate credentials and issue stateless JWT token.</td>
        <td><span class="badge badge-slate">Public</span></td>
      </tr>
      <tr>
        <td><span class="endpoint-method post">POST</span></td>
        <td><code>/auth/google</code></td>
        <td>One-click Google OAuth authentication with role selection.</td>
        <td><span class="badge badge-slate">Public</span></td>
      </tr>
      <tr>
        <td><span class="endpoint-method get">GET</span></td>
        <td><code>/auth/me</code></td>
        <td>Return active session user profile, role, and permissions.</td>
        <td><span class="badge badge-primary">JWT Token</span></td>
      </tr>
      <tr>
        <td><span class="endpoint-method get">GET</span></td>
        <td><code>/challenges</code></td>
        <td>List challenges with pagination, keyword search, difficulty, and topic filters.</td>
        <td><span class="badge badge-slate">Public</span></td>
      </tr>
      <tr>
        <td><span class="endpoint-method get">GET</span></td>
        <td><code>/challenges/{slug}</code></td>
        <td>Get challenge specs, sample inputs, constraints, and starter boilerplate.</td>
        <td><span class="badge badge-slate">Public</span></td>
      </tr>
      <tr>
        <td><span class="endpoint-method post">POST</span></td>
        <td><code>/challenges/{id}/run-tests</code></td>
        <td>Execute candidate code in sandbox against sample test cases (Fast feedback).</td>
        <td><span class="badge badge-primary">JWT Token</span></td>
      </tr>
      <tr>
        <td><span class="endpoint-method post">POST</span></td>
        <td><code>/challenges/{id}/submit</code></td>
        <td>Final submission evaluated against all test cases + generates ThinkTrace report.</td>
        <td><span class="badge badge-primary">JWT Token</span></td>
      </tr>
      <tr>
        <td><span class="endpoint-method get">GET</span></td>
        <td><code>/submissions</code></td>
        <td>Retrieve user's historical submissions with pagination and execution metrics.</td>
        <td><span class="badge badge-primary">JWT Token</span></td>
      </tr>
      <tr>
        <td><span class="endpoint-method get">GET</span></td>
        <td><code>/bughunter/challenges</code></td>
        <td>List real-world incident reproduction bugs, categories, and severity tiers.</td>
        <td><span class="badge badge-slate">Public</span></td>
      </tr>
      <tr>
        <td><span class="endpoint-method post">POST</span></td>
        <td><code>/bughunter/challenges/{id}/submit</code></td>
        <td>Verify candidate bug fix by running reproduction integration suite.</td>
        <td><span class="badge badge-primary">JWT Token</span></td>
      </tr>
      <tr>
        <td><span class="endpoint-method get">GET</span></td>
        <td><code>/bughunter/streak</code></td>
        <td>Fetch user's current daily debugging streak and earned achievement badges.</td>
        <td><span class="badge badge-primary">JWT Token</span></td>
      </tr>
      <tr>
        <td><span class="endpoint-method get">GET</span></td>
        <td><code>/skillgraph</code></td>
        <td>Returns full taxonomy DAG (nodes, prerequisite edges, mastery percentages).</td>
        <td><span class="badge badge-primary">JWT Token</span></td>
      </tr>
      <tr>
        <td><span class="endpoint-method get">GET</span></td>
        <td><code>/skillgraph/skills/{slug}</code></td>
        <td>Detailed skill node inspection (historical score timeline, related problems).</td>
        <td><span class="badge badge-primary">JWT Token</span></td>
      </tr>
      <tr>
        <td><span class="endpoint-method get">GET</span></td>
        <td><code>/thinktrace/reports/{sub_id}</code></td>
        <td>Fetch detailed AI reasoning audit, rubric bars, and complexity diagnostics.</td>
        <td><span class="badge badge-primary">JWT Token</span></td>
      </tr>
    </tbody>
  </table>

  <!-- ================= PAGE 3 ================= -->
  <div class="page-break"></div>

  <h2>6. Key Technical Workflows & Services</h2>

  <div class="card" style="margin-bottom: 12px;">
    <div class="card-title"><span>Workflow 1: Code Execution & Sandbox Engine</span> <span class="badge badge-emerald">Engine</span></div>
    <p>
      Located in <code>backend/app/services/evaluator/</code>. When a user runs tests or submits:
    </p>
    <ol style="margin: 4px 0 6px 18px; font-size: 9.5pt; color: #334155;">
      <li><strong>AST Sanity Check:</strong> The source code is parsed using Python's <code>ast</code> module to check for syntax validity and restrict disallowed modules (e.g., direct socket creation or shell execution).</li>
      <li><strong>Harness Assembly:</strong> The runner dynamically injects standard test runners around the candidate's function.</li>
      <li><strong>Subprocess Isolation:</strong> Executed in a spawned subprocess with <code>timeout=5.0s</code> and capped memory to prevent infinite loops.</li>
      <li><strong>Comparator:</strong> <code>comparator.py</code> strips whitespace and parses JSON/primitive outputs to match expected results.</li>
    </ol>
  </div>

  <div class="card" style="margin-bottom: 12px;">
    <div class="card-title"><span>Workflow 2: ThinkTrace Cognitive Telemetry</span> <span class="badge badge-primary">AI Reasoning</span></div>
    <p>
      Located in <code>backend/app/services/thinktrace/</code>. Evaluates beyond binary pass/fail:
    </p>
    <ul>
      <li><strong>Rubric Dimension 1 (Time Complexity):</strong> Evaluates loop depths and recurrence relations (e.g. O(N) vs O(N²)).</li>
      <li><strong>Rubric Dimension 2 (Space Complexity):</strong> Measures memory allocations, auxiliary structures, and in-place mutation.</li>
      <li><strong>Rubric Dimension 3 (Edge Case Resilience):</strong> Checks boundary states (null values, negative numbers, overflow).</li>
      <li><strong>Actionable Feedback:</strong> Returns concrete recommendations on how the code could be simplified or refactored.</li>
    </ul>
  </div>

  <div class="card" style="margin-bottom: 12px;">
    <div class="card-title"><span>Workflow 3: SkillGraph DAG Competency Engine</span> <span class="badge badge-amber">Competency DAG</span></div>
    <p>
      Located in <code>backend/app/services/skillgraph/</code> and rendered via <code>SkillGraphCanvas.tsx</code>:
    </p>
    <ul>
      <li>Skills are organized hierarchically across 7 core software engineering domains.</li>
      <li>Prerequisite edges enforce logical learning progression (e.g., <em>Hash Tables</em> unlocks <em>Rate Limiter Design</em>).</li>
      <li>A skill transitions from <code>Unassessed</code> → <code>Developing</code> → <code>Proficient</code> → <code>Mastered</code> as validated test evidence accumulates (minimum 3 successful evaluations for mastery).</li>
    </ul>
  </div>

  <h2>7. Design System & Frontend Architecture</h2>
  <div class="grid-2">
    <div class="card">
      <div class="card-title"><span>Visual Identity (Lightly AI Inspired)</span></div>
      <ul>
        <li><strong>Canvas Canvas:</strong> Pearl Off-White (<code>#FAFAFC</code>) and Pure White (<code>#FFFFFF</code>).</li>
        <li><strong>Primary Brand Accent:</strong> Modern Warm Indigo (<code>#4F46E5</code>, <code>#6366F1</code>).</li>
        <li><strong>Status Colors:</strong> Emerald (Success), Amber (Medium/In-Progress), Rose (Error).</li>
        <li><strong>Typography:</strong> Crisp charcoal text (<code>#0F172A</code>) with high readability.</li>
      </ul>
    </div>
    <div class="card">
      <div class="card-title"><span>Pruned & Streamlined Usability</span></div>
      <ul>
        <li><strong>Pruned DevOps Jargon:</strong> Removed complex Kubernetes chaos simulators (DevSim) and cognitive digital twins (CodeTwin).</li>
        <li><strong>3-Pillar Clarity:</strong> Coding Arena + BugHunter + Skill Progress.</li>
        <li><strong>Responsive Layouts:</strong> AppShell layout with collapsable sidebar and breadcrumbs.</li>
      </ul>
    </div>
  </div>

  <h2>8. Quick Start & Developer Guide</h2>
  <div class="callout">
    <div class="callout-title">Default Test Credentials</div>
    User: <code>candidate@devmind.ai</code> | Password: <code>Password123!</code> (Argon2id verified)
  </div>

  <table>
    <thead>
      <tr>
        <th style="width: 25%;">Task</th>
        <th style="width: 50%;">Command / Location</th>
        <th style="width: 25%;">Expected Result</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>Start Backend Server</strong></td>
        <td><code>cd backend && .\\venv\\Scripts\\uvicorn app.main:app --port 8000</code></td>
        <td>FastAPI on <code>http://127.0.0.1:8000</code></td>
      </tr>
      <tr>
        <td><strong>Start Frontend Client</strong></td>
        <td><code>cd frontend && npm run dev</code></td>
        <td>Vite dev server on <code>http://localhost:3000</code></td>
      </tr>
      <tr>
        <td><strong>Production Build</strong></td>
        <td><code>cd frontend && npm run build</code></td>
        <td>Typecheck + Vite production bundle in <code>dist/</code></td>
      </tr>
      <tr>
        <td><strong>Backend Test Suite</strong></td>
        <td><code>cd backend && pytest</code></td>
        <td>Unit & integration tests validation</td>
      </tr>
    </tbody>
  </table>

  <div class="footer-meta">
    <span>DevMind AI Engineering Study Guide & Technical Manual</span>
    <span>Generated November 2026</span>
    <span>Page 3 of 3</span>
  </div>

</body>
</html>
"""

# 1. Write HTML file
html_path = os.path.abspath("DevMind_AI_Codebase_Study_Guide.html")
with open(html_path, "w", encoding="utf-8") as f:
    f.write(html_content)
print(f"Wrote HTML: {html_path}")

# 2. Generate PDF via Chrome headless
pdf_path = os.path.abspath("DevMind_AI_Codebase_Study_Guide.pdf")
chrome_path = r"C:\Program Files\Google\Chrome\Application\chrome.exe"

try:
    cmd = [
        chrome_path,
        "--headless=new",
        "--disable-gpu",
        f"--print-to-pdf={pdf_path}",
        "--no-pdf-header-footer",
        html_path
    ]
    res = subprocess.run(cmd, capture_output=True, text=True, timeout=30)
    if os.path.exists(pdf_path):
        size_kb = os.path.getsize(pdf_path) / 1024
        print(f"SUCCESS: Generated PDF at {pdf_path} ({size_kb:.1f} KB)")
    else:
        print(f"Failed to create PDF. Stderr: {res.stderr}")
except Exception as e:
    print(f"Error running Chrome: {e}")
