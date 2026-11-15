import os
import json
import uuid
import httpx
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional
from app.models.interview import InterviewSession, InterviewTurn
from app.schemas.interview import InterviewEvaluationScorecard

INTERVIEW_PROBLEMS = [
    {
        "title": "Design a Distributed LRU Cache with TTL",
        "difficulty": "medium",
        "role_target": "Senior Backend Engineer",
        "description": (
            "You are asked to design an in-memory Least Recently Used (LRU) Cache supporting:\n"
            "1. get(key) -> value in O(1) time.\n"
            "2. put(key, value, ttl_ms) -> updates or inserts key in O(1) time.\n"
            "3. Automatic eviction of least recently used item when capacity is exceeded.\n"
            "4. Passive or active expiration of keys whose TTL has elapsed.\n"
            "Consider thread-safety and concurrency trade-offs."
        ),
        "initial_code": (
            "import time\n"
            "from typing import Optional, Dict\n\n"
            "class Node:\n"
            "    def __init__(self, key: str, val: any, expires_at: float):\n"
            "        self.key = key\n"
            "        self.val = val\n"
            "        self.expires_at = expires_at\n"
            "        self.prev = None\n"
            "        self.next = None\n\n"
            "class LRUCacheWithTTL:\n"
            "    def __init__(self, capacity: int):\n"
            "        self.capacity = capacity\n"
            "        self.cache = {}\n"
            "        # Head and Tail dummy sentinel nodes\n"
            "        self.head = Node('', None, 0)\n"
            "        self.tail = Node('', None, 0)\n"
            "        self.head.next = self.tail\n"
            "        self.tail.prev = self.head\n\n"
            "    def get(self, key: str) -> Optional[any]:\n"
            "        # TODO: Implement O(1) get with TTL check\n"
            "        pass\n\n"
            "    def put(self, key: str, val: any, ttl_seconds: float = 300) -> None:\n"
            "        # TODO: Implement O(1) put with LRU eviction\n"
            "        pass\n"
        ),
    },
    {
        "title": "Sliding Window Rate Limiter for Microservices",
        "difficulty": "medium",
        "role_target": "Backend / Platform Engineer",
        "description": (
            "Implement a sliding-window log rate limiter:\n"
            "1. allow_request(client_id, timestamp_ms) -> bool.\n"
            "2. Enforce max_requests within a rolling window of window_size_ms.\n"
            "3. Minimize memory footprint by pruning stale timestamps."
        ),
        "initial_code": (
            "from collections import deque\n"
            "from typing import Dict\n\n"
            "class SlidingWindowRateLimiter:\n"
            "    def __init__(self, max_requests: int, window_size_ms: int):\n"
            "        self.max_requests = max_requests\n"
            "        self.window_size_ms = window_size_ms\n"
            "        self.client_logs: Dict[str, deque] = {}\n\n"
            "    def allow_request(self, client_id: str, timestamp_ms: int) -> bool:\n"
            "        # TODO: Implement rolling window rate limiting\n"
            "        pass\n"
        ),
    },
]


