import type { Tables } from '@/lib/supabase/database.types';

export type ClinicSettings = Tables<'clinic_settings'>;

export type ClinicSettingsPatch = Partial<
  Omit<ClinicSettings, 'id' | 'tenant_id' | 'created_at' | 'updated_at'>
>;
