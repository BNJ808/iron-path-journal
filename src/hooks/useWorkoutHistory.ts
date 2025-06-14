
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Workout } from '@/types';
import { useAuth } from '@/contexts/AuthContext';

export const useWorkoutHistory = () => {
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const userId = user?.id;

    const { data: workouts = [], isLoading } = useQuery({
        queryKey: ['workouts', userId],
        queryFn: async () => {
            if (!userId) return [];
            const { data, error } = await supabase
                .from('workouts')
                .select('*')
                .eq('user_id', userId)
                .eq('status', 'completed')
                .order('date', { ascending: false });
            if (error) throw new Error(error.message);
            // FIX: Cast to unknown first to align Supabase's JSON type with our local Workout type.
            return data as unknown as Workout[];
        },
        enabled: !!userId,
    });

    const addWorkoutMutation = useMutation({
        mutationFn: async (workout: Omit<Workout, 'id' | 'user_id'>) => {
            if (!userId) throw new Error("User not authenticated");
            const { data, error } = await supabase
                .from('workouts')
                // FIX: Cast the inserted object to `any` to match Supabase's expectation for the JSON column.
                .insert([{ ...workout, user_id: userId }] as any)
                .select();
            if (error) throw new Error(error.message);
            return data[0];
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['workouts', userId] });
        },
    });

    const deleteWorkoutMutation = useMutation({
        mutationFn: async (workoutId: string) => {
            const { error } = await supabase.from('workouts').delete().eq('id', workoutId);
            if (error) throw new Error(error.message);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['workouts', userId] });
        },
    });

    const clearHistoryMutation = useMutation({
        mutationFn: async () => {
            if (!userId) throw new Error("User not authenticated");
            const { error } = await supabase.from('workouts').delete().eq('user_id', userId);
            if (error) throw new Error(error.message);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['workouts', userId] });
        },
    });

    return {
        workouts,
        isLoading,
        addWorkout: addWorkoutMutation.mutate,
        deleteWorkout: deleteWorkoutMutation.mutate,
        clearHistory: clearHistoryMutation.mutate,
    };
};
