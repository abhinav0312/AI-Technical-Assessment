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

export interface Challenge {
  id: string;
  title: string;
  slug: string;
  description: string;
  difficulty: ChallengeDifficulty;
  category: string;
  constraints?: string | null;
  starterCode?: StarterCodeMap | null;
  supportedLanguages: string[];
  visibility: ChallengeVisibility;
  tags: ChallengeTag[];
  createdAt: string;
  updatedAt: string;
}

export interface ChallengeFilterParams {
  search?: string;
  difficulty?: string;
  category?: string;
  tag?: string;
  page?: number;
  pageSize?: number;
}

export interface ChallengeCreateInput {
  title: string;
  slug?: string;
  description: string;
  difficulty: ChallengeDifficulty;
  category: string;
  constraints?: string;
  starterCode?: Record<string, string>;
  supportedLanguages: string[];
  visibility?: ChallengeVisibility;
  tagNames?: string[];
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
