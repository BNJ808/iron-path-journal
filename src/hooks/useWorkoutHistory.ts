
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
            
            console.log('Fetching workouts for user:', userId);
            
            const { data, error } = await supabase
                .from('workouts')
                .select('*')
                .eq('user_id', userId)
                .eq('status', 'completed')
                .order('date', { ascending: false });
                
            console.log('Workouts query result:', { data, error });
            
            if (error) throw new Error(error.message);
            
            // Les types générés par Supabase utilisent un type `Json` générique pour les colonnes JSON.
            // Nous convertissons le résultat vers notre type `Workout` plus spécifique.
            const workoutsData = data as unknown as Workout[];
            console.log('Converted workouts data:', workoutsData);
            
            return workoutsData;
        },
        enabled: !!userId,
    });

    const addWorkoutMutation = useMutation({
        mutationFn: async (workout: Omit<Workout, 'id' | 'user_id'>) => {
            if (!userId) throw new Error("User not authenticated");
            const { data, error } = await supabase
                .from('workouts')
                // La propriété `exercises` de notre objet `workout` est un tableau typé,
                // compatible avec le type `Json` de Supabase. Nous utilisons `as any`
                // pour aligner les types en raison des limitations d'inférence de TypeScript.
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

    const updateWorkoutDurationMutation = useMutation({
        mutationFn: async ({ workoutId, newDurationMinutes }: { workoutId: string; newDurationMinutes: number }) => {
            if (!userId) throw new Error("User not authenticated");
            
            // Récupérer l'entraînement pour obtenir la date de début
            const { data: workout, error: fetchError } = await supabase
                .from('workouts')
                .select('date')
                .eq('id', workoutId)
                .eq('user_id', userId)
                .single();
                
            if (fetchError) throw new Error(fetchError.message);
            
            // Calculer la nouvelle date de fin
            const startDate = new Date(workout.date);
            const endDate = new Date(startDate.getTime() + newDurationMinutes * 60 * 1000);
            
            const { error } = await supabase
                .from('workouts')
                .update({ ended_at: endDate.toISOString() })
                .eq('id', workoutId)
                .eq('user_id', userId);
                
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
        updateWorkoutDuration: updateWorkoutDurationMutation.mutate,
        isUpdatingDuration: updateWorkoutDurationMutation.isPending,
    };
};
