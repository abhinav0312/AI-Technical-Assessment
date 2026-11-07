import json
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.codetwin import Skill, ChallengeSkillAssociation, SkillGraphVersion
from app.models.bughunter import BugHunterChallenge
from app.models.devsim import DevSimScenario
from app.core.logging import logger

SEED_SKILLS = [
    # --- 1. Programming: Python Fundamentals ---
    {
        "domain": "programming_fundamentals",
        "category": "Python",
        "name": "Variables & Scoping",
        "slug": "variables-and-scoping",
        "description": "Variable types, scoping rules, closures, immutability, and state lifetime.",
        "tier": 1,
        "hierarchy_path": "programming.python.variables_and_types",
        "version": "1.0.0",
        "prerequisites": [],
    },
    {
        "domain": "programming_fundamentals",
        "category": "Python",
        "name": "Functions & Modularity",
        "slug": "functions-and-modularity",
        "description": "Pure functions, decomposition, modular abstraction, and parameter passing.",
        "tier": 1,
        "hierarchy_path": "programming.python.functions",
        "version": "1.0.0",
        "prerequisites": ["variables-and-scoping"],
    },
    {
        "domain": "programming_fundamentals",
        "category": "Python",
        "name": "Collections & Iterables",
        "slug": "collections-and-iterables",
        "description": "Lists, dicts, sets, tuples, list comprehensions, and iteration protocols.",
        "tier": 1,
        "hierarchy_path": "programming.python.collections",
        "version": "1.0.0",
        "prerequisites": ["variables-and-scoping"],
    },
    {
        "domain": "programming_fundamentals",
        "category": "Python",
        "name": "Error & Exception Handling",
        "slug": "error-and-exception-handling",
        "description": "Try/except blocks, custom exceptions, context managers, and fail-safe recovery.",
        "tier": 1,
        "hierarchy_path": "programming.python.error_handling",
        "version": "1.0.0",
        "prerequisites": ["functions-and-modularity"],
    },
    {
        "domain": "programming_fundamentals",
        "category": "Python",
        "name": "Control Flow & Conditionals",
        "slug": "control-flow-and-conditionals",
        "description": "Branching, loops, iteration constructs, and short-circuit evaluation.",
        "tier": 1,
        "hierarchy_path": "programming.python.control_flow",
        "version": "1.0.0",
        "prerequisites": ["variables-and-scoping"],
    },

    # --- 2. Programming: Data Structures ---
    {
        "domain": "data_structures",
        "category": "Data Structures",
        "name": "Arrays & Strings",
        "slug": "arrays-and-strings",
        "description": "Contiguous memory layout, dynamic array resizing, string manipulation, and slicing.",
        "tier": 1,
        "hierarchy_path": "programming.data_structures.arrays",
        "version": "1.0.0",
        "prerequisites": ["control-flow-and-conditionals"],
    },
    {
        "domain": "data_structures",
        "category": "Data Structures",
        "name": "Linked Lists",
        "slug": "linked-lists",
        "description": "Singly and doubly linked lists, pointer manipulation, and cycle detection.",
        "tier": 1,
        "hierarchy_path": "programming.data_structures.linked_lists",
        "version": "1.0.0",
        "prerequisites": ["variables-and-scoping"],
    },
    {
        "domain": "data_structures",
        "category": "Data Structures",
        "name": "Queues & Stacks",
        "slug": "queues-and-stacks",
        "description": "FIFO queues, LIFO stacks, monotonic queues, and double-ended queues (deque).",
        "tier": 1,
        "hierarchy_path": "programming.data_structures.stacks_and_queues",
        "version": "1.0.0",
        "prerequisites": ["arrays-and-strings"],
    },
    {
        "domain": "data_structures",
        "category": "Data Structures",
        "name": "Hash Tables & Sets",
        "slug": "hash-tables-and-sets",
        "description": "Hash functions, collision resolution, O(1) average lookup, and frequency counting.",
        "tier": 1,
        "hierarchy_path": "programming.data_structures.hash_tables",
        "version": "1.0.0",
        "prerequisites": ["arrays-and-strings"],
    },
    {
        "domain": "data_structures",
        "category": "Data Structures",
        "name": "Trees & Tree Traversals",
        "slug": "trees-and-traversals",
        "description": "Binary search trees, DFS pre/in/post-order, BFS level-order, and balancing principles.",
        "tier": 2,
        "hierarchy_path": "programming.data_structures.trees",
        "version": "1.0.0",
        "prerequisites": ["linked-lists", "queues-and-stacks"],
    },

    # --- 3. Programming: Algorithms ---
    {
        "domain": "algorithms",
        "category": "Algorithms",
        "name": "Binary Search",
        "slug": "binary-search",
        "description": "Logarithmic divide-and-conquer on sorted ranges and monotonic predicates.",
        "tier": 1,
        "hierarchy_path": "programming.algorithms.searching",
        "version": "1.0.0",
        "prerequisites": ["arrays-and-strings"],
    },
    {
        "domain": "algorithms",
        "category": "Algorithms",
        "name": "Sorting Algorithms",
        "slug": "sorting-algorithms",
        "description": "Quicksort, mergesort, comparison lower bounds, and stability properties.",
        "tier": 1,
        "hierarchy_path": "programming.algorithms.sorting",
        "version": "1.0.0",
        "prerequisites": ["arrays-and-strings"],
    },
    {
        "domain": "algorithms",
        "category": "Algorithms",
        "name": "Two Pointers Technique",
        "slug": "two-pointers",
        "description": "Converging and parallel pointers for linear traversals and pair finding.",
        "tier": 1,
        "hierarchy_path": "programming.algorithms.two_pointers",
        "version": "1.0.0",
        "prerequisites": ["arrays-and-strings"],
    },
    {
        "domain": "algorithms",
        "category": "Algorithms",
        "name": "Sliding Window",
        "slug": "sliding-window",
        "description": "Fixed and dynamic sliding window boundaries for substring and subarray queries.",
        "tier": 2,
        "hierarchy_path": "programming.algorithms.sliding_window",
        "version": "1.0.0",
        "prerequisites": ["two-pointers", "hash-tables-and-sets"],
    },
    {
        "domain": "algorithms",
        "category": "Algorithms",
        "name": "Recursion & Backtracking",
        "slug": "recursion-and-backtracking",
        "description": "Base case definition, call stack frames, recursive branching, and state pruning.",
        "tier": 2,
        "hierarchy_path": "programming.algorithms.recursion",
        "version": "1.0.0",
        "prerequisites": ["functions-and-modularity"],
    },
    {
        "domain": "algorithms",
        "category": "Algorithms",
        "name": "Dynamic Programming",
        "slug": "dynamic-programming",
        "description": "Optimal substructure, overlapping subproblems, memoization, and bottom-up tabulation.",
        "tier": 3,
        "hierarchy_path": "programming.algorithms.dynamic_programming",
        "version": "1.0.0",
        "prerequisites": ["recursion-and-backtracking"],
    },

    # --- 4. Complexity Analysis ---
    {
        "domain": "complexity_analysis",
        "category": "Algorithms",
        "name": "Big-O Time Complexity",
        "slug": "big-o-time-complexity",
        "description": "Asymptotic upper bounds, nested loop counting, and recurrence relations.",
        "tier": 1,
        "hierarchy_path": "programming.algorithms.complexity",
        "version": "1.0.0",
        "prerequisites": ["control-flow-and-conditionals"],
    },
    {
        "domain": "complexity_analysis",
        "category": "Algorithms",
        "name": "Space Complexity & Auxiliary Memory",
        "slug": "space-complexity",
        "description": "Stack frame memory, heap allocations, and in-place algorithmic transformations.",
        "tier": 1,
        "hierarchy_path": "programming.algorithms.space_complexity",
        "version": "1.0.0",
        "prerequisites": ["variables-and-scoping"],
    },
    {
        "domain": "complexity_analysis",
        "category": "Algorithms",
        "name": "Amortized Analysis",
        "slug": "amortized-analysis",
        "description": "Amortized cost bounds (e.g. deque popleft, dynamic array doubling).",
        "tier": 2,
        "hierarchy_path": "programming.algorithms.amortized",
        "version": "1.0.0",
        "prerequisites": ["big-o-time-complexity"],
    },

    # --- 5. Databases ---
    {
        "domain": "sql_and_databases",
        "category": "Databases",
        "name": "SQL Query Optimization",
        "slug": "sql-query-optimization",
        "description": "Filtering clauses, aggregations, eliminating Cartesian joins, and index utilization.",
        "tier": 1,
        "hierarchy_path": "databases.sql",
        "version": "1.0.0",
        "prerequisites": ["control-flow-and-conditionals"],
    },
    {
        "domain": "sql_and_databases",
        "category": "Databases",
        "name": "Database Indexing & Keys",
        "slug": "database-indexing",
        "description": "B-Tree vs hash indexes, composite index prefixes, and primary/foreign keys.",
        "tier": 2,
        "hierarchy_path": "databases.indexing",
        "version": "1.0.0",
        "prerequisites": ["sql-query-optimization"],
    },
    {
        "domain": "sql_and_databases",
        "category": "Databases",
        "name": "Query Execution & Plans",
        "slug": "query-execution-plans",
        "description": "EXPLAIN ANALYZE, sequential vs index scans, nested loop joins, and cost models.",
        "tier": 2,
        "hierarchy_path": "databases.query_optimization",
        "version": "1.0.0",
        "prerequisites": ["database-indexing"],
    },

    # --- 6. Software Engineering ---
    {
        "domain": "testing",
        "category": "Software Engineering",
        "name": "Deterministic Unit Testing",
        "slug": "deterministic-unit-testing",
        "description": "Writing reproducible assertions, test fixtures, and invariant validations.",
        "tier": 1,
        "hierarchy_path": "software_engineering.testing",
        "version": "1.0.0",
        "prerequisites": ["functions-and-modularity"],
    },
    {
        "domain": "testing",
        "category": "Software Engineering",
        "name": "Edge-Case Coverage",
        "slug": "edge-case-coverage",
        "description": "Identifying and covering pathological inputs, empty inputs, and null/None states.",
        "tier": 2,
        "hierarchy_path": "software_engineering.edge_cases",
        "version": "1.0.0",
        "prerequisites": ["deterministic-unit-testing"],
    },
    {
        "domain": "debugging",
        "category": "Software Engineering",
        "name": "Root Cause Isolation",
        "slug": "root-cause-isolation",
        "description": "Hypothesis-driven debugging, narrowing failure domains, and stack trace inspection.",
        "tier": 1,
        "hierarchy_path": "software_engineering.debugging",
        "version": "1.0.0",
        "prerequisites": ["control-flow-and-conditionals"],
    },
    {
        "domain": "debugging",
        "category": "Software Engineering",
        "name": "Boundary Value Analysis",
        "slug": "boundary-value-analysis",
        "description": "Zero values, empty collections, off-by-one indices, and extreme magnitude inputs.",
        "tier": 1,
        "hierarchy_path": "software_engineering.boundary_analysis",
        "version": "1.0.0",
        "prerequisites": ["control-flow-and-conditionals"],
    },
    {
        "domain": "debugging",
        "category": "Software Engineering",
        "name": "Regression Detection",
        "slug": "regression-detection",
        "description": "Validating that bug patches do not break previously passing test assertions.",
        "tier": 2,
        "hierarchy_path": "software_engineering.regression",
        "version": "1.0.0",
        "prerequisites": ["deterministic-unit-testing"],
    },
    {
        "domain": "software_engineering_fundamentals",
        "category": "Software Engineering",
        "name": "REST API Architecture",
        "slug": "rest-api-architecture",
        "description": "HTTP semantics, status codes, idempotent methods, and clean endpoint contracts.",
        "tier": 1,
        "hierarchy_path": "software_engineering.api_design",
        "version": "1.0.0",
        "prerequisites": ["functions-and-modularity"],
    },
    {
        "domain": "software_engineering_fundamentals",
        "category": "Software Engineering",
        "name": "Rate Limiting & Resilience",
        "slug": "rate-limiting-resilience",
        "description": "Token bucket, sliding window rate limits, timeouts, and graceful degradation.",
        "tier": 2,
        "hierarchy_path": "software_engineering.resilience",
        "version": "1.0.0",
        "prerequisites": ["queues-and-stacks", "hash-tables-and-sets"],
    },
    {
        "domain": "software_engineering_fundamentals",
        "category": "Software Engineering",
        "name": "Idempotency & Error Handling",
        "slug": "idempotency-and-error-handling",
        "description": "Handling duplicate requests, transaction rollbacks, and structured error responses.",
        "tier": 2,
        "hierarchy_path": "software_engineering.idempotency",
        "version": "1.0.0",
        "prerequisites": ["rest-api-architecture"],
    },
]



