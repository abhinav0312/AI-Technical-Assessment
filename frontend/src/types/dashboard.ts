export interface ActivityRecord {
  id: string;
  userId: string;
  activityType: 'challenge_viewed' | 'submission_created' | 'assessment_started' | 'profile_updated' | 'login';
  metadata: Record<string, any>;
  createdAt: string;
}

export interface SkillScore {
  name: string;
  score: number; // 0-100
  totalProblems: number;
}

export interface DashboardMetrics {
  assessmentsCompleted: number;
  challengesSolved: number;
  learningStreakDays: number;
  currentScoreAverage: number;
  recentActivities: ActivityRecord[];
  skills: SkillScore[];
  recommendedActions: {
    id: string;
    title: string;
    category: string;
    difficulty: string;
    reason: string;
    url: string;
  }[];
  learningGoals: string[];
}
