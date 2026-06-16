import { useProfile } from '../api/auth.queries';
import { useAuth } from './use-auth';

export function useIsOwner(): boolean {
  const { session } = useAuth();
  const profile = useProfile(session?.user.id);
  return profile.data?.role === 'owner';
}
