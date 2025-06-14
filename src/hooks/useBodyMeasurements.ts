
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Tables } from '@/integrations/supabase/types';

export type BodyMeasurement = Tables<'body_measurements'>;

export const useBodyMeasurements = () => {
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const userId = user?.id;

    const { data: measurements, isLoading } = useQuery({
        queryKey: ['bodyMeasurements', userId],
        queryFn: async () => {
            if (!userId) return [];
            const { data, error } = await supabase
                .from('body_measurements')
                .select('*')
                .eq('user_id', userId)
                .order('date', { ascending: false });
            if (error) {
                throw new Error(error.message);
            }
            return data;
        },
        enabled: !!userId,
    });

    const addMeasurementMutation = useMutation({
        mutationFn: async (newMeasurement: { weight: number; date: string }) => {
            if (!userId) throw new Error('User not authenticated');
            
            const { error, data } = await supabase
                .from('body_measurements')
                .upsert({ ...newMeasurement, user_id: userId }, { onConflict: 'user_id,date' })
                .select()
                .single();

            if (error) {
                throw error;
            }
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['bodyMeasurements', userId] });
        },
    });

    return {
        measurements,
        isLoading,
        addMeasurement: addMeasurementMutation.mutateAsync,
    };
};
