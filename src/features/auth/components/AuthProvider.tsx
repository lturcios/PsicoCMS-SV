import type { Session } from '@supabase/supabase-js';
import type { ReactNode } from 'react';
import { createContext, useEffect, useState } from 'react';

import { supabase } from '@/lib/supabase/client';

import type { AuthState } from '../types';

export const AuthContext = createContext<AuthState | null>(null);

function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setIsLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return <AuthContext.Provider value={{ session, isLoading }}>{children}</AuthContext.Provider>;
}

export default AuthProvider;
