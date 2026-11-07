import json
import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app

@pytest.mark.asyncio
async def test_google_auth_registration_and_login():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        # 1. Register new user via Google
        mock_payload = {
            "email": "dr.evelyn.stone@gmail.com",
            "name": "Dr. Evelyn Stone",
            "sub": "google-oauth2|99887766",
        }
        res = await client.post(
            "/api/v1/auth/google",
            json={
                "credential": json.dumps(mock_payload),
                "role": "candidate",
            },
        )
        assert res.status_code == 200, res.text
        data = res.json()
        assert "access_token" in data
        assert data["user"]["email"] == "dr.evelyn.stone@gmail.com"
        assert data["user"]["display_name"] == "Dr. Evelyn Stone"
        assert data["user"]["role"] == "candidate"

        # 2. Login existing user with Google
        res_login = await client.post(
            "/api/v1/auth/google",
            json={
                "credential": json.dumps(mock_payload),
                "role": "candidate",
            },
        )
        assert res_login.status_code == 200
        data_login = res_login.json()
        assert data_login["user"]["id"] == data["user"]["id"]
        assert data_login["user"]["email"] == "dr.evelyn.stone@gmail.com"

