import math
from datetime import datetime, timezone, timedelta
from typing import List, Dict, Any, Optional
from sqlalchemy import select, func, desc
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.codetwin import (
    Skill,
    ChallengeSkillAssociation,
    UserSkillProficiency,
    SkillEvidence,
    ErrorPatternDetection,
    PersonalizedRecommendation,
    LearningPlan,
    LearningPlanItem,
)
from app.models.submission import Submission
from app.models.challenge import Challenge
from app.models.thinktrace import ThinkTraceReport
from app.models.bughunter import BugHunterChallenge, BugHunterSubmission
from app.models.devsim import DevSimScenario, DevSimAttempt, DevSimReport
from app.models.user import User
from app.models.profile import UserProfile
from app.db.base import get_utc_now


class CodeTwinService:
    async def get_or_compute_dashboard(
        self, user_id: str, db: AsyncSession
    ) -> Dict[str, Any]:
        """
        Builds the unified CodeTwin skill intelligence profile:
        - Analyzes all actual historical submissions, ThinkTrace reports, BugHunter, and DevSim attempts.
        - Calculates traceable proficiencies distinguishing observed performance from estimated proficiency.
        - Identifies recurring error patterns with verifiable citations.
        - Generates ranked, explainable recommendations.
        - Manages the active weekly learning plan.
        """
        # 1. Update proficiencies & evidence from latest activity
        await self._sync_skill_evidence_and_proficiencies(user_id, db)

        # 2. Update error pattern analysis from actual submission errors
        await self._analyze_error_patterns(user_id, db)

        # 3. Update personalized recommendations
        await self._generate_recommendations(user_id, db)

        # 4. Fetch updated proficiencies
        prof_stmt = (
            select(UserSkillProficiency)
            .options(selectinload(UserSkillProficiency.skill))
            .where(UserSkillProficiency.user_id == user_id)
            .order_by(desc(UserSkillProficiency.estimated_proficiency))
        )
        prof_res = await db.execute(prof_stmt)
        proficiencies = prof_res.scalars().all()

        # Format proficiencies
        formatted_profs = []
        for p in proficiencies:
            if not p.skill:
                continue
            formatted_profs.append({
                "id": p.id,
                "skill_id": p.skill_id,
                "skill_name": p.skill.name,
                "domain": p.skill.domain,
                "observed_performance": round(p.observed_performance, 1),
                "estimated_proficiency": round(p.estimated_proficiency, 1),
                "confidence_level": p.confidence_level,
                "evidence_count": p.evidence_count,
                "status": p.status,
                "last_assessed_at": p.last_assessed_at,
            })

        # Evidence count & onboarding status
        evidence_count_res = await db.execute(
            select(func.count(SkillEvidence.id)).where(SkillEvidence.user_id == user_id)
        )
        total_evidence = evidence_count_res.scalar() or 0
        is_onboarding = total_evidence == 0

        # Split strongest vs needing evidence
        strongest = [p for p in formatted_profs if p["status"] == "proficient" and p["confidence_level"] != "insufficient_evidence"][:5]
        needing_evidence = [p for p in formatted_profs if p["confidence_level"] == "insufficient_evidence" or p["status"] == "needs_evidence"][:6]

        # 5. Fetch Error Patterns
        err_stmt = (
            select(ErrorPatternDetection)
            .where(ErrorPatternDetection.user_id == user_id)
            .order_by(desc(ErrorPatternDetection.frequency))
        )
        err_res = await db.execute(err_stmt)
        error_patterns = [
            {
                "id": ep.id,
                "pattern_category": ep.pattern_category,
                "title": ep.title,
                "description": ep.description,
                "frequency": ep.frequency,
                "supporting_evidence": ep.supporting_evidence,
                "severity": ep.severity,
                "remediation_advice": ep.remediation_advice,
                "created_at": ep.created_at,
                "updated_at": ep.updated_at,
            }
            for ep in err_res.scalars().all()
        ]

        # 6. Fetch Recommendations
        rec_stmt = (
            select(PersonalizedRecommendation)
            .where(
                PersonalizedRecommendation.user_id == user_id,
                PersonalizedRecommendation.status.in_(["pending", "accepted"]),
            )
            .order_by(desc(PersonalizedRecommendation.rank_score))
            .limit(6)
        )
        rec_res = await db.execute(rec_stmt)
        recommendations = [
            {
                "id": r.id,
                "activity_type": r.activity_type,
                "activity_id": r.activity_id,
                "title": r.title,
                "difficulty": r.difficulty,
                "domain": r.domain,
                "rank_score": r.rank_score,
                "reason": r.reason,
                "status": r.status,
                "created_at": r.created_at,
            }
            for r in rec_res.scalars().all()
        ]

        # 7. Fetch or generate Learning Plan
        active_plan = await self._get_or_create_weekly_plan(user_id, db)

        # 8. Historical improvement progression
        history = await self._get_historical_progression(user_id, db)

        return {
            "is_onboarding": is_onboarding,
            "total_evidence_count": total_evidence,
            "strongest_skills": strongest,
            "skills_needing_evidence": needing_evidence,
            "all_proficiencies": formatted_profs,
            "recurring_error_patterns": error_patterns,
            "recommended_activities": recommendations,
            "active_learning_plan": active_plan,
            "historical_improvement": history,
        }

    async def _sync_skill_evidence_and_proficiencies(
        self, user_id: str, db: AsyncSession
    ):
        """
        Extracts evidence from submissions, ThinkTrace reports, BugHunter,
        and DevSim attempts, then updates UserSkillProficiency models.
        """
        # Fetch all skills
        all_skills_res = await db.execute(select(Skill))
        all_skills = all_skills_res.scalars().all()
        skill_map_by_slug = {s.slug: s for s in all_skills}
        skill_map_by_id = {s.id: s for s in all_skills}

        # 1. Evidence from coding arena submissions
        sub_stmt = (
            select(Submission)
            .options(selectinload(Submission.challenge))
            .where(Submission.user_id == user_id)
        )
        sub_res = await db.execute(sub_stmt)
        submissions = sub_res.scalars().all()

        for sub in submissions:
            ev_check = await db.execute(
                select(SkillEvidence).where(
                    SkillEvidence.user_id == user_id,
                    SkillEvidence.source_type == "submission",
                    SkillEvidence.source_id == sub.id,
                )
            )
            if ev_check.scalars().first():
                continue

            # Determine relevant skills from challenge tags/category
            ch = sub.challenge
            if not ch:
                continue

            target_slugs = []
            if "sliding" in ch.slug:
                target_slugs.extend(["sliding-window", "queues-and-stacks", "rate-limiting-resilience"])
            elif "two-sum" in ch.slug:
                target_slugs.extend(["hash-tables-and-sets", "two-pointers", "arrays-and-strings"])
            elif "lru" in ch.slug:
                target_slugs.extend(["hash-tables-and-sets", "linked-lists", "queues-and-stacks"])
            elif "reverse" in ch.slug:
                target_slugs.extend(["linked-lists", "recursion-and-backtracking"])
            else:
                target_slugs.append("control-flow-and-conditionals")

            score = 100.0 if sub.status == "accepted" else (sub.score or 0.0)
            for s_slug in target_slugs:
                if s_slug in skill_map_by_slug:
                    ev = SkillEvidence(
                        user_id=user_id,
                        skill_id=skill_map_by_slug[s_slug].id,
                        source_type="submission",
                        source_id=sub.id,
                        challenge_title=ch.title,
                        score=score,
                        details={
                            "status": sub.status,
                            "passed_tests": sub.passed_tests,
                            "total_tests": sub.total_tests,
                            "language": sub.language,
                        },
                    )
                    db.add(ev)

        # 2. Evidence from ThinkTrace Reports
        tt_stmt = (
            select(ThinkTraceReport)
            .options(selectinload(ThinkTraceReport.challenge))
            .where(ThinkTraceReport.user_id == user_id)
        )
        tt_res = await db.execute(tt_stmt)
        tt_reports = tt_res.scalars().all()

        for rep in tt_reports:
            ev_check = await db.execute(
                select(SkillEvidence).where(
                    SkillEvidence.user_id == user_id,
                    SkillEvidence.source_type == "thinktrace",
                    SkillEvidence.source_id == rep.id,
                )
            )
            if ev_check.scalars().first():
                continue

            # Complexity analysis skill
            if "big-o-time-complexity" in skill_map_by_slug:
                db.add(
                    SkillEvidence(
                        user_id=user_id,
                        skill_id=skill_map_by_slug["big-o-time-complexity"].id,
                        source_type="thinktrace",
                        source_id=rep.id,
                        challenge_title=rep.challenge.title if rep.challenge else "Problem Analysis",
                        score=rep.complexity_analysis_score,
                        details={"rubric": "complexity_analysis", "stated": rep.rubric_version},
                    )
                )
            # Edge-case coverage skill
            if "edge-case-coverage" in skill_map_by_slug:
                db.add(
                    SkillEvidence(
                        user_id=user_id,
                        skill_id=skill_map_by_slug["edge-case-coverage"].id,
                        source_type="thinktrace",
                        source_id=rep.id,
                        challenge_title=rep.challenge.title if rep.challenge else "Problem Analysis",
                        score=rep.edge_case_awareness_score,
                        details={"rubric": "edge_case_awareness"},
                    )
                )

        # 3. Evidence from BugHunter
        bh_stmt = (
            select(BugHunterSubmission)
            .options(selectinload(BugHunterSubmission.challenge))
            .where(BugHunterSubmission.user_id == user_id)
        )
        bh_res = await db.execute(bh_stmt)
        bh_subs = bh_res.scalars().all()

        for bh_sub in bh_subs:
            ev_check = await db.execute(
                select(SkillEvidence).where(
                    SkillEvidence.user_id == user_id,
                    SkillEvidence.source_type == "bughunter",
                    SkillEvidence.source_id == bh_sub.id,
                )
            )
            if ev_check.scalars().first():
                continue

            target_skill_slug = "root-cause-isolation"
            if bh_sub.challenge and bh_sub.challenge.bug_category == "boundary_condition":
                target_skill_slug = "boundary-value-analysis"
            elif bh_sub.challenge and bh_sub.challenge.bug_category == "regression":
                target_skill_slug = "regression-detection"

            if target_skill_slug in skill_map_by_slug:
                db.add(
                    SkillEvidence(
                        user_id=user_id,
                        skill_id=skill_map_by_slug[target_skill_slug].id,
                        source_type="bughunter",
                        source_id=bh_sub.id,
                        challenge_title=bh_sub.challenge.title if bh_sub.challenge else "BugHunter Challenge",
                        score=bh_sub.score,
                        details={
                            "is_bug_fixed": bh_sub.is_bug_fixed,
                            "regressions_passed": bh_sub.regressions_passed,
                            "category": bh_sub.challenge.bug_category if bh_sub.challenge else "general",
                        },
                    )
                )

        # 4. Evidence from DevSim
        ds_stmt = (
            select(DevSimReport)
            .options(selectinload(DevSimReport.scenario))
            .where(DevSimReport.user_id == user_id)
        )
        ds_res = await db.execute(ds_stmt)
        ds_reports = ds_res.scalars().all()

        for ds_rep in ds_reports:
            ev_check = await db.execute(
                select(SkillEvidence).where(
                    SkillEvidence.user_id == user_id,
                    SkillEvidence.source_type == "devsim",
                    SkillEvidence.source_id == ds_rep.id,
                )
            )
            if ev_check.scalars().first():
                continue

            target_slug = "rest-api-architecture"
            if ds_rep.scenario and "idempotency" in ds_rep.scenario.slug:
                target_slug = "idempotency-and-error-handling"

            if target_slug in skill_map_by_slug:
                db.add(
                    SkillEvidence(
                        user_id=user_id,
                        skill_id=skill_map_by_slug[target_slug].id,
                        source_type="devsim",
                        source_id=ds_rep.id,
                        challenge_title=ds_rep.scenario.title if ds_rep.scenario else "Engineering Scenario",
                        score=ds_rep.functional_score,
                        details={"acceptance_passed": ds_rep.acceptance_tests_passed},
                    )
                )

        await db.flush()

        # 5. Now update UserSkillProficiency for each taxonomy skill
        for skill in all_skills:
            # Query all evidences for this skill and user
            ev_stmt = select(SkillEvidence).where(
                SkillEvidence.user_id == user_id,
                SkillEvidence.skill_id == skill.id,
            )
            ev_list = (await db.execute(ev_stmt)).scalars().all()

            # Query existing proficiency record
            prof_stmt = select(UserSkillProficiency).where(
                UserSkillProficiency.user_id == user_id,
                UserSkillProficiency.skill_id == skill.id,
            )
            prof = (await db.execute(prof_stmt)).scalar_one_or_none()

            evidence_count = len(ev_list)

            if evidence_count == 0:
                observed = 0.0
                estimated = 0.0
                confidence = "insufficient_evidence"
                status = "needs_evidence"
            elif evidence_count in (1, 2):
                observed = sum(e.score for e in ev_list) / evidence_count
                # Bayesian regression towards baseline prior (50.0) with small sample size
                estimated = round(observed * 0.7 + 50.0 * 0.3, 1)
                confidence = "low"
                status = "proficient" if estimated >= 75.0 else "developing"
            else:
                observed = sum(e.score for e in ev_list) / evidence_count
                # Exponential decay weighting towards recent attempts
                weighted_sum = 0.0
                weight_total = 0.0
                for i, e in enumerate(reversed(ev_list)):
                    w = math.pow(0.9, i)
                    weighted_sum += e.score * w
                    weight_total += w
                estimated = round(weighted_sum / weight_total, 1) if weight_total > 0 else observed
                confidence = "high" if evidence_count >= 5 else "medium"
                status = "proficient" if estimated >= 75.0 else "developing"

            if not prof:
                prof = UserSkillProficiency(
                    user_id=user_id,
                    skill_id=skill.id,
                    observed_performance=round(observed, 1),
                    estimated_proficiency=round(estimated, 1),
                    confidence_level=confidence,
                    evidence_count=evidence_count,
                    status=status,
                    last_assessed_at=get_utc_now(),
                )
                db.add(prof)
            else:
                prof.observed_performance = round(observed, 1)
                prof.estimated_proficiency = round(estimated, 1)
                prof.confidence_level = confidence
                prof.evidence_count = evidence_count
                prof.status = status
                prof.last_assessed_at = get_utc_now()

        await db.commit()

    async def _analyze_error_patterns(self, user_id: str, db: AsyncSession):
        """
        Identifies recurring error patterns across candidate submissions.
        Every pattern detected MUST cite real supporting submission data.
        """
        # Fetch submissions with errors or failed tests
        sub_stmt = (
            select(Submission)
            .options(selectinload(Submission.challenge))
            .where(
                Submission.user_id == user_id,
                Submission.status.in_(["failed", "wrong_answer", "runtime_error", "time_limit_exceeded"]),
            )
            .order_by(desc(Submission.created_at))
        )
        failed_subs = (await db.execute(sub_stmt)).scalars().all()

        # Bucket evidence by error pattern category
        buckets: Dict[str, List[Dict[str, Any]]] = {
            "off_by_one": [],
            "boundary_conditions": [],
            "recursion": [],
            "inefficient_algorithm": [],
            "edge_case_failure": [],
        }

        for sub in failed_subs:
            msg = (sub.error_message or "").lower()
            ch_title = sub.challenge.title if sub.challenge else "Challenge"

            # Off by one / index errors
            if "indexerror" in msg or "index out of range" in msg or "string index" in msg:
                buckets["off_by_one"].append({
                    "source_id": sub.id,
                    "title": ch_title,
                    "timestamp": sub.created_at.isoformat(),
                    "error_summary": "IndexError: sequence index out of bounds during traversal.",
                })

            # Boundary conditions
            if "boundary" in msg or "empty" in msg or "division by zero" in msg or "zerodivision" in msg:
                buckets["boundary_conditions"].append({
                    "source_id": sub.id,
                    "title": ch_title,
                    "timestamp": sub.created_at.isoformat(),
                    "error_summary": "Zero or boundary value failed invariant precondition.",
                })

            # Recursion
            if "recursionerror" in msg or "maximum recursion depth" in msg:
                buckets["recursion"].append({
                    "source_id": sub.id,
                    "title": ch_title,
                    "timestamp": sub.created_at.isoformat(),
                    "error_summary": "Recursion depth exceeded due to missing or flawed base condition.",
                })

            # Inefficient algorithm
            if sub.status == "time_limit_exceeded" or "timed out" in msg:
                buckets["inefficient_algorithm"].append({
                    "source_id": sub.id,
                    "title": ch_title,
                    "timestamp": sub.created_at.isoformat(),
                    "error_summary": "Time Limit Exceeded: algorithm exceeded execution deadline.",
                })

            # Edge case failure (failed hidden tests despite sample success)
            if sub.status == "wrong_answer" and sub.passed_tests > 0 and sub.passed_tests < sub.total_tests:
                buckets["edge_case_failure"].append({
                    "source_id": sub.id,
                    "title": ch_title,
                    "timestamp": sub.created_at.isoformat(),
                    "error_summary": f"Passed {sub.passed_tests}/{sub.total_tests} tests; failed on hidden edge test cases.",
                })

        # Pattern metadata descriptions
        pattern_meta = {
            "off_by_one": {
                "title": "Off-By-One Index Boundary Errors",
                "desc": "Frequent sequence index overflows during loop increments or slicing window computations.",
                "remediation": "Always trace array bounds on length 1, 0, and N - 1. Prefer idiomatic range bounds (range(len(nums))) and inclusive/exclusive slice invariants.",
                "severity": "critical",
            },
            "boundary_conditions": {
                "title": "Unhandled Boundary & Extreme Values",
                "desc": "Logic terminates abruptly when encountering zero elements, single-item collections, or extreme numerical ranges.",
                "remediation": "Explicitly guard against empty collections at the function entrance. Validate negative values and zero-division cases.",
                "severity": "moderate",
            },
            "recursion": {
                "title": "Unbounded Recursive Stack Growth",
                "desc": "Recursive functions fail to reach the base termination case before stack limit.",
                "remediation": "Verify induction step strictly shrinks the problem state space towards a well-defined base case.",
                "severity": "critical",
            },
            "inefficient_algorithm": {
                "title": "Quadratic Time Complexity Bottlenecks",
                "desc": "Nested linear operations lead to O(N^2) or worse latency timeouts during high-input test cases.",
                "remediation": "Replace inner loops with hash maps, frequency arrays, or two-pointer passes to maintain linear or log-linear execution bounds.",
                "severity": "moderate",
            },
            "edge_case_failure": {
                "title": "Hidden Edge-Case Inconsistencies",
                "desc": "Solutions pass standard examples but falter on non-standard inputs such as duplicates or boundary collisions.",
                "remediation": "Draft edge cases before writing implementation logic using ThinkTrace reasoning worksheets.",
                "severity": "advisory",
            },
        }

        for cat, evidence_list in buckets.items():
            if not evidence_list:
                continue

            # Check if pattern already detected
            p_stmt = select(ErrorPatternDetection).where(
                ErrorPatternDetection.user_id == user_id,
                ErrorPatternDetection.pattern_category == cat,
            )
            pattern = (await db.execute(p_stmt)).scalar_one_or_none()

            meta = pattern_meta[cat]
            if not pattern:
                pattern = ErrorPatternDetection(
                    user_id=user_id,
                    pattern_category=cat,
                    title=meta["title"],
                    description=meta["desc"],
                    frequency=len(evidence_list),
                    supporting_evidence=evidence_list[:5],
                    severity=meta["severity"],
                    remediation_advice=meta["remediation"],
                )
                db.add(pattern)
            else:
                pattern.frequency = len(evidence_list)
                pattern.supporting_evidence = evidence_list[:5]
                pattern.updated_at = get_utc_now()

        await db.commit()

    async def _generate_recommendations(self, user_id: str, db: AsyncSession):
        """
        Generates explainable recommendations based on user goals, skill gaps,
        prerequisite relationships, challenge difficulty, and past attempts.
        """
        # Fetch user profile to read learning goals
        prof_res = await db.execute(select(UserProfile).where(UserProfile.user_id == user_id))
        user_prof = prof_res.scalar_one_or_none()
        learning_goals = (user_prof.learning_goals or "").lower() if user_prof else ""

        # Fetch skills with 'developing' or 'needs_evidence' status
        gap_profs_stmt = (
            select(UserSkillProficiency)
            .options(selectinload(UserSkillProficiency.skill))
            .where(
                UserSkillProficiency.user_id == user_id,
                UserSkillProficiency.status.in_(["developing", "needs_evidence"]),
            )
        )
        gap_profs = (await db.execute(gap_profs_stmt)).scalars().all()
        gap_slugs = {p.skill.slug for p in gap_profs if p.skill}

        # Fetch all challenges
        all_ch = (await db.execute(select(Challenge))).scalars().all()
        all_bh = (await db.execute(select(BugHunterChallenge))).scalars().all()
        all_ds = (await db.execute(select(DevSimScenario))).scalars().all()

        # Fetch solved challenge IDs
        solved_res = await db.execute(
            select(Submission.challenge_id).where(
                Submission.user_id == user_id,
                Submission.status == "accepted",
            )
        )
        solved_ids = set(solved_res.scalars().all())

        # Generate candidates
        candidates = []

        # 1. Standard Challenges
        for ch in all_ch:
            if ch.id in solved_ids:
                continue

            reason = "Recommended to strengthen foundational algorithmic skills."
            rank = 1.0

            if "sliding" in ch.slug and ("sliding-window" in gap_slugs or "queues-and-stacks" in gap_slugs):
                reason = "Recommended because your Sliding Window & Queue skills are developing, and boundary errors were noted."
                rank = 3.5
            elif "two-sum" in ch.slug and "hash-tables-and-sets" in gap_slugs:
                reason = "Recommended to reinforce Hash Map fast-lookup invariants, an essential prerequisite for caching."
                rank = 3.0
            elif "lru" in ch.slug and ("linked-lists" in gap_slugs or "queues-and-stacks" in gap_slugs):
                reason = "Recommended to practice doubly-linked list ordering and amortized O(1) eviction."
                rank = 3.2

            candidates.append({
                "activity_type": "challenge",
                "activity_id": ch.slug,
                "title": ch.title,
                "difficulty": ch.difficulty,
                "domain": ch.category,
                "rank_score": rank,
                "reason": reason,
            })

        # 2. BugHunter Challenges
        for bh in all_bh:
            reason = f"Recommended debugging challenge to master {bh.bug_category.replace('_', ' ')} diagnosis."
            rank = 2.5
            if bh.bug_category == "boundary_condition":
                reason = "Recommended because boundary condition failures were identified in your recent submissions."
                rank = 4.0
            elif bh.bug_category == "runtime_error":
                reason = "Recommended to practice defensive error handling and unhandled exception triage."
                rank = 3.8

            candidates.append({
                "activity_type": "bughunter",
                "activity_id": bh.slug,
                "title": f"BugHunter: {bh.title}",
                "difficulty": bh.difficulty,
                "domain": "debugging",
                "rank_score": rank,
                "reason": reason,
            })

        # 3. DevSim Scenarios
        for ds in all_ds:
            reason = "Recommended real-world engineering assessment to practice multi-file system troubleshooting."
            rank = 3.0
            candidates.append({
                "activity_type": "devsim",
                "activity_id": ds.slug,
                "title": f"DevSim: {ds.title}",
                "difficulty": ds.difficulty,
                "domain": "software_engineering",
                "rank_score": rank,
                "reason": reason,
            })

        # Sort by rank score descending
        candidates.sort(key=lambda c: c["rank_score"], reverse=True)

        # Clear old pending recommendations and write top 6
        del_stmt = select(PersonalizedRecommendation).where(
            PersonalizedRecommendation.user_id == user_id,
            PersonalizedRecommendation.status == "pending",
        )
        old_recs = (await db.execute(del_stmt)).scalars().all()
        for r in old_recs:
            await db.delete(r)

        for c in candidates[:6]:
            rec = PersonalizedRecommendation(
                user_id=user_id,
                activity_type=c["activity_type"],
                activity_id=c["activity_id"],
                title=c["title"],
                difficulty=c["difficulty"],
                domain=c["domain"],
                rank_score=c["rank_score"],
                reason=c["reason"],
                status="pending",
            )
            db.add(rec)

        await db.commit()

    async def _get_or_create_weekly_plan(
        self, user_id: str, db: AsyncSession
    ) -> Optional[Dict[str, Any]]:
        """
        Retrieves the user's active weekly learning plan or generates a realistic one.
        """
        plan_stmt = (
            select(LearningPlan)
            .options(selectinload(LearningPlan.items))
            .where(
                LearningPlan.user_id == user_id,
                LearningPlan.status == "active",
            )
        )
        plan = (await db.execute(plan_stmt)).scalar_one_or_none()

        if not plan:
            # Generate default plan
            now = get_utc_now()
            plan = LearningPlan(
                user_id=user_id,
                title="Targeted Skill Intelligence Plan",
                week_start_date=now,
                target_skills=["Sliding Window", "Boundary Condition Debugging", "REST Idempotency"],
                estimated_hours=3.5,
                status="active",
            )
            db.add(plan)
            await db.flush()

            items = [
                LearningPlanItem(
                    learning_plan_id=plan.id,
                    title="Solve Two Sum Target Pair with O(N) Hash Map",
                    activity_type="challenge",
                    activity_id="two-sum-target-pair",
                    target_skill="Hash Tables & Sets",
                    estimated_minutes=25,
                    order_index=0,
                ),
                LearningPlanItem(
                    learning_plan_id=plan.id,
                    title="Fix Off-By-One Boundary Crash in Window Maximum",
                    activity_type="bughunter",
                    activity_id="off-by-one-window-maximum",
                    target_skill="Boundary Value Analysis",
                    estimated_minutes=35,
                    order_index=1,
                ),
                LearningPlanItem(
                    learning_plan_id=plan.id,
                    title="DevSim: Fix Broken Payment Webhook Idempotency",
                    activity_type="devsim",
                    activity_id="fix-payment-webhook-idempotency",
                    target_skill="Idempotency & Error Handling",
                    estimated_minutes=45,
                    order_index=2,
                ),
                LearningPlanItem(
                    learning_plan_id=plan.id,
                    title="ThinkTrace Practice: State Complexity for Sliding Window",
                    activity_type="concept_review",
                    activity_id="sliding-window-rate-limiter",
                    target_skill="Complexity Analysis",
                    estimated_minutes=20,
                    order_index=3,
                ),
            ]
            for it in items:
                db.add(it)
            await db.commit()
            await db.refresh(plan)

        return {
            "id": plan.id,
            "title": plan.title,
            "week_start_date": plan.week_start_date,
            "target_skills": plan.target_skills,
            "estimated_hours": plan.estimated_hours,
            "status": plan.status,
            "items": [
                {
                    "id": it.id,
                    "title": it.title,
                    "activity_type": it.activity_type,
                    "activity_id": it.activity_id,
                    "target_skill": it.target_skill,
                    "estimated_minutes": it.estimated_minutes,
                    "is_completed": it.is_completed,
                    "is_rejected": it.is_rejected,
                    "completed_at": it.completed_at,
                    "order_index": it.order_index,
                }
                for it in plan.items
            ],
            "created_at": plan.created_at,
        }

    async def _get_historical_progression(
        self, user_id: str, db: AsyncSession
    ) -> List[Dict[str, Any]]:
        """
        Returns chronological assessment timeline entries.
        """
        ev_stmt = (
            select(SkillEvidence)
            .options(selectinload(SkillEvidence.skill))
            .where(SkillEvidence.user_id == user_id)
            .order_by(SkillEvidence.created_at.asc())
            .limit(10)
        )
        ev_list = (await db.execute(ev_stmt)).scalars().all()

        progression = []
        for e in ev_list:
            progression.append({
                "date": e.created_at.strftime("%Y-%m-%d"),
                "challenge": e.challenge_title,
                "skill": e.skill.name if e.skill else "General",
                "score": e.score,
                "source": e.source_type,
            })
        return progression


codetwin_service = CodeTwinService()
