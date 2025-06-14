
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Tables } from '@/integrations/supabase/types';

export type Profile = Tables<'profiles'>;

export const useProfile = () => {
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const userId = user?.id;

    const { data: profile, isLoading } = useQuery({
        queryKey: ['profile', userId],
        queryFn: async () => {
            if (!userId) return null;
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single();
            if (error && error.code !== 'PGRST116') { // PGRST116: "The result contains 0 rows"
                throw new Error(error.message);
            }
            return data;
        },
        enabled: !!userId,
    });

    const updateProfileMutation = useMutation({
        mutationFn: async (updatedProfile: Partial<Profile> & { id: string }) => {
            const { error, data } = await supabase
                .from('profiles')
                .update({ username: updatedProfile.username, updated_at: new Date().toISOString() })
                .eq('id', updatedProfile.id)
                .select()
                .single();

            if (error) {
                throw error;
            }
            return data;
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['profile', userId] });
            queryClient.setQueryData(['profile', userId], data);
        },
    });

    return {
        profile,
        isLoading,
        updateProfile: updateProfileMutation.mutateAsync,
    };
};
