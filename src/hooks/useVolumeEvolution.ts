import { useMemo } from 'react';
import type { Workout } from '@/types';
import { useExerciseDatabase } from '@/hooks/useExerciseDatabase';
import { isAfter, parseISO } from 'date-fns';
import { DateRange } from 'react-day-picker';

export const useVolumeEvolution = (allWorkouts: Workout[] | undefined, dateRange: DateRange | undefined) => {
    const { allGroupedExercises } = useExerciseDatabase();
    
    const exerciseToGroupMap = useMemo(() => {
        const map = new Map<string, string>();
        if (!allGroupedExercises) return map;
        allGroupedExercises.forEach(group => {
            group.exercises.forEach(ex => {
                // Map both by ID and by name for compatibility
                map.set(ex.id, group.group);
                map.set(ex.name, group.group);
            });
        });
        return map;
    }, [allGroupedExercises]);

    const volumeEvolution = useMemo(() => {
        if (!allWorkouts || !exerciseToGroupMap.size || !allGroupedExercises || !dateRange?.from || !dateRange?.to) {
            return [];
        }

        const periodStartDate = dateRange.from;
        const periodEndDate = dateRange.to;
        
        // Calculer la durée de la période actuelle
        const periodDurationMs = periodEndDate.getTime() - periodStartDate.getTime();
        
        // Calculer les dates de la période précédente (même durée)
        const previousPeriodEndDate = new Date(periodStartDate.getTime() - 1); // 1 jour avant le début de la période actuelle
        const previousPeriodStartDate = new Date(periodStartDate.getTime() - periodDurationMs);

        // Calculer le volume pour la période actuelle
        const currentPeriodWorkouts = allWorkouts.filter(workout => {
            const workoutDate = parseISO(workout.date);
            return workoutDate >= periodStartDate && workoutDate <= periodEndDate;
        });

        // Calculer le volume pour la période précédente
        const previousPeriodWorkouts = allWorkouts.filter(workout => {
            const workoutDate = parseISO(workout.date);
            return workoutDate >= previousPeriodStartDate && workoutDate <= previousPeriodEndDate;
        });

        const calculateVolumeByGroup = (workouts: Workout[]) => {
            const initialVolumeByGroup = Object.fromEntries(
                allGroupedExercises.map(groupData => [groupData.group, 0])
            );

            return workouts.reduce((acc, workout) => {
                workout.exercises.forEach(exercise => {
                    const group = exerciseToGroupMap.get(exercise.name);
                    if (group && acc.hasOwnProperty(group)) {
                        const exerciseVolume = exercise.sets.reduce((vol, set) => {
                            if (set.completed) {
                                return vol + (Number(set.weight) || 0) * (Number(set.reps) || 0);
                            }
                            return vol;
                        }, 0);
                        acc[group] += exerciseVolume;
                    }
                });
                return acc;
            }, { ...initialVolumeByGroup });
        };

        const currentVolume = calculateVolumeByGroup(currentPeriodWorkouts);
        const previousVolume = calculateVolumeByGroup(previousPeriodWorkouts);

        // Calculer l'évolution en pourcentage
        const evolution = Object.entries(currentVolume).map(([group, current]) => {
            const previous = previousVolume[group] || 0;
            let evolutionPercent = 0;
            
            if (previous > 0) {
                evolutionPercent = ((current - previous) / previous) * 100;
            } else if (current > 0) {
                evolutionPercent = 100; // Nouveau groupe avec du volume
            }

            return {
                group,
                currentVolume: Math.round(current),
                previousVolume: Math.round(previous),
                evolutionPercent: Math.round(evolutionPercent * 10) / 10, // Arrondi à 1 décimale
                trend: evolutionPercent > 0 ? 'positive' : evolutionPercent < 0 ? 'negative' : 'stable' as 'positive' | 'negative' | 'stable'
            };
        })
        .filter(item => item.currentVolume > 0 || item.previousVolume > 0) // Filtrer les groupes sans activité
        .sort((a, b) => Math.abs(b.evolutionPercent) - Math.abs(a.evolutionPercent)); // Trier par évolution la plus importante

        return evolution;

    }, [allWorkouts, exerciseToGroupMap, allGroupedExercises, dateRange]);

    return {
        volumeEvolution
    };
};