import { Loader2 } from 'lucide-react';
import { Navigate, Outlet } from 'react-router-dom';

import { useProfile } from '../api/auth.queries';
import { useAuth } from '../hooks/use-auth';

function LoadingScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
    </div>
  );
}

export function AuthGuard() {
  const { session, isLoading } = useAuth();
  const profile = useProfile(session?.user.id);

  if (isLoading || profile.isLoading) return <LoadingScreen />;
  if (!session) return <Navigate to="/login" replace />;
  if (!profile.data) return <Navigate to="/onboarding" replace />;

  return <Outlet />;
}
