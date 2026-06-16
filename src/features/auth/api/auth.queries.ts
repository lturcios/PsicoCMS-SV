import { useQuery } from '@tanstack/react-query';

import { supabase } from '@/lib/supabase/client';

export const authKeys = {
  profile: () => ['auth', 'profile'] as const,
};

export function useProfile(userId: string | undefined) {
  return useQuery({
    queryKey: authKeys.profile(),
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId as string)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
  });
}