SEED_BUGHUNTER_CHALLENGES = [
    {
        "title": "Off-By-One Boundary Crash in Window Maximum",
        "slug": "off-by-one-window-maximum",
        "description": "A payment stream service computes the maximum transaction amount over a rolling window of size k. During high-throughput bursts, the service crashes or returns stale maxima due to a boundary condition bug in the sliding window index calculation.",
        "bug_report": "SYMPTOMS: IndexError: deque index out of range when array length equals k, and incorrect maximum reported for the final window.\nREPRO:\nInput: nums = [1, 3, -1, -3, 5, 3, 6, 7], k = 3\nExpected: [3, 3, 5, 5, 6, 7]\nActual: Crashes on boundary or omits final window.",
        "bug_category": "boundary_condition",
        "difficulty": "medium",
        "expected_behavior": "Return the maximum element in every sliding window of size k in O(N) time without boundary index errors.",
        "language": "python",
        "starter_code": """from collections import deque
import sys

def max_sliding_window(nums: list[int], k: int) -> list[int]:
    if not nums or k <= 0:
        return []
    if k == 1:
        return nums

    result = []
    q = deque()  # stores indices

    for i in range(len(nums)):
        # BUG: The boundary check uses > instead of >= and checks i - k + 1 improperly
        while q and q[0] < i - k:
            q.popleft()

        # Maintain decreasing monotonic order
        while q and nums[q[-1]] <= nums[i]:
            q.pop()

        q.append(i)

        # BUG: Off-by-one here! Requires i >= k - 1, but currently writes i > k
        if i > k:
            result.append(nums[q[0]])

    return result

if __name__ == "__main__":
    lines = sys.stdin.read().splitlines()
    if len(lines) >= 2:
        nums = list(map(int, lines[0].split()))
        k = int(lines[1].strip())
        res = max_sliding_window(nums, k)
        print(" ".join(map(str, res)))
""",
        "root_cause_options": [
            {
                "id": "rc1",
                "text": "The deque index eviction condition uses q[0] < i - k instead of <= i - k, and the window capture starts at i > k instead of i >= k - 1.",
                "is_correct": True,
                "explanation": "Sliding window of size k completes its first window at index k - 1. Checking i > k skips the first window result.",
            },
            {
                "id": "rc2",
                "text": "The monotonic queue should store values rather than indices.",
                "is_correct": False,
                "explanation": "Storing indices is necessary to detect when elements slide outside the current window boundary.",
            },
            {
                "id": "rc3",
                "text": "The while loop should pop from the left instead of the right.",
                "is_correct": False,
                "explanation": "To maintain a decreasing monotonic queue, smaller elements are removed from the right before appending.",
            },
        ],
        "hints": [
            {"level": 1, "title": "Window Completion Index", "content": "When does the very first window of size k end? For k=3, indices are 0, 1, 2. At which index i should result.append be triggered?"},
            {"level": 2, "title": "Boundary Eviction", "content": "An index j is outside the current window [i - k + 1, i] if j <= i - k."},
        ],
        "evaluation_rubric": {
            "bug_fix_weight": 0.5,
            "regression_weight": 0.3,
            "edge_case_weight": 0.2,
        },
        "public_test_cases": [
            {
                "stdin": "1 3 -1 -3 5 3 6 7\n3",
                "expected_output": "3 3 5 5 6 7",
                "description": "Standard 8 elements with k=3",
            },
            {
                "stdin": "1\n1",
                "expected_output": "1",
                "description": "Single element array with k=1",
            },
        ],
        "hidden_test_cases": [
            {
                "stdin": "1 -1\n1",
                "expected_output": "1 -1",
                "description": "k=1 regression test",
                "is_regression": True,
                "is_edge": False,
            },
            {
                "stdin": "9 11\n2",
                "expected_output": "11",
                "description": "Exact window length equals array length",
                "is_regression": False,
                "is_edge": True,
            },
            {
                "stdin": "4 -2\n2",
                "expected_output": "4",
                "description": "Two elements with negative value",
                "is_regression": True,
                "is_edge": True,
            },
        ],
        "relevant_skills": ["sliding-window", "boundary-value-analysis", "queues-and-stacks"],
        "is_daily": True,
        "daily_date": "2026-10-27",
    },
    {
        "title": "Unhandled KeyError in JWT Session Claims Decoder",
        "slug": "unhandled-keyerror-jwt-session",
        "description": "The authentication microservice parses session claims from incoming tokens. When a third-party SSO provider sends tokens missing optional user attributes (e.g. `roles` or `org_id`), the server crashes with a 500 error instead of defaulting safely.",
        "bug_report": "SYMPTOMS: KeyError: 'roles' raised in decode_claims when user signs in via OAuth with limited scope.\nREPRO:\nInput: JSON dictionary without 'roles' or 'exp'\nExpected: Validated session with default roles and valid expiration check.\nActual: Unhandled exception terminates the request.",
        "bug_category": "runtime_error",
        "difficulty": "easy",
        "expected_behavior": "Safely decode token payload using defensive dict lookups with appropriate defaults (roles=[]). Return structured session string.",
        "language": "python",
        "starter_code": """import json
import sys

def decode_session_claims(raw_json: str) -> str:
    # Parses raw token claims and returns formatted session string:
    # "USER:<id>|ROLE:<primary_role>|STATUS:<active/expired>"
    try:
        data = json.loads(raw_json)
    except Exception:
        return "ERROR:INVALID_JSON"

    # BUG: Direct bracket access crashes when keys are omitted by OAuth SSO!
    user_id = data["user_id"]
    roles = data["roles"]          # Crashes with KeyError if 'roles' is absent
    exp_timestamp = data["exp"]    # Crashes with KeyError if 'exp' is absent
    current_time = data.get("current_time", 1000)

    primary_role = roles[0] if len(roles) > 0 else "guest"
    status = "active" if current_time <= exp_timestamp else "expired"

    return f"USER:{user_id}|ROLE:{primary_role}|STATUS:{status}"

if __name__ == "__main__":
    line = sys.stdin.read().strip()
    if line:
        print(decode_session_claims(line))
""",
        "root_cause_options": [
            {
                "id": "rc1",
                "text": "Direct bracket access data['roles'] and data['exp'] without default fallback causes KeyError when optional claims are missing.",
                "is_correct": True,
                "explanation": "SSO providers often omit empty roles or exp claims. Defensive access via data.get('roles', []) and data.get('exp', 0) prevents runtime crashes.",
            },
            {
                "id": "rc2",
                "text": "The JSON parser cannot deserialize string inputs.",
                "is_correct": False,
                "explanation": "json.loads parses the string correctly; the crash happens on dict lookup.",
            },
        ],
        "hints": [
            {"level": 1, "title": "Defensive Dictionary Access", "content": "Use dict.get(key, default) instead of direct indexing data[key]."},
            {"level": 2, "title": "Default Roles & Exp", "content": "When 'roles' is missing, default to an empty list []. When 'exp' is missing, decide if it expires or defaults to 0."},
        ],
        "evaluation_rubric": {
            "bug_fix_weight": 0.6,
            "regression_weight": 0.2,
            "edge_case_weight": 0.2,
        },
        "public_test_cases": [
            {
                "stdin": '{"user_id": "u123", "roles": ["admin"], "exp": 2000, "current_time": 1500}',
                "expected_output": "USER:u123|ROLE:admin|STATUS:active",
                "description": "Full payload with roles and exp",
            },
            {
                "stdin": '{"user_id": "u456", "current_time": 100}',
                "expected_output": "USER:u456|ROLE:guest|STATUS:expired",
                "description": "SSO token without roles and exp (missing optional claims)",
            },
        ],
        "hidden_test_cases": [
            {
                "stdin": '{"user_id": "u789", "roles": [], "exp": 500, "current_time": 600}',
                "expected_output": "USER:u789|ROLE:guest|STATUS:expired",
                "description": "Empty roles list and expired token",
                "is_regression": True,
                "is_edge": False,
            },
            {
                "stdin": 'not-valid-json',
                "expected_output": "ERROR:INVALID_JSON",
                "description": "Malformed JSON input regression check",
                "is_regression": True,
                "is_edge": True,
            },
        ],
        "relevant_skills": ["root-cause-isolation", "variables-and-scoping", "edge-case-coverage"],
        "is_daily": False,
    },
    {
        "title": "Accidental Mutable Default Parameter in Query Cache",
        "slug": "mutable-default-param-query-cache",
        "description": "A repository query cache function has an insidious state leak: subsequent queries from completely different users receive cached results from prior users due to a mutable default argument in Python.",
        "bug_report": "SYMPTOMS: Cross-tenant data leakage. Querying cache for User B returns records previously fetched by User A.\nREPRO:\nConsecutive calls to execute_cached_query with default cache argument share the same dict instance.",
        "bug_category": "regression",
        "difficulty": "medium",
        "expected_behavior": "Every call that does not pass an explicit cache store should use a fresh instance, preventing memory pollution across invocations.",
        "language": "python",
        "starter_code": """import sys
import json

# BUG: Mutable default argument shared_cache={} persists across function calls!
def execute_cached_query(query_key: str, data_val: str, shared_cache: dict = {}) -> str:
    if query_key in shared_cache:
        return f"CACHE_HIT:{shared_cache[query_key]}"
    shared_cache[query_key] = data_val
    return f"CACHE_MISS:{data_val}"

def run_commands(lines: list[str]) -> list[str]:
    results = []
    for line in lines:
        parts = line.strip().split()
        if len(parts) >= 2:
            res = execute_cached_query(parts[0], parts[1])
            results.append(res)
    return results

if __name__ == "__main__":
    lines = sys.stdin.read().splitlines()
    for out in run_commands(lines):
        print(out)
""",
        "root_cause_options": [
            {
                "id": "rc1",
                "text": "In Python, default parameter expressions are evaluated once at function definition time, so shared_cache={} is shared across all function calls.",
                "is_correct": True,
                "explanation": "To make defaults safe, use shared_cache=None and initialize shared_cache = {} inside the function body.",
            },
            {
                "id": "rc2",
                "text": "The dictionary lookup should use shared_cache.has_key().",
                "is_correct": False,
                "explanation": "has_key is deprecated in Python 3; 'in' operator is correct.",
            },
        ],
        "hints": [
            {"level": 1, "title": "Python Function Default Objects", "content": "What is the canonical pattern in Python for safe optional collection parameters?"},
            {"level": 2, "title": "None Sentinel", "content": "def func(param=None): if param is None: param = {}"},
        ],
        "evaluation_rubric": {
            "bug_fix_weight": 0.5,
            "regression_weight": 0.3,
            "edge_case_weight": 0.2,
        },
        "public_test_cases": [
            {
                "stdin": "key1 val1\nkey2 val2",
                "expected_output": "CACHE_MISS:val1\nCACHE_MISS:val2",
                "description": "Distinct keys within single execution",
            },
        ],
        "hidden_test_cases": [
            {
                "stdin": "user_a alpha\nuser_b beta\nuser_a alpha",
                "expected_output": "CACHE_MISS:alpha\nCACHE_MISS:beta\nCACHE_HIT:alpha",
                "description": "Cache hits within explicit session",
                "is_regression": True,
                "is_edge": False,
            },
        ],
        "relevant_skills": ["regression-detection", "variables-and-scoping", "root-cause-isolation"],
        "is_daily": False,
    },
]


