
import { useMemo } from 'react';
import type { Workout } from '@/types';
import { startOfDay, endOfDay } from 'date-fns';
import { DateRange } from 'react-day-picker';
import { calculateEstimated1RM } from '@/utils/calculations';
import { filterWorkoutsForStats } from '@/utils/workoutFilters';

interface PersonalRecord {
    weight: number;
    reps: number;
}

export const useStatsCalculations = (workouts: Workout[] | undefined, dateRange: DateRange | undefined) => {
    // Filtrer les workouts pour exclure les sorties running
    const muscleWorkouts = useMemo(() => filterWorkoutsForStats(workouts), [workouts]);
    
    const filteredWorkouts = useMemo(() => {
        if (!muscleWorkouts) return [];
        
        // Si pas de dateRange, retourner tous les workouts filtrés
        if (!dateRange?.from) return muscleWorkouts;

        const fromDate = startOfDay(dateRange.from);
        const toDate = dateRange.to ? endOfDay(dateRange.to) : endOfDay(dateRange.from);
        
        return muscleWorkouts.filter(w => {
            const workoutDate = new Date(w.date);
            return workoutDate >= fromDate && workoutDate <= toDate;
        });
    }, [muscleWorkouts, dateRange]);

    const stats = useMemo(() => {
        if (!muscleWorkouts) {
            return {
                totalWorkouts: 0,
                totalVolume: 0,
                totalSets: 0,
                averageDuration: 0,
                personalRecords: {},
            };
        }

        // Utiliser tous les muscleWorkouts pour les records personnels
        const personalRecords: { [key: string]: PersonalRecord } = {};
        muscleWorkouts.forEach(workout => {
            workout.exercises.forEach(exercise => {
                exercise.sets.forEach(set => {
                    if (!set.completed) return;
                    const weight = Number(set.weight) || 0;
                    const reps = Number(set.reps) || 0;
                    const currentPR = personalRecords[exercise.name] || { weight: 0, reps: 0 };
                    if (weight > currentPR.weight) {
                        personalRecords[exercise.name] = { weight, reps };
                    }
                });
            });
        });

        // Utiliser filteredWorkouts pour les statistiques de période, mais tous les muscleWorkouts si pas de filtre
        const workoutsToAnalyze = dateRange?.from ? filteredWorkouts : muscleWorkouts;

        let totalVolume = 0;
        let totalSets = 0;
        let totalDuration = 0;
        let workoutsWithDuration = 0;

        workoutsToAnalyze.forEach(workout => {
            if (workout.ended_at && workout.date) {
                const duration = new Date(workout.ended_at).getTime() - new Date(workout.date).getTime();
                if (duration > 0) {
                    totalDuration += duration;
                    workoutsWithDuration++;
                }
            }

            workout.exercises.forEach(exercise => {
                exercise.sets.forEach(set => {
                    if (set.completed) {
                        totalSets++;
                        const weight = Number(set.weight) || 0;
                        const reps = Number(set.reps) || 0;
                        totalVolume += reps * weight;
                    }
                });
            });
        });
        
        const averageDuration = workoutsWithDuration > 0 ? (totalDuration / workoutsWithDuration) / (1000 * 60) : 0; // in minutes

        return {
            totalWorkouts: workoutsToAnalyze.length,
            totalVolume: Math.round(totalVolume),
            totalSets,
            averageDuration,
            personalRecords,
        };
    }, [muscleWorkouts, filteredWorkouts, dateRange]);

    const estimated1RMs = useMemo(() => {
        if (!muscleWorkouts) return {};

        const records = new Map<string, number>();

        muscleWorkouts.forEach(workout => {
            workout.exercises.forEach(exercise => {
                exercise.sets.forEach(set => {
                    if (set.completed) {
                        const weight = Number(set.weight);
                        const reps = Number(set.reps);
                        if (weight > 0 && reps > 0) {
                            const est1RM = calculateEstimated1RM(weight, reps);
                            const currentMax = records.get(exercise.name) || 0;
                            if (est1RM > currentMax) {
                                records.set(exercise.name, est1RM);
                            }
                        }
                    }
                });
            });
        });

        return Object.fromEntries(records);
    }, [muscleWorkouts]);

    const uniqueExercises = useMemo(() => {
        if (!muscleWorkouts) return [];
        const exercisesMap = new Map<string, { name: string }>();
        muscleWorkouts.forEach(workout => {
            workout.exercises.forEach(exercise => {
                if (!exercisesMap.has(exercise.name)) {
                    exercisesMap.set(exercise.name, { name: exercise.name });
                }
            });
        });
        return Array.from(exercisesMap.values())
            .sort((a, b) => a.name.localeCompare(b.name));
    }, [muscleWorkouts]);

    return {
        filteredWorkouts,
        stats,
        estimated1RMs,
        uniqueExercises
    };
};
