import pytest
import asyncio
from app.services.evaluator.runner import SubprocessRunner
from app.services.evaluator.comparator import normalize_output, compare_outputs
from app.services.evaluator.engine import EvaluationEngine
from app.models.test_case import TestCase


@pytest.mark.asyncio
async def test_subprocess_runner_correct_python():
    code = """
import sys
lines = sys.stdin.read().splitlines()
if lines:
    nums = list(map(int, lines[0].split()))
    target = int(lines[1])
    seen = {}
    for i, x in enumerate(nums):
        if target - x in seen:
            print(f"{seen[target - x]} {i}")
            break
        seen[x] = i
"""
    stdin = "2 7 11 15\n9"
    res = await SubprocessRunner.execute_code("python", code, stdin, timeout_seconds=3.0)
    assert res.exit_code == 0
    assert not res.is_timed_out
    assert normalize_output(res.stdout) == "0 1"


@pytest.mark.asyncio
async def test_subprocess_runner_syntax_error():
    code = "def broken_code( : invalid syntax"
    res = await SubprocessRunner.execute_code("python", code, "", timeout_seconds=2.0)
    assert res.compilation_error is not None
    assert "SyntaxError" in res.compilation_error


@pytest.mark.asyncio
async def test_subprocess_runner_runtime_error():
    code = """
import sys
x = 1 / 0
"""
    res = await SubprocessRunner.execute_code("python", code, "", timeout_seconds=2.0)
    assert res.exit_code != 0
    assert "ZeroDivisionError" in res.stderr


@pytest.mark.asyncio
async def test_subprocess_runner_timeout():
    code = """
import time
while True:
    time.sleep(0.1)
"""
    res = await SubprocessRunner.execute_code("python", code, "", timeout_seconds=1.0)
    assert res.is_timed_out
    assert "timed out" in res.stderr.lower()


@pytest.mark.asyncio
async def test_subprocess_runner_javascript():
    code = """
const fs = require('fs');
const input = fs.readFileSync(0, 'utf-8').trim();
console.log(`HELLO_${input}`);
"""
    res = await SubprocessRunner.execute_code("typescript", code, "WORLD", timeout_seconds=3.0)
    assert res.exit_code == 0
    assert normalize_output(res.stdout) == "HELLO_WORLD"


def test_comparator():
    assert compare_outputs("hello \r\nworld  \n", "hello\nworld")[0]
    assert not compare_outputs("result 10", "result 20")[0]


@pytest.mark.asyncio
async def test_evaluation_engine_sample_and_hidden_confidentiality():
    tc_sample = TestCase(
        id="tc-1",
        challenge_id="ch-1",
        stdin="2 7 11 15\n9",
        expected_output="0 1",
        is_sample=True,
        weight=1.0,
        order_index=0,
    )
    tc_hidden = TestCase(
        id="tc-2",
        challenge_id="ch-1",
        stdin="-3 4 3 90\n0",
        expected_output="0 2",
        is_sample=False,
        weight=1.0,
        order_index=1,
    )

    code = """
import sys
lines = sys.stdin.read().splitlines()
nums = list(map(int, lines[0].split()))
target = int(lines[1])
seen = {}
for i, x in enumerate(nums):
    if target - x in seen:
        print(f"{seen[target - x]} {i}")
        break
    seen[x] = i
"""
    summary = await EvaluationEngine.evaluate_submission("python", code, [tc_sample, tc_hidden])
    assert summary.status == "accepted"
    assert summary.score == 100.0
    assert len(summary.test_results) == 2

    # Verify confidentiality: sample test exposes stdin/expected/actual, hidden test does NOT!
    sample_res = summary.test_results[0]
    hidden_res = summary.test_results[1]

    assert sample_res.is_sample is True
    assert sample_res.stdin == "2 7 11 15\n9"
    assert sample_res.expected_output == "0 1"
    assert sample_res.actual_output is not None

    assert hidden_res.is_sample is False
    assert hidden_res.stdin is None
    assert hidden_res.expected_output is None
    assert hidden_res.actual_output is None
