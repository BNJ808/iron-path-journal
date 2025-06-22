
import { useMemo } from 'react';
import type { Workout } from '@/types';
import { startOfDay, endOfDay } from 'date-fns';
import { DateRange } from 'react-day-picker';
import { calculateEstimated1RM } from '@/utils/calculations';

interface PersonalRecord {
    weight: number;
    reps: number;
}

export const useStatsCalculations = (workouts: Workout[] | undefined, dateRange: DateRange | undefined) => {
    const filteredWorkouts = useMemo(() => {
        if (!workouts) return [];
        
        // Si pas de dateRange, retourner tous les workouts
        if (!dateRange?.from) return workouts;

        const fromDate = startOfDay(dateRange.from);
        const toDate = dateRange.to ? endOfDay(dateRange.to) : endOfDay(dateRange.from);
        
        return workouts.filter(w => {
            const workoutDate = new Date(w.date);
            return workoutDate >= fromDate && workoutDate <= toDate;
        });
    }, [workouts, dateRange]);

    const stats = useMemo(() => {
        if (!workouts) {
            return {
                totalWorkouts: 0,
                totalVolume: 0,
                totalSets: 0,
                averageDuration: 0,
                personalRecords: {},
            };
        }

        const personalRecords: { [key: string]: PersonalRecord } = {};
        workouts.forEach(workout => {
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

        // Utiliser filteredWorkouts pour les statistiques de période
        const workoutsToAnalyze = filteredWorkouts.length > 0 ? filteredWorkouts : workouts;

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
    }, [workouts, filteredWorkouts]);

    const estimated1RMs = useMemo(() => {
        if (!workouts) return [];

        const records = new Map<string, number>();

        workouts.forEach(workout => {
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

        return Array.from(records.entries())
            .map(([exerciseName, estimated1RM]) => ({ exerciseName, estimated1RM }))
            .sort((a, b) => b.estimated1RM - a.estimated1RM);

    }, [workouts]);

    const uniqueExercises = useMemo(() => {
        if (!workouts) return [];
        const exercisesMap = new Map<string, { name: string }>();
        workouts.forEach(workout => {
            workout.exercises.forEach(exercise => {
                if (!exercisesMap.has(exercise.name)) {
                    exercisesMap.set(exercise.name, { name: exercise.name });
                }
            });
        });
        return Array.from(exercisesMap.values())
            .sort((a, b) => a.name.localeCompare(b.name));
    }, [workouts]);

    return {
        filteredWorkouts,
        stats,
        estimated1RMs,
        uniqueExercises
    };
};
