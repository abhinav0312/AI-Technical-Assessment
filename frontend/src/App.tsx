import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from '@/routes/ProtectedRoute';
import { AppShell } from '@/components/layout/AppShell';

import { LandingPage } from '@/pages/LandingPage';
import { LoginPage } from '@/pages/LoginPage';
import { RegisterPage } from '@/pages/RegisterPage';
import { ChallengesPage } from '@/pages/ChallengesPage';
import { FeaturesPage } from '@/pages/FeaturesPage';
import { DashboardOverview } from '@/pages/DashboardOverview';
import { CodingArena } from '@/pages/CodingArena';
import { SubmissionsPage } from '@/pages/SubmissionsPage';
import { AssessmentsPage } from '@/pages/AssessmentsPage';
import { AnalyticsPage } from '@/pages/AnalyticsPage';
import { ProfilePage } from '@/pages/ProfilePage';
import { SettingsPage } from '@/pages/SettingsPage';
import { CodeTwinDashboard } from '@/pages/CodeTwinDashboard';
import { BugHunterPage } from '@/pages/BugHunterPage';
import { BugHunterArena } from '@/pages/BugHunterArena';
import { DevSimPage } from '@/pages/DevSimPage';
import { DevSimWorkspace } from '@/pages/DevSimWorkspace';
import { SkillGraphPage } from '@/pages/SkillGraphPage';
import { NotFoundPage } from '@/pages/NotFoundPage';

export function App() {
  return (
    <Routes>
      {/* Public Platform Routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/challenges" element={<ChallengesPage />} />
      <Route path="/challenges/:slug" element={<CodingArena />} />
      <Route
        path="/skillgraph"
        element={
          <ProtectedRoute>
            <Navigate to="/dashboard/skillgraph" replace />
          </ProtectedRoute>
        }
      />
      <Route path="/bughunter" element={<BugHunterPage />} />
      <Route path="/bughunter/:slug" element={<BugHunterArena />} />
      <Route path="/devsim" element={<DevSimPage />} />
      <Route path="/devsim/:slug" element={<DevSimWorkspace />} />
      <Route path="/features" element={<FeaturesPage />} />

      {/* Protected Dashboard Routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <AppShell />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardOverview />} />
        <Route path="arena" element={<CodingArena />} />
        <Route path="arena/:slug" element={<CodingArena />} />
        <Route path="skillgraph" element={<SkillGraphPage />} />
        <Route path="codetwin" element={<CodeTwinDashboard />} />
        <Route path="bughunter" element={<BugHunterPage />} />
        <Route path="bughunter/:slug" element={<BugHunterArena />} />
        <Route path="devsim" element={<DevSimPage />} />
        <Route path="devsim/:slug" element={<DevSimWorkspace />} />
        <Route path="submissions" element={<SubmissionsPage />} />
        <Route path="assessments" element={<AssessmentsPage />} />
        <Route path="analytics" element={<AnalyticsPage />} />
        <Route path="learning-path" element={<CodeTwinDashboard />} />
        <Route path="activity" element={<SubmissionsPage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default App;
