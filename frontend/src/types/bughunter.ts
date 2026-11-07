export interface BugHunterChallengeSummary {
  id: string;
  title: string;
  slug: string;
  bug_category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  language: string;
  is_daily: boolean;
  daily_date?: string | null;
  relevant_skills: string[];
  created_at: string;
}

export interface BugHunterChallenge {
  id: string;
  title: string;
  slug: string;
  description: string;
  bug_report: string;
  bug_category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  language: string;
  starter_code: string;
  expected_behavior: string;
  root_cause_options: Array<{
    id: string;
    text: string;
    is_correct?: boolean;
    explanation?: string;
  }>;
  hints: Array<{
    level: number;
    title: string;
    content: string;
  }>;
  public_test_cases: Array<{
    stdin: string;
    expected_output: string;
    description: string;
  }>;
  relevant_skills: string[];
  is_daily: boolean;
  daily_date?: string | null;
  created_at: string;
}

export interface BugHunterRunResult {
  passed_tests: number;
  total_tests: number;
  execution_time_ms: number;
  all_passed: boolean;
  test_results: Array<{
    test_index: number;
    description: string;
    passed: boolean;
    is_public: boolean;
    actual_output: string;
    expected_output: string;
    stderr?: string | null;
    execution_time_ms: number;
    is_timed_out?: boolean;
  }>;
}

export interface BugHunterSubmissionResult {
  id: string;
  challenge_id: string;
  challenge_title: string;
  challenge_slug: string;
  status: string;
  score: number;
  is_bug_fixed: boolean;
  regressions_passed: boolean;
  edge_cases_passed: boolean;
  passed_tests: number;
  total_tests: number;
  execution_time_ms?: number | null;
  root_cause_correct?: boolean | null;
  test_results: Array<{
    test_index: number;
    description: string;
    passed: boolean;
    is_public: boolean;
    is_regression?: boolean;
    is_edge?: boolean;
    actual_output: string;
    expected_output: string;
    execution_time_ms: number;
  }>;
  ai_review: {
    root_cause_explanation?: string;
    anti_pattern_flag?: string;
    root_cause_hypothesis_correct?: boolean | null;
    recommendations?: string[];
    advisory_notice?: string;
  };
  streak_updated?: {
    current_streak: number;
    longest_streak: number;
    last_activity_date?: string | null;
    total_bugs_fixed: number;
    points: number;
  } | null;
  new_badges_earned: string[];
  created_at: string;
}

export interface BugHunterStreak {
  current_streak: number;
  longest_streak: number;
  last_activity_date?: string | null;
  total_bugs_fixed: number;
  points: number;
  badges: Array<{
    id: string;
    badge_key: string;
    badge_name: string;
    description: string;
    icon: string;
    earned_at: string;
  }>;
}
