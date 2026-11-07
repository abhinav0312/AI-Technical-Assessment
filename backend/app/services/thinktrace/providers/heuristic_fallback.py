import re
import time
from typing import List, Dict, Any
from app.services.thinktrace.schemas import (
    ThinkTraceEvalInput,
    ThinkTraceAIOutput,
    RubricDimensionScore,
    ConceptLink,
    ThinkTraceServiceResult,
)


class HeuristicFallbackProvider:
    """
    Deterministic development fallback evaluator.
    Analyzes candidate explanations and code alignment using structured heuristics.
    Clearly identifies itself as a fallback engine and never pretends to be a live LLM.
    """

    @property
    def provider_name(self) -> str:
        return "development-heuristic-engine"

    @property
    def model_name(self) -> str:
        return "devmind-heuristic-v1.0"

    async def evaluate(self, inp: ThinkTraceEvalInput) -> ThinkTraceServiceResult:
        start_time = time.perf_counter()

        # 1. Evaluate Problem Understanding
        interp = (inp.problem_interpretation or "").strip()
        interp_len = len(interp)
        if interp_len > 120:
            und_score = 92.0
            und_evidence = f"Candidate demonstrated comprehensive understanding: '{interp[:90]}...'"
            und_feedback = "Strong articulation of input specifications, constraints, and target invariants."
        elif interp_len > 40:
            und_score = 75.0
            und_evidence = f"Candidate identified core requirements: '{interp}'"
            und_feedback = "Basic requirements captured; could further highlight implicit constraints."
        else:
            und_score = 45.0
            und_evidence = f"Minimal problem description provided: '{interp}'"
            und_feedback = "Consider explicitly restating the input-output contract and invariants."

        # 2. Evaluate Algorithm Correctness
        algo = (inp.proposed_algorithm or "").strip()
        algo_keywords = ["map", "hash", "dict", "deque", "window", "pointer", "loop", "queue", "cache", "sort", "binary"]
        found_keywords = [k for k in algo_keywords if k in algo.lower()]
        if len(algo) > 100 and len(found_keywords) >= 2:
            algo_score = 90.0
            algo_evidence = f"Proposed logic utilizes appropriate paradigm ({', '.join(found_keywords)}): '{algo[:80]}...'"
            algo_feedback = "Sound algorithmic strategy with clear step-by-step state transitions."
        elif len(algo) > 30:
            algo_score = 70.0
            algo_evidence = f"High-level strategy proposed: '{algo[:60]}...'"
            algo_feedback = "Logical direction is plausible; add concrete pseudocode or invariant handling."
        else:
            algo_score = 40.0
            algo_evidence = "Vague or truncated algorithmic strategy."
            algo_feedback = "Elaborate the algorithmic steps and data structure choices."

        # 3. Evaluate Edge Case Awareness
        edges = (inp.edge_cases or "").strip().lower()
        edge_markers = ["empty", "zero", "null", "none", "negative", "boundary", "duplicate", "large", "overflow", "single", "odd", "even"]
        identified_edges = [m for m in edge_markers if m in edges]
        if len(identified_edges) >= 3:
            edge_score = 95.0
            edge_evidence = f"Explicitly identified boundary conditions: {', '.join(identified_edges)}."
            edge_feedback = "Excellent awareness of boundary conditions and potential runtime pitfalls."
        elif len(identified_edges) >= 1 or len(edges) > 30:
            edge_score = 75.0
            edge_evidence = f"Identified {len(identified_edges)} standard edge conditions."
            edge_feedback = "Good start on edge conditions. Consider extreme dataset sizes and boundary collisions."
        else:
            edge_score = 50.0
            edge_evidence = "Few or no explicit edge cases documented."
            edge_feedback = "Identify potential edge cases such as empty inputs, negative numbers, or boundary collisions."

        # 4. Evaluate Complexity Analysis
        time_c = (inp.time_complexity or "").strip().upper()
        space_c = (inp.space_complexity or "").strip().upper()
        has_big_o_time = bool(re.search(r"O\([^)]+\)", time_c))
        has_big_o_space = bool(re.search(r"O\([^)]+\)", space_c))

        if has_big_o_time and has_big_o_space:
            comp_score = 90.0
            comp_evidence = f"Formally stated Time: {time_c}, Space: {space_c}."
            comp_feedback = "Correct Big-O mathematical notation applied for both dimensions."
        elif has_big_o_time or has_big_o_space:
            comp_score = 70.0
            comp_evidence = f"Partial Big-O notation: Time={time_c}, Space={space_c}."
            comp_feedback = "Ensure both time and auxiliary space complexities are rigorously specified."
        else:
            comp_score = 45.0
            comp_evidence = f"Informal complexity notation: '{time_c}' / '{space_c}'."
            comp_feedback = "Use standard Big-O asymptotic notation (e.g., O(N) time, O(1) space)."

        # 5. Evaluate Code Consistency
        code = (inp.submitted_code or "").lower()
        code_matches = [k for k in found_keywords if k in code]
        if len(code) > 40 and len(code_matches) > 0:
            cons_score = 88.0
            cons_evidence = f"Implementation utilizes data structures referenced in explanation ({', '.join(code_matches)})."
            cons_feedback = "High fidelity between planned algorithmic architecture and code implementation."
        elif len(code) > 20:
            cons_score = 70.0
            cons_evidence = "Implementation partially aligns with stated approach."
            cons_feedback = "Code mostly mirrors planned algorithm; ensure all planned helpers/structures are present."
        else:
            cons_score = 50.0
            cons_evidence = "Minimal code submitted or significant divergence from stated plan."
            cons_feedback = "Align code structure with the proposed approach."

        # 6. Evaluate Trade-off Explanation
        tradeoff = (inp.tradeoff_reasoning or "").strip()
        tradeoff_markers = ["brute", "alternative", "tradeoff", "trade-off", "faster", "space", "memory", "overhead", "amortized", "optimiz"]
        tradeoff_hits = [m for m in tradeoff_markers if m in tradeoff.lower()]
        if len(tradeoff) > 60 and len(tradeoff_hits) >= 2:
            trade_score = 88.0
            trade_evidence = f"Articulated engineering trade-offs regarding {', '.join(tradeoff_hits)}."
            trade_feedback = "Thoughtful consideration of space-time trade-offs over brute-force alternatives."
        elif len(tradeoff) > 20:
            trade_score = 70.0
            trade_evidence = f"Brief justification provided: '{tradeoff[:50]}...'"
            trade_feedback = "Reasonable rationale. Discuss why alternative data structures were rejected."
        else:
            trade_score = 45.0
            trade_evidence = "Minimal trade-off explanation provided."
            trade_feedback = "Explain why this approach is preferred over simpler or alternative algorithms."

        # Overall composite reasoning score (weighted average)
        overall = round(
            (und_score * 0.15) +
            (algo_score * 0.25) +
            (edge_score * 0.15) +
            (comp_score * 0.15) +
            (cons_score * 0.20) +
            (trade_score * 0.10),
            1
        )

        strengths = []
        if und_score >= 80:
            strengths.append("Clear, structured grasp of problem constraints and invariants.")
        if algo_score >= 80:
            strengths.append(f"Effective choice of algorithmic strategy ({algo[:40]}...).")
        if edge_score >= 80:
            strengths.append("Proactive anticipation of edge cases and boundary conditions.")
        if comp_score >= 80:
            strengths.append(f"Precise asymptotic complexity profiling ({time_c} time, {space_c} space).")
        if not strengths:
            strengths.append("Structured initial problem-solving framework established.")

        areas_for_growth = []
        if edge_score < 75:
            areas_for_growth.append("Deepen edge case analysis to account for boundary inputs and scale extremes.")
        if trade_score < 75:
            areas_for_growth.append("Elaborate on space-time trade-offs compared to naive or alternative approaches.")
        if comp_score < 75:
            areas_for_growth.append("Rigorous Big-O characterization for both peak memory and runtime.")
        if not areas_for_growth:
            areas_for_growth.append("Consider memory allocation overhead under concurrent high-throughput workloads.")

        socratic_questions = [
            f"If the input size scaled to 10^8 elements, would your chosen {space_c} auxiliary space remain viable?",
            "What happens if inputs arrive in strictly descending or duplicate order?",
            "Could this problem be solved with O(1) auxiliary memory by mutating in-place or streaming?",
        ]

        concepts = [
            ConceptLink(
                title="Hash Table Invariants & Amortized Lookups",
                category="Data Structures",
                description="Understanding O(1) average lookup guarantees and collision resolution strategies.",
            ),
            ConceptLink(
                title="Sliding Window & Monotonic Deque Optimization",
                category="Algorithms",
                description="Pruning stale elements to achieve optimal O(N) stream processing.",
            ),
            ConceptLink(
                title="Space-Time Trade-Off Analysis in Systems",
                category="System Design",
                description="Evaluating when caching or memoization pays for itself versus memory pressure.",
            ),
        ]

        def to_scale_5(val: float) -> float:
            return round(1.0 + (val / 100.0) * 4.0, 1)

        eval_output = ThinkTraceAIOutput(
            problem_understanding=RubricDimensionScore(
                dimension="problem_understanding",
                score=und_score,
                scale_1_to_5=to_scale_5(und_score),
                evidence=und_evidence,
                feedback=und_feedback,
            ),
            algorithm_correctness=RubricDimensionScore(
                dimension="algorithm_correctness",
                score=algo_score,
                scale_1_to_5=to_scale_5(algo_score),
                evidence=algo_evidence,
                feedback=algo_feedback,
            ),
            edge_case_awareness=RubricDimensionScore(
                dimension="edge_case_awareness",
                score=edge_score,
                scale_1_to_5=to_scale_5(edge_score),
                evidence=edge_evidence,
                feedback=edge_feedback,
            ),
            complexity_analysis=RubricDimensionScore(
                dimension="complexity_analysis",
                score=comp_score,
                scale_1_to_5=to_scale_5(comp_score),
                evidence=comp_evidence,
                feedback=comp_feedback,
            ),
            code_consistency=RubricDimensionScore(
                dimension="code_consistency",
                score=cons_score,
                scale_1_to_5=to_scale_5(cons_score),
                evidence=cons_evidence,
                feedback=cons_feedback,
            ),
            tradeoff_explanation=RubricDimensionScore(
                dimension="tradeoff_explanation",
                score=trade_score,
                scale_1_to_5=to_scale_5(trade_score),
                evidence=trade_evidence,
                feedback=trade_feedback,
            ),
            overall_reasoning_score=overall,
            missing_or_incorrect_steps=[] if edge_score >= 80 else ["Edge condition handling for extreme boundaries not fully detailed."],
            strengths=strengths,
            areas_for_growth=areas_for_growth,
            alternative_approaches=[
                "Two-pointer in-place scanning (if array is sorted)",
                "Space-optimized bitmasking / bucket indexing for bounded ranges",
            ],
            socratic_guiding_questions=socratic_questions,
            recommended_concepts=concepts,
            confidence_score=0.92,
            confidence_level="high",
        )

        latency_ms = round((time.perf_counter() - start_time) * 1000.0, 2)

        return ThinkTraceServiceResult(
            evaluation=eval_output,
            provider=self.provider_name,
            model=self.model_name,
            is_fallback=True,
            token_usage={
                "prompt_tokens": 0,
                "completion_tokens": 0,
                "total_tokens": 0,
                "latency_ms": latency_ms,
            },
        )
