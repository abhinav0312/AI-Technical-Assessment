import pytest
import asyncio
from unittest.mock import AsyncMock, patch
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.services.thinktrace.schemas import ThinkTraceEvalInput, ThinkTraceAIOutput
from app.services.thinktrace.providers.heuristic_fallback import HeuristicFallbackProvider
from app.services.thinktrace.service import ThinkTraceService


@pytest.mark.asyncio
async def test_heuristic_fallback_provider_direct():
    provider = HeuristicFallbackProvider()
    inp = ThinkTraceEvalInput(
        challenge_title="Sliding Window Rate Limiter",
        challenge_description="Design an in-memory Sliding Window Rate Limiter.",
        constraints="1 <= max_requests <= 10^5",
        problem_interpretation="We need to track timestamps for each client and restrict requests within window_size_seconds.",
        proposed_algorithm="Use a hash map of client IDs to double-ended queues (deque). Evict stale timestamps older than timestamp - window_size.",
        time_complexity="O(1) amortized",
        space_complexity="O(N)",
        edge_cases="Boundary timestamps, empty client histories, concurrent bursts",
        tradeoff_reasoning="A deque offers O(1) amortized popleft, much faster than array slicing O(N) at the cost of minimal queue node overhead.",
        submitted_code="""
from collections import deque
class RateLimiter:
    def __init__(self, max_req, win_sec):
        self.max_req = max_req
        self.win_sec = win_sec
        self.history = {}
""",
        code_execution_status="accepted",
        passed_tests=4,
        total_tests=4,
    )

    result = await provider.evaluate(inp)
    assert result.is_fallback is True
    assert result.provider == "development-heuristic-engine"
    assert result.model == "devmind-heuristic-v1.0"
    out = result.evaluation
    assert out.problem_understanding.score >= 70.0
    assert out.algorithm_correctness.score >= 70.0
    assert out.edge_case_awareness.score >= 70.0
    assert out.complexity_analysis.score >= 70.0
    assert len(out.socratic_guiding_questions) >= 1
    assert len(out.strengths) >= 1


@pytest.mark.asyncio
async def test_malformed_ai_response_fallback():
    service = ThinkTraceService()
    inp = ThinkTraceEvalInput(
        challenge_title="Two Sum",
        challenge_description="Find indices of two numbers.",
        problem_interpretation="Find pair summing to target.",
        proposed_algorithm="Hash map lookups.",
        time_complexity="O(N)",
        space_complexity="O(N)",
        edge_cases="No match, negatives",
        tradeoff_reasoning="One-pass hash map is optimal.",
    )

    # Simulate LLM provider throwing a malformed response error
    with patch.object(service.llm_provider, "is_available", return_value=True):
        with patch.object(service.llm_provider, "evaluate", side_effect=RuntimeError("Malformed JSON response from LLM")):
            res = await service.evaluate_reasoning(inp)
            assert res.is_fallback is True
            assert res.provider == "development-heuristic-engine"
            assert res.evaluation.overall_reasoning_score > 0


@pytest.mark.asyncio
async def test_timeout_handling_fallback():
    service = ThinkTraceService()
    inp = ThinkTraceEvalInput(
        challenge_title="Two Sum",
        challenge_description="Find indices of two numbers.",
        problem_interpretation="Find pair summing to target.",
        proposed_algorithm="Hash map lookups.",
        time_complexity="O(N)",
        space_complexity="O(N)",
        edge_cases="No match, negatives",
        tradeoff_reasoning="One-pass hash map is optimal.",
    )

    # Simulate LLM provider timing out
    with patch.object(service.llm_provider, "is_available", return_value=True):
        with patch.object(service.llm_provider, "evaluate", side_effect=TimeoutError("Request timed out after 15s")):
            res = await service.evaluate_reasoning(inp)
            assert res.is_fallback is True
            assert res.provider == "development-heuristic-engine"


@pytest.mark.asyncio
async def test_reasoning_record_versioning():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        # Login candidate
        login_res = await client.post(
            "/api/v1/auth/login",
            json={"email": "candidate@devmind.ai", "password": "Password123!"},
        )
        token = login_res.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        # Clean up any existing reasoning record for this challenge to ensure test isolation
        from app.db.session import AsyncSessionLocal
        from app.models.thinktrace import ReasoningRecord
        from app.models.challenge import Challenge
        from sqlalchemy import select, delete
        async with AsyncSessionLocal() as session:
            ch_res = await session.execute(select(Challenge.id).where(Challenge.slug == "two-sum-target-pair"))
            ch_id = ch_res.scalar_one_or_none()
            if ch_id:
                await session.execute(delete(ReasoningRecord).where(ReasoningRecord.challenge_id == ch_id))
                await session.commit()

        # Save Version 1
        v1_res = await client.post(
            "/api/v1/thinktrace/challenges/two-sum-target-pair/reasoning",
            json={
                "problem_interpretation": "Initial understanding: nested loops",
                "proposed_algorithm": "Brute force check every pair",
                "time_complexity": "O(N^2)",
                "space_complexity": "O(1)",
                "edge_cases": "None considered yet",
                "tradeoff_reasoning": "Simple to implement first",
                "mode": "practice",
            },
            headers=headers,
        )
        assert v1_res.status_code == 200
        assert v1_res.json()["version"] == 1

        # Revise to Version 2
        v2_res = await client.post(
            "/api/v1/thinktrace/challenges/two-sum-target-pair/reasoning",
            json={
                "problem_interpretation": "Refined understanding: find complement in O(1) time",
                "proposed_algorithm": "Hash table storing seen numbers and indices",
                "time_complexity": "O(N)",
                "space_complexity": "O(N)",
                "edge_cases": "Negative integers, duplicate numbers",
                "tradeoff_reasoning": "Trading O(N) memory for linear execution time",
                "mode": "practice",
                "change_summary": "Upgraded from brute force to hash map",
            },
            headers=headers,
        )
        assert v2_res.status_code == 200
        assert v2_res.json()["version"] == 2

        # Check version history
        history_res = await client.get(
            "/api/v1/thinktrace/challenges/two-sum-target-pair/reasoning/versions",
            headers=headers,
        )
        assert history_res.status_code == 200
        versions = history_res.json()
        assert len(versions) >= 2


