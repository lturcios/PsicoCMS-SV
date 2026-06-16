import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { supabase } from '@/lib/supabase/client';

import type { ServiceFormValues } from '../schemas';
import type { Service, ServicePatch } from '../types';
import { settingsKeys } from './settings.queries';

export function useServices() {
  return useQuery({
    queryKey: settingsKeys.services(),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .order('sort_order')
        .order('created_at');
      if (error) throw error;
      return data as Service[];
    },
  });
}

export function useCreateService() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (values: ServiceFormValues) => {
      // set_tenant_id trigger overrides tenant_id before insert
      const { data, error } = await supabase
        .from('services')
        .insert({
          ...values,
          description: values.description || null,
          tenant_id: '',
        })
        .select()
        .single();
      if (error) throw error;
      return data as Service;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.services() });
    },
  });
}

export function useUpdateService() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...patch }: { id: string } & ServicePatch) => {
      const { data, error } = await supabase
        .from('services')
        .update(patch)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data as Service;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.services() });
    },
  });
}

export function useDeleteService() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('services').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.services() });
    },
  });
}
