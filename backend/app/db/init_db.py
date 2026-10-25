import asyncio
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.db.base import Base
from app.db.session import engine, AsyncSessionLocal
from app.models.user import User
from app.models.profile import UserProfile
from app.models.challenge import Challenge, ChallengeTag, ProgrammingLanguage
from app.core.security import get_password_hash
from app.core.logging import logger, setup_logging

setup_logging()

SEED_USERS = [
    {
        "email": "admin@devmind.ai",
        "password": "Password123!",
        "display_name": "DevMind Admin",
        "role": "admin",
        "bio": "Principal Platform Architect & Lead Assessment Engineer",
        "experience": "staff",
    },
    {
        "email": "creator@devmind.ai",
        "password": "Password123!",
        "display_name": "Sarah Connor",
        "role": "creator",
        "bio": "Staff Staffing Architect, specializes in high-throughput systems and concurrency challenges.",
        "experience": "senior",
    },
    {
        "email": "candidate@devmind.ai",
        "password": "Password123!",
        "display_name": "Alex Mercer",
        "role": "candidate",
        "bio": "Full-stack engineer preparing for distributed systems engineering evaluations.",
        "experience": "mid",
    },
]

SEED_LANGUAGES = [
    {"name": "Python 3.12", "identifier": "python", "supported_status": "active"},
    {"name": "TypeScript 5.6", "identifier": "typescript", "supported_status": "active"},
    {"name": "Go 1.23", "identifier": "go", "supported_status": "beta"},
    {"name": "Rust 1.82", "identifier": "rust", "supported_status": "beta"},
]

SEED_CHALLENGES = [
    {
        "title": "Sliding Window Rate Limiter",
        "slug": "sliding-window-rate-limiter",
        "difficulty": "medium",
        "category": "system_design",
        "description": "Design an in-memory Sliding Window Rate Limiter that restricts a client identifier to `max_requests` within a sliding window of `window_size_seconds`.\n\nImplement the class `RateLimiter` with the method `allow_request(client_id: str, timestamp: float) -> bool`.\n\nEnsure that requests occurring exactly on the boundary are handled deterministically.",
        "constraints": "- 1 <= max_requests <= 10^5\n- 1 <= window_size_seconds <= 86400\n- Timestamps are strictly monotonic non-decreasing per client.",
        "starter_code": {
            "python": "class RateLimiter:\n    def __init__(self, max_requests: int, window_size_seconds: float):\n        self.max_requests = max_requests\n        self.window_size_seconds = window_size_seconds\n\n    def allow_request(self, client_id: str, timestamp: float) -> bool:\n        # TODO: Implement sliding window logic\n        return True\n",
            "typescript": "export class RateLimiter {\n  constructor(private maxRequests: number, private windowSizeSeconds: number) {}\n\n  allowRequest(clientId: string, timestamp: number): boolean {\n    // TODO: Implement sliding window logic\n    return true;\n  }\n}\n",
        },
        "supported_languages": ["python", "typescript"],
        "tags": ["concurrency", "system-design", "algorithms"],
    },
    {
        "title": "LRU Cache with TTL Eviction",
        "slug": "lru-cache-with-ttl",
        "difficulty": "medium",
        "category": "data_structures",
        "description": "Implement a Least Recently Used (LRU) Cache that additionally supports Time-To-Live (TTL) expiration per key.\n\nMethods to implement:\n1. `get(key: str) -> Optional[Any]`: Returns value if present and not expired, refreshing its recency.\n2. `put(key: str, value: Any, ttl_seconds: float) -> None`: Inserts or updates the key with a TTL. If capacity is exceeded, evicts the least recently used unexpired item or expired items.",
        "constraints": "- 1 <= capacity <= 10,000\n- Get and Put should operate in O(1) amortized time complexity.",
        "starter_code": {
            "python": "class LRUCacheWithTTL:\n    def __init__(self, capacity: int):\n        self.capacity = capacity\n\n    def get(self, key: str):\n        pass\n\n    def put(self, key: str, value, ttl_seconds: float):\n        pass\n",
            "typescript": "export class LRUCacheWithTTL<T> {\n  constructor(private capacity: number) {}\n\n  get(key: string): T | null {\n    return null;\n  }\n\n  put(key: string, value: T, ttlSeconds: number): void {}\n}\n",
        },
        "supported_languages": ["python", "typescript"],
        "tags": ["caching", "hash-table", "linked-list"],
    },
    {
        "title": "Distributed Transaction Coordinator (2PC)",
        "slug": "distributed-transaction-coordinator-2pc",
        "difficulty": "hard",
        "category": "distributed_systems",
        "description": "Implement the Two-Phase Commit (2PC) protocol coordinator logic for a distributed database cluster.\n\nThe coordinator must execute the `prepare` phase across all participant nodes. If all nodes return `VOTE_COMMIT`, the coordinator broadcasts `GLOBAL_COMMIT`. If any node votes `VOTE_ABORT` or times out, the coordinator must broadcast `GLOBAL_ABORT` to rollback all prepared participants.",
        "constraints": "- Handles partial node failures and network timeouts safely.\n- State transitions must be idempotent.",
        "starter_code": {
            "python": "class TwoPhaseCoordinator:\n    def __init__(self, participants: list[str]):\n        self.participants = participants\n\n    def execute_transaction(self, tx_id: str, action_payload: dict) -> bool:\n        # TODO: Execute prepare and commit/rollback phases\n        return True\n",
            "typescript": "export class TwoPhaseCoordinator {\n  constructor(private participants: string[]) {}\n\n  executeTransaction(txId: string, payload: Record<string, unknown>): boolean {\n    return true;\n  }\n}\n",
        },
        "supported_languages": ["python", "typescript"],
        "tags": ["distributed-systems", "transactions", "reliability"],
    },
    {
        "title": "Reverse Linked List in K-Groups",
        "slug": "reverse-linked-list-k-groups",
        "difficulty": "hard",
        "category": "algorithms",
        "description": "Given the head of a singly linked list, reverse the nodes of the list `k` at a time, and return the modified list.\n\n`k` is a positive integer and is less than or equal to the length of the linked list. If the number of nodes is not a multiple of `k` then left-out nodes, in the end, should remain as it is.",
        "constraints": "- The number of nodes in the list is n.\n- 1 <= k <= n <= 5000\n- You may not alter the values in the list's nodes, only nodes themselves may be changed.",
        "starter_code": {
            "python": "class ListNode:\n    def __init__(self, val=0, next=None):\n        self.val = val\n        self.next = next\n\ndef reverse_k_group(head: ListNode, k: int) -> ListNode:\n    # TODO: Implement\n    return head\n",
            "typescript": "export class ListNode {\n  val: number;\n  next: ListNode | null;\n  constructor(val?: number, next?: ListNode | null) {\n    this.val = val === undefined ? 0 : val;\n    this.next = next === undefined ? null : next;\n  }\n}\n\nexport function reverseKGroup(head: ListNode | null, k: number): ListNode | null {\n  return head;\n}\n",
        },
        "supported_languages": ["python", "typescript"],
        "tags": ["linked-list", "recursion", "algorithms"],
    },
    {
        "title": "Asynchronous Task Scheduler with Concurrency Limits",
        "slug": "async-task-scheduler",
        "difficulty": "easy",
        "category": "concurrency",
        "description": "Design an asynchronous task worker pool that executes tasks while capping the maximum concurrency to `max_workers`.\n\nTasks are added with an priority level (1=highest). High priority tasks must be picked up before lower priority tasks once a worker slot frees up.",
        "constraints": "- 1 <= max_workers <= 50\n- Prioritization must be deterministic and thread-safe.",
        "starter_code": {
            "python": "import asyncio\n\nclass PriorityTaskPool:\n    def __init__(self, max_workers: int = 4):\n        self.max_workers = max_workers\n\n    async def submit(self, priority: int, coroutine_fn, *args):\n        pass\n",
            "typescript": "export class PriorityTaskPool {\n  constructor(private maxWorkers: number = 4) {}\n\n  async submit<T>(priority: number, task: () => Promise<T>): Promise<T> {\n    throw new Error('Not implemented');\n  }\n}\n",
        },
        "supported_languages": ["python", "typescript"],
        "tags": ["concurrency", "async", "queue"],
    },
]


