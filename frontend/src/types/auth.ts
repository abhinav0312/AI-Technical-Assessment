export type UserRole = 'candidate' | 'creator' | 'recruiter' | 'admin';

export interface User {
  id: string;
  email: string;
  displayName: string;
  role: UserRole;
  accountStatus: string;
  createdAt: string;
  updatedAt: string;
  profile?: UserProfile;
}

export interface UserProfile {
  id?: string;
  userId: string;
  biography?: string | null;
  preferredProgrammingLanguages?: string[] | null;
  experienceLevel?: string | null;
  learningGoals?: string | null;
  timezone?: string | null;
}

export interface AuthResponse {
  user: User;
  token?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  displayName: string;
  role?: UserRole;
}
