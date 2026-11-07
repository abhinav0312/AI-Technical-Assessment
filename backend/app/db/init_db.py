import asyncio
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, text
from app.db.base import Base
from app.db.session import engine, AsyncSessionLocal
from app.models.user import User
from app.models.profile import UserProfile
from app.models.challenge import Challenge, ChallengeTag, ProgrammingLanguage
from app.models.test_case import TestCase
from app.models.bookmark import ChallengeBookmark
from app.models.code_draft import CodeDraft
from app.models.submission import Submission, SubmissionTestCaseResult
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
    {"name": "TypeScript / Node", "identifier": "typescript", "supported_status": "active"},
    {"name": "Go 1.23", "identifier": "go", "supported_status": "beta"},
    {"name": "Rust 1.82", "identifier": "rust", "supported_status": "beta"},
]

SEED_CHALLENGES = [
    {
        "title": "Sliding Window Rate Limiter",
        "slug": "sliding-window-rate-limiter",
        "difficulty": "medium",
        "category": "system_design",
        "description": "Design an in-memory Sliding Window Rate Limiter that restricts a client identifier to `max_requests` within a sliding window of `window_size_seconds`.\n\nInput Format:\nLine 1: `max_requests window_size_seconds`\nSubsequent lines: `ALLOW <client_id> <timestamp>`\n\nOutput Format:\nFor each ALLOW command, print `true` if the request is permitted, or `false` otherwise.",
        "constraints": "- 1 <= max_requests <= 10^5\n- 1 <= window_size_seconds <= 86400\n- Timestamps are strictly monotonic non-decreasing per client.",
        "starter_code": {
            "python": """import sys
from collections import deque

class RateLimiter:
    def __init__(self, max_requests: int, window_size_seconds: float):
        self.max_requests = max_requests
        self.window_size_seconds = window_size_seconds
        self.history = {}

    def allow_request(self, client_id: str, timestamp: float) -> bool:
        if client_id not in self.history:
            self.history[client_id] = deque()
        q = self.history[client_id]
        boundary = timestamp - self.window_size_seconds
        while q and q[0] <= boundary:
            q.popleft()
        if len(q) < self.max_requests:
            q.append(timestamp)
            return True
        return False

def main():
    lines = sys.stdin.read().splitlines()
    if not lines:
        return
    first = lines[0].split()
    max_req = int(first[0])
    win_size = float(first[1])
    limiter = RateLimiter(max_req, win_size)
    for line in lines[1:]:
        line = line.strip()
        if not line:
            continue
        parts = line.split()
        if parts[0] == "ALLOW":
            cid = parts[1]
            ts = float(parts[2])
            res = limiter.allow_request(cid, ts)
            print("true" if res else "false")

if __name__ == "__main__":
    main()
""",
            "typescript": """const fs = require('fs');

class RateLimiter {
  constructor(maxRequests, windowSizeSeconds) {
    this.maxRequests = maxRequests;
    this.windowSizeSeconds = windowSizeSeconds;
    this.history = new Map();
  }

  allowRequest(clientId, timestamp) {
    if (!this.history.has(clientId)) {
      this.history.set(clientId, []);
    }
    const q = this.history.get(clientId);
    const boundary = timestamp - this.windowSizeSeconds;
    while (q.length > 0 && q[0] <= boundary) {
      q.shift();
    }
    if (q.length < this.maxRequests) {
      q.push(timestamp);
      return true;
    }
    return false;
  }
}

function main() {
  const input = fs.readFileSync(0, 'utf-8');
  const lines = input.trim().split('\\n').filter(Boolean);
  if (lines.length === 0) return;
  const [maxReq, winSize] = lines[0].trim().split(/\\s+/).map(Number);
  const limiter = new RateLimiter(maxReq, winSize);
  for (let i = 1; i < lines.length; i++) {
    const parts = lines[i].trim().split(/\\s+/);
    if (parts[0] === 'ALLOW') {
      const res = limiter.allowRequest(parts[1], parseFloat(parts[2]));
      console.log(res ? 'true' : 'false');
    }
  }
}

main();
""",
        },
        "supported_languages": ["python", "typescript"],
        "tags": ["concurrency", "system-design", "algorithms"],
        "test_cases": [
            {
                "description": "Single client basic burst within limit",
                "stdin": "3 10.0\nALLOW c1 1.0\nALLOW c1 2.0\nALLOW c1 3.0",
                "expected_output": "true\ntrue\ntrue",
                "is_sample": True,
                "weight": 1.0,
                "order_index": 0,
            },
            {
                "description": "Burst exceeded then sliding window boundary expiry",
                "stdin": "2 5.0\nALLOW c1 1.0\nALLOW c1 2.0\nALLOW c1 3.0\nALLOW c1 7.0",
                "expected_output": "true\ntrue\nfalse\ntrue",
                "is_sample": True,
                "weight": 1.0,
                "order_index": 1,
            },
            {
                "description": "Multi-client concurrency and isolation",
                "stdin": "2 5.0\nALLOW c1 1.0\nALLOW c2 1.0\nALLOW c1 2.0\nALLOW c2 2.0\nALLOW c1 3.0\nALLOW c2 3.0",
                "expected_output": "true\ntrue\ntrue\ntrue\nfalse\nfalse",
                "is_sample": False,
                "weight": 1.5,
                "order_index": 2,
            },
            {
                "description": "Boundary collision check at exact window delta",
                "stdin": "2 5.0\nALLOW c1 1.0\nALLOW c1 3.0\nALLOW c1 6.0",
                "expected_output": "true\ntrue\ntrue",
                "is_sample": False,
                "weight": 1.5,
                "order_index": 3,
            },
        ],
    },
    {
        "title": "Two Sum Target Pair Finder",
        "slug": "two-sum-target-pair",
        "difficulty": "easy",
        "category": "algorithms",
        "description": "Given an array of integers `nums` and an integer `target`, return the 0-based indices of the two numbers such that they add up to `target`.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.\n\nInput Format:\nLine 1: Space-separated integers representing `nums`.\nLine 2: Single integer representing `target`.\n\nOutput Format:\nPrint the two indices separated by a space in ascending order.",
        "constraints": "- 2 <= nums.length <= 10^4\n- -10^9 <= nums[i] <= 10^9\n- -10^9 <= target <= 10^9\n- Only one valid answer exists.",
        "starter_code": {
            "python": """import sys

def two_sum(nums: list[int], target: int) -> list[int]:
    seen = {}
    for i, num in enumerate(nums):
        diff = target - num
        if diff in seen:
            return [seen[diff], i]
        seen[num] = i
    return []

if __name__ == "__main__":
    lines = sys.stdin.read().splitlines()
    if len(lines) >= 2:
        nums = list(map(int, lines[0].split()))
        target = int(lines[1].strip())
        res = two_sum(nums, target)
        print(f"{res[0]} {res[1]}")
""",
            "typescript": """const fs = require('fs');

function twoSum(nums, target) {
  const map = new Map();
  for (let i = 0; i < nums.length; i++) {
    const diff = target - nums[i];
    if (map.has(diff)) {
      return [map.get(diff), i];
    }
    map.set(nums[i], i);
  }
  return [];
}

const input = fs.readFileSync(0, 'utf-8').trim().split('\\n').filter(Boolean);
if (input.length >= 2) {
  const nums = input[0].trim().split(/\\s+/).map(Number);
  const target = parseInt(input[1].trim(), 10);
  const res = twoSum(nums, target);
  console.log(`${res[0]} ${res[1]}`);
}
""",
        },
        "supported_languages": ["python", "typescript"],
        "tags": ["hash-table", "algorithms", "arrays"],
        "test_cases": [
            {
                "description": "Standard positive integers",
                "stdin": "2 7 11 15\n9",
                "expected_output": "0 1",
                "is_sample": True,
                "weight": 1.0,
                "order_index": 0,
            },
            {
                "description": "Unsorted elements target 6",
                "stdin": "3 2 4\n6",
                "expected_output": "1 2",
                "is_sample": True,
                "weight": 1.0,
                "order_index": 1,
            },
            {
                "description": "Negative numbers and zero sum",
                "stdin": "-3 4 3 90\n0",
                "expected_output": "0 2",
                "is_sample": False,
                "weight": 1.5,
                "order_index": 2,
            },
            {
                "description": "Larger sequence with high indices",
                "stdin": "1 2 3 4 5 6 7 8 9 10\n19",
                "expected_output": "8 9",
                "is_sample": False,
                "weight": 1.5,
                "order_index": 3,
            },
        ],
    },
    {
        "title": "LRU Cache with TTL Eviction",
        "slug": "lru-cache-with-ttl",
        "difficulty": "medium",
        "category": "data_structures",
        "description": "Implement a Least Recently Used (LRU) Cache that supports TTL expiration.\n\nInput Format:\nLine 1: `capacity`\nSubsequent lines: `PUT <key> <val> <ttl_seconds>` or `GET <key>`\n\nOutput Format:\nFor each `GET` command, print the value, or `null` if expired or absent.",
        "constraints": "- 1 <= capacity <= 10,000\n- Operations run in O(1) amortized time.",
        "starter_code": {
            "python": """import sys
from collections import OrderedDict
import time

class LRUCacheWithTTL:
    def __init__(self, capacity: int):
        self.capacity = capacity
        self.cache = OrderedDict()
        self.expires = {}

    def get(self, key: str):
        if key not in self.cache:
            return "null"
        if time.time() > self.expires[key]:
            del self.cache[key]
            del self.expires[key]
            return "null"
        self.cache.move_to_end(key)
        return self.cache[key]

    def put(self, key: str, value: str, ttl: float):
        if key in self.cache:
            del self.cache[key]
        elif len(self.cache) >= self.capacity:
            oldest, _ = self.cache.popitem(last=False)
            self.expires.pop(oldest, None)
        self.cache[key] = value
        self.expires[key] = time.time() + ttl

def main():
    lines = sys.stdin.read().splitlines()
    if not lines:
        return
    capacity = int(lines[0].strip())
    lru = LRUCacheWithTTL(capacity)
    for line in lines[1:]:
        line = line.strip()
        if not line:
            continue
        parts = line.split()
        if parts[0] == "PUT":
            lru.put(parts[1], parts[2], float(parts[3]))
        elif parts[0] == "GET":
            print(lru.get(parts[1]))

if __name__ == "__main__":
    main()
""",
            "typescript": """const fs = require('fs');

class LRUCacheWithTTL {
  constructor(capacity) {
    this.capacity = capacity;
    this.cache = new Map();
    this.expires = new Map();
  }

  get(key) {
    if (!this.cache.has(key)) return "null";
    if (Date.now() > this.expires.get(key)) {
      this.cache.delete(key);
      this.expires.delete(key);
      return "null";
    }
    const val = this.cache.get(key);
    this.cache.delete(key);
    this.cache.set(key, val);
    return val;
  }

  put(key, value, ttl) {
    if (this.cache.has(key)) {
      this.cache.delete(key);
    } else if (this.cache.size >= this.capacity) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
      this.expires.delete(firstKey);
    }
    this.cache.set(key, value);
    this.expires.set(key, Date.now() + ttl * 1000);
  }
}

function main() {
  const input = fs.readFileSync(0, 'utf-8').trim().split('\\n').filter(Boolean);
  if (input.length === 0) return;
  const cap = parseInt(input[0].trim(), 10);
  const lru = new LRUCacheWithTTL(cap);
  for (let i = 1; i < input.length; i++) {
    const parts = input[i].trim().split(/\\s+/);
    if (parts[0] === 'PUT') {
      lru.put(parts[1], parts[2], parseFloat(parts[3]));
    } else if (parts[0] === 'GET') {
      console.log(lru.get(parts[1]));
    }
  }
}

main();
""",
        },
        "supported_languages": ["python", "typescript"],
        "tags": ["caching", "hash-table", "data-structures"],
        "test_cases": [
            {
                "description": "Basic put and get within capacity",
                "stdin": "2\nPUT a 10 100\nPUT b 20 100\nGET a\nGET b",
                "expected_output": "10\n20",
                "is_sample": True,
                "weight": 1.0,
                "order_index": 0,
            },
            {
                "description": "Eviction on capacity overflow",
                "stdin": "2\nPUT a 10 100\nPUT b 20 100\nPUT c 30 100\nGET a\nGET b\nGET c",
                "expected_output": "null\n20\n30",
                "is_sample": True,
                "weight": 1.0,
                "order_index": 1,
            },
            {
                "description": "Capacity of 1 rapid eviction",
                "stdin": "1\nPUT x 99 100\nGET x\nPUT y 88 100\nGET x\nGET y",
                "expected_output": "99\nnull\n88",
                "is_sample": False,
                "weight": 1.5,
                "order_index": 2,
            },
        ],
    },
    {
        "title": "Reverse Linked List in K-Groups",
        "slug": "reverse-linked-list-k-groups",
        "difficulty": "hard",
        "category": "algorithms",
        "description": "Given a sequence of integers representing nodes of a linked list and an integer `k`, reverse the nodes of the list `k` at a time.\n\nInput Format:\nLine 1: Space-separated integers representing the list.\nLine 2: Single integer `k`.\n\nOutput Format:\nSpace-separated integers representing the resulting list.",
        "constraints": "- 1 <= k <= length <= 5000\n- Values between -1000 and 1000.",
        "starter_code": {
            "python": """import sys

def reverse_k_group(nums: list[int], k: int) -> list[int]:
    res = []
    n = len(nums)
    for i in range(0, n, k):
        chunk = nums[i:i+k]
        if len(chunk) == k:
            res.extend(reversed(chunk))
        else:
            res.extend(chunk)
    return res

if __name__ == "__main__":
    lines = sys.stdin.read().splitlines()
    if len(lines) >= 2:
        nums = list(map(int, lines[0].split()))
        k = int(lines[1].strip())
        res = reverse_k_group(nums, k)
        print(" ".join(map(str, res)))
""",
            "typescript": """const fs = require('fs');

function reverseKGroup(nums, k) {
  const res = [];
  for (let i = 0; i < nums.length; i += k) {
    const chunk = nums.slice(i, i + k);
    if (chunk.length === k) {
      res.push(...chunk.reverse());
    } else {
      res.push(...chunk);
    }
  }
  return res;
}

const lines = fs.readFileSync(0, 'utf-8').trim().split('\\n').filter(Boolean);
if (lines.length >= 2) {
  const nums = lines[0].trim().split(/\\s+/).map(Number);
  const k = parseInt(lines[1].trim(), 10);
  const res = reverseKGroup(nums, k);
  console.log(res.join(' '));
}
""",
        },
        "supported_languages": ["python", "typescript"],
        "tags": ["linked-list", "recursion", "algorithms"],
        "test_cases": [
            {
                "description": "5 elements reversed in groups of 2",
                "stdin": "1 2 3 4 5\n2",
                "expected_output": "2 1 4 3 5",
                "is_sample": True,
                "weight": 1.0,
                "order_index": 0,
            },
            {
                "description": "5 elements reversed in groups of 3",
                "stdin": "1 2 3 4 5\n3",
                "expected_output": "3 2 1 4 5",
                "is_sample": True,
                "weight": 1.0,
                "order_index": 1,
            },
            {
                "description": "Exact multiple of k=3",
                "stdin": "1 2 3 4 5 6\n3",
                "expected_output": "3 2 1 6 5 4",
                "is_sample": False,
                "weight": 1.5,
                "order_index": 2,
            },
            {
                "description": "k=1 identity check",
                "stdin": "10 20 30\n1",
                "expected_output": "10 20 30",
                "is_sample": False,
                "weight": 1.5,
                "order_index": 3,
            },
        ],
    },
]