SEED_DEVSIM_SCENARIOS = [
    {
        "title": "Fix Broken Payment Webhook Idempotency",
        "slug": "fix-payment-webhook-idempotency",
        "scenario_type": "backend_endpoint_fix",
        "business_context": "FinTech payment integrations receive duplicate webhook notifications from payment processors during network retries. Our payment listener must process each transaction idempotently: duplicate delivery of the same payment event must acknowledge HTTP 200 without double-crediting the user's ledger balance.",
        "task_description": "1. Inspect `app/webhook.py` and `app/ledger.py`.\n2. Fix the webhook handler so that duplicate event_id payloads return `{'status': 'already_processed', 'event_id': event_id}` without modifying ledger balances.\n3. Ensure new payment events credit the balance and record the processed event ID.\n4. Run the test suite `tests/test_webhook.py` and verify all acceptance criteria pass.",
        "acceptance_criteria": [
            "Valid webhook events credit the customer ledger and return HTTP 200 with status 'processed'.",
            "Duplicate webhook deliveries with the same event_id return HTTP 200 with status 'already_processed'.",
            "Customer account balance is never incremented more than once for identical event IDs.",
            "Malformed webhook events with negative amounts or missing customer_id return HTTP 400 error.",
        ],
        "difficulty": "medium",
        "relevant_skills": ["rest-api-architecture", "idempotency-and-error-handling", "deterministic-unit-testing"],
        "starter_files": {
            "app/ledger.py": """class LedgerService:
    def __init__(self):
        self.balances = {}
        self.processed_events = set()

    def get_balance(self, customer_id: str) -> float:
        return self.balances.get(customer_id, 0.0)

    def credit_account(self, customer_id: str, amount: float, event_id: str) -> dict:
        # BUG: Currently forgets to check processed_events, leading to double-crediting!
        if customer_id not in self.balances:
            self.balances[customer_id] = 0.0
        self.balances[customer_id] += amount
        self.processed_events.add(event_id)
        return {"customer_id": customer_id, "balance": self.balances[customer_id]}
""",
            "app/webhook.py": """from app.ledger import LedgerService

class PaymentWebhookHandler:
    def __init__(self, ledger: LedgerService):
        self.ledger = ledger

    def handle_event(self, payload: dict) -> tuple[int, dict]:
        event_id = payload.get("event_id")
        customer_id = payload.get("customer_id")
        amount = payload.get("amount")

        if not event_id or not customer_id or amount is None or amount <= 0:
            return 400, {"error": "Invalid webhook payload"}

        # Fix: Check idempotency before applying credit!
        if event_id in self.ledger.processed_events:
            return 200, {"status": "already_processed", "event_id": event_id}

        self.ledger.credit_account(customer_id, amount, event_id)
        return 200, {"status": "processed", "event_id": event_id, "amount": amount}
""",
            "tests/test_webhook.py": """import unittest
from app.ledger import LedgerService
from app.webhook import PaymentWebhookHandler

class TestPaymentWebhook(unittest.TestCase):
    def setUp(self):
        self.ledger = LedgerService()
        self.handler = PaymentWebhookHandler(self.ledger)

    def test_single_payment_processing(self):
        status, body = self.handler.handle_event({
            "event_id": "evt_001",
            "customer_id": "cust_abc",
            "amount": 50.0
        })
        self.assertEqual(status, 200)
        self.assertEqual(body["status"], "processed")
        self.assertEqual(self.ledger.get_balance("cust_abc"), 50.0)

    def test_duplicate_webhook_idempotency(self):
        event = {"event_id": "evt_002", "customer_id": "cust_xyz", "amount": 100.0}
        s1, b1 = self.handler.handle_event(event)
        self.assertEqual(s1, 200)
        self.assertEqual(b1["status"], "processed")

        # Second delivery of identical event
        s2, b2 = self.handler.handle_event(event)
        self.assertEqual(s2, 200)
        self.assertEqual(b2["status"], "already_processed")
        # Balance must NOT be doubled
        self.assertEqual(self.ledger.get_balance("cust_xyz"), 100.0)

    def test_invalid_negative_amount(self):
        status, body = self.handler.handle_event({
            "event_id": "evt_003",
            "customer_id": "cust_123",
            "amount": -20.0
        })
        self.assertEqual(status, 400)

if __name__ == "__main__":
    unittest.main()
""",
        },
        "read_only_files": ["tests/test_webhook.py"],
        "public_tests": {
            "tests/test_webhook.py": "# Acceptance test suite verifying idempotency and error checks"
        },
        "hidden_tests": {
            "tests/test_hidden_edge.py": """import unittest
from app.ledger import LedgerService
from app.webhook import PaymentWebhookHandler

class TestHiddenEdgeCases(unittest.TestCase):
    def test_zero_amount_rejection(self):
        ledger = LedgerService()
        handler = PaymentWebhookHandler(ledger)
        status, _ = handler.handle_event({"event_id": "evt_h1", "customer_id": "c1", "amount": 0.0})
        self.assertEqual(status, 400)
"""
        },
        "entrypoint_command": "python -m unittest tests/test_webhook.py",
        "timeout_seconds": 6.0,
        "resource_limits": {"memory_mb": 128, "timeout_seconds": 6.0},
        "evaluation_rubric": {
            "acceptance_tests": 60.0,
            "idempotency_correctness": 25.0,
            "code_cleanliness": 15.0,
        },
        "version": 1,
    },
    {
        "title": "Diagnose Error Using Application Logs & Fix Auth Session Regression",
        "slug": "diagnose-auth-session-regression",
        "scenario_type": "error_log_diagnosis",
        "business_context": "Following a production deployment, mobile app users report getting randomly signed out or receiving 500 Internal Server Errors when refreshing their session tokens. Server log snapshots are captured in `logs/server.log`. You must diagnose the error, trace the fault in `app/session.py`, and patch the session refresh logic without breaking existing security token invalidation.",
        "task_description": "1. Review `logs/server.log` to identify the crashing exception and stack trace.\n2. Fix the bug in `app/session.py` to handle expired refresh tokens gracefully.\n3. Run `tests/test_session.py` to confirm the fix passes all unit tests.",
        "acceptance_criteria": [
            "Session refresh with valid token returns new access token and HTTP 200.",
            "Expired refresh tokens return structured HTTP 401 with 'token_expired' rather than crashing with 500.",
            "Revoked tokens cannot be refreshed.",
            "All assertions in `tests/test_session.py` pass cleanly.",
        ],
        "difficulty": "easy",
        "relevant_skills": ["root-cause-isolation", "rest-api-architecture", "deterministic-unit-testing"],
        "starter_files": {
            "logs/server.log": """2026-10-27T10:14:22Z [INFO] AuthServer v2.4 starting on port 8000
2026-10-27T10:14:35Z [INFO] POST /api/v1/auth/refresh - client_ip=192.168.1.42
2026-10-27T10:14:35Z [ERROR] Unhandled exception during session refresh:
Traceback (most recent call last):
  File "app/session.py", line 28, in refresh_session
    if current_time > session_data["expires_at"]:
TypeError: '>' not supported between instances of 'int' and 'NoneType'
2026-10-27T10:14:35Z [ERROR] HTTP 500 Internal Server Error returned to client
""",
            "app/session.py": """import time

class SessionManager:
    def __init__(self):
        self.sessions = {}
        self.revoked_tokens = set()

    def create_session(self, user_id: str, token: str, ttl_seconds: int = 3600) -> dict:
        now = int(time.time())
        expires = now + ttl_seconds
        self.sessions[token] = {
            "user_id": user_id,
            "expires_at": expires,
            "created_at": now,
        }
        return {"token": token, "expires_at": expires}

    def refresh_session(self, old_token: str, new_token: str, current_time: int) -> tuple[int, dict]:
        if old_token in self.revoked_tokens:
            return 401, {"error": "token_revoked"}

        session_data = self.sessions.get(old_token)
        if not session_data:
            return 401, {"error": "invalid_token"}

        # BUG: expires_at might be None or uninitialized in legacy sessions!
        # Leads to TypeError: '>' not supported between instances of 'int' and 'NoneType'
        expires_at = session_data.get("expires_at")
        if expires_at is None or current_time > expires_at:
            return 401, {"error": "token_expired"}

        # Invalidate old and assign new
        self.revoked_tokens.add(old_token)
        user_id = session_data["user_id"]
        new_expires = current_time + 3600
        self.sessions[new_token] = {
            "user_id": user_id,
            "expires_at": new_expires,
            "created_at": current_time,
        }
        return 200, {"access_token": new_token, "expires_at": new_expires}
""",
            "tests/test_session.py": """import unittest
from app.session import SessionManager

class TestSessionManager(unittest.TestCase):
    def setUp(self):
        self.mgr = SessionManager()

    def test_valid_refresh(self):
        self.mgr.create_session("u1", "tok_valid", ttl_seconds=3600)
        status, body = self.mgr.refresh_session("tok_valid", "tok_new", current_time=100)
        self.assertEqual(status, 200)
        self.assertEqual(body["access_token"], "tok_new")

    def test_expired_token(self):
        self.mgr.create_session("u2", "tok_exp", ttl_seconds=10)
        status, body = self.mgr.refresh_session("tok_exp", "tok_next", current_time=2000000000)
        self.assertEqual(status, 401)
        self.assertEqual(body["error"], "token_expired")

    def test_legacy_session_missing_expires_at(self):
        # Legacy session where expires_at is None
        self.mgr.sessions["tok_legacy"] = {"user_id": "u3", "expires_at": None}
        status, body = self.mgr.refresh_session("tok_legacy", "tok_fresh", current_time=100)
        self.assertEqual(status, 401)
        self.assertEqual(body["error"], "token_expired")

if __name__ == "__main__":
    unittest.main()
""",
        },
        "read_only_files": ["tests/test_session.py", "logs/server.log"],
        "public_tests": {
            "tests/test_session.py": "# Unit test suite verifying session refresh & log diagnosis"
        },
        "hidden_tests": {},
        "entrypoint_command": "python -m unittest tests/test_session.py",
        "timeout_seconds": 5.0,
        "resource_limits": {"memory_mb": 128, "timeout_seconds": 5.0},
        "evaluation_rubric": {
            "acceptance_tests": 70.0,
            "log_diagnosis_accuracy": 20.0,
            "code_safety": 10.0,
        },
        "version": 1,
    },
]