async def init_db():
    logger.info("Initializing database schema...")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with AsyncSessionLocal() as session:
        # Check if users already seeded
        res = await session.execute(select(User).limit(1))
        if res.scalar_one_or_none():
            logger.info("Database already seeded with initial data. Skipping.")
            return

        logger.info("Seeding programming languages...")
        for lang_data in SEED_LANGUAGES:
            lang = ProgrammingLanguage(**lang_data)
            session.add(lang)

        logger.info("Seeding default platform users...")
        for user_data in SEED_USERS:
            pwd_hash = get_password_hash(user_data["password"])
            user = User(
                email=user_data["email"],
                password_hash=pwd_hash,
                display_name=user_data["display_name"],
                role=user_data["role"],
                account_status="active",
            )
            session.add(user)
            await session.flush()

            profile = UserProfile(
                user_id=user.id,
                biography=user_data["bio"],
                preferred_programming_languages=["python", "typescript"],
                experience_level=user_data["experience"],
                learning_goals="Advanced algorithms, distributed consensus, system architecture",
                timezone="UTC",
            )
            session.add(profile)

        logger.info("Seeding initial engineering challenges...")
        for ch_data in SEED_CHALLENGES:
            tags_to_add = []
            for tag_name in ch_data["tags"]:
                slug = tag_name.lower().replace(" ", "-")
                tag_res = await session.execute(select(ChallengeTag).where(ChallengeTag.slug == slug))
                tag_obj = tag_res.scalar_one_or_none()
                if not tag_obj:
                    tag_obj = ChallengeTag(name=tag_name, slug=slug)
                    session.add(tag_obj)
                    await session.flush()
                tags_to_add.append(tag_obj)

            challenge = Challenge(
                title=ch_data["title"],
                slug=ch_data["slug"],
                description=ch_data["description"],
                difficulty=ch_data["difficulty"],
                category=ch_data["category"],
                constraints=ch_data["constraints"],
                starter_code=ch_data["starter_code"],
                supported_languages=ch_data["supported_languages"],
                visibility="public",
                tags=tags_to_add,
            )
            session.add(challenge)

        await session.commit()
        logger.info("Database initialized and seeded successfully.")


if __name__ == "__main__":
    asyncio.run(init_db())
