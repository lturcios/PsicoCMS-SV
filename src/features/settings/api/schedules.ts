import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { supabase } from '@/lib/supabase/client';

import type { ExceptionFormValues, WeeklyScheduleFormValues } from '../schemas';
import type { AvailabilityException, AvailabilitySchedule } from '../types';
import { settingsKeys } from './settings.queries';

function toDbTime(t: string): string {
  return t.length === 5 ? `${t}:00` : t;
}

export function useAvailabilitySchedules() {
  return useQuery({
    queryKey: settingsKeys.schedules(),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('availability_schedules')
        .select('*')
        .order('day_of_week');
      if (error) throw error;
      return data as AvailabilitySchedule[];
    },
  });
}

export function useUpsertSchedules() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (values: WeeklyScheduleFormValues) => {
      const rows = values.days.map((d) => ({
        day_of_week: d.day_of_week,
        is_active: d.is_active,
        start_time: toDbTime(d.start_time),
        end_time: toDbTime(d.end_time),
        tenant_id: '', // set_tenant_id trigger overrides before insert
      }));
      const { error } = await supabase
        .from('availability_schedules')
        .upsert(rows, { onConflict: 'tenant_id,day_of_week' });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.schedules() });
    },
  });
}

export function useAvailabilityExceptions() {
  return useQuery({
    queryKey: settingsKeys.exceptions(),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('availability_exceptions')
        .select('*')
        .order('date');
      if (error) throw error;
      return data as AvailabilityException[];
    },
  });
}

export function useCreateException() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (values: ExceptionFormValues) => {
      const { data, error } = await supabase
        .from('availability_exceptions')
        .insert({
          date: values.date,
          type: values.type,
          reason: values.reason || null,
          start_time: values.start_time ? toDbTime(values.start_time) : null,
          end_time: values.end_time ? toDbTime(values.end_time) : null,
          tenant_id: '', // set_tenant_id trigger overrides before insert
        })
        .select()
        .single();
      if (error) throw error;
      return data as AvailabilityException;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.exceptions() });
    },
  });
}

export function useDeleteException() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('availability_exceptions').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.exceptions() });
    },
  });
}
