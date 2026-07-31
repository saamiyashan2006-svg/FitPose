import { Routes, Route } from 'react-router-dom';
import { SplashScreen } from '@/pages/SplashScreen';
import { LoginPage, SignUpPage, ForgotPasswordPage } from '@/pages/AuthPages';
import { DashboardPage } from '@/pages/DashboardPage';
import { ExerciseLibraryPage } from '@/pages/ExerciseLibraryPage';
import { SessionPage } from '@/pages/SessionPage';
import { ProgressPage } from '@/pages/ProgressPage';
import { ProfilePage } from '@/pages/ProfilePage';
import { SettingsPage } from '@/pages/SettingsPage';
import { ProtectedRoute } from '@/components/layout/ProtectedRoute';
import { AppLayout } from '@/components/layout/AppLayout';

function NotFound() {
  return (
    <div className="grid min-h-screen place-items-center text-center">
      <div>
        <p className="font-display text-6xl font-extrabold text-gradient">404</p>
        <p className="mt-2 text-slate-500">Page not found.</p>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<SplashScreen />} />
      <Route path="/auth/login" element={<LoginPage />} />
      <Route path="/auth/signup" element={<SignUpPage />} />
      <Route path="/auth/forgot" element={<ForgotPasswordPage />} />
      <Route
        path="/app"
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="exercises" element={<ExerciseLibraryPage />} />
        <Route path="session" element={<SessionPage />} />
        <Route path="progress" element={<ProgressPage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
