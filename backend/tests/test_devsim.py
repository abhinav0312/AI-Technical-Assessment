import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app


@pytest.mark.asyncio
async def test_devsim_scenario_catalog_and_attempt():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        cand_login = await client.post(
            "/api/v1/auth/login",
            json={"email": "candidate@devmind.ai", "password": "Password123!"},
        )
        token = cand_login.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # 1. List Scenarios
        list_res = await client.get("/api/v1/devsim/scenarios", headers=headers)
        assert list_res.status_code == 200
        scenarios = list_res.json()
        assert len(scenarios) >= 2

        # 2. Get Scenario Detail
        first_slug = scenarios[0]["slug"]
        detail_res = await client.get(f"/api/v1/devsim/scenarios/{first_slug}", headers=headers)
        assert detail_res.status_code == 200
        detail = detail_res.json()
        assert "starter_files" in detail
        assert "acceptance_criteria" in detail
        assert "business_context" in detail
        assert len(detail["starter_files"]) >= 2

        # 3. Get Attempt
        attempt_res = await client.get(f"/api/v1/devsim/scenarios/{first_slug}/attempt", headers=headers)
        assert attempt_res.status_code == 200
        att_data = attempt_res.json()
        assert "workspace_files" in att_data
        assert len(att_data["workspace_files"]) >= 2


@pytest.mark.asyncio
async def test_devsim_isolated_workspace_run_and_path_traversal_protection():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        cand_login = await client.post(
            "/api/v1/auth/login",
            json={"email": "candidate@devmind.ai", "password": "Password123!"},
        )
        headers = {"Authorization": f"Bearer {cand_login.json()['access_token']}"}

        # Run tests with clean files
        files = {
            "app/ledger.py": """class LedgerService:
    def __init__(self):
        self.balances = {}
        self.processed_events = set()
    def get_balance(self, cid):
        return self.balances.get(cid, 0.0)
    def credit_account(self, cid, amt, eid):
        if cid not in self.balances:
            self.balances[cid] = 0.0
        self.balances[cid] += amt
        self.processed_events.add(eid)
""",
            "app/webhook.py": """from app.ledger import LedgerService
class PaymentWebhookHandler:
    def __init__(self, ledger):
        self.ledger = ledger
    def handle_event(self, p):
        eid, cid, amt = p.get("event_id"), p.get("customer_id"), p.get("amount")
        if not eid or not cid or amt is None or amt <= 0:
            return 400, {"error": "Invalid"}
        if eid in self.ledger.processed_events:
            return 200, {"status": "already_processed", "event_id": eid}
        self.ledger.credit_account(cid, amt, eid)
        return 200, {"status": "processed", "event_id": eid}
""",
            "tests/test_webhook.py": """import unittest
from app.ledger import LedgerService
from app.webhook import PaymentWebhookHandler

class TestWebhook(unittest.TestCase):
    def test_basic(self):
        l = LedgerService()
        h = PaymentWebhookHandler(l)
        s, b = h.handle_event({"event_id": "e1", "customer_id": "c1", "amount": 10.0})
        self.assertEqual(s, 200)
        self.assertEqual(b["status"], "processed")
if __name__ == "__main__":
    unittest.main()
""",
            # Attempt malicious directory traversal injection
            "../../malicious_file.py": "print('attack')",
        }

        run_res = await client.post(
            "/api/v1/devsim/scenarios/fix-payment-webhook-idempotency/run-tests",
            json={"workspace_files": files},
            headers=headers,
        )
        assert run_res.status_code == 200
        data = run_res.json()
        assert data["exit_code"] == 0
        assert data["passed"] is True
        assert "OK" in (data["stdout"] + data["stderr"])


@pytest.mark.asyncio
async def test_devsim_submit_and_evaluator_review():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        # Candidate login
        cand_login = await client.post(
            "/api/v1/auth/login",
            json={"email": "candidate@devmind.ai", "password": "Password123!"},
        )
        cand_headers = {"Authorization": f"Bearer {cand_login.json()['access_token']}"}

        # Staff login
        staff_login = await client.post(
            "/api/v1/auth/login",
            json={"email": "creator@devmind.ai", "password": "Password123!"},
        )
        staff_headers = {"Authorization": f"Bearer {staff_login.json()['access_token']}"}

        # Fetch starter files for diagnose-auth-session-regression
        detail_res = await client.get(
            "/api/v1/devsim/scenarios/diagnose-auth-session-regression",
            headers=cand_headers,
        )
        scenario_data = detail_res.json()
        workspace = dict(scenario_data["starter_files"])

        # Candidate submits solution
        sub_res = await client.post(
            "/api/v1/devsim/scenarios/diagnose-auth-session-regression/submit",
            json={"workspace_files": workspace},
            headers=cand_headers,
        )
        assert sub_res.status_code == 200
        report = sub_res.json()
        assert "functional_score" in report
        assert "acceptance_tests_passed" in report
        assert "ai_review" in report
        assert "maintainability_observations" in report["ai_review"]
        report_id = report["id"]

        # Staff evaluator performs review
        rev_res = await client.post(
            f"/api/v1/devsim/reports/{report_id}/evaluator-review",
            json={
                "evaluator_notes": "Candidate correctly diagnosed NoneType expiration regression and patched gracefully.",
                "evaluator_score_override": 98.0,
            },
            headers=staff_headers,
        )
        assert rev_res.status_code == 200
        rev_data = rev_res.json()
        assert rev_data["evaluator_reviewed"] is True
        assert rev_data["evaluator_score_override"] == 98.0
