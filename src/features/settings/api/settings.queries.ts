import { useQuery } from '@tanstack/react-query';

import { supabase } from '@/lib/supabase/client';

import type { ClinicSettings } from '../types';

export const settingsKeys = {
  all: ['settings'] as const,
  clinicSettings: () => [...settingsKeys.all, 'clinic-settings'] as const,
};

export function useClinicSettings() {
  return useQuery({
    queryKey: settingsKeys.clinicSettings(),
    queryFn: async () => {
      const { data, error } = await supabase.from('clinic_settings').select('*').single();
      if (error) throw error;
      return data as ClinicSettings;
    },
  });
}
