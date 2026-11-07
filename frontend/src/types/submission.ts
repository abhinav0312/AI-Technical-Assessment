export interface SubmissionTestCaseResult {
  id: string;
  test_case_id?: string | null;
  is_sample: boolean;
  status: 'passed' | 'failed' | 'timed_out' | 'runtime_error' | 'compilation_error';
  stdin?: string | null;
  expected_output?: string | null;
  actual_output?: string | null;
  error_message?: string | null;
  execution_time_ms?: number | null;
  order_index: number;
}

export interface Submission {
  id: string;
  challenge_id: string;
  challenge_title?: string | null;
  challenge_slug?: string | null;
  user_id: string;
  user_display_name?: string | null;
  language: string;
  source_code: string;
  status: 'submitted' | 'queued' | 'evaluating' | 'accepted' | 'wrong_answer' | 'time_limit_exceeded' | 'memory_limit_exceeded' | 'runtime_error' | 'compilation_error';
  score?: number | null;
  execution_time_ms?: number | null;
  memory_usage_kb?: number | null;
  error_message?: string | null;
  total_tests: number;
  passed_tests: number;
  is_sample_run: boolean;
  created_at: string;
  evaluated_at?: string | null;
  test_results: SubmissionTestCaseResult[];
}

export interface EvaluationSummary {
  status: 'accepted' | 'wrong_answer' | 'time_limit_exceeded' | 'memory_limit_exceeded' | 'runtime_error' | 'compilation_error';
  score: number;
  total_tests: number;
  passed_tests: number;
  total_execution_time_ms: number;
  max_memory_kb: number;
  error_message?: string | null;
  test_results: SubmissionTestCaseResult[];
}
