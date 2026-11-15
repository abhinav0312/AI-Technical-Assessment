import uuid
import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app


@pytest.mark.asyncio
async def test_admin_stats_and_challenge_generation():
    uid = uuid.uuid4().hex[:8]
    admin_email = f"admin_{uid}@devmind.ai"
    admin_display = f"Admin_{uid}"

    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        # 1. Register admin user
        reg_payload = {
            "email": admin_email,
            "password": "Password123!",
            "displayName": admin_display,
            "role": "admin",
        }
        res_reg = await client.post("/api/v1/auth/register", json=reg_payload)
        assert res_reg.status_code == 201
        token = res_reg.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # 2. Get admin stats
        res_stats = await client.get("/api/v1/admin/stats", headers=headers)
        assert res_stats.status_code == 200
        stats = res_stats.json()
        assert stats["total_users"] >= 1
        assert stats["total_challenges"] >= 1

        # 3. Generate challenge preview
        res_gen = await client.post(
            "/api/v1/admin/generate-challenge",
            json={"topic": "Trie Prefix Search", "difficulty": "medium", "category": "data_structures"},
            headers=headers,
        )
        assert res_gen.status_code == 200
        generated = res_gen.json()
        assert "title" in generated
        assert "starter_code" in generated
        assert len(generated["sample_test_cases"]) >= 1

        # 4. Publish generated challenge
        res_pub = await client.post(
            "/api/v1/admin/publish-challenge",
            json={"challenge_data": generated},
            headers=headers,
        )
        assert res_pub.status_code == 201
        pub_data = res_pub.json()
        assert "id" in pub_data
        assert "slug" in pub_data

        # 5. Verify challenge is accessible publicly
        res_check = await client.get(f"/api/v1/challenges/{pub_data['slug']}")
        assert res_check.status_code == 200

