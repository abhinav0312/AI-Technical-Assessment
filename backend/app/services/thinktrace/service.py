from typing import Optional
from app.services.thinktrace.schemas import (
    ThinkTraceEvalInput,
    ThinkTraceServiceResult,
)
from app.services.thinktrace.engines.flash_lite import FlashLiteEngine
from app.services.thinktrace.engines.flash_pro import FlashProEngine
from app.core.logging import logger


class ThinkTraceService:
    """
    Dual-Tier ThinkTrace AI Intelligence Engine (Gemini Flash Architecture).
    - Tier 1 (Flash Lite): Sub-second AST & Static Structural Intelligence.
    - Tier 2 (Flash Pro): Deep Cognitive Multi-Pillar Semantic Reasoning & Formal Invariant Proofs.
    """

    def __init__(self):
        self.flash_lite_engine = FlashLiteEngine()
        self.flash_pro_engine = FlashProEngine()

    @property
    def llm_provider(self):
        return self.flash_pro_engine.llm_provider

    async def evaluate_reasoning(
        self,
        inp: ThinkTraceEvalInput,
        tier: Optional[str] = None
    ) -> ThinkTraceServiceResult:
        selected_tier = (tier or inp.tier or "flash_pro").lower()

        if selected_tier == "flash_lite":
            logger.info("Executing ThinkTrace Tier 1 (Flash Lite: Sub-second AST / Static Analysis)...")
            return await self.flash_lite_engine.evaluate(inp)

        # Default to Flash Pro (Deep Cognitive Intelligence)
        logger.info("Executing ThinkTrace Tier 2 (Flash Pro: Deep Cognitive Intelligence)...")
        return await self.flash_pro_engine.evaluate(inp)


# Singleton instance
thinktrace_service = ThinkTraceService()
