
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Tables } from '@/integrations/supabase/types';
import { startOfToday } from 'date-fns';

export type ExerciseSet = { id: string; reps: number | string; weight: number | string };
export type ExerciseLog = {
    id: string; // unique id for the log entry
    exerciseId: string; // from data/exercises.ts
    name: string;
    sets: ExerciseSet[];
};
export type Workout = Omit<Tables<'workouts'>, 'exercises'> & {
    exercises: ExerciseLog[];
};

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
                .gte('date', today.toISOString())
                .lt('date', new Date(today.getTime() + 24 * 60 * 60 * 1000).toISOString())
                .order('date', { ascending: false })
                .limit(1)
                .maybeSingle();

            if (error) throw error;
            
            if (data) {
                return { ...data, exercises: (data.exercises as unknown as ExerciseLog[]) || [] };
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
                    exercises: newWorkout?.exercises || [],
                    notes: newWorkout?.notes,
                })
                .select()
                .single();

            if (error) throw error;
            return { ...data, exercises: (data.exercises as unknown as ExerciseLog[]) || [] };
        },
        onSuccess: (data) => {
            queryClient.setQueryData(['workout', 'today', userId], data);
            queryClient.invalidateQueries({ queryKey: ['workouts', 'history'] });
        },
    });

    const updateWorkoutMutation = useMutation({
        mutationFn: async (updatedWorkout: { workoutId: string; exercises?: ExerciseLog[], notes?: string }) => {
            if (!userId) throw new Error("User not authenticated");

            const { workoutId, ...updateData } = updatedWorkout;

            const { data, error } = await supabase
                .from('workouts')
                .update(updateData)
                .eq('id', workoutId)
                .select()
                .single();
            
            if (error) throw error;
            return { ...data, exercises: (data.exercises as unknown as ExerciseLog[]) || [] };
        },
        onSuccess: (data) => {
            queryClient.setQueryData(['workout', 'today', userId], data);
        },
    });

    return {
        todayWorkout,
        isLoadingWorkout,
        createWorkout: createWorkoutMutation.mutateAsync,
        updateWorkout: updateWorkoutMutation.mutateAsync,
    };
};
