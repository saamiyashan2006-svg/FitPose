import { Navigate } from 'react-router-dom';
import { type ReactNode } from 'react';
import { useAuth } from '@/context/AuthContext';
import { FullScreenLoader } from '@/components/ui/Spinner';

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <FullScreenLoader label="Securing your session..." />;
  if (!user) return <Navigate to="/auth/login" replace />;
  return <>{children}</>;
}
