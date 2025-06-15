
import { useMemo } from 'react';
import type { Workout } from '@/types';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export const useExerciseProgress = (selectedExerciseName: string | null, workouts: Workout[] | undefined) => {
    const selectedExerciseData = useMemo(() => {
        if (!selectedExerciseName || !workouts) return null;

        const history = workouts
            .map(workout => {
                const exerciseLogs = workout.exercises.filter(ex => ex.name === selectedExerciseName);
                if (exerciseLogs.length === 0) return null;

                const volume = exerciseLogs.reduce((totalVol, log) => 
                    totalVol + log.sets.filter(s => s.completed).reduce((acc, set) => acc + (Number(set.reps) || 0) * (Number(set.weight) || 0), 0), 0);
                
                const maxWeight = Math.max(0, ...exerciseLogs.flatMap(log => log.sets.filter(s => s.completed).map(set => Number(set.weight) || 0)));

                return {
                    date: workout.date,
                    displayDate: format(new Date(workout.date), 'd MMM', { locale: fr }),
                    volume,
                    maxWeight,
                };
            })
            .filter((item): item is NonNullable<typeof item> => item !== null)
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        
        return {
            name: selectedExerciseName,
            history: history,
        };
    }, [selectedExerciseName, workouts]);

    return selectedExerciseData;
};
