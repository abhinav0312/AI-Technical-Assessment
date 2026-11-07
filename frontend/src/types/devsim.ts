export interface DevSimScenarioSummary {
  id: string;
  title: string;
  slug: string;
  scenario_type: string;
  difficulty: 'easy' | 'medium' | 'hard';
  relevant_skills: string[];
  version: number;
  created_at: string;
}

export interface DevSimScenario {
  id: string;
  title: string;
  slug: string;
  scenario_type: string;
  business_context: string;
  task_description: string;
  acceptance_criteria: string[];
  difficulty: 'easy' | 'medium' | 'hard';
  relevant_skills: string[];
  starter_files: Record<string, string>;
  read_only_files: string[];
  entrypoint_command: string;
  timeout_seconds: number;
  version: number;
  created_at: string;
}

export interface DevSimRunResult {
  stdout: string;
  stderr: string;
  exit_code: number;
  execution_time_ms: number;
  is_timed_out: boolean;
  passed: boolean;
}

export interface DevSimReport {
  id: string;
  attempt_id: string;
  scenario_id: string;
  scenario_title: string;
  scenario_slug: string;
  functional_score: number;
  acceptance_tests_passed: number;
  total_acceptance_tests: number;
  regression_safety_passed: boolean;
  execution_time_ms: number;
  test_output: string;
  rubric_scores: Record<string, number>;
  successful_requirements: string[];
  major_issues: string[];
  ai_review: {
    maintainability_observations?: string[];
    tradeoffs_explained?: string[];
    fragile_code_flags?: string[];
    improvement_suggestions?: string[];
    advisory_disclaimer?: string;
  };
  evaluator_reviewed: boolean;
  evaluator_notes?: string | null;
  evaluator_score_override?: number | null;
  created_at: string;
}
