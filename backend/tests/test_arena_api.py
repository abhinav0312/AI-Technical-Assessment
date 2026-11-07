import pytest
import asyncio
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.core.security import create_access_token


@pytest.fixture
def candidate_token():
    # User id for candidate Alex Mercer in seed data
    return create_access_token(data={"sub": "candidate-user-id", "role": "candidate"})


@pytest.fixture
def other_candidate_token():
    return create_access_token(data={"sub": "other-candidate-user-id", "role": "candidate"})


@pytest.fixture
def admin_token():
    return create_access_token(data={"sub": "admin-user-id", "role": "admin"})


@pytest.mark.asyncio
async def test_list_challenges_public():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        res = await client.get("/api/v1/challenges")
        assert res.status_code == 200
        data = res.json()
        assert "items" in data
        assert "total" in data
        assert data["total"] >= 1
        # Validate structure
        first = data["items"][0]
        assert "title" in first
        assert "slug" in first
        assert "difficulty" in first


@pytest.mark.asyncio
async def test_filter_and_search_challenges():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        # Search by keyword
        res = await client.get("/api/v1/challenges?search=Two+Sum")
        assert res.status_code == 200
        data = res.json()
        assert any("Two Sum" in item["title"] for item in data["items"])

        # Filter by difficulty
        res_diff = await client.get("/api/v1/challenges?difficulty=easy")
        assert res_diff.status_code == 200
        for item in res_diff.json()["items"]:
            assert item["difficulty"] == "easy"


@pytest.mark.asyncio
async def test_get_challenge_detail_public():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        res = await client.get("/api/v1/challenges/two-sum-target-pair")
        assert res.status_code == 200
        data = res.json()
        assert data["title"] == "Two Sum Target Pair Finder"
        assert "sample_test_cases" in data
        # Ensure sample test cases are returned, and none are hidden
        assert len(data["sample_test_cases"]) >= 1
        for stc in data["sample_test_cases"]:
            assert "stdin" in stc
            assert "expected_output" in stc


@pytest.mark.asyncio
async def test_run_sample_tests_direct():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        # Login candidate
        login_res = await client.post(
            "/api/v1/auth/login",
            json={"email": "candidate@devmind.ai", "password": "Password123!"},
        )
        assert login_res.status_code == 200
        token = login_res.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # Run sample test with correct python solution
        sol_code = """
import sys

def two_sum(nums, target):
    seen = {}
    for i, x in enumerate(nums):
        if target - x in seen:
            return [seen[target - x], i]
        seen[x] = i
    return []

if __name__ == "__main__":
    lines = sys.stdin.read().splitlines()
    if len(lines) >= 2:
        nums = list(map(int, lines[0].split()))
        target = int(lines[1].strip())
        res = two_sum(nums, target)
        print(f"{res[0]} {res[1]}")
"""
        run_res = await client.post(
            "/api/v1/challenges/two-sum-target-pair/run-sample",
            json={"language": "python", "source_code": sol_code},
            headers=headers,
        )
        assert run_res.status_code == 200
        res_data = run_res.json()
        assert res_data["status"] == "accepted"
        assert res_data["score"] == 100.0
        assert res_data["passed_tests"] == len(res_data["test_results"])


@pytest.mark.asyncio
async def test_draft_and_bookmark():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        # Login candidate
        login_res = await client.post(
            "/api/v1/auth/login",
            json={"email": "candidate@devmind.ai", "password": "Password123!"},
        )
        assert login_res.status_code == 200
        token = login_res.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # Save code draft
        draft_res = await client.put(
            "/api/v1/challenges/two-sum-target-pair/draft",
            json={"language": "python", "code": "# My draft code"},
            headers=headers,
        )
        assert draft_res.status_code == 200
        assert draft_res.json()["code"] == "# My draft code"

        # Read back code draft
        get_draft_res = await client.get(
            "/api/v1/challenges/two-sum-target-pair/draft?language=python",
            headers=headers,
        )
        assert get_draft_res.status_code == 200
        assert get_draft_res.json()["code"] == "# My draft code"

        # Toggle bookmark
        bm_res = await client.post(
            "/api/v1/challenges/two-sum-target-pair/bookmark",
            headers=headers,
        )
        assert bm_res.status_code == 200
        assert "is_bookmarked" in bm_res.json()


