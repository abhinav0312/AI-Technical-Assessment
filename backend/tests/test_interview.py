import uuid
import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app


@pytest.mark.asyncio
async def test_interview_session_lifecycle():
    uid = uuid.uuid4().hex[:8]
    test_email = f"interview_user_{uid}@example.com"
    test_display = f"Interviewee_{uid}"

    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        # 1. Register test candidate
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

        # 2. Create interview session
        res_sess = await client.post(
            "/api/v1/interview/sessions",
            json={"role_target": "Senior Backend Engineer", "difficulty": "medium"},
            headers=headers,
        )
        assert res_sess.status_code == 201, res_sess.text
        session = res_sess.json()
        session_id = session["id"]
        assert session["status"] == "in_progress"
        assert len(session["turns"]) >= 1
        assert session["turns"][0]["sender"] == "interviewer"

        # 3. Candidate sends a message
        res_msg = await client.post(
            f"/api/v1/interview/sessions/{session_id}/message",
            json={
                "message": "I plan to use a hash map and a doubly linked list to achieve O(1) operations.",
                "current_code": session["initial_code"],
            },
            headers=headers,
        )
        assert res_msg.status_code == 200
        updated_session = res_msg.json()
        assert len(updated_session["turns"]) >= 3
        assert updated_session["turns"][1]["sender"] == "candidate"
        assert updated_session["turns"][2]["sender"] == "interviewer"

        # 4. Candidate syncs code
        res_code = await client.post(
            f"/api/v1/interview/sessions/{session_id}/code",
            json={"code": "class LRUCacheWithTTL:\n    pass\n", "language": "python"},
            headers=headers,
        )
        assert res_code.status_code == 200

        # 5. Complete interview and get scorecard
        res_comp = await client.post(
            f"/api/v1/interview/sessions/{session_id}/complete",
            json={"final_code": "class LRUCacheWithTTL:\n    pass\n"},
            headers=headers,
        )
        assert res_comp.status_code == 200
        comp_session = res_comp.json()
        assert comp_session["status"] == "completed"
        assert comp_session["score"] is not None
        assert comp_session["recommendation"] in ["Strong Hire", "Hire", "Lean Hire", "No Hire"]
