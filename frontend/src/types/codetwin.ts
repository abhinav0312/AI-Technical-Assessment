export interface Skill {
  id: string;
  domain: string;
  name: string;
  slug: string;
  description: string;
  prerequisites: string[];
}

export interface UserSkillProficiency {
  id: string;
  skill_id: string;
  skill_name: string;
  domain: string;
  observed_performance: number;
  estimated_proficiency: number;
  confidence_level: 'high' | 'medium' | 'low' | 'insufficient_evidence';
  evidence_count: number;
  status: 'proficient' | 'developing' | 'needs_evidence';
  last_assessed_at: string;
}

export interface ErrorPattern {
  id: string;
  pattern_category: string;
  title: string;
  description: string;
  frequency: number;
  supporting_evidence: Array<{
    source_id: string;
    title: string;
    timestamp: string;
    error_summary: string;
  }>;
  severity: 'critical' | 'moderate' | 'advisory';
  remediation_advice: string;
  created_at: string;
  updated_at: string;
}

export interface PersonalizedRecommendation {
  id: string;
  activity_type: 'challenge' | 'bughunter' | 'devsim' | 'learning_module';
  activity_id: string;
  title: string;
  difficulty: 'easy' | 'medium' | 'hard';
  domain: string;
  rank_score: number;
  reason: string;
  status: 'pending' | 'accepted' | 'dismissed' | 'completed';
  created_at: string;
}

export interface LearningPlanItem {
  id: string;
  title: string;
  activity_type: string;
  activity_id?: string | null;
  target_skill: string;
  estimated_minutes: number;
  is_completed: boolean;
  is_rejected: boolean;
  completed_at?: string | null;
  order_index: number;
}

export interface LearningPlan {
  id: string;
  title: string;
  week_start_date: string;
  target_skills: string[];
  estimated_hours: number;
  status: string;
  items: LearningPlanItem[];
  created_at: string;
}

export interface CodeTwinDashboard {
  is_onboarding: boolean;
  total_evidence_count: number;
  strongest_skills: UserSkillProficiency[];
  skills_needing_evidence: UserSkillProficiency[];
  all_proficiencies: UserSkillProficiency[];
  recurring_error_patterns: ErrorPattern[];
  recommended_activities: PersonalizedRecommendation[];
  active_learning_plan?: LearningPlan | null;
  historical_improvement: Array<{
    date: string;
    challenge: string;
    skill: string;
    score: number;
    source: string;
  }>;
}
