import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app


@pytest.mark.asyncio
async def test_bughunter_catalog_and_hidden_test_protection():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        cand_login = await client.post(
            "/api/v1/auth/login",
            json={"email": "candidate@devmind.ai", "password": "Password123!"},
        )
        token = cand_login.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # 1. List BugHunter Challenges
        list_res = await client.get("/api/v1/bughunter/challenges", headers=headers)
        assert list_res.status_code == 200
        challenges = list_res.json()
        assert len(challenges) >= 2

        # 2. Get Challenge Detail
        first_slug = challenges[0]["slug"]
        detail_res = await client.get(f"/api/v1/bughunter/challenges/{first_slug}", headers=headers)
        assert detail_res.status_code == 200
        detail = detail_res.json()

        assert "starter_code" in detail
        assert "bug_report" in detail
        assert "public_test_cases" in detail
        # CRITICAL: Hidden test cases must NEVER be exposed in public challenge detail!
        assert "hidden_test_cases" not in detail


@pytest.mark.asyncio
async def test_bughunter_run_reproduction_tests():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        cand_login = await client.post(
            "/api/v1/auth/login",
            json={"email": "candidate@devmind.ai", "password": "Password123!"},
        )
        headers = {"Authorization": f"Bearer {cand_login.json()['access_token']}"}

        # Run broken starter code for unhandled keyerror
        broken_code = """import json, sys
def decode_session_claims(raw_json):
    data = json.loads(raw_json)
    # Broken: direct bracket access crashes on missing keys
    return f"USER:{data['user_id']}|ROLE:{data['roles'][0]}|STATUS:active"

if __name__ == "__main__":
    line = sys.stdin.read().strip()
    if line:
        print(decode_session_claims(line))
"""
        run_res = await client.post(
            "/api/v1/bughunter/challenges/unhandled-keyerror-jwt-session/run-tests",
            json={"code": broken_code, "language": "python"},
            headers=headers,
        )
        assert run_res.status_code == 200
        data = run_res.json()
        assert "test_results" in data
        assert data["total_tests"] >= 2
        # Case without roles must fail or raise error on broken starter
        assert data["all_passed"] is False


@pytest.mark.asyncio
async def test_bughunter_submit_fix_and_gamification():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        cand_login = await client.post(
            "/api/v1/auth/login",
            json={"email": "candidate@devmind.ai", "password": "Password123!"},
        )
        headers = {"Authorization": f"Bearer {cand_login.json()['access_token']}"}

        # Correct fix for unhandled keyerror
        fixed_code = """import json, sys
def decode_session_claims(raw_json):
    try:
        data = json.loads(raw_json)
    except Exception:
        return "ERROR:INVALID_JSON"

    user_id = data.get("user_id", "anonymous")
    roles = data.get("roles", [])
    exp_timestamp = data.get("exp", 0)
    current_time = data.get("current_time", 1000)

    primary_role = roles[0] if len(roles) > 0 else "guest"
    status = "active" if current_time <= exp_timestamp else "expired"
    return f"USER:{user_id}|ROLE:{primary_role}|STATUS:{status}"

if __name__ == "__main__":
    line = sys.stdin.read().strip()
    if line:
        print(decode_session_claims(line))
"""
        sub_res = await client.post(
            "/api/v1/bughunter/challenges/unhandled-keyerror-jwt-session/submit",
            json={
                "code": fixed_code,
                "language": "python",
                "identified_root_cause": "rc1",
                "time_spent_seconds": 120,
            },
            headers=headers,
        )
        assert sub_res.status_code == 200
        report = sub_res.json()
        assert report["is_bug_fixed"] is True
        assert report["regressions_passed"] is True
        assert report["score"] == 100.0
        assert report["status"] == "accepted"
        assert report["root_cause_correct"] is True
        assert "ai_review" in report

        # Verify streak and badge state
        streak_res = await client.get("/api/v1/bughunter/streak", headers=headers)
        assert streak_res.status_code == 200
        streak_data = streak_res.json()
        assert streak_data["total_bugs_fixed"] >= 1
        assert streak_data["current_streak"] >= 1
