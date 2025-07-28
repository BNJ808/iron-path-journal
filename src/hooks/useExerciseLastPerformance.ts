import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { ExerciseSet } from '@/types';

export interface ExerciseLastPerformance {
    user_id: string;
    exercise_id: string;
    sets: ExerciseSet[];
    notes?: string;
    updated_at: string;
}

export const useExerciseLastPerformance = () => {
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const userId = user?.id;

    const getLastPerformances = async (exerciseIds: string[]): Promise<Record<string, ExerciseSet[]>> => {
        if (!userId || exerciseIds.length === 0) return {};

        const { data, error } = await supabase
            .from('exercise_last_performance')
            .select('exercise_id, sets, notes')
            .in('exercise_id', exerciseIds)
            .eq('user_id', userId);

        if (error) {
            console.error("Error fetching last performances:", error);
            return {};
        }

        const performances: Record<string, ExerciseSet[]> = {};
        if (data) {
            data.forEach(item => {
                if(item.exercise_id && item.sets){
                    performances[item.exercise_id] = (item.sets as unknown as ExerciseSet[]) || [];
                }
            });
        }

        return performances;
    };

    const getLastNotes = async (exerciseIds: string[]): Promise<Record<string, string>> => {
        if (!userId || exerciseIds.length === 0) return {};

        const { data, error } = await supabase
            .from('exercise_last_performance')
            .select('exercise_id, notes')
            .in('exercise_id', exerciseIds)
            .eq('user_id', userId);

        if (error) {
            console.error("Error fetching last notes:", error);
            return {};
        }

        const notes: Record<string, string> = {};
        if (data) {
            data.forEach(item => {
                if (item.exercise_id && item.notes) {
                    notes[item.exercise_id] = item.notes;
                }
            });
        }

        return notes;
    };

    const updateLastPerformancesMutation = useMutation({
        mutationFn: async (performances: { exerciseId: string; sets: ExerciseSet[]; notes?: string }[]) => {
            if (!userId) throw new Error("User not authenticated");

            // Éliminer les doublons par exerciceId pour éviter l'erreur ON CONFLICT
            const uniquePerformances = performances.reduce((acc, current) => {
                const existingIndex = acc.findIndex(item => item.exerciseId === current.exerciseId);
                if (existingIndex >= 0) {
                    // Si l'exercice existe déjà, on garde le plus récent (le dernier)
                    acc[existingIndex] = current;
                } else {
                    acc.push(current);
                }
                return acc;
            }, [] as typeof performances);

            const recordsToUpsert = uniquePerformances.map(p => ({
                user_id: userId,
                exercise_id: p.exerciseId,
                sets: p.sets as any,
                notes: p.notes,
                updated_at: new Date().toISOString()
            }));

            if (recordsToUpsert.length === 0) return;

            // Traiter les mises à jour une par une pour éviter les conflits
            for (const record of recordsToUpsert) {
                const { error } = await supabase
                    .from('exercise_last_performance')
                    .upsert(record, { 
                        onConflict: 'user_id,exercise_id',
                        ignoreDuplicates: false 
                    });

                if (error) {
                    console.error(`Erreur lors de la mise à jour de l'exercice ${record.exercise_id}:`, error);
                    throw error;
                }
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['exercise_last_performance', userId] });
        },
    });

    return {
        getLastPerformances,
        getLastNotes,
        updateLastPerformances: updateLastPerformancesMutation.mutateAsync,
    };
};
