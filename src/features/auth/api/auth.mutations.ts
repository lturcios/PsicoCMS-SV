import { useMutation } from '@tanstack/react-query';

import { supabase } from '@/lib/supabase/client';

import type { SignInFormValues, SignUpFormValues } from '../schemas';

export function useSignIn() {
  return useMutation({
    mutationFn: async ({ email, password }: SignInFormValues) => {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      return data;
    },
  });
}

export function useSignUp() {
  return useMutation({
    mutationFn: async ({ email, password }: Pick<SignUpFormValues, 'email' | 'password'>) => {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: `${window.location.origin}/onboarding` },
      });
      if (error) throw error;
      return data;
    },
  });
}

export function useSignOut() {
  return useMutation({
    mutationFn: async () => {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    },
  });
}

export function useMagicLink() {
  return useMutation({
    mutationFn: async ({ email }: { email: string }) => {
      const { data, error } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: window.location.origin },
      });
      if (error) throw error;
      return data;
    },
  });
}

export function useCreateTenant() {
  return useMutation({
    mutationFn: async ({
      userId,
      displayName,
      slug,
    }: {
      userId: string;
      displayName: string;
      slug: string;
    }) => {
      const { data, error } = await supabase.rpc('create_tenant_for_user', {
        p_user_id: userId,
        p_display_name: displayName,
        p_slug: slug,
      });
      if (error) throw error;

      // Refrescar sesión para que el Auth Hook inyecte tenant_id y user_role en el JWT
      const { error: refreshError } = await supabase.auth.refreshSession();
      if (refreshError) throw refreshError;

      return data as string; // tenant UUID
    },
  });
}
