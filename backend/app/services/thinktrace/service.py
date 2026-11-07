from typing import Optional
from app.services.thinktrace.schemas import (
    ThinkTraceEvalInput,
    ThinkTraceServiceResult,
)
from app.services.thinktrace.providers.heuristic_fallback import HeuristicFallbackProvider
from app.services.thinktrace.providers.llm_provider import LLMProvider
from app.core.logging import logger


class ThinkTraceService:
    """
    Unified ThinkTrace AI Evaluation Service.
    Manages provider selection, timeout handling, and deterministic fallback.
    """

    def __init__(self):
        self.fallback_provider = HeuristicFallbackProvider()
        self.llm_provider = LLMProvider()

    async def evaluate_reasoning(self, inp: ThinkTraceEvalInput) -> ThinkTraceServiceResult:
        # Check if live LLM provider is configured with an active API key
        if self.llm_provider.is_available():
            try:
                logger.info("Evaluating reasoning via configured live AI Provider...")
                result = await self.llm_provider.evaluate(inp)
                return result
            except Exception as e:
                logger.warning(
                    f"Live AI provider evaluation failed or timed out ({e}). Engaging development heuristic fallback.",
                    exc_info=True,
                )

        # Fallback evaluation with transparent labeling
        logger.info("Executing ThinkTrace evaluation via development heuristic engine.")
        fallback_result = await self.fallback_provider.evaluate(inp)
        return fallback_result


# Singleton instance
thinktrace_service = ThinkTraceService()