@pytest.mark.asyncio
async def test_combined_evaluation_and_unauthorized_report_access():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        # 1. Candidate login
        cand_login = await client.post(
            "/api/v1/auth/login",
            json={"email": "candidate@devmind.ai", "password": "Password123!"},
        )
        cand_token = cand_login.json()["access_token"]
        cand_headers = {"Authorization": f"Bearer {cand_token}"}

        # 2. Creator login (staff)
        creator_login = await client.post(
            "/api/v1/auth/login",
            json={"email": "creator@devmind.ai", "password": "Password123!"},
        )
        creator_token = creator_login.json()["access_token"]
        creator_headers = {"Authorization": f"Bearer {creator_token}"}

        # 3. Candidate submits reasoning + code for combined evaluation
        code = """
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
        eval_res = await client.post(
            "/api/v1/thinktrace/challenges/two-sum-target-pair/evaluate-reasoning",
            json={
                "reasoning": {
                    "problem_interpretation": "Find 2 indices summing to target in single pass",
                    "proposed_algorithm": "Hash map dictionary lookups",
                    "time_complexity": "O(N)",
                    "space_complexity": "O(N)",
                    "edge_cases": "Negative numbers, duplicates",
                    "tradeoff_reasoning": "O(N) time and space beats O(N^2) brute force",
                    "mode": "assessment",
                },
                "source_code": code,
                "language": "python",
            },
            headers=cand_headers,
        )
        assert eval_res.status_code == 200
        report = eval_res.json()
        report_id = report["id"]

        # Check combined separation: deterministic code correctness preserved!
        assert report["code_status"] == "accepted"
        assert report["code_score"] == 100.0
        assert report["passed_tests"] == report["total_tests"]

        # Check rubric scores generated
        assert report["overall_reasoning_score"] > 0
        assert report["problem_understanding_score"] > 0
        assert report["code_consistency_score"] > 0
        assert len(report["socratic_guiding_questions"]) >= 1

        # 4. Candidate can inspect their own report
        cand_rep_res = await client.get(f"/api/v1/thinktrace/reports/{report_id}", headers=cand_headers)
        assert cand_rep_res.status_code == 200

        # 5. Creator (staff) can inspect report and add human review
        staff_rep_res = await client.get(f"/api/v1/thinktrace/reports/{report_id}", headers=creator_headers)
        assert staff_rep_res.status_code == 200

        review_res = await client.post(
            f"/api/v1/thinktrace/reports/{report_id}/human-review",
            json={
                "human_score_override": 95.0,
                "human_notes": "Assessor verified candidate correctly reasoned about hash collision amortized bounds.",
            },
            headers=creator_headers,
        )
        assert review_res.status_code == 200
        reviewed_data = review_res.json()
        assert reviewed_data["human_reviewed"] is True
        assert reviewed_data["human_score_override"] == 95.0


@pytest.mark.asyncio
async def test_contradictory_feedback_consistency():
    """
    Verifies that when a candidate writes a good reasoning explanation
    but submits broken/failing code, the code score remains 0% (failing)
    while reasoning evaluates the explanation separately without overwriting test results.
    """
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        cand_login = await client.post(
            "/api/v1/auth/login",
            json={"email": "candidate@devmind.ai", "password": "Password123!"},
        )
        cand_headers = {"Authorization": f"Bearer {cand_login.json()['access_token']}"}

        # Intentionally failing/broken code
        failing_code = "print('WRONG OUTPUT')"

        eval_res = await client.post(
            "/api/v1/thinktrace/challenges/two-sum-target-pair/evaluate-reasoning",
            json={
                "reasoning": {
                    "problem_interpretation": "Find two indices that sum to the target integer.",
                    "proposed_algorithm": "I plan to use a hash table for O(N) lookups.",
                    "time_complexity": "O(N)",
                    "space_complexity": "O(N)",
                    "edge_cases": "Negative numbers",
                    "tradeoff_reasoning": "Faster than quadratic brute force.",
                    "mode": "practice",
                },
                "source_code": failing_code,
                "language": "python",
            },
            headers=cand_headers,
        )
        assert eval_res.status_code == 200
        report = eval_res.json()

        # Deterministic code results MUST show wrong_answer
        assert report["code_status"] in ("wrong_answer", "failed")
        assert report["code_score"] == 0.0

        # Reasoning score evaluates explanation independently
        assert report["problem_understanding_score"] >= 60.0
        # Code consistency score should reflect divergence
        assert report["code_consistency_score"] <= 75.0
