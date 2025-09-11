import { useMemo } from 'react';
import type { Workout } from '@/types';
import { useExerciseDatabase } from '@/hooks/useExerciseDatabase';
import { subDays, subMonths, subYears, isAfter, parseISO } from 'date-fns';

export type EvolutionPeriod = '7d' | '1m' | '3m' | '6m' | '1y';

export const useVolumeEvolution = (allWorkouts: Workout[] | undefined, selectedPeriod: EvolutionPeriod = '1m') => {
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
        if (!allWorkouts || !exerciseToGroupMap.size || !allGroupedExercises) {
            return [];
        }

        const now = new Date();
        let periodStartDate: Date;
        let previousPeriodStartDate: Date;

        switch (selectedPeriod) {
            case '7d':
                periodStartDate = subDays(now, 7);
                previousPeriodStartDate = subDays(now, 14);
                break;
            case '1m':
                periodStartDate = subMonths(now, 1);
                previousPeriodStartDate = subMonths(now, 2);
                break;
            case '3m':
                periodStartDate = subMonths(now, 3);
                previousPeriodStartDate = subMonths(now, 6);
                break;
            case '6m':
                periodStartDate = subMonths(now, 6);
                previousPeriodStartDate = subYears(now, 1);
                break;
            case '1y':
                periodStartDate = subYears(now, 1);
                previousPeriodStartDate = subYears(now, 2);
                break;
        }

        // Calculer le volume pour la période actuelle
        const currentPeriodWorkouts = allWorkouts.filter(workout => 
            isAfter(parseISO(workout.date), periodStartDate)
        );

        // Calculer le volume pour la période précédente
        const previousPeriodWorkouts = allWorkouts.filter(workout => {
            const workoutDate = parseISO(workout.date);
            return isAfter(workoutDate, previousPeriodStartDate) && !isAfter(workoutDate, periodStartDate);
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

    }, [allWorkouts, exerciseToGroupMap, allGroupedExercises, selectedPeriod]);

    const getPeriodLabel = (period: EvolutionPeriod): string => {
        switch (period) {
            case '7d': return '7 derniers jours';
            case '1m': return '1 mois';
            case '3m': return '3 mois';
            case '6m': return '6 mois';
            case '1y': return '1 an';
        }
    };

    return {
        volumeEvolution,
        getPeriodLabel
    };
};