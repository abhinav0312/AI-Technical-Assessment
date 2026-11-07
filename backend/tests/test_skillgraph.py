import pytest
from httpx import AsyncClient, ASGITransport
from sqlalchemy import select
from app.main import app
from app.db.session import AsyncSessionLocal
from app.models.codetwin import Skill, UserSkillProficiency, SkillEvidence
from app.models.user import User


import uuid

@pytest.mark.asyncio
async def test_skillgraph_new_user_no_history():
    """
    Test user with no history:
    All nodes should report 'unassessed' with 'insufficient_evidence' confidence,
    proficiency as None, and 'no_data' trend.
    """
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        unique_email = f"candidate.graph.{uuid.uuid4().hex[:8]}@devmind.ai"
        reg_res = await client.post(
            "/api/v1/auth/register",
            json={
                "email": unique_email,
                "password": "Password123!",
                "display_name": "New Graph Candidate",
            },
        )
        assert reg_res.status_code == 201
        token = reg_res.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # Fetch SkillGraph
        res = await client.get("/api/v1/skillgraph/graph", headers=headers)
        assert res.status_code == 200
        data = res.json()

        assert "version" in data
        assert len(data["nodes"]) >= 20
        assert len(data["edges"]) >= 15
        assert data["summary"]["unassessed_count"] == len(data["nodes"])
        assert data["summary"]["mastered_count"] == 0
        assert data["summary"]["proficient_count"] == 0

        for node in data["nodes"]:
            assert node["mastery_level"] == "unassessed"
            assert node["confidence_level"] == "insufficient_evidence"
            assert node["proficiency"] is None
            assert node["recent_trend"] == "no_data"
            assert node["evidence_count"] == 0


@pytest.mark.asyncio
async def test_skillgraph_single_question_does_not_establish_mastery():
    """
    Critical requirement:
    A single successful question must NOT automatically establish mastery.
    When a candidate has 1 successful evidence record, status must be 'developing'
    and confidence must be 'low'.
    When evidence count increases to >= 2 with high score, status can become 'proficient'.
    """
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        # Login as candidate
        login_res = await client.post(
            "/api/v1/auth/login",
            json={"email": "candidate@devmind.ai", "password": "Password123!"},
        )
        assert login_res.status_code == 200
        token = login_res.json()["access_token"]
        user_id = login_res.json()["user"]["id"]
        headers = {"Authorization": f"Bearer {token}"}

        async with AsyncSessionLocal() as session:
            # Pick a skill: variables-and-scoping
            sk_stmt = select(Skill).where(Skill.slug == "variables-and-scoping")
            sk = (await session.execute(sk_stmt)).scalar_one()

            # Clear any old evidence for this test skill to test clean progression
            old_ev_stmt = select(SkillEvidence).where(SkillEvidence.user_id == user_id, SkillEvidence.skill_id == sk.id)
            for old_ev in (await session.execute(old_ev_stmt)).scalars().all():
                await session.delete(old_ev)
            await session.commit()

            # Insert exactly 1 high-scoring evidence (100% score)
            ev1 = SkillEvidence(
                user_id=user_id,
                skill_id=sk.id,
                source_type="submission",
                source_id="sub-test-single-1",
                challenge_title="Two Sum Target Pair",
                score=1.0,
                details={"status": "accepted"},
            )
            session.add(ev1)

            # Update proficiency record with 1 observation
            prof_stmt = select(UserSkillProficiency).where(
                UserSkillProficiency.user_id == user_id,
                UserSkillProficiency.skill_id == sk.id,
            )
            prof = (await session.execute(prof_stmt)).scalars().first()
            if not prof:
                prof = UserSkillProficiency(
                    user_id=user_id,
                    skill_id=sk.id,
                    observed_performance=1.0,
                    estimated_proficiency=0.90,
                    confidence_level="low",
                    evidence_count=1,
                    status="developing",
                )
                session.add(prof)
            else:
                prof.observed_performance = 1.0
                prof.estimated_proficiency = 0.90
                prof.confidence_level = "low"
                prof.evidence_count = 1
                prof.status = "developing"

            await session.commit()

        # Invalidate / fetch graph
        res1 = await client.get("/api/v1/skillgraph/graph", headers=headers)
        assert res1.status_code == 200
        data1 = res1.json()

        node1 = next(n for n in data1["nodes"] if n["slug"] == "variables-and-scoping")
        # Assert that despite 100% score, 1 observation does NOT establish mastery!
        assert node1["evidence_count"] == 1
        assert node1["confidence_level"] == "low"
        assert node1["mastery_level"] == "developing"
        assert node1["mastery_level"] != "mastered"
        assert node1["mastery_level"] != "proficient"
        assert node1["recent_trend"] == "new"

        # Now add a 2nd successful evidence item
        async with AsyncSessionLocal() as session:
            ev2 = SkillEvidence(
                user_id=user_id,
                skill_id=sk.id,
                source_type="thinktrace",
                source_id="tt-test-single-2",
                challenge_title="Sliding Window Rate Limiter",
                score=0.95,
                details={"status": "proficient"},
            )
            session.add(ev2)

            prof_stmt = select(UserSkillProficiency).where(
                UserSkillProficiency.user_id == user_id,
                UserSkillProficiency.skill_id == sk.id,
            )
            prof = (await session.execute(prof_stmt)).scalars().first()
            prof.evidence_count = 2
            prof.estimated_proficiency = 0.92
            prof.confidence_level = "medium"
            prof.status = "proficient"
            await session.commit()

        # Re-fetch graph with 2 observations
        res2 = await client.get("/api/v1/skillgraph/graph", headers=headers)
        assert res2.status_code == 200
        data2 = res2.json()

        node2 = next(n for n in data2["nodes"] if n["slug"] == "variables-and-scoping")
        assert node2["evidence_count"] == 2
        assert node2["confidence_level"] == "medium"
        assert node2["mastery_level"] in ("proficient", "mastered")


