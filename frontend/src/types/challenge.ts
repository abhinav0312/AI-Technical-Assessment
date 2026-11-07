export type ChallengeDifficulty = 'easy' | 'medium' | 'hard';
export type ChallengeVisibility = 'public' | 'private' | 'unlisted';

export interface ChallengeTag {
  id: string;
  name: string;
  slug: string;
}

export interface StarterCodeMap {
  [language: string]: string;
}

export interface SampleTestCase {
  id: string;
  description?: string | null;
  stdin: string;
  expected_output: string;
  order_index?: number;
}

export interface Challenge {
  id: string;
  title: string;
  slug: string;
  description: string;
  difficulty: ChallengeDifficulty;
  category: string;
  constraints?: string | null;
  starter_code?: StarterCodeMap | null;
  supported_languages?: string[];
  visibility: ChallengeVisibility;
  tags: ChallengeTag[];
  created_at: string;
  updated_at: string;

  // Arena additions
  acceptance_rate?: number | null;
  total_submissions?: number | null;
  user_status?: 'completed' | 'attempted' | 'unsolved' | null;
  is_bookmarked?: boolean;
  sample_test_cases?: SampleTestCase[];
  user_draft?: string | null;
  prev_challenge_slug?: string | null;
  next_challenge_slug?: string | null;
  required_reasoning_fields?: string[];
}

export interface ChallengeFilterParams {
  search?: string;
  difficulty?: string;
  category?: string;
  tag?: string;
  language?: string;
  sort_by?: string;
  page?: number;
  page_size?: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}
