import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { startOfToday } from 'date-fns';
import { Workout, ExerciseLog } from '@/types';

export { type ExerciseLog };

export const useWorkouts = () => {
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const userId = user?.id;

    const { data: todayWorkout, isLoading: isLoadingWorkout } = useQuery<Workout | null>({
        queryKey: ['workout', 'today', userId],
        queryFn: async () => {
            if (!userId) return null;

            const today = startOfToday();
            // check for workouts created today
            const { data, error } = await supabase
                .from('workouts')
                .select('*')
                .eq('user_id', userId)
                .eq('status', 'in-progress')
                .gte('date', today.toISOString())
                .lt('date', new Date(today.getTime() + 24 * 60 * 60 * 1000).toISOString())
                .order('date', { ascending: false })
                .limit(1)
                .maybeSingle();

            if (error) throw error;
            
            if (data) {
                return { ...data, exercises: (data.exercises as unknown as ExerciseLog[]) || [] } as Workout;
            }
            return null;
        },
        enabled: !!userId,
    });

    const createWorkoutMutation = useMutation({
        mutationFn: async (newWorkout?: { exercises?: ExerciseLog[], notes?: string }) => {
            if (!userId) throw new Error("User not authenticated");
            
            const { data, error } = await supabase
                .from('workouts')
                .insert({
                    user_id: userId,
                    date: new Date().toISOString(),
                    exercises: newWorkout?.exercises as any || [],
                    notes: newWorkout?.notes,
                    status: 'in-progress',
                })
                .select()
                .single();

            if (error) throw error;
            return { ...data, exercises: (data.exercises as unknown as ExerciseLog[]) || [] } as Workout;
        },
        onSuccess: (data) => {
            queryClient.setQueryData(['workout', 'today', userId], data);
            queryClient.invalidateQueries({ queryKey: ['workouts', userId] });
        },
    });

    const updateWorkoutMutation = useMutation({
        mutationFn: async (updatedWorkout: { workoutId: string; exercises?: ExerciseLog[], notes?: string, status?: string, ended_at?: string | null }) => {
            if (!userId) throw new Error("User not authenticated");

            const { workoutId, ...updateData } = updatedWorkout;

            const { data, error } = await supabase
                .from('workouts')
                .update(updateData as any)
                .eq('id', workoutId)
                .select()
                .single();
            
            if (error) throw error;
            return { ...data, exercises: (data.exercises as unknown as ExerciseLog[]) || [] } as Workout;
        },
        onSuccess: (data) => {
            if (data.status === 'completed') {
                queryClient.removeQueries({ queryKey: ['workout', 'today', userId] });
                queryClient.invalidateQueries({ queryKey: ['workouts', userId] });
            } else {
                queryClient.setQueryData(['workout', 'today', userId], data);
            }
        },
    });

    const deleteWorkoutMutation = useMutation({
        mutationFn: async (workoutId: string) => {
            if (!userId) throw new Error("User not authenticated");

            const { error } = await supabase
                .from('workouts')
                .delete()
                .eq('id', workoutId);
            
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.setQueryData(['workout', 'today', userId], null);
        },
    });

    return {
        todayWorkout,
        isLoadingWorkout,
        createWorkout: createWorkoutMutation.mutateAsync,
        updateWorkout: updateWorkoutMutation.mutateAsync,
        deleteWorkout: deleteWorkoutMutation.mutateAsync,
    };
};
