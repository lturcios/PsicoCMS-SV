import type { Session } from '@supabase/supabase-js';

import type { Database } from '@/lib/supabase/database.types';

export type UserRole = 'owner' | 'asistente';

export type Profile = Database['public']['Tables']['profiles']['Row'];

export type AuthState = {
  session: Session | null;
  isLoading: boolean;
};