@pytest.mark.asyncio
async def test_submit_and_submission_isolation():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        # Candidate 1 login
        cand_login = await client.post(
            "/api/v1/auth/login",
            json={"email": "candidate@devmind.ai", "password": "Password123!"},
        )
        cand_token = cand_login.json()["access_token"]
        cand_headers = {"Authorization": f"Bearer {cand_token}"}

        # Creator login (different user)
        creator_login = await client.post(
            "/api/v1/auth/login",
            json={"email": "creator@devmind.ai", "password": "Password123!"},
        )
        creator_token = creator_login.json()["access_token"]
        creator_headers = {"Authorization": f"Bearer {creator_token}"}

        # Submit code as candidate
        sol_code = """
import sys
lines = sys.stdin.read().splitlines()
if len(lines) >= 2:
    nums = list(map(int, lines[0].split()))
    target = int(lines[1].strip())
    seen = {}
    for i, x in enumerate(nums):
        if target - x in seen:
            print(f"{seen[target - x]} {i}")
            break
        seen[x] = i
"""
        sub_res = await client.post(
            "/api/v1/submissions",
            json={
                "challenge_id": "two-sum-target-pair",
                "language": "python",
                "source_code": sol_code,
            },
            headers=cand_headers,
        )
        assert sub_res.status_code == 201
        sub_data = sub_res.json()
        sub_id = sub_data["id"]
        assert sub_data["status"] in ("queued", "evaluating", "accepted")

        from app.services.evaluator import process_submission

        # Explicitly process submission (in unit tests without lifespan runner)
        await process_submission(sub_id)

        # Check submission details as the author (candidate)
        detail_res = await client.get(f"/api/v1/submissions/{sub_id}", headers=cand_headers)
        assert detail_res.status_code == 200
        evaluated_sub = detail_res.json()
        assert evaluated_sub["status"] == "accepted"
        assert evaluated_sub["score"] == 100.0

        # Verify hidden tests confidentiality: candidate CANNOT see stdin or expected_output of hidden tests
        for tr in evaluated_sub["test_results"]:
            if not tr["is_sample"]:
                assert tr["stdin"] is None
                assert tr["expected_output"] is None
                assert tr["actual_output"] is None

        # Verify creator (staff) CAN view submission details
        staff_res = await client.get(f"/api/v1/submissions/{sub_id}", headers=creator_headers)
        assert staff_res.status_code == 200


@pytest.mark.asyncio
async def test_concurrent_submissions():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        cand_login = await client.post(
            "/api/v1/auth/login",
            json={"email": "candidate@devmind.ai", "password": "Password123!"},
        )
        cand_token = cand_login.json()["access_token"]
        cand_headers = {"Authorization": f"Bearer {cand_token}"}

        code_template = """
import sys
lines = sys.stdin.read().splitlines()
if len(lines) >= 2:
    nums = list(map(int, lines[0].split()))
    target = int(lines[1].strip())
    seen = {}
    for i, x in enumerate(nums):
        if target - x in seen:
            print(f"{seen[target - x]} {i}")
            break
        seen[x] = i
"""
        async def submit_one():
            return await client.post(
                "/api/v1/submissions",
                json={
                    "challenge_id": "two-sum-target-pair",
                    "language": "python",
                    "source_code": code_template,
                },
                headers=cand_headers,
            )

        responses = await asyncio.gather(submit_one(), submit_one(), submit_one())
        sub_ids = []
        for r in responses:
            assert r.status_code == 201
            sub_ids.append(r.json()["id"])

        from app.services.evaluator import process_submission
        await asyncio.gather(*(process_submission(sid) for sid in sub_ids))

        # Check all evaluated to accepted
        for sid in sub_ids:
            res = await client.get(f"/api/v1/submissions/{sid}", headers=cand_headers)
            assert res.status_code == 200
            assert res.json()["status"] == "accepted"


@pytest.mark.asyncio
async def test_queue_failure_and_recovery():
    from app.services.evaluator import process_submission
    # Non-existent submission ID should not crash worker
    await process_submission("non-existent-submission-id-xyz")

    # Queue continues normally for subsequent valid submission
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        cand_login = await client.post(
            "/api/v1/auth/login",
            json={"email": "candidate@devmind.ai", "password": "Password123!"},
        )
        token = cand_login.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        res = await client.post(
            "/api/v1/submissions",
            json={
                "challenge_id": "two-sum-target-pair",
                "language": "python",
                "source_code": "print('0 1')",
            },
            headers=headers,
        )
        assert res.status_code == 201
        sid = res.json()["id"]
        await process_submission(sid)

        check_res = await client.get(f"/api/v1/submissions/{sid}", headers=headers)
        assert check_res.status_code == 200
        assert check_res.json()["status"] in ("accepted", "wrong_answer")