class InterviewEngine:
    @staticmethod
    def get_seed_problem(role: str, difficulty: str) -> Dict[str, Any]:
        for p in INTERVIEW_PROBLEMS:
            if p["difficulty"] == difficulty.lower():
                return p
        return INTERVIEW_PROBLEMS[0]

    @staticmethod
    def get_initial_greeting(session: InterviewSession) -> str:
        return (
            f"Hello and welcome! I am your AI Technical Interviewer for today's session on '{session.title}'. "
            f"We are evaluating for the role of {session.role_target}.\n\n"
            f"Take a moment to read through the problem statement on the editor panel. "
            f"Before writing code, walk me through your high-level thought process: "
            f"what data structures come to mind, and how would you achieve optimal O(1) runtime while handling edge cases?"
        )

    @classmethod
    async def generate_response(
        cls,
        session: InterviewSession,
        turns: List[InterviewTurn],
        user_message: str,
        current_code: Optional[str] = None,
    ) -> str:
        api_key = os.getenv("OPENAI_API_KEY") or os.getenv("GEMINI_API_KEY")
        base_url = os.getenv("AI_BASE_URL", "https://api.openai.com/v1")
        model = os.getenv("AI_MODEL", "gpt-4o-mini")

        if api_key and api_key.strip():
            try:
                system_prompt = (
                    f"You are a friendly yet rigorous Principal Technical Interviewer conducting a coding interview. "
                    f"Problem: {session.title}\n"
                    f"Description: {session.problem_description}\n"
                    f"Role: {session.role_target}\n"
                    f"Evaluate the candidate's technical clarity, Big-O complexity, architectural trade-offs, and edge cases. "
                    f"Keep responses concise (2-4 sentences max), ask probing follow-ups or guide them gently if they are stuck. "
                    f"Do not solve the problem for them."
                )

                messages = [{"role": "system", "content": system_prompt}]
                for t in turns[-6:]:
                    role = "assistant" if t.sender == "interviewer" else "user"
                    messages.append({"role": role, "content": t.message})

                current_context = user_message
                if current_code and current_code.strip():
                    current_context += f"\n\n[Candidate's Current Code]:\n```python\n{current_code[:1200]}\n```"

                messages.append({"role": "user", "content": current_context})

                async with httpx.AsyncClient(timeout=10.0) as client:
                    res = await client.post(
                        f"{base_url.rstrip('/')}/chat/completions",
                        headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"},
                        json={"model": model, "messages": messages, "temperature": 0.3},
                    )
                    if res.status_code == 200:
                        data = res.json()
                        reply = data["choices"][0]["message"]["content"].strip()
                        return reply
            except Exception:
                pass

        # Intelligent Heuristic Interviewer Simulation
        msg_lower = user_message.lower()
        code_str = current_code or ""

        if any(term in msg_lower for term in ["hash map", "dictionary", "doubly linked list", "deque", "heap", "priority queue"]):
            return (
                "Excellent choice of data structures. Combining a hash map with a doubly-linked list "
                "or deque is a classic way to achieve true O(1) operations. How do you plan to handle the sentinel "
                "nodes or null pointers at the boundaries when evicting or moving a node to the front?"
            )
        elif any(term in msg_lower for term in ["o(1)", "o(n)", "complexity", "big o", "runtime", "space"]):
            return (
                "Good observation on the complexity bounds. O(1) time for lookups and insertions is critical for this scale. "
                "What about space complexity? If millions of expired keys remain unread, how will you prevent memory leaks?"
            )
        elif any(term in msg_lower for term in ["thread", "lock", "concurrency", "race condition", "mutex"]):
            return (
                "Great engineering instincts bringing up concurrency. In a multi-threaded web server, a simple mutex "
                "might create a bottleneck on high-throughput reads. Would a Read-Write Lock (RWLock) or segmented locking "
                "make sense here?"
            )
        elif len(code_str) > 150 and any(kw in code_str for kw in ["def ", "class ", "return "]):
            return (
                "I see you're making solid progress on the implementation. Let's trace through an edge case: "
                "what happens if a key exists but has just expired right before get() is called? "
                "Ensure your code removes it and returns None cleanly."
            )
        else:
            return (
                "That makes sense. Go ahead and start drafting that logic into the editor. "
                "Focus on the core eviction mechanism first, and feel free to explain any edge cases you are keeping in mind."
            )

    @classmethod
    async def evaluate_session(
        cls,
        session: InterviewSession,
        turns: List[InterviewTurn],
        final_code: Optional[str] = None,
    ) -> InterviewEvaluationScorecard:
        code = final_code or session.final_code or ""
        turns_count = len(turns)

        # Baseline scoring
        problem_solving = min(25, 18 + min(5, turns_count))
        algorithmic = 20 if any(t in code for t in ["prev", "next", "head", "tail", "pop", "append"]) else 16
        code_quality = 22 if len(code.strip()) > 100 else 14
        communication = min(25, 15 + min(10, turns_count * 2))

        total_score = problem_solving + algorithmic + code_quality + communication

        recommendation = "Strong Hire" if total_score >= 85 else "Hire" if total_score >= 70 else "Lean Hire"

        strengths = [
            "Clear technical communication during problem decomposition.",
            "Demonstrated solid grasp of O(1) data structure operations.",
            "Thoughtfully considered boundary edge cases.",
        ]

        growth_areas = [
            "Consider thread-safety and lock-free concurrency patterns under heavy scale.",
            "Add proactive background expiration routines to reclaim memory from dormant keys.",
        ]

        summary = (
            f"The candidate successfully engaged with the interviewer, formulating a structured approach "
            f"to {session.title}. Achieved an overall score of {total_score}/100 with a recommendation of {recommendation}."
        )

        return InterviewEvaluationScorecard(
            score=float(total_score),
            recommendation=recommendation,
            problem_solving_score=problem_solving,
            algorithmic_efficiency_score=algorithmic,
            code_quality_score=code_quality,
            communication_score=communication,
            summary=summary,
            strengths=strengths,
            growth_areas=growth_areas,
        )

