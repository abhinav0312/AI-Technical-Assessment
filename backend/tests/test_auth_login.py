import uuid
import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app

@pytest.mark.asyncio
async def test_login_with_email_and_display_name_and_id():
    uid = uuid.uuid4().hex[:8]
    test_email = f"user_{uid}@cyberdyne.org"
    test_display = f"CyberWarrior_{uid}"
    
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        # 1. Register a test user
        reg_payload = {
            "email": test_email,
            "password": "Password123!",
            "displayName": test_display,
            "role": "candidate",
        }
        res_reg = await client.post("/api/v1/auth/register", json=reg_payload)
        assert res_reg.status_code == 201
        data_reg = res_reg.json()
        user_id = data_reg["user"]["id"]

        # 2. Login with email
        res_email = await client.post("/api/v1/auth/login", json={
            "email": test_email,
            "password": "Password123!",
        })
        assert res_email.status_code == 200
        assert res_email.json()["user"]["email"] == test_email

        # 3. Login with username / display_name
        res_user = await client.post("/api/v1/auth/login", json={
            "identifier": test_display,
            "password": "Password123!",
        })
        assert res_user.status_code == 200
        assert res_user.json()["user"]["id"] == user_id

        # 4. Login with user ID
        res_id = await client.post("/api/v1/auth/login", json={
            "identifier": user_id,
            "password": "Password123!",
        })
        assert res_id.status_code == 200
        assert res_id.json()["user"]["id"] == user_id
