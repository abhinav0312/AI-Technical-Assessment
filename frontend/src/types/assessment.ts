export type AssessmentStatus = 'draft' | 'published' | 'archived';
export type AttemptStatus = 'in_progress' | 'submitted' | 'evaluated' | 'abandoned';

export interface Assessment {
  id: string;
  title: string;
  description: string;
  creatorId: string;
  assessmentType: string;
  durationSeconds: number;
  status: AssessmentStatus;
  startTime?: string | null;
  endTime?: string | null;
  createdAt: string;
}

export interface AssessmentAttempt {
  id: string;
  assessmentId: string;
  candidateId: string;
  startedAt: string;
  submittedAt?: string | null;
  status: AttemptStatus;
  score?: number | null;
  maximumScore: number;
}
