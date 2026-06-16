import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { supabase } from '@/lib/supabase/client';

import type { Specialty } from '../types';
import { settingsKeys } from './settings.queries';

export function useSpecialties() {
  return useQuery({
    queryKey: settingsKeys.specialties(),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('specialties')
        .select('*')
        .order('sort_order')
        .order('created_at');
      if (error) throw error;
      return data as Specialty[];
    },
  });
}

export function useCreateSpecialty() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (name: string) => {
      // set_tenant_id trigger overrides tenant_id before insert
      const { data, error } = await supabase
        .from('specialties')
        .insert({ name, tenant_id: '' })
        .select()
        .single();
      if (error) throw error;
      return data as Specialty;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.specialties() });
    },
  });
}

export function useDeleteSpecialty() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('specialties').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.specialties() });
    },
  });
}
