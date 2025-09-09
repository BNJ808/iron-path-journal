
import { useMemo } from 'react';
import type { Workout } from '@/types';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export const useExerciseProgress = (selectedExerciseName: string | null, workouts: Workout[] | undefined) => {
    const selectedExerciseData = useMemo(() => {
        if (!selectedExerciseName || !workouts) return null;

        console.log('Processing exercise:', selectedExerciseName);
        console.log('Total workouts:', workouts.length);

        const history = workouts
            .map(workout => {
                const exerciseLogs = workout.exercises.filter(ex => ex.name === selectedExerciseName);
                if (exerciseLogs.length === 0) return null;

                console.log(`Workout ${workout.date}: found ${exerciseLogs.length} exercise logs`);
                exerciseLogs.forEach((log, index) => {
                    console.log(`  Log ${index}:`, log.name, 'Sets:', log.sets.length);
                    log.sets.forEach((set, setIndex) => {
                        console.log(`    Set ${setIndex}:`, {
                            completed: set.completed,
                            weight: set.weight,
                            reps: set.reps,
                            weightNum: Number(set.weight),
                            repsNum: Number(set.reps),
                            weightValid: !isNaN(Number(set.weight)),
                            repsValid: !isNaN(Number(set.reps))
                        });
                    });
                });

                // Filtrer les sets valides (avec des valeurs numériques valides, peu importe le statut completed)
                const validSets = exerciseLogs.flatMap(log => 
                    log.sets.filter(set => {
                        const weight = Number(set.weight);
                        const reps = Number(set.reps);
                        const isValid = !isNaN(weight) && !isNaN(reps) && weight > 0 && reps > 0;
                        if (!isValid) {
                            console.log(`    Invalid set:`, {
                                completed: set.completed,
                                weight: set.weight,
                                reps: set.reps,
                                reason: isNaN(weight) ? 'invalid weight' :
                                       isNaN(reps) ? 'invalid reps' :
                                       weight <= 0 ? 'weight <= 0' :
                                       reps <= 0 ? 'reps <= 0' : 'unknown'
                            });
                        }
                        return isValid;
                    })
                );

                console.log(`  Valid sets: ${validSets.length}`);

                // Si aucun set valide, on ignore cette entrée
                if (validSets.length === 0) {
                    console.log(`  Skipping workout ${workout.date} - no valid sets`);
                    return null;
                }

                const volume = validSets.reduce((acc, set) => {
                    const weight = Number(set.weight);
                    const reps = Number(set.reps);
                    return acc + (weight * reps);
                }, 0);
                
                const sets = validSets.length;
                const reps = validSets.reduce((acc, set) => acc + Number(set.reps), 0);
                const maxWeight = Math.max(...validSets.map(set => Number(set.weight)));

                const result = {
                    date: workout.date,
                    displayDate: format(new Date(workout.date), 'd MMM', { locale: fr }),
                    sets,
                    reps,
                    volume,
                    maxWeight,
                };

                console.log(`  Workout result:`, result);
                return result;
            })
            .filter((item): item is NonNullable<typeof item> => item !== null)
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        
        console.log(`Final history for ${selectedExerciseName}:`, history);
        
        return {
            name: selectedExerciseName,
            history: history,
        };
    }, [selectedExerciseName, workouts]);

    return selectedExerciseData;
};