async def seed_codetwin_bughunter_devsim(session: AsyncSession):
    """
    Seeds extensible skills taxonomy, BugHunter debugging challenges,
    and DevSim software engineering assessment scenarios.
    """
    logger.info("Synchronizing CodeTwin skill taxonomy & SkillGraph...")
    for s_data in SEED_SKILLS:
        stmt = select(Skill).where(Skill.slug == s_data["slug"])
        res = await session.execute(stmt)
        skill = res.scalar_one_or_none()
        if not skill:
            skill = Skill(
                domain=s_data["domain"],
                name=s_data["name"],
                slug=s_data["slug"],
                description=s_data["description"],
                category=s_data.get("category"),
                tier=s_data.get("tier", 1),
                hierarchy_path=s_data.get("hierarchy_path"),
                version=s_data.get("version", "1.0.0"),
                prerequisites=s_data["prerequisites"],
            )
            session.add(skill)
        else:
            skill.category = s_data.get("category")
            skill.tier = s_data.get("tier", 1)
            skill.hierarchy_path = s_data.get("hierarchy_path")
            skill.version = s_data.get("version", "1.0.0")
            skill.prerequisites = s_data["prerequisites"]

    stmt_v = select(SkillGraphVersion).where(SkillGraphVersion.version == "1.0.0")
    res_v = await session.execute(stmt_v)
    if not res_v.scalar_one_or_none():
        sg_v = SkillGraphVersion(
            version="1.0.0",
            title="Core Software Engineering Skill Taxonomy",
            description="Hierarchical graph covering programming fundamentals, data structures, algorithms, databases, and software engineering.",
            is_active=True,
            graph_metadata={
                "domains": [
                    "programming_fundamentals",
                    "data_structures",
                    "algorithms",
                    "complexity_analysis",
                    "debugging",
                    "testing",
                    "sql_and_databases",
                    "software_engineering_fundamentals",
                ],
                "hierarchy_root": "Technical Proficiency",
            },
        )
        session.add(sg_v)

    await session.flush()

    logger.info("Synchronizing BugHunter challenges...")
    for bh_data in SEED_BUGHUNTER_CHALLENGES:
        stmt = select(BugHunterChallenge).where(BugHunterChallenge.slug == bh_data["slug"])
        res = await session.execute(stmt)
        challenge = res.scalar_one_or_none()
        if not challenge:
            challenge = BugHunterChallenge(
                title=bh_data["title"],
                slug=bh_data["slug"],
                description=bh_data["description"],
                bug_report=bh_data["bug_report"],
                bug_category=bh_data["bug_category"],
                difficulty=bh_data["difficulty"],
                starter_code=bh_data["starter_code"],
                expected_behavior=bh_data["expected_behavior"],
                language=bh_data.get("language", "python"),
                root_cause_options=bh_data["root_cause_options"],
                hints=bh_data["hints"],
                evaluation_rubric=bh_data["evaluation_rubric"],
                public_test_cases=bh_data["public_test_cases"],
                hidden_test_cases=bh_data["hidden_test_cases"],
                relevant_skills=bh_data["relevant_skills"],
                is_daily=bh_data.get("is_daily", False),
                daily_date=bh_data.get("daily_date"),
                is_published=True,
            )
            session.add(challenge)

    await session.flush()

    logger.info("Synchronizing DevSim scenarios...")
    for ds_data in SEED_DEVSIM_SCENARIOS:
        stmt = select(DevSimScenario).where(DevSimScenario.slug == ds_data["slug"])
        res = await session.execute(stmt)
        scenario = res.scalar_one_or_none()
        if not scenario:
            scenario = DevSimScenario(
                title=ds_data["title"],
                slug=ds_data["slug"],
                scenario_type=ds_data["scenario_type"],
                business_context=ds_data["business_context"],
                task_description=ds_data["task_description"],
                acceptance_criteria=ds_data["acceptance_criteria"],
                difficulty=ds_data["difficulty"],
                relevant_skills=ds_data["relevant_skills"],
                starter_files=ds_data["starter_files"],
                read_only_files=ds_data["read_only_files"],
                public_tests=ds_data["public_tests"],
                hidden_tests=ds_data["hidden_tests"],
                entrypoint_command=ds_data["entrypoint_command"],
                timeout_seconds=ds_data.get("timeout_seconds", 6.0),
                resource_limits=ds_data["resource_limits"],
                evaluation_rubric=ds_data["evaluation_rubric"],
                version=ds_data.get("version", 1),
                is_published=True,
            )
            session.add(scenario)

    await session.flush()
    logger.info("CodeTwin, BugHunter, and DevSim seeded successfully.")
