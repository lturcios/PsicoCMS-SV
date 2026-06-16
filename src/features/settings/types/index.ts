import type { Tables } from '@/lib/supabase/database.types';

export type ClinicSettings = Tables<'clinic_settings'>;

export type ClinicSettingsPatch = Partial<
  Omit<ClinicSettings, 'id' | 'tenant_id' | 'created_at' | 'updated_at'>
>;

export type Specialty = Tables<'specialties'>;

export type Service = Tables<'services'>;

export type ServicePatch = Partial<Omit<Service, 'id' | 'tenant_id' | 'created_at' | 'updated_at'>>;

export type AvailabilitySchedule = Tables<'availability_schedules'>;

export type AvailabilityException = Tables<'availability_exceptions'>;
