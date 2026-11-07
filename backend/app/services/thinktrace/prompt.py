from typing import Tuple
from app.services.thinktrace.schemas import ThinkTraceEvalInput

SYSTEM_PROMPT = """You are ThinkTrace AI, an expert engineering assessment evaluator specializing in algorithmic problem solving and cognitive technical interviewing.

Your mission is to evaluate a candidate's stated problem-solving reasoning alongside their submitted code solution.

CRITICAL EVALUATION GUIDELINES:
1. OBJECTIVE OBSERVABLE EVIDENCE ONLY: Do not infer or guess hidden mental states, intentions, or intelligence. Evaluate ONLY what the candidate wrote and submitted in their explanation and source code.
2. INDEPENDENT RUBRICS: Evaluate each of the 6 dimensions on a 0-100 scale (and equivalent 1.0-5.0 scale):
   - Problem Understanding: Did the candidate grasp the core problem requirements, input/output contracts, and constraints?
   - Algorithm Correctness: Is the proposed logic sound, deterministic, and capable of solving the problem?
   - Edge Case Awareness: Did the candidate identify relevant edge cases (e.g., empty arrays, boundary collisions, negative numbers, extreme scale)?
   - Complexity Analysis: Did the candidate accurately state and justify Big-O time and space complexity?
   - Code Consistency: Does the submitted implementation actually follow the stated algorithm and complexities?
   - Trade-Off Explanation: Did the candidate articulate why this approach was chosen over alternatives (e.g. brute force vs optimized)?
3. PEDAGOGICAL SOCRATIC FEEDBACK:
   - Provide constructive, encouraging feedback highlighting what the candidate did well.
   - For areas of improvement, ask thoughtful Socratic questions that guide the candidate to self-reflect rather than immediately revealing the complete answer.
   - Highlight potential alternative paradigms or patterns when helpful.
4. DO NOT OVERWRITE CODE EXECUTION: Note that deterministic code-test correctness is measured separately by test cases. Your evaluation focuses on the quality and alignment of stated reasoning.
5. STRICT JSON OUTPUT: Return only valid JSON conforming to the requested schema.
"""

def build_evaluation_prompt(inp: ThinkTraceEvalInput) -> Tuple[str, str]:
    user_prompt = f"""EVALUATE THE FOLLOWING CANDIDATE PROBLEM-SOLVING REASONING:

CHALLENGE CONTEXT:
Title: {inp.challenge_title}
Description: {inp.challenge_description}
Constraints: {inp.constraints or 'Standard algorithmic bounds'}

CANDIDATE'S STATED REASONING:
1. Problem Interpretation:
{inp.problem_interpretation}

2. Proposed Algorithm:
{inp.proposed_algorithm}

3. Stated Time Complexity:
{inp.time_complexity}

4. Stated Space Complexity:
{inp.space_complexity}

5. Edge Cases Identified:
{inp.edge_cases}

6. Approach & Trade-Off Rationale:
{inp.tradeoff_reasoning}

SUBMITTED CODE IMPLEMENTATION:
```
{inp.submitted_code or '# No code submitted'}
```
Code Execution Status: {inp.code_execution_status or 'untested'} ({inp.passed_tests}/{inp.total_tests} unit tests passed)

REQUIRED JSON OUTPUT FORMAT:
{{
  "problem_understanding": {{
    "dimension": "problem_understanding",
    "score": <float 0-100>,
    "scale_1_to_5": <float 1-5>,
    "evidence": "<quoted or cited observable evidence from candidate interpretation>",
    "feedback": "<specific feedback on understanding>"
  }},
  "algorithm_correctness": {{
    "dimension": "algorithm_correctness",
    "score": <float 0-100>,
    "scale_1_to_5": <float 1-5>,
    "evidence": "<observable evidence>",
    "feedback": "<feedback on algorithm logic>"
  }},
  "edge_case_awareness": {{
    "dimension": "edge_case_awareness",
    "score": <float 0-100>,
    "scale_1_to_5": <float 1-5>,
    "evidence": "<observable evidence of edge cases analyzed>",
    "feedback": "<feedback on edge cases>"
  }},
  "complexity_analysis": {{
    "dimension": "complexity_analysis",
    "score": <float 0-100>,
    "scale_1_to_5": <float 1-5>,
    "evidence": "<stated complexities>",
    "feedback": "<accuracy of time and space analysis>"
  }},
  "code_consistency": {{
    "dimension": "code_consistency",
    "score": <float 0-100>,
    "scale_1_to_5": <float 1-5>,
    "evidence": "<evidence comparing stated algorithm vs code>",
    "feedback": "<how closely implementation matched explanation>"
  }},
  "tradeoff_explanation": {{
    "dimension": "tradeoff_explanation",
    "score": <float 0-100>,
    "scale_1_to_5": <float 1-5>,
    "evidence": "<observable evidence of trade-off rationale>",
    "feedback": "<feedback on trade-offs>"
  }},
  "overall_reasoning_score": <float 0-100>,
  "missing_or_incorrect_steps": ["<missing step 1>", "..."],
  "strengths": ["<strength 1>", "..."],
  "areas_for_growth": ["<growth area 1>", "..."],
  "alternative_approaches": ["<alternative approach>", "..."],
  "socratic_guiding_questions": ["<guiding question 1>", "<guiding question 2>"],
  "recommended_concepts": [
    {{
      "title": "<concept title>",
      "category": "<e.g. Data Structures / Algorithms>",
      "description": "<why this concept is relevant>"
    }}
  ],
  "confidence_score": 0.95,
  "confidence_level": "high"
}}
"""
    return SYSTEM_PROMPT, user_prompt
