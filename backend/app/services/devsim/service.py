import os
import sys
import time
import shutil
import asyncio
import tempfile
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional
from sqlalchemy import select, desc
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.devsim import DevSimScenario, DevSimAttempt, DevSimReport
from app.models.codetwin import Skill, SkillEvidence
from app.services.evaluator.runner import get_sterile_env, MAX_OUTPUT_BYTES
from app.db.base import get_utc_now
from app.core.logging import logger


class DevSimService:
    def _write_workspace_files(self, base_dir: str, files: Dict[str, str]):
        """
        Safely unpacks multi-file project files into the isolated temporary directory.
        Strictly prevents directory traversal attacks.
        """
        base_dir_abs = os.path.abspath(base_dir)
        for rel_path, content in files.items():
            # Security: normalize path and reject traversal attempts
            clean_rel = os.path.normpath(rel_path.strip().lstrip("/\\"))
            if clean_rel.startswith("..") or os.path.isabs(clean_rel):
                continue

            full_path = os.path.abspath(os.path.join(base_dir_abs, clean_rel))
            if not full_path.startswith(base_dir_abs):
                continue

            os.makedirs(os.path.dirname(full_path), exist_ok=True)
            with open(full_path, "w", encoding="utf-8") as f:
                f.write(content)

    async def run_workspace_tests(
        self,
        workspace_files: Dict[str, str],
        entrypoint_command: str = "python -m unittest discover",
        timeout_seconds: float = 6.0,
    ) -> Dict[str, Any]:
        """
        Executes test harness in a sterile, temporary workspace sandbox.
        Captures real terminal output, enforcing process timeouts and memory isolation.
        """
        temp_dir = tempfile.mkdtemp(prefix="devmind_devsim_")
        start_time = time.perf_counter()

        try:
            self._write_workspace_files(temp_dir, workspace_files)
            sterile_env = get_sterile_env(temp_dir)

            # Parse command
            cmd_parts = entrypoint_command.split()
            if cmd_parts and cmd_parts[0] in ("python", "python3"):
                cmd_parts[0] = sys.executable

            proc = await asyncio.create_subprocess_exec(
                *cmd_parts,
                cwd=temp_dir,
                env=sterile_env,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE,
            )

            try:
                stdout_data, stderr_data = await asyncio.wait_for(
                    proc.communicate(),
                    timeout=timeout_seconds,
                )
                is_timed_out = False
                exit_code = proc.returncode or 0
            except asyncio.TimeoutError:
                try:
                    proc.kill()
                    await proc.wait()
                except Exception:
                    pass
                stdout_data = b""
                stderr_data = f"[Execution Error]: Process exceeded timeout limit of {timeout_seconds}s.".encode("utf-8")
                is_timed_out = True
                exit_code = -1

            exec_time_ms = (time.perf_counter() - start_time) * 1000.0

            # Decode and cap bytes
            stdout_str = stdout_data[:MAX_OUTPUT_BYTES].decode("utf-8", errors="replace")
            stderr_str = stderr_data[:MAX_OUTPUT_BYTES].decode("utf-8", errors="replace")

            passed = (exit_code == 0) and not is_timed_out

            return {
                "stdout": stdout_str,
                "stderr": stderr_str,
                "exit_code": exit_code,
                "execution_time_ms": round(exec_time_ms, 2),
                "is_timed_out": is_timed_out,
                "passed": passed,
            }
        finally:
            shutil.rmtree(temp_dir, ignore_errors=True)

    async def evaluate_scenario(
        self,
        scenario: DevSimScenario,
        user_id: str,
        submitted_files: Dict[str, str],
        db: AsyncSession,
    ) -> Dict[str, Any]:
        """
        Evaluates candidate's software engineering submission:
        1. Injects hidden acceptance tests and regression tests into workspace.
        2. Executes test suite inside isolated subprocess.
        3. Parses acceptance criteria results.
        4. Synthesizes advisory AI engineering review referencing specific files/lines.
        5. Saves DevSimAttempt and DevSimReport.
        6. Emits traceable SkillEvidence to CodeTwin.
        """
        # Merge workspace: user edited files + hidden tests
        eval_workspace = dict(submitted_files)
        if scenario.hidden_tests:
            for h_path, h_content in scenario.hidden_tests.items():
                eval_workspace[h_path] = h_content

        # Run test execution
        run_res = await self.run_workspace_tests(
            workspace_files=eval_workspace,
            entrypoint_command=scenario.entrypoint_command,
            timeout_seconds=scenario.timeout_seconds,
        )

        # Parse test metrics from stdout/stderr (Python unittest output)
        combined_output = (run_res["stdout"] + "\n" + run_res["stderr"]).strip()

        # Parse test count from unittest e.g. "Ran 3 tests in 0.002s"
        total_tests = 3
        passed_tests = 3 if run_res["passed"] else 0
        for line in combined_output.splitlines():
            if "Ran " in line and " test" in line:
                try:
                    parts = line.strip().split()
                    total_tests = int(parts[1])
                except Exception:
                    pass

        if run_res["passed"]:
            passed_tests = total_tests
            functional_score = 100.0
            regression_safety = True
        else:
            # Estimate passed from failures/errors count
            fail_count = 1
            if "FAILED (failures=" in combined_output or "FAILED (errors=" in combined_output:
                try:
                    import re
                    match = re.search(r"failures=(\d+)", combined_output)
                    if match:
                        fail_count = int(match.group(1))
                except Exception:
                    pass
            passed_tests = max(0, total_tests - fail_count)
            functional_score = round((passed_tests / total_tests) * 85.0, 1) if total_tests > 0 else 0.0
            regression_safety = False

        # Criteria breakdown
        successful_reqs = []
        major_issues = []
        for i, crit in enumerate(scenario.acceptance_criteria or []):
            if run_res["passed"]:
                successful_reqs.append(crit)
            elif i == 0 and passed_tests > 0:
                successful_reqs.append(crit)
            else:
                major_issues.append(f"Unsatisfied criterion: {crit}")

        # AI Engineering Review (Advisory)
        ai_review = self._build_ai_engineering_review(scenario, submitted_files, run_res["passed"])

        # Persist Attempt and Report
        attempt = DevSimAttempt(
            scenario_id=scenario.id,
            user_id=user_id,
            workspace_files=submitted_files,
            status="evaluated",
            run_count=1,
            started_at=get_utc_now(),
            submitted_at=get_utc_now(),
        )
        db.add(attempt)
        await db.flush()

        report = DevSimReport(
            attempt_id=attempt.id,
            scenario_id=scenario.id,
            user_id=user_id,
            functional_score=functional_score,
            acceptance_tests_passed=passed_tests,
            total_acceptance_tests=total_tests,
            regression_safety_passed=regression_safety,
            execution_time_ms=run_res["execution_time_ms"],
            test_output=combined_output[:8000],
            rubric_scores={
                "functional_correctness": functional_score,
                "regression_safety": 100.0 if regression_safety else 40.0,
                "error_handling": 90.0 if run_res["passed"] else 50.0,
            },
            successful_requirements=successful_reqs,
            major_issues=major_issues,
            ai_review=ai_review,
        )
        db.add(report)
        await db.flush()

        # CodeTwin skill evidence
        target_slug = "rest-api-architecture"
        if "idempotency" in scenario.slug:
            target_slug = "idempotency-and-error-handling"
        elif "log" in scenario.slug:
            target_slug = "root-cause-isolation"

        skill_res = await db.execute(select(Skill).where(Skill.slug == target_slug))
        skill = skill_res.scalar_one_or_none()
        if skill:
            ev = SkillEvidence(
                user_id=user_id,
                skill_id=skill.id,
                source_type="devsim",
                source_id=report.id,
                challenge_title=scenario.title,
                score=functional_score,
                details={
                    "acceptance_passed": passed_tests,
                    "total": total_tests,
                    "functional_score": functional_score,
                },
            )
            db.add(ev)

        await db.commit()
        await db.refresh(report)

        return {
            "id": report.id,
            "attempt_id": attempt.id,
            "scenario_id": scenario.id,
            "scenario_title": scenario.title,
            "scenario_slug": scenario.slug,
            "functional_score": report.functional_score,
            "acceptance_tests_passed": report.acceptance_tests_passed,
            "total_acceptance_tests": report.total_acceptance_tests,
            "regression_safety_passed": report.regression_safety_passed,
            "execution_time_ms": report.execution_time_ms,
            "test_output": report.test_output,
            "rubric_scores": report.rubric_scores,
            "successful_requirements": report.successful_requirements,
            "major_issues": report.major_issues,
            "ai_review": report.ai_review,
            "evaluator_reviewed": report.evaluator_reviewed,
            "evaluator_notes": report.evaluator_notes,
            "evaluator_score_override": report.evaluator_score_override,
            "created_at": report.created_at,
        }

    def _build_ai_engineering_review(
        self,
        scenario: DevSimScenario,
        files: Dict[str, str],
        all_passed: bool,
    ) -> Dict[str, Any]:
        """
        Generates structured advisory AI Engineering Review:
        - Maintainability observations
        - Architectural trade-offs
        - Fragile code flags
        - Specific line/file citations
        """
        observations = []
        tradeoffs = []
        fragile_flags = []
        improvements = []

        # Analyze files
        for fname, content in files.items():
            lines = content.splitlines()

            # Check for comments and docstrings
            if not any(l.strip().startswith("#") or '"""' in l for l in lines):
                observations.append(f"In `{fname}`: Consider adding concise docstrings explaining public interface invariants.")

            # Check for bare exceptions
            for idx, line in enumerate(lines):
                if "except:" in line or "except Exception:" in line and "raise" not in content:
                    fragile_flags.append(
                        f"In `{fname}:L{idx + 1}`: Broad exception catch without re-raise may swallow unexpected system faults."
                    )
                if "time.sleep(" in line:
                    fragile_flags.append(
                        f"In `{fname}:L{idx + 1}`: Synchronous `time.sleep` in request handler blocks the worker thread."
                    )

        if "idempotency" in scenario.slug:
            tradeoffs.append(
                "Idempotency Tracking: Using an in-memory set (`self.processed_events`) offers O(1) checks without network latency, but requires persistent Redis or DB storage in multi-instance horizontal deployments."
            )
            improvements.append("Consider setting a Time-To-Live (TTL) on processed event keys to bound ledger memory growth.")

        if all_passed:
            observations.append("Implementation cleanly satisfies all core acceptance criteria without breaking module boundaries.")
        else:
            observations.append("Test assertions failed on edge or error handling paths; review return payload structure.")

        return {
            "maintainability_observations": observations,
            "tradeoffs_explained": tradeoffs,
            "fragile_code_flags": fragile_flags,
            "improvement_suggestions": improvements,
            "advisory_disclaimer": "AI engineering review observations are advisory and highlight architectural best practices without altering test scores.",
        }


devsim_service = DevSimService()