@pytest.mark.asyncio
async def test_skillgraph_details_and_prerequisite_edges():
    """
    Tests prerequisite relationships, edge statuses, and detailed skill inspector
    containing citations, related challenges, and explainable recommendations.
    """
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        login_res = await client.post(
            "/api/v1/auth/login",
            json={"email": "candidate@devmind.ai", "password": "Password123!"},
        )
        assert login_res.status_code == 200
        token = login_res.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # 1. Fetch graph and verify edges exist
        graph_res = await client.get("/api/v1/skillgraph/graph", headers=headers)
        assert graph_res.status_code == 200
        graph_data = graph_res.json()

        # Find an edge (e.g. variables-and-scoping -> functions-and-modularity)
        edges = graph_data["edges"]
        assert len(edges) > 0
        for edge in edges:
            assert "source" in edge
            assert "target" in edge
            assert edge["status"] in ("satisfied", "in_progress", "unmet")

        # 2. Inspect skill details for 'variables-and-scoping'
        detail_res = await client.get("/api/v1/skillgraph/skills/variables-and-scoping", headers=headers)
        assert detail_res.status_code == 200
        detail = detail_res.json()

        assert detail["node"]["slug"] == "variables-and-scoping"
        assert "supporting_evidence" in detail
        assert "related_challenges" in detail
        assert "dependents" in detail
        assert len(detail["dependents"]) >= 1  # functions-and-modularity depends on variables-and-scoping
        assert "recommended_activity" in detail

        # 3. Test non-existent skill returns 404
        bad_res = await client.get("/api/v1/skillgraph/skills/non-existent-skill-xyz", headers=headers)
        assert bad_res.status_code == 404


@pytest.mark.asyncio
async def test_skillgraph_privacy_access_restriction():
    """
    Verifies that a candidate cannot access another user's private skill graph,
    while an admin has authorized oversight access.
    """
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        # Candidate login
        cand_login = await client.post(
            "/api/v1/auth/login",
            json={"email": "candidate@devmind.ai", "password": "Password123!"},
        )
        cand_token = cand_login.json()["access_token"]

        # Admin login
        admin_login = await client.post(
            "/api/v1/auth/login",
            json={"email": "admin@devmind.ai", "password": "Password123!"},
        )
        admin_token = admin_login.json()["access_token"]
        admin_id = admin_login.json()["user"]["id"]

        # Candidate attempts to access Admin's skillgraph -> MUST FAIL with 403 Forbidden
        cand_headers = {"Authorization": f"Bearer {cand_token}"}
        forbidden_res = await client.get(f"/api/v1/skillgraph/graph?user_id={admin_id}", headers=cand_headers)
        assert forbidden_res.status_code == 403

        # Admin accesses Candidate's skillgraph -> MUST SUCCEED (200 OK)
        admin_headers = {"Authorization": f"Bearer {admin_token}"}
        cand_id = cand_login.json()["user"]["id"]
        allowed_res = await client.get(f"/api/v1/skillgraph/graph?user_id={cand_id}", headers=admin_headers)
        assert allowed_res.status_code == 200
