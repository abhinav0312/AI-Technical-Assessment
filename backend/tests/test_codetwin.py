import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.db.session import AsyncSessionLocal
from app.models.codetwin import Skill, UserSkillProficiency, SkillEvidence, ErrorPatternDetection


@pytest.mark.asyncio
async def test_codetwin_taxonomy_and_onboarding():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        # Candidate login
        login_res = await client.post(
            "/api/v1/auth/login",
            json={"email": "candidate@devmind.ai", "password": "Password123!"},
        )
        assert login_res.status_code == 200
        token = login_res.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # 1. Fetch Skill Taxonomy
        skills_res = await client.get("/api/v1/codetwin/skills", headers=headers)
        assert skills_res.status_code == 200
        skills = skills_res.json()
        assert len(skills) >= 8
        domains = {s["domain"] for s in skills}
        assert "programming_fundamentals" in domains
        assert "data_structures" in domains
        assert "algorithms" in domains
        assert "complexity_analysis" in domains
        assert "debugging" in domains
        assert "testing" in domains
        assert "sql_and_databases" in domains
        assert "software_engineering_fundamentals" in domains

        # 2. Fetch CodeTwin Dashboard for Candidate
        dash_res = await client.get("/api/v1/codetwin/dashboard", headers=headers)
        assert dash_res.status_code == 200
        dashboard = dash_res.json()
        assert "all_proficiencies" in dashboard
        assert "recurring_error_patterns" in dashboard
        assert "recommended_activities" in dashboard
        assert "active_learning_plan" in dashboard

        # Verify insufficient evidence explicit representation
        for prof in dashboard["all_proficiencies"]:
            assert prof["confidence_level"] in ("high", "medium", "low", "insufficient_evidence")
            assert prof["status"] in ("proficient", "developing", "needs_evidence")
            # Should have distinct observed performance vs estimated proficiency
            assert "observed_performance" in prof
            assert "estimated_proficiency" in prof


@pytest.mark.asyncio
async def test_codetwin_privacy_access_restriction():
    """
    Verifies that a candidate cannot access another candidate's private skill profile.
    Only the candidate themselves or authorized staff (admin/creator/recruiter) may access.
    """
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        cand_login = await client.post(
            "/api/v1/auth/login",
            json={"email": "candidate@devmind.ai", "password": "Password123!"},
        )
        cand_token = cand_login.json()["access_token"]
        cand_headers = {"Authorization": f"Bearer {cand_token}"}

        # Candidate attempting to query a different user's profile
        unauthorized_res = await client.get(
            "/api/v1/codetwin/dashboard?user_id=someone-elses-uuid",
            headers=cand_headers,
        )
        assert unauthorized_res.status_code == 403
        assert "Access denied" in unauthorized_res.json()["detail"]

        # Admin login
        admin_login = await client.post(
            "/api/v1/auth/login",
            json={"email": "admin@devmind.ai", "password": "Password123!"},
        )
        admin_token = admin_login.json()["access_token"]
        admin_headers = {"Authorization": f"Bearer {admin_token}"}

        # Admin can view candidate's dashboard
        cand_user_id = cand_login.json()["user"]["id"]
        admin_res = await client.get(
            f"/api/v1/codetwin/dashboard?user_id={cand_user_id}",
            headers=admin_headers,
        )
        assert admin_res.status_code == 200


@pytest.mark.asyncio
async def test_codetwin_learning_plan_interaction():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        login_res = await client.post(
            "/api/v1/auth/login",
            json={"email": "candidate@devmind.ai", "password": "Password123!"},
        )
        token = login_res.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        plan_res = await client.get("/api/v1/codetwin/learning-plan", headers=headers)
        assert plan_res.status_code == 200
        plan = plan_res.json()
        assert plan is not None
        assert len(plan["items"]) > 0

        first_item = plan["items"][0]
        item_id = first_item["id"]

        # Mark completed
        patch_res = await client.patch(
            f"/api/v1/codetwin/learning-plan/items/{item_id}",
            json={"is_completed": True},
            headers=headers,
        )
        assert patch_res.status_code == 200
        assert patch_res.json()["is_completed"] is True
