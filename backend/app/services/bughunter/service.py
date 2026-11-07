from datetime import datetime, timezone, timedelta
from typing import List, Dict, Any, Optional
from sqlalchemy import select, func, desc
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.bughunter import (
    BugHunterChallenge,
    BugHunterSubmission,
    BugHunterStreak,
    BugHunterBadge,
)
from app.models.codetwin import Skill, SkillEvidence
from app.services.evaluator.runner import SubprocessRunner
from app.db.base import get_utc_now


class BugHunterService:
    async def run_permitted_tests(
        self,
        challenge: BugHunterChallenge,
        code: str,
        language: str = "python",
    ) -> Dict[str, Any]:
        """
        Runs permitted (public) reproduction test cases in an isolated subprocess.
        Allows the candidate to reproduce the bug and verify fixes before submitting.
        """
        public_tests = challenge.public_test_cases or []
        results = []
        passed_count = 0
        total_time_ms = 0.0

        for i, tc in enumerate(public_tests):
            stdin = tc.get("stdin", "")
            expected = tc.get("expected_output", "").strip()
            desc_text = tc.get("description", f"Public Case #{i + 1}")

            sub_res = await SubprocessRunner.execute_code(
                language=language,
                source_code=code,
                stdin_data=stdin,
                timeout_seconds=4.0,
            )
            total_time_ms += sub_res.execution_time_ms

            stdout_clean = sub_res.stdout.strip()
            passed = (stdout_clean == expected) and (sub_res.exit_code == 0) and not sub_res.is_timed_out
            if passed:
                passed_count += 1

            results.append({
                "test_index": i + 1,
                "description": desc_text,
                "passed": passed,
                "is_public": True,
                "actual_output": stdout_clean[:1000],
                "expected_output": expected,
                "stderr": sub_res.stderr[:500] if sub_res.stderr else None,
                "execution_time_ms": round(sub_res.execution_time_ms, 2),
                "is_timed_out": sub_res.is_timed_out,
            })

        total = len(public_tests)
        all_passed = (passed_count == total) if total > 0 else True

        return {
            "passed_tests": passed_count,
            "total_tests": total,
            "execution_time_ms": round(total_time_ms, 2),
            "all_passed": all_passed,
            "test_results": results,
        }

    async def evaluate_bug_fix(
        self,
        challenge: BugHunterChallenge,
        user_id: str,
        submitted_code: str,
        language: str = "python",
        identified_root_cause: Optional[str] = None,
        time_spent_seconds: int = 0,
        db: Optional[AsyncSession] = None,
    ) -> Dict[str, Any]:
        """
        Evaluates candidate's debugging fix against the full test suite:
        - Public test cases
        - Hidden regression tests
        - Hidden boundary and edge case tests
        Never leaks hidden expected outputs or sensitive parameters.
        Evaluates root cause identification and updates gamification streak/badges.
        """
        all_test_cases = []
        # Tag public tests
        for i, tc in enumerate(challenge.public_test_cases or []):
            all_test_cases.append({**tc, "is_public": True, "idx": i + 1})

        # Tag hidden tests
        pub_len = len(all_test_cases)
        for i, tc in enumerate(challenge.hidden_test_cases or []):
            all_test_cases.append({**tc, "is_public": False, "idx": pub_len + i + 1})

        results = []
        passed_count = 0
        total_time_ms = 0.0

        regression_total = 0
        regression_passed = 0
        edge_total = 0
        edge_passed = 0

        for tc in all_test_cases:
            stdin = tc.get("stdin", "")
            expected = tc.get("expected_output", "").strip()
            is_regression = tc.get("is_regression", False)
            is_edge = tc.get("is_edge", False)
            is_public = tc.get("is_public", False)

            if is_regression:
                regression_total += 1
            if is_edge:
                edge_total += 1

            sub_res = await SubprocessRunner.execute_code(
                language=language,
                source_code=submitted_code,
                stdin_data=stdin,
                timeout_seconds=4.0,
            )
            total_time_ms += sub_res.execution_time_ms

            stdout_clean = sub_res.stdout.strip()
            passed = (stdout_clean == expected) and (sub_res.exit_code == 0) and not sub_res.is_timed_out

            if passed:
                passed_count += 1
                if is_regression:
                    regression_passed += 1
                if is_edge:
                    edge_passed += 1

            # Sanitize report: For hidden tests, do NOT expose hidden expected outputs or inputs!
            results.append({
                "test_index": tc["idx"],
                "description": tc.get("description", f"Test Case #{tc['idx']}"),
                "passed": passed,
                "is_public": is_public,
                "is_regression": is_regression,
                "is_edge": is_edge,
                "actual_output": stdout_clean[:1000] if is_public else ("PASSED" if passed else "FAILED_ASSERTION"),
                "expected_output": expected if is_public else "[HIDDEN_EVALUATION_CASE]",
                "execution_time_ms": round(sub_res.execution_time_ms, 2),
            })

        total = len(all_test_cases)
        all_passed = (passed_count == total) if total > 0 else True
        regressions_ok = (regression_passed == regression_total) if regression_total > 0 else True
        edge_cases_ok = (edge_passed == edge_total) if edge_total > 0 else True
        is_bug_fixed = (passed_count >= len(challenge.public_test_cases or [])) and all_passed

        # Check Root Cause Option
        root_cause_correct = None
        if identified_root_cause and challenge.root_cause_options:
            for opt in challenge.root_cause_options:
                if opt.get("id") == identified_root_cause or opt.get("text") == identified_root_cause:
                    root_cause_correct = opt.get("is_correct", False)
                    break

        # Calculate Score
        if all_passed:
            score = 100.0
            status_str = "accepted"
        elif not regressions_ok and passed_count > 0:
            score = round((passed_count / total) * 70.0, 1)
            status_str = "regression_detected"
        elif passed_count > 0:
            score = round((passed_count / total) * 80.0, 1)
            status_str = "partial_fix"
        else:
            score = 0.0
            status_str = "failed"

        # Construct Advisory AI Root Cause Review
        ai_review = self._build_advisory_ai_review(challenge, is_bug_fixed, regressions_ok, root_cause_correct)

        # Gamification: Update streak and check badge awards
        new_badges = []
        streak_data = None
        if db:
            streak_data, new_badges = await self._update_streak_and_badges(
                user_id=user_id,
                challenge=challenge,
                is_perfect_fix=all_passed,
                root_cause_correct=root_cause_correct,
                regressions_ok=regressions_ok,
                db=db,
            )

            # Record Submission
            sub_count_res = await db.execute(
                select(func.count(BugHunterSubmission.id)).where(
                    BugHunterSubmission.challenge_id == challenge.id,
                    BugHunterSubmission.user_id == user_id,
                )
            )
            attempt_number = (sub_count_res.scalar() or 0) + 1

            sub_record = BugHunterSubmission(
                challenge_id=challenge.id,
                user_id=user_id,
                submitted_code=submitted_code,
                identified_root_cause=identified_root_cause,
                root_cause_correct=root_cause_correct,
                is_bug_fixed=is_bug_fixed,
                regressions_passed=regressions_ok,
                edge_cases_passed=edge_cases_ok,
                passed_tests=passed_count,
                total_tests=total,
                score=score,
                execution_time_ms=round(total_time_ms, 2),
                status=status_str,
                test_results=results,
                ai_review=ai_review,
                time_spent_seconds=time_spent_seconds,
                attempt_number=attempt_number,
            )
            db.add(sub_record)
            await db.flush()

            # Record CodeTwin skill evidence
            target_slug = "root-cause-isolation"
            if challenge.bug_category == "boundary_condition":
                target_slug = "boundary-value-analysis"
            elif challenge.bug_category == "regression":
                target_slug = "regression-detection"

            skill_res = await db.execute(select(Skill).where(Skill.slug == target_slug))
            skill = skill_res.scalar_one_or_none()
            if skill:
                ev = SkillEvidence(
                    user_id=user_id,
                    skill_id=skill.id,
                    source_type="bughunter",
                    source_id=sub_record.id,
                    challenge_title=challenge.title,
                    score=score,
                    details={
                        "is_bug_fixed": is_bug_fixed,
                        "regressions_passed": regressions_ok,
                        "status": status_str,
                    },
                )
                db.add(ev)

            await db.commit()
            await db.refresh(sub_record)

            submission_id = sub_record.id
            created_at = sub_record.created_at
        else:
            submission_id = "test-sub-id"
            created_at = get_utc_now()

        return {
            "id": submission_id,
            "challenge_id": challenge.id,
            "challenge_title": challenge.title,
            "challenge_slug": challenge.slug,
            "status": status_str,
            "score": score,
            "is_bug_fixed": is_bug_fixed,
            "regressions_passed": regressions_ok,
            "edge_cases_passed": edge_cases_ok,
            "passed_tests": passed_count,
            "total_tests": total,
            "execution_time_ms": round(total_time_ms, 2),
            "root_cause_correct": root_cause_correct,
            "test_results": results,
            "ai_review": ai_review,
            "streak_updated": streak_data,
            "new_badges_earned": new_badges,
            "created_at": created_at,
        }

    def _build_advisory_ai_review(
        self,
        challenge: BugHunterChallenge,
        is_bug_fixed: bool,
        regressions_ok: bool,
        root_cause_correct: Optional[bool],
    ) -> Dict[str, Any]:
        """
        Generates structured advisory root cause and architectural review.
        """
        if is_bug_fixed and regressions_ok:
            verdict = "The bug has been successfully resolved without introducing regressions into previous test assertions."
            recommendations = [
                "Consider adding continuous fuzz testing or hypothesis tests for boundary values.",
                "Ensure error invariants are preserved in CI before merge.",
            ]
        elif not regressions_ok:
            verdict = "The patch appears to correct the primary symptom but induces a regression in prior working scenarios."
            recommendations = [
                "Review git diff to verify that boundary edge checks do not restrict valid general cases.",
                "Test against both the bug reproduction case and baseline sanity checks.",
            ]
        else:
            verdict = "The underlying bug remains partially or fully unresolved in the submitted implementation."
            recommendations = [
                "Carefully inspect the reproduction steps and stack trace in the Bug Report tab.",
                "Consult Hint 1 for conceptual guidance on the failure condition.",
            ]

        anti_pattern = f"Category '{challenge.bug_category}': Commonly triggered by unchecked index arithmetic, unhandled dictionary keys, or shared mutable structures."

        return {
            "root_cause_explanation": verdict,
            "anti_pattern_flag": anti_pattern,
            "root_cause_hypothesis_correct": root_cause_correct,
            "recommendations": recommendations,
            "advisory_notice": "AI findings are provided for diagnostic guidance and do not overwrite deterministic test outcomes.",
        }

    async def _update_streak_and_badges(
        self,
        user_id: str,
        challenge: BugHunterChallenge,
        is_perfect_fix: bool,
        root_cause_correct: Optional[bool],
        regressions_ok: bool,
        db: AsyncSession,
    ) -> tuple[Dict[str, Any], List[str]]:
        """
        Anti-cheat streak tracker:
        Only updates streak and awards badges if this is an authentic successful fix
        and the user hasn't already received credit for this challenge today.
        """
        streak_stmt = select(BugHunterStreak).where(BugHunterStreak.user_id == user_id)
        streak = (await db.execute(streak_stmt)).scalar_one_or_none()

        today_str = get_utc_now().strftime("%Y-%m-%d")

        if not streak:
            streak = BugHunterStreak(
                user_id=user_id,
                current_streak=0,
                longest_streak=0,
                last_activity_date=None,
                total_bugs_fixed=0,
                points=0,
            )
            db.add(streak)
            await db.flush()

        new_badges = []

        if is_perfect_fix:
            # Check if user already solved this challenge
            prev_solve_stmt = select(BugHunterSubmission).where(
                BugHunterSubmission.user_id == user_id,
                BugHunterSubmission.challenge_id == challenge.id,
                BugHunterSubmission.status == "accepted",
            )
            already_solved = (await db.execute(prev_solve_stmt)).scalars().first() is not None

            if not already_solved:
                streak.total_bugs_fixed += 1
                streak.points += 50

                # Streak calculation
                if streak.last_activity_date != today_str:
                    yesterday_str = (get_utc_now() - timedelta(days=1)).strftime("%Y-%m-%d")
                    if streak.last_activity_date == yesterday_str:
                        streak.current_streak += 1
                    else:
                        streak.current_streak = 1
                    streak.longest_streak = max(streak.longest_streak, streak.current_streak)
                    streak.last_activity_date = today_str

                # Award Badges if criteria met
                badge_candidates = []
                if root_cause_correct is True:
                    badge_candidates.append({
                        "key": "root_cause_sleuth",
                        "name": "Root Cause Detective",
                        "desc": "Correctly diagnosed underlying architectural root cause on first inspection.",
                        "icon": "SearchCheck",
                    })
                if challenge.bug_category == "boundary_condition":
                    badge_candidates.append({
                        "key": "boundary_buster",
                        "name": "Boundary Condition Master",
                        "desc": "Fixed a tricky boundary condition error without crashing edge tests.",
                        "icon": "ShieldAlert",
                    })
                if regressions_ok:
                    badge_candidates.append({
                        "key": "regression_guardian",
                        "name": "Regression Guardian",
                        "desc": "Delivered a clean bug fix while preserving 100% of regression tests.",
                        "icon": "ShieldCheck",
                    })
                if challenge.is_daily:
                    badge_candidates.append({
                        "key": "daily_hunter",
                        "name": "Daily Bug Hunter",
                        "desc": "Successfully completed a featured daily debugging challenge.",
                        "icon": "Flame",
                    })

                for bc in badge_candidates:
                    b_check = await db.execute(
                        select(BugHunterBadge).where(
                            BugHunterBadge.user_id == user_id,
                            BugHunterBadge.badge_key == bc["key"],
                        )
                    )
                    if not b_check.scalar_one_or_none():
                        new_b = BugHunterBadge(
                            user_id=user_id,
                            badge_key=bc["key"],
                            badge_name=bc["name"],
                            description=bc["desc"],
                            icon=bc["icon"],
                        )
                        db.add(new_b)
                        new_badges.append(bc["name"])

        streak_data = {
            "current_streak": streak.current_streak,
            "longest_streak": streak.longest_streak,
            "last_activity_date": streak.last_activity_date,
            "total_bugs_fixed": streak.total_bugs_fixed,
            "points": streak.points,
        }
        return streak_data, new_badges


bughunter_service = BugHunterService()