async def run_sqlite_migrations(conn):
    """Safely adds missing columns to existing SQLite tables."""
    # Check submissions table columns
    res = await conn.execute(text("PRAGMA table_info(submissions)"))
    cols = {row[1] for row in res.fetchall()}
    
    needed_cols = [
        ("execution_time_ms", "FLOAT"),
        ("memory_usage_kb", "FLOAT"),
        ("error_message", "TEXT"),
        ("total_tests", "INTEGER DEFAULT 0 NOT NULL"),
        ("passed_tests", "INTEGER DEFAULT 0 NOT NULL"),
        ("is_sample_run", "BOOLEAN DEFAULT 0 NOT NULL"),
    ]
    for col_name, col_type in needed_cols:
        if col_name not in cols:
            logger.info(f"Adding column '{col_name}' to 'submissions' table...")
            await conn.execute(text(f"ALTER TABLE submissions ADD COLUMN {col_name} {col_type}"))

    # Check challenges table columns
    ch_res = await conn.execute(text("PRAGMA table_info(challenges)"))
    ch_cols = {row[1] for row in ch_res.fetchall()}
    if "reasoning_config" not in ch_cols:
        logger.info("Adding column 'reasoning_config' to 'challenges' table...")
        await conn.execute(text("ALTER TABLE challenges ADD COLUMN reasoning_config JSON"))

    # Check skills table columns
    sk_res = await conn.execute(text("PRAGMA table_info(skills)"))
    sk_cols = {row[1] for row in sk_res.fetchall()}
    for sk_col, sk_type in [
        ("category", "VARCHAR(80)"),
        ("tier", "INTEGER DEFAULT 1 NOT NULL"),
        ("hierarchy_path", "VARCHAR(200)"),
        ("version", "VARCHAR(20) DEFAULT '1.0.0' NOT NULL"),
    ]:
        if sk_col not in sk_cols:
            logger.info(f"Adding column '{sk_col}' to 'skills' table...")
            await conn.execute(text(f"ALTER TABLE skills ADD COLUMN {sk_col} {sk_type}"))

    # Check user_skill_proficiencies table columns
    usp_res = await conn.execute(text("PRAGMA table_info(user_skill_proficiencies)"))
    usp_cols = {row[1] for row in usp_res.fetchall()}
    if "recent_trend" not in usp_cols:
        logger.info("Adding column 'recent_trend' to 'user_skill_proficiencies' table...")
        await conn.execute(text("ALTER TABLE user_skill_proficiencies ADD COLUMN recent_trend VARCHAR(30) DEFAULT 'steady' NOT NULL"))


