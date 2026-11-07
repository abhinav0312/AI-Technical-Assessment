export interface SkillGraphNode {
  id: string;
  slug: string;
  name: string;
  domain: string;
  category?: string | null;
  tier: number;
  hierarchy_path?: string | null;
  description: string;
  prerequisites: string[];
  proficiency?: number | null; // 0.0 - 1.0 or null
  observed_performance?: number | null;
  evidence_count: number;
  confidence_level: 'high' | 'medium' | 'low' | 'insufficient_evidence';
  mastery_level: 'mastered' | 'proficient' | 'developing' | 'unassessed';
  recent_trend: 'improving' | 'declining' | 'steady' | 'new' | 'no_data';
  last_assessed_at?: string | null;
  is_unlocked: boolean;
  position_x: number;
  position_y: number;
}

export interface SkillGraphEdge {
  id: string;
  source: string; // Prerequisite slug
  target: string; // Dependent slug
  status: 'satisfied' | 'in_progress' | 'unmet';
}

export interface SkillGraphSummary {
  total_skills: number;
  mastered_count: number;
  proficient_count: number;
  developing_count: number;
  unassessed_count: number;
  overall_proficiency: number;
}

export interface SkillGraphDomain {
  key: string;
  label: string;
  count: number;
}

export interface SkillGraphResponse {
  version: string;
  nodes: SkillGraphNode[];
  edges: SkillGraphEdge[];
  domains: SkillGraphDomain[];
  categories: string[];
  summary: SkillGraphSummary;
}

export interface SupportingEvidenceItem {
  source_id: string;
  source_type: string;
  challenge_title: string;
  score: number;
  timestamp: string;
  details: Record<string, any>;
}

export interface RelatedChallengeItem {
  id: string;
  slug: string;
  title: string;
  challenge_type: 'standard' | 'bughunter' | 'devsim';
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface PrerequisiteDetailItem {
  slug: string;
  name: string;
  domain: string;
  proficiency?: number | null;
  status: string;
  is_satisfied: boolean;
}

export interface SkillDetailResponse {
  node: SkillGraphNode;
  supporting_evidence: SupportingEvidenceItem[];
  related_challenges: RelatedChallengeItem[];
  prerequisites: PrerequisiteDetailItem[];
  dependents: PrerequisiteDetailItem[];
  recent_mistakes: Array<{
    id: string;
    title: string;
    pattern_category: string;
    frequency: number;
    remediation_advice: string;
    severity: string;
  }>;
  progress_history: Array<{
    date: string;
    score: number;
    challenge: string;
    source: string;
  }>;
  recommended_activity?: {
    id: string;
    activity_type: string;
    activity_id: string;
    title: string;
    difficulty: string;
    reason: string;
  } | null;
}
