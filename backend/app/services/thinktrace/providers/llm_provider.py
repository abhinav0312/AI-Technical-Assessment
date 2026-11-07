import os
import json
import time
import asyncio
from typing import Optional, Dict, Any
import httpx
from app.services.thinktrace.schemas import (
    ThinkTraceEvalInput,
    ThinkTraceAIOutput,
    ThinkTraceServiceResult,
)
from app.services.thinktrace.prompt import build_evaluation_prompt
from app.core.logging import logger
from app.core.rate_limiter import SimpleRateLimiter

# Rate limiter for external AI calls: max 20 requests per minute
_ai_call_limiter = SimpleRateLimiter(max_requests=20, window_seconds=60)


class LLMProvider:
    """
    Provider-independent LLM client supporting OpenAI-compatible and Gemini endpoints
    with timeouts, retries, JSON validation, and token usage tracking.
    """

    def __init__(
        self,
        api_key: Optional[str] = None,
        base_url: Optional[str] = None,
        model: Optional[str] = None,
        timeout_seconds: float = 15.0,
        max_retries: int = 2,
    ):
        self.api_key = api_key or os.getenv("OPENAI_API_KEY") or os.getenv("GEMINI_API_KEY")
        self.base_url = base_url or os.getenv("AI_BASE_URL", "https://api.openai.com/v1")
        self.model = model or os.getenv("AI_MODEL", "gpt-4o-mini")
        self.timeout_seconds = timeout_seconds
        self.max_retries = max_retries

    def is_available(self) -> bool:
        return bool(self.api_key and self.api_key.strip())

    async def evaluate(self, inp: ThinkTraceEvalInput) -> ThinkTraceServiceResult:
        if not self.is_available():
            raise ValueError("No valid AI provider API key configured.")

        # Rate limiting check
        if _ai_call_limiter.is_rate_limited("global_ai_provider"):
            raise RuntimeError("ThinkTrace AI provider rate limit exceeded. Please retry in a few moments.")

        sys_prompt, user_prompt = build_evaluation_prompt(inp)

        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
        }

        body = {
            "model": self.model,
            "messages": [
                {"role": "system", "content": sys_prompt},
                {"role": "user", "content": user_prompt},
            ],
            "response_format": {"type": "json_object"},
            "temperature": 0.2,
        }

        url = f"{self.base_url.rstrip('/')}/chat/completions"
        start_time = time.perf_counter()

        last_error = None
        for attempt in range(self.max_retries + 1):
            try:
                async with httpx.AsyncClient(timeout=self.timeout_seconds) as client:
                    resp = await client.post(url, json=body, headers=headers)

                    if resp.status_code == 200:
                        data = resp.json()
                        content = data["choices"][0]["message"]["content"]
                        usage = data.get("usage", {})

                        # Validate structured JSON against ThinkTrace schema
                        parsed_json = json.loads(content)
                        eval_output = ThinkTraceAIOutput.model_validate(parsed_json)

                        latency_ms = round((time.perf_counter() - start_time) * 1000.0, 2)
                        return ThinkTraceServiceResult(
                            evaluation=eval_output,
                            provider="openai-compatible-provider",
                            model=self.model,
                            is_fallback=False,
                            token_usage={
                                "prompt_tokens": usage.get("prompt_tokens", 0),
                                "completion_tokens": usage.get("completion_tokens", 0),
                                "total_tokens": usage.get("total_tokens", 0),
                                "latency_ms": latency_ms,
                            },
                        )

                    elif resp.status_code in (429, 500, 502, 503, 504) and attempt < self.max_retries:
                        backoff = (2 ** attempt) * 0.5
                        logger.warning(f"AI Provider returned {resp.status_code}. Retrying in {backoff}s...")
                        await asyncio.sleep(backoff)
                        continue
                    else:
                        raise RuntimeError(f"AI Provider error {resp.status_code}: {resp.text}")

            except (httpx.TimeoutException, httpx.NetworkError) as net_err:
                last_error = net_err
                if attempt < self.max_retries:
                    await asyncio.sleep(0.5)
                    continue
                raise TimeoutError(f"AI Provider call timed out after {self.timeout_seconds}s: {net_err}")
            except Exception as e:
                last_error = e
                break

        raise RuntimeError(f"Failed to evaluate via AI Provider: {last_error}")