async def init_db():
    logger.info("Initializing database schema...")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
        await run_sqlite_migrations(conn)

    async with AsyncSessionLocal() as session:
        # Check users
        res = await session.execute(select(User).limit(1))
        has_users = res.scalar_one_or_none() is not None

        if not has_users:
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

        # Seed or sync challenges and test cases
        for ch_data in SEED_CHALLENGES:
            ch_stmt = select(Challenge).where(Challenge.slug == ch_data["slug"])
            ch_res = await session.execute(ch_stmt)
            challenge = ch_res.scalar_one_or_none()

            if not challenge:
                logger.info(f"Seeding challenge: {ch_data['title']}")
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
                await session.flush()
            else:
                # Update starter code and description to match latest interactive harness
                challenge.starter_code = ch_data["starter_code"]
                challenge.description = ch_data["description"]
                challenge.constraints = ch_data["constraints"]

            # Check if test cases exist for this challenge
            tc_check = await session.execute(select(TestCase).where(TestCase.challenge_id == challenge.id).limit(1))
            if not tc_check.scalar_one_or_none() and "test_cases" in ch_data:
                logger.info(f"Seeding test cases for challenge '{challenge.title}'...")
                for tc_info in ch_data["test_cases"]:
                    tc = TestCase(
                        challenge_id=challenge.id,
                        stdin=tc_info.get("stdin", ""),
                        expected_output=tc_info["expected_output"],
                        is_sample=tc_info.get("is_sample", False),
                        description=tc_info.get("description"),
                        weight=tc_info.get("weight", 1.0),
                        order_index=tc_info.get("order_index", 0),
                    )
                    session.add(tc)

        # Seed CodeTwin skill taxonomy, BugHunter challenges, and DevSim scenarios
        from app.db.seeds_codetwin_bughunter_devsim import seed_codetwin_bughunter_devsim
        await seed_codetwin_bughunter_devsim(session)

        await session.commit()
        logger.info("Database initialized and synchronized successfully.")


if __name__ == "__main__":
    asyncio.run(init_db())
