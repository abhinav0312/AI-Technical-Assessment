import pytest
from app.services.thinktrace.schemas import ThinkTraceEvalInput
from app.services.thinktrace.service import thinktrace_service


@pytest.mark.asyncio
async def test_thinktrace_flash_lite_engine():
    # Test Tier 1 (Low-level Flash Lite AST analysis)
    code = """
def two_sum(nums, target):
    seen = {}
    for i, num in enumerate(nums):
        complement = target - num
        if complement in seen:
            return [seen[complement], i]
        seen[num] = i
    return []
"""
    inp = ThinkTraceEvalInput(
        challenge_title="Two Sum",
        challenge_description="Find two integers that sum to target.",
        problem_interpretation="Use a hash map to look up complements in O(1) time.",
        proposed_algorithm="Iterate once through nums, looking up target - num in dict.",
        time_complexity="O(N)",
        space_complexity="O(N)",
        edge_cases="Single element, no solution, negative numbers.",
        tradeoff_reasoning="O(N) memory is preferred over O(N^2) brute force nested loops.",
        submitted_code=code,
        language="python",
        tier="flash_lite",
    )

    result = await thinktrace_service.evaluate_reasoning(inp, tier="flash_lite")
    assert result.tier == "flash_lite"
    assert "lite" in result.model.lower()
    assert result.diagnostic_metrics is not None
    assert result.diagnostic_metrics["ast_loop_depth"] == 1
    assert result.diagnostic_metrics["detected_structural_bound"] == "O(N)"
    assert result.diagnostic_metrics["complexity_match"] is True
    assert result.evaluation.overall_reasoning_score > 70.0


@pytest.mark.asyncio
async def test_thinktrace_flash_pro_engine():
    # Test Tier 2 (High-level Flash Pro Cognitive analysis)
    code = """
def max_subarray(nums):
    max_so_far = nums[0]
    curr_max = nums[0]
    for x in nums[1:]:
        curr_max = max(x, curr_max + x)
        max_so_far = max(max_so_far, curr_max)
    return max_so_far
"""
    inp = ThinkTraceEvalInput(
        challenge_title="Maximum Subarray",
        challenge_description="Find contiguous subarray with largest sum.",
        problem_interpretation="Kadane's algorithm tracking max subarray ending at current position.",
        proposed_algorithm="Single pass dynamic programming updating local and global maximums.",
        time_complexity="O(N)",
        space_complexity="O(1)",
        edge_cases="All negative values, single item, large array.",
        tradeoff_reasoning="O(N) time and O(1) space is optimal compared to divide and conquer O(N log N).",
        submitted_code=code,
        language="python",
        tier="flash_pro",
    )

    result = await thinktrace_service.evaluate_reasoning(inp, tier="flash_pro")
    assert result.tier == "flash_pro"
    assert "pro" in result.model.lower()
    assert result.diagnostic_metrics is not None
    assert result.diagnostic_metrics["formal_edge_proofs_count"] >= 1
    assert len(result.evaluation.socratic_guiding_questions) >= 2
    assert result.evaluation.overall_reasoning_score > 70.0

