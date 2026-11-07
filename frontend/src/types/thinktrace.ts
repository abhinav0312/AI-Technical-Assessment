export interface ReasoningRecord {
  id?: string;
  user_id?: string;
  challenge_id?: string;
  submission_id?: string | null;
  problem_interpretation: string;
  proposed_algorithm: string;
  time_complexity: string;
  space_complexity: string;
  edge_cases: string;
  tradeoff_reasoning: string;
  mode: 'practice' | 'assessment';
  version?: number;
  is_locked?: boolean;
  change_summary?: string | null;
  created_at?: string;
  updated_at?: string;
  versions?: ReasoningVersion[];
}

export interface ReasoningVersion {
  id: string;
  version_number: number;
  problem_interpretation: string;
  proposed_algorithm: string;
  time_complexity: string;
  space_complexity: string;
  edge_cases: string;
  tradeoff_reasoning: string;
  change_summary?: string | null;
  created_at: string;
}

export interface ThinkTraceReport {
  id: string;
  reasoning_record_id: string;
  submission_id?: string | null;
  challenge_id: string;
  challenge_title?: string | null;
  challenge_slug?: string | null;
  user_id: string;
  user_display_name?: string | null;
  status: string;

  // Deterministic Code Correctness
  code_status: string;
  code_score: number;
  passed_tests: number;
  total_tests: number;
  execution_time_ms?: number | null;

  // Reasoning Rubric Scores
  problem_understanding_score: number;
  algorithm_correctness_score: number;
  edge_case_awareness_score: number;
  complexity_analysis_score: number;
  code_consistency_score: number;
  tradeoff_explanation_score: number;
  overall_reasoning_score: number;

  // Qualitative Insights & Observable Evidence
  supporting_evidence: Record<string, any>;
  missing_or_incorrect_steps: string[];
  strengths: string[];
  areas_for_growth: string[];
  alternative_approaches: string[];
  socratic_guiding_questions: string[];
  recommended_concept_links: Array<{ name: string; url?: string; description?: string }>;

  // Reliability & Transparency Metadata
  rubric_version: string;
  prompt_version: string;
  ai_provider: string;
  ai_model: string;
  is_fallback: boolean;
  confidence_score: number;
  confidence_level: 'high' | 'medium' | 'low';
  token_usage: Record<string, any>;

  // Human Review & Correction
  human_reviewed: boolean;
  human_reviewer_name?: string | null;
  human_score_override?: number | null;
  human_notes?: string | null;
  human_reviewed_at?: string | null;

  created_at: string;
  updated_at: string;
}
