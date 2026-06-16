import { useMutation, useQueryClient } from '@tanstack/react-query';

import { uploadToCloudinary, validateImageFile } from '@/lib/cloudinary/upload';
import { supabase } from '@/lib/supabase/client';

import type { ClinicSettings, ClinicSettingsPatch } from '../types';
import { settingsKeys } from './settings.queries';

export function useUpdateClinicSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...patch }: { id: string } & ClinicSettingsPatch) => {
      const { data, error } = await supabase
        .from('clinic_settings')
        .update(patch)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data as ClinicSettings;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(settingsKeys.clinicSettings(), data);
    },
  });
}

export function useUploadProfilePhoto() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, file }: { id: string; file: File }) => {
      const validationError = validateImageFile(file);
      if (validationError) throw new Error(validationError);

      const photoUrl = await uploadToCloudinary(file);

      const { data, error } = await supabase
        .from('clinic_settings')
        .update({ photo_url: photoUrl })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data as ClinicSettings;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(settingsKeys.clinicSettings(), data);
    },
  });
}
