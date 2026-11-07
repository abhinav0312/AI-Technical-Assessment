from typing import Optional, List, Dict, Any
from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from app.models.codetwin import (
    Skill,
    UserSkillProficiency,
    SkillEvidence,
    ErrorPatternDetection,
    PersonalizedRecommendation,
    ChallengeSkillAssociation,
    SkillGraphVersion,
)
from app.models.challenge import Challenge
from app.models.bughunter import BugHunterChallenge
from app.models.devsim import DevSimScenario
from app.core.logging import logger


DOMAIN_LABELS = {
    "programming_fundamentals": "Programming",
    "data_structures": "Data Structures",
    "algorithms": "Algorithms",
    "complexity_analysis": "Complexity",
    "sql_and_databases": "Databases",
    "testing": "Testing",
    "debugging": "Debugging",
    "software_engineering_fundamentals": "Software Engineering",
}

DOMAIN_X_OFFSETS = {
    "programming_fundamentals": 120,
    "data_structures": 380,
    "algorithms": 640,
    "complexity_analysis": 900,
    "sql_and_databases": 1160,
    "testing": 1420,
    "debugging": 1420,
    "software_engineering_fundamentals": 1680,
}


class SkillGraphService:
    def __init__(self):
        # In-memory graph cache: cache_key -> graph_dict
        self._cache: Dict[str, Dict[str, Any]] = {}

    def clear_cache(self, user_id: Optional[str] = None):
        """Clears memory cache for a user or globally."""
        if user_id:
            keys_to_del = [k for k in self._cache if k.startswith(f"{user_id}:")]
            for k in keys_to_del:
                del self._cache[k]
        else:
            self._cache.clear()

    async def get_skill_graph(
        self,
        user_id: str,
        db: AsyncSession,
        domain_filter: Optional[str] = None,
        status_filter: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        Builds and returns the interactive Technical SkillGraph.
        Includes graph caching, prerequisite edges, and explicit unassessed states.
        """
        # Determine user's latest evidence timestamp for cache invalidation
        ev_ts_stmt = select(func.max(SkillEvidence.created_at)).where(SkillEvidence.user_id == user_id)
        latest_ev = (await db.execute(ev_ts_stmt)).scalar()
        ev_token = latest_ev.isoformat() if latest_ev else "zero_evidence"
        latest_prof_stmt = select(func.max(UserSkillProficiency.updated_at)).where(
            UserSkillProficiency.user_id == user_id
        )
        latest_prof = (await db.execute(latest_prof_stmt)).scalar()
        if latest_prof:
            prof_token = latest_prof.isoformat()
        else:
            prof_token = "zero_proficiency"

        cache_key = (
            f"{user_id}:{ev_token}:{prof_token}:"
            f"{domain_filter or 'all'}:{status_filter or 'all'}"
        )
        if cache_key in self._cache:
            return self._cache[cache_key]

        # 1. Fetch active SkillGraphVersion
        stmt_v = select(SkillGraphVersion).where(SkillGraphVersion.is_active == True)
        v_res = await db.execute(stmt_v)
        active_version = v_res.scalars().first()
        version_str = active_version.version if active_version else "1.0.0"

        # 2. Fetch all skills
        stmt_skills = select(Skill).order_by(Skill.domain, Skill.tier, Skill.name)
        skills = (await db.execute(stmt_skills)).scalars().all()

        # 3. Fetch user proficiencies
        stmt_prof = select(UserSkillProficiency).where(UserSkillProficiency.user_id == user_id)
        prof_records = (await db.execute(stmt_prof)).scalars().all()
        prof_map = {p.skill_id: p for p in prof_records}

        # 4. Fetch user evidence to calculate trends & counts
        stmt_ev = select(SkillEvidence).where(SkillEvidence.user_id == user_id).order_by(SkillEvidence.created_at.desc())
        evidences = (await db.execute(stmt_ev)).scalars().all()

        ev_by_skill: Dict[str, List[SkillEvidence]] = {}
        for ev in evidences:
            ev_by_skill.setdefault(ev.skill_id, []).append(ev)

        # 5. Build raw nodes
        raw_nodes: Dict[str, Dict[str, Any]] = {}
        domain_item_counts: Dict[str, int] = {}

        for skill in skills:
            prof = prof_map.get(skill.id)
            ev_items = ev_by_skill.get(skill.id, [])

            obs_count = len(ev_items) if ev_items else (prof.evidence_count if prof else 0)
            raw_prof = prof.estimated_proficiency if prof else 0.0
            raw_obs_perf = prof.observed_performance if prof else 0.0

            # Round precision to avoid unsupported precision
            display_prof = round(raw_prof, 2) if obs_count > 0 else None
            display_obs_perf = round(raw_obs_perf, 2) if obs_count > 0 else None

            # Confidence Level
            if obs_count == 0:
                conf = "insufficient_evidence"
            elif obs_count == 1:
                conf = "low"  # Crucial: single question must not establish high confidence
            elif obs_count in (2, 3):
                conf = "medium"
            else:
                conf = "high"

            # Mastery Level
            # Critical constraint: A single successful question must NOT establish mastery!
            if obs_count == 0:
                mastery = "unassessed"
            elif obs_count == 1:
                mastery = "developing"
            elif obs_count >= 2 and raw_prof >= 0.70:
                if obs_count >= 3 and raw_prof >= 0.88:
                    mastery = "mastered"
                else:
                    mastery = "proficient"
            else:
                mastery = "developing"

            # Recent Trend calculation
            if obs_count >= 2:
                latest_score = ev_items[0].score
                prior_scores = [e.score for e in ev_items[1:]]
                prior_avg = sum(prior_scores) / len(prior_scores)
                diff = latest_score - prior_avg
                if diff > 0.08:
                    trend = "improving"
                elif diff < -0.08:
                    trend = "declining"
                else:
                    trend = "steady"
            elif obs_count == 1:
                trend = "new"
            else:
                trend = "no_data"

            # Last assessed timestamp
            last_dt = None
            if ev_items:
                last_dt = ev_items[0].created_at.strftime("%Y-%m-%d %H:%M")
            elif prof and prof.last_assessed_at:
                last_dt = prof.last_assessed_at.strftime("%Y-%m-%d %H:%M")

            # 2D Canvas positioning
            domain_key = skill.domain
            count_in_domain = domain_item_counts.get(domain_key, 0)
            domain_item_counts[domain_key] = count_in_domain + 1

            base_x = DOMAIN_X_OFFSETS.get(domain_key, 300)
            # Tier vertically spaces nodes, with slight horizontal offset for subcategories
            tier_base_y = 80 + (skill.tier - 1) * 200
            y_offset = (count_in_domain % 3) * 65
            pos_x = float(base_x + (count_in_domain // 3) * 90)
            pos_y = float(tier_base_y + y_offset)

            raw_nodes[skill.slug] = {
                "id": skill.id,
                "slug": skill.slug,
                "name": skill.name,
                "domain": skill.domain,
                "category": skill.category or DOMAIN_LABELS.get(skill.domain, skill.domain),
                "tier": skill.tier,
                "hierarchy_path": skill.hierarchy_path,
                "description": skill.description,
                "prerequisites": skill.prerequisites or [],
                "proficiency": display_prof,
                "observed_performance": display_obs_perf,
                "evidence_count": obs_count,
                "confidence_level": conf,
                "mastery_level": mastery,
                "recent_trend": trend,
                "last_assessed_at": last_dt,
                "is_unlocked": True,  # computed below
                "position_x": pos_x,
                "position_y": pos_y,
            }

        # 6. Compute Unlock State & Directed Prerequisite Edges
        edges = []
        for slug, node in raw_nodes.items():
            prereqs = node["prerequisites"]
            if not prereqs:
                node["is_unlocked"] = True
            else:
                all_satisfied = True
                for p_slug in prereqs:
                    prereq_node = raw_nodes.get(p_slug)
                    if prereq_node:
                        p_mastery = prereq_node["mastery_level"]
                        if p_mastery in ("mastered", "proficient"):
                            edge_status = "satisfied"
                        elif p_mastery == "developing":
                            edge_status = "in_progress"
                            all_satisfied = False
                        else:
                            edge_status = "unmet"
                            all_satisfied = False

                        edges.append({
                            "id": f"edge:{p_slug}->{slug}",
                            "source": p_slug,
                            "target": slug,
                            "status": edge_status,
                        })
                    else:
                        all_satisfied = False
                node["is_unlocked"] = all_satisfied

        # 7. Summary metrics
        total = len(raw_nodes)
        mastered_c = sum(1 for n in raw_nodes.values() if n["mastery_level"] == "mastered")
        proficient_c = sum(1 for n in raw_nodes.values() if n["mastery_level"] == "proficient")
        developing_c = sum(1 for n in raw_nodes.values() if n["mastery_level"] == "developing")
        unassessed_c = sum(1 for n in raw_nodes.values() if n["mastery_level"] == "unassessed")

        assessed_profs = [n["proficiency"] for n in raw_nodes.values() if n["proficiency"] is not None]
        overall_prof = round(sum(assessed_profs) / len(assessed_profs), 2) if assessed_profs else 0.0

        summary = {
            "total_skills": total,
            "mastered_count": mastered_c,
            "proficient_count": proficient_c,
            "developing_count": developing_c,
            "unassessed_count": unassessed_c,
            "overall_proficiency": overall_prof,
        }

        # 8. Filter nodes and edges if requested
        filtered_nodes = list(raw_nodes.values())
        if domain_filter and domain_filter.lower() != "all":
            filtered_nodes = [
                n for n in filtered_nodes
                if n["domain"].lower() == domain_filter.lower() or (n["category"] and n["category"].lower() == domain_filter.lower())
            ]

        if status_filter and status_filter.lower() != "all":
            filtered_nodes = [
                n for n in filtered_nodes
                if n["mastery_level"].lower() == status_filter.lower()
            ]

        active_slugs = {n["slug"] for n in filtered_nodes}
        filtered_edges = [
            e for e in edges if e["source"] in active_slugs and e["target"] in active_slugs
        ]

        # Domain list for frontend filter bar
        unique_domains = []
        seen_d = set()
        for s in skills:
            if s.domain not in seen_d:
                seen_d.add(s.domain)
                unique_domains.append({
                    "key": s.domain,
                    "label": DOMAIN_LABELS.get(s.domain, s.domain.replace("_", " ").title()),
                    "count": sum(1 for n in raw_nodes.values() if n["domain"] == s.domain),
                })

        categories = sorted(list({n["category"] for n in raw_nodes.values() if n["category"]}))

        response = {
            "version": version_str,
            "nodes": filtered_nodes,
            "edges": filtered_edges,
            "domains": unique_domains,
            "categories": categories,
            "summary": summary,
        }

        self._cache[cache_key] = response
        return response

    async def get_skill_detail(
        self,
        skill_slug: str,
        user_id: str,
        db: AsyncSession,
    ) -> Dict[str, Any]:
        """
        Retrieves full inspection details for a selected skill,
        including assessment evidence, related challenges, prerequisites,
        recent mistakes, history, and explainable recommendations.
        """
        # Fetch Skill
        stmt_s = select(Skill).where(Skill.slug == skill_slug)
        res_s = await db.execute(stmt_s)
        skill = res_s.scalar_one_or_none()
        if not skill:
            return None

        # Fetch Graph Node to get current proficiency status
        graph_data = await self.get_skill_graph(user_id, db)
        node = next((n for n in graph_data["nodes"] if n["slug"] == skill_slug), None)
        if not node:
            # Fallback if filtered out
            all_graph = await self.get_skill_graph(user_id, db, domain_filter=None, status_filter=None)
            node = next((n for n in all_graph["nodes"] if n["slug"] == skill_slug), None)

        # 1. Supporting Evidence
        stmt_ev = (
            select(SkillEvidence)
            .where(SkillEvidence.user_id == user_id, SkillEvidence.skill_id == skill.id)
            .order_by(SkillEvidence.created_at.desc())
        )
        ev_records = (await db.execute(stmt_ev)).scalars().all()
        supporting_evidence = [
            {
                "source_id": ev.source_id,
                "source_type": ev.source_type,
                "challenge_title": ev.challenge_title,
                "score": round(ev.score * 100, 1) if (ev.score is not None and 0.0 < ev.score <= 1.0) else round(ev.score or 0.0, 1),
                "timestamp": ev.created_at.strftime("%Y-%m-%d %H:%M"),
                "details": ev.details or {},
            }
            for ev in ev_records
        ]

        # 2. Related Challenges
        # Look up associations + fallback matching
        stmt_assoc = (
            select(ChallengeSkillAssociation)
            .where(ChallengeSkillAssociation.skill_id == skill.id)
        )
        assocs = (await db.execute(stmt_assoc)).scalars().all()
        assoc_challenge_ids = {a.challenge_id for a in assocs}

        related_challenges = []
        if assoc_challenge_ids:
            stmt_ch = select(Challenge).where(Challenge.id.in_(assoc_challenge_ids))
            ch_records = (await db.execute(stmt_ch)).scalars().all()
            for ch in ch_records:
                related_challenges.append({
                    "id": ch.id,
                    "slug": ch.slug,
                    "title": ch.title,
                    "challenge_type": "standard",
                    "difficulty": ch.difficulty,
                })

        # Match BugHunter challenges by relevant_skills
        stmt_bh = select(BugHunterChallenge)
        bh_records = (await db.execute(stmt_bh)).scalars().all()
        for bh in bh_records:
            if skill.slug in bh.relevant_skills or skill.name.lower() in [s.lower() for s in bh.relevant_skills]:
                related_challenges.append({
                    "id": bh.id,
                    "slug": bh.slug,
                    "title": bh.title,
                    "challenge_type": "bughunter",
                    "difficulty": bh.difficulty,
                })

        # Match DevSim scenarios by relevant_skills
        stmt_ds = select(DevSimScenario)
        ds_records = (await db.execute(stmt_ds)).scalars().all()
        for ds in ds_records:
            if skill.slug in ds.relevant_skills or skill.name.lower() in [s.lower() for s in ds.relevant_skills]:
                related_challenges.append({
                    "id": ds.id,
                    "slug": ds.slug,
                    "title": ds.title,
                    "challenge_type": "devsim",
                    "difficulty": ds.difficulty,
                })

        # If empty, provide standard catalog fallback
        if not related_challenges:
            stmt_any = select(Challenge).limit(2)
            for ch in (await db.execute(stmt_any)).scalars().all():
                related_challenges.append({
                    "id": ch.id,
                    "slug": ch.slug,
                    "title": ch.title,
                    "challenge_type": "standard",
                    "difficulty": ch.difficulty,
                })

        # 3. Prerequisites Status
        prerequisites = []
        if skill.prerequisites:
            all_skills_stmt = select(Skill).where(Skill.slug.in_(skill.prerequisites))
            prereq_skills = (await db.execute(all_skills_stmt)).scalars().all()
            for ps in prereq_skills:
                p_node = next((n for n in graph_data["nodes"] if n["slug"] == ps.slug), None)
                p_prof = p_node["proficiency"] if p_node else None
                p_status = p_node["mastery_level"] if p_node else "unassessed"
                prerequisites.append({
                    "slug": ps.slug,
                    "name": ps.name,
                    "domain": ps.domain,
                    "proficiency": p_prof,
                    "status": p_status,
                    "is_satisfied": p_status in ("mastered", "proficient"),
                })

        # 4. Dependents (Skills that list this skill as a prerequisite)
        stmt_all_s = select(Skill)
        all_s_records = (await db.execute(stmt_all_s)).scalars().all()
        dependents = []
        for ds in all_s_records:
            if skill.slug in (ds.prerequisites or []):
                d_node = next((n for n in graph_data["nodes"] if n["slug"] == ds.slug), None)
                dependents.append({
                    "slug": ds.slug,
                    "name": ds.name,
                    "domain": ds.domain,
                    "proficiency": d_node["proficiency"] if d_node else None,
                    "status": d_node["mastery_level"] if d_node else "unassessed",
                    "is_satisfied": (node["mastery_level"] in ("mastered", "proficient")) if node else False,
                })

        # 5. Recent Mistakes / Error Patterns
        stmt_err = (
            select(ErrorPatternDetection)
            .where(ErrorPatternDetection.user_id == user_id)
            .order_by(ErrorPatternDetection.created_at.desc())
        )
        errors = (await db.execute(stmt_err)).scalars().all()
        recent_mistakes = []
        for err in errors:
            recent_mistakes.append({
                "id": err.id,
                "title": err.title,
                "pattern_category": err.pattern_category,
                "frequency": err.frequency,
                "remediation_advice": err.remediation_advice,
                "severity": err.severity,
            })

        # 6. Progress History
        progress_history = [
            {
                "date": ev.created_at.strftime("%b %d, %Y"),
                "score": round(ev.score * 100) if ev.score <= 1.0 else round(ev.score),
                "challenge": ev.challenge_title,
                "source": ev.source_type,
            }
            for ev in reversed(ev_records)
        ]

        # 7. Recommended Activity with Explanation
        stmt_rec = (
            select(PersonalizedRecommendation)
            .where(PersonalizedRecommendation.user_id == user_id, PersonalizedRecommendation.status == "pending")
            .order_by(PersonalizedRecommendation.rank_score.desc())
        )
        recs = (await db.execute(stmt_rec)).scalars().all()

        recommended_activity = None
        if recs:
            r = recs[0]
            recommended_activity = {
                "id": r.id,
                "activity_type": r.activity_type,
                "activity_id": r.activity_id,
                "title": r.title,
                "difficulty": r.difficulty,
                "reason": r.reason,
            }
        elif related_challenges:
            ch_first = related_challenges[0]
            reason_text = (
                f"Selected to establish calibrated evidence for {skill.name}."
                if (node and node["mastery_level"] == "unassessed")
                else f"Targeted practice to strengthen verified proficiency in {skill.name}."
            )
            recommended_activity = {
                "id": ch_first["id"],
                "activity_type": ch_first["challenge_type"],
                "activity_id": ch_first["slug"],
                "title": ch_first["title"],
                "difficulty": ch_first["difficulty"],
                "reason": reason_text,
            }

        return {
            "node": node,
            "supporting_evidence": supporting_evidence,
            "related_challenges": related_challenges,
            "prerequisites": prerequisites,
            "dependents": dependents,
            "recent_mistakes": recent_mistakes,
            "progress_history": progress_history,
            "recommended_activity": recommended_activity,
        }


skillgraph_service = SkillGraphService()
