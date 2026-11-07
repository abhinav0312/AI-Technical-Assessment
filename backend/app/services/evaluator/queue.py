import asyncio
from datetime import datetime, timezone
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from app.db.session import AsyncSessionLocal
from app.models.submission import Submission, SubmissionTestCaseResult
from app.models.challenge import Challenge
from app.models.test_case import TestCase
from app.services.evaluator.engine import EvaluationEngine
from app.core.logging import logger

_submission_queue: asyncio.Queue = asyncio.Queue()
_worker_task: asyncio.Task = None


async def enqueue_submission(submission_id: str):
    await _submission_queue.put(submission_id)
    logger.info(f"Enqueued submission {submission_id} for background evaluation.")


async def process_submission(submission_id: str):
    async with AsyncSessionLocal() as session:
        try:
            stmt = select(Submission).where(Submission.id == submission_id)
            res = await session.execute(stmt)
            submission = res.scalar_one_or_none()
            if not submission:
                logger.error(f"Submission {submission_id} not found in database for evaluation.")
                return

            submission.status = "evaluating"
            await session.commit()

            # Load all test cases for this challenge
            tc_stmt = (
                select(TestCase)
                .where(TestCase.challenge_id == submission.challenge_id)
                .order_by(TestCase.order_index)
            )
            tc_res = await session.execute(tc_stmt)
            test_cases = list(tc_res.scalars().all())

            # Evaluate against test cases
            summary = await EvaluationEngine.evaluate_submission(
                language=submission.language,
                source_code=submission.source_code,
                test_cases=test_cases,
                is_sample_only=submission.is_sample_run,
            )

            # Record test results in database
            for tr in summary.test_results:
                test_res_row = SubmissionTestCaseResult(
                    submission_id=submission.id,
                    test_case_id=tr.test_case_id,
                    is_sample=tr.is_sample,
                    status=tr.status,
                    stdin=tr.stdin,
                    expected_output=tr.expected_output,
                    actual_output=tr.actual_output,
                    error_message=tr.error_message,
                    execution_time_ms=tr.execution_time_ms,
                    order_index=tr.order_index,
                )
                session.add(test_res_row)

            # Update submission outcome
            submission.status = summary.status.value
            submission.score = summary.score
            submission.execution_time_ms = summary.total_execution_time_ms
            submission.total_tests = summary.total_tests
            submission.passed_tests = summary.passed_tests
            submission.error_message = summary.error_message
            submission.evaluated_at = datetime.now(timezone.utc)

            await session.commit()
            logger.info(
                f"Evaluated submission {submission_id}: status={summary.status.value}, score={summary.score}%"
            )

        except Exception as e:
            logger.error(f"Exception processing submission {submission_id}: {e}", exc_info=True)
            try:
                submission.status = "runtime_error"
                submission.error_message = f"Evaluation worker error: {str(e)}"
                submission.evaluated_at = datetime.now(timezone.utc)
                await session.commit()
            except Exception:
                pass


async def evaluation_worker():
    logger.info("Evaluation background worker started.")
    while True:
        try:
            submission_id = await _submission_queue.get()
            try:
                await process_submission(submission_id)
            finally:
                _submission_queue.task_done()
        except asyncio.CancelledError:
            logger.info("Evaluation worker received cancel signal.")
            break
        except Exception as e:
            logger.error(f"Unexpected error in evaluation worker loop: {e}", exc_info=True)
            await asyncio.sleep(0.5)


def start_evaluator_worker():
    global _worker_task
    if _worker_task is None or _worker_task.done():
        _worker_task = asyncio.create_task(evaluation_worker())


def stop_evaluator_worker():
    global _worker_task
    if _worker_task and not _worker_task.done():
        _worker_task.cancel()
