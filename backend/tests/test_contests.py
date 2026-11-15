import uuid
import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app


@pytest.mark.asyncio
async def test_contest_lifecycle_and_leaderboard():
    uid = uuid.uuid4().hex[:8]
    test_email = f"contest_user_{uid}@example.com"
    test_display = f"Contestant_{uid}"

    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        # 1. Register candidate
        reg_payload = {
            "email": test_email,
            "password": "Password123!",
            "displayName": test_display,
            "role": "candidate",
        }
        res_reg = await client.post("/api/v1/auth/register", json=reg_payload)
        assert res_reg.status_code == 201
        token = res_reg.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # 2. List contests
        res_list = await client.get("/api/v1/contests", headers=headers)
        assert res_list.status_code == 200
        contests = res_list.json()
        assert len(contests) >= 1
        active_contest = contests[0]

        # 3. Get contest by slug
        res_detail = await client.get(f"/api/v1/contests/{active_contest['slug']}", headers=headers)
        assert res_detail.status_code == 200
        detail = res_detail.json()
        assert detail["id"] == active_contest["id"]
        assert len(detail["challenges"]) >= 1

        # 4. Register for contest
        res_join = await client.post(f"/api/v1/contests/{active_contest['id']}/register", headers=headers)
        assert res_join.status_code == 200

        # 5. Get leaderboard
        res_lead = await client.get(f"/api/v1/contests/{active_contest['id']}/leaderboard")
        assert res_lead.status_code == 200
        leaderboard = res_lead.json()
        assert leaderboard["contest_id"] == active_contest["id"]
        assert len(leaderboard["entries"]) >= 1

