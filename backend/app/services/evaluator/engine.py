from typing import List, Optional
from app.services.evaluator.schemas import (
    EvaluationStatus,
    SingleTestResult,
    EvaluationSummary,
)
from app.services.evaluator.runner import SubprocessRunner
from app.services.evaluator.comparator import compare_outputs
from app.models.test_case import TestCase
from app.core.logging import logger


class EvaluationEngine:
    @staticmethod
    async def evaluate_submission(
        language: str,
        source_code: str,
        test_cases: List[TestCase],
        is_sample_only: bool = False,
    ) -> EvaluationSummary:
        """
        Executes untrusted code against a list of test cases in an isolated sandbox.
        Strictly prevents leaking hidden test case inputs and expected outputs.
        """
        if not test_cases:
            return EvaluationSummary(
                status=EvaluationStatus.ACCEPTED,
                score=100.0,
                total_tests=0,
                passed_tests=0,
                total_execution_time_ms=0.0,
                max_memory_kb=0.0,
                test_results=[],
            )

        results: List[SingleTestResult] = []
        total_time_ms = 0.0
        passed_weight = 0.0
        total_weight = 0.0
        passed_count = 0
        overall_status: Optional[EvaluationStatus] = None
        first_error_message: Optional[str] = None

        for tc in test_cases:
            if is_sample_only and not tc.is_sample:
                continue

            total_weight += tc.weight

            # Execute test case in isolated subprocess
            sub_res = await SubprocessRunner.execute_code(
                language=language,
                source_code=source_code,
                stdin_data=tc.stdin or "",
                timeout_seconds=3.0,
            )

            total_time_ms += sub_res.execution_time_ms

            # Check for compilation / syntax errors
            if sub_res.compilation_error:
                overall_status = EvaluationStatus.COMPILATION_ERROR
                first_error_message = sub_res.compilation_error
                results.append(
                    SingleTestResult(
                        test_case_id=tc.id,
                        is_sample=tc.is_sample,
                        status="compilation_error",
                        stdin=tc.stdin if tc.is_sample else None,
                        expected_output=tc.expected_output if tc.is_sample else None,
                        actual_output=None,
                        error_message=sub_res.compilation_error if tc.is_sample else "Compilation error during execution.",
                        execution_time_ms=sub_res.execution_time_ms,
                        order_index=tc.order_index,
                    )
                )
                break  # Stop further execution on compilation failure

            # Check for timeout
            if sub_res.is_timed_out:
                if overall_status is None:
                    overall_status = EvaluationStatus.TIME_LIMIT_EXCEEDED
                results.append(
                    SingleTestResult(
                        test_case_id=tc.id,
                        is_sample=tc.is_sample,
                        status="timed_out",
                        stdin=tc.stdin if tc.is_sample else None,
                        expected_output=tc.expected_output if tc.is_sample else None,
                        actual_output=None,
                        error_message="Time limit exceeded (3000ms)",
                        execution_time_ms=sub_res.execution_time_ms,
                        order_index=tc.order_index,
                    )
                )
                continue

            # Check for runtime error (non-zero exit code or stderr traceback)
            if sub_res.exit_code != 0:
                if overall_status is None:
                    overall_status = EvaluationStatus.RUNTIME_ERROR
                    first_error_message = sub_res.stderr or "Runtime error during execution"
                results.append(
                    SingleTestResult(
                        test_case_id=tc.id,
                        is_sample=tc.is_sample,
                        status="runtime_error",
                        stdin=tc.stdin if tc.is_sample else None,
                        expected_output=tc.expected_output if tc.is_sample else None,
                        actual_output=sub_res.stdout if tc.is_sample else None,
                        error_message=sub_res.stderr if tc.is_sample else "Runtime error occurred.",
                        execution_time_ms=sub_res.execution_time_ms,
                        order_index=tc.order_index,
                    )
                )
                continue

            # Check correctness against expected output
            is_match, norm_actual, norm_expected = compare_outputs(
                sub_res.stdout, tc.expected_output
            )

            if is_match:
                passed_weight += tc.weight
                passed_count += 1
                results.append(
                    SingleTestResult(
                        test_case_id=tc.id,
                        is_sample=tc.is_sample,
                        status="passed",
                        stdin=tc.stdin if tc.is_sample else None,
                        expected_output=tc.expected_output if tc.is_sample else None,
                        actual_output=sub_res.stdout if tc.is_sample else None,
                        error_message=None,
                        execution_time_ms=sub_res.execution_time_ms,
                        order_index=tc.order_index,
                    )
                )
            else:
                if overall_status is None:
                    overall_status = EvaluationStatus.WRONG_ANSWER
                results.append(
                    SingleTestResult(
                        test_case_id=tc.id,
                        is_sample=tc.is_sample,
                        status="failed",
                        stdin=tc.stdin if tc.is_sample else None,
                        expected_output=tc.expected_output if tc.is_sample else None,
                        actual_output=sub_res.stdout if tc.is_sample else None,
                        error_message="Output mismatch" if tc.is_sample else "Test case failed.",
                        execution_time_ms=sub_res.execution_time_ms,
                        order_index=tc.order_index,
                    )
                )

        # Compute final score
        score = round((passed_weight / total_weight) * 100.0, 1) if total_weight > 0 else 0.0

        if overall_status is None:
            if passed_count == len(results) and len(results) > 0:
                overall_status = EvaluationStatus.ACCEPTED
            else:
                overall_status = EvaluationStatus.WRONG_ANSWER

        return EvaluationSummary(
            status=overall_status,
            score=score,
            total_tests=len(results),
            passed_tests=passed_count,
            total_execution_time_ms=round(total_time_ms, 2),
            max_memory_kb=0.0,
            error_message=first_error_message,
            test_results=results,
        )
