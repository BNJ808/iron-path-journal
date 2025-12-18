import { useMemo } from 'react';
import type { Workout } from '@/types';
import { useExerciseDatabase } from '@/hooks/useExerciseDatabase';
import { parseISO, format, startOfWeek, endOfWeek, eachWeekOfInterval } from 'date-fns';
import { fr } from 'date-fns/locale';
import { DateRange } from 'react-day-picker';

export const useVolumeTimeline = (allWorkouts: Workout[] | undefined, dateRange: DateRange | undefined) => {
    const { allGroupedExercises } = useExerciseDatabase();
    
    const exerciseToGroupMap = useMemo(() => {
        const map = new Map<string, string>();
        if (!allGroupedExercises) return map;
        allGroupedExercises.forEach(group => {
            group.exercises.forEach(ex => {
                map.set(ex.id, group.group);
                map.set(ex.name, group.group);
            });
        });
        return map;
    }, [allGroupedExercises]);

    const volumeTimeline = useMemo(() => {
        if (!allWorkouts || !exerciseToGroupMap.size || !allGroupedExercises) {
            return { data: [], muscleGroups: [] };
        }

        const periodStartDate = dateRange?.from || parseISO(allWorkouts[0]?.date || new Date().toISOString());
        const periodEndDate = dateRange?.to || new Date();

        // Filtrer les workouts dans la période
        const filteredWorkouts = allWorkouts.filter(workout => {
            const workoutDate = parseISO(workout.date);
            return workoutDate >= periodStartDate && workoutDate <= periodEndDate;
        });

        // Calculer le volume par jour plutôt que par semaine pour les courtes périodes
        const daysDiff = Math.ceil((periodEndDate.getTime() - periodStartDate.getTime()) / (1000 * 60 * 60 * 24));
        const useDaily = daysDiff <= 14;

        // Obtenir les groupes actifs d'abord
        const activeGroups = Array.from(
            new Set(
                filteredWorkouts.flatMap(workout =>
                    workout.exercises
                        .map(ex => exerciseToGroupMap.get(ex.name))
                        .filter(Boolean)
                )
            )
        ) as string[];

        if (filteredWorkouts.length === 0 || activeGroups.length === 0) {
            return { data: [], muscleGroups: [] };
        }

        let timelineData: Array<{ week: string; fullDate: string; [key: string]: string | number }>;

        if (useDaily) {
            // Pour les courtes périodes, grouper par jour avec des données
            const volumeByDay = new Map<string, { [key: string]: number }>();
            
            filteredWorkouts.forEach(workout => {
                const dateKey = format(parseISO(workout.date), 'dd/MM', { locale: fr });
                const fullDate = workout.date;
                
                if (!volumeByDay.has(dateKey)) {
                    volumeByDay.set(dateKey, { fullDate } as any);
                }
                
                const dayData = volumeByDay.get(dateKey)!;
                
                workout.exercises.forEach(exercise => {
                    const group = exerciseToGroupMap.get(exercise.name);
                    if (group) {
                        const exerciseVolume = exercise.sets.reduce((vol, set) => {
                            if (set.completed) {
                                return vol + (Number(set.weight) || 0) * (Number(set.reps) || 0);
                            }
                            return vol;
                        }, 0);
                        dayData[group] = (dayData[group] || 0) + exerciseVolume;
                    }
                });
            });

            timelineData = Array.from(volumeByDay.entries())
                .map(([week, data]) => ({
                    week,
                    fullDate: (data as any).fullDate || '',
                    ...data
                }))
                .sort((a, b) => new Date(a.fullDate).getTime() - new Date(b.fullDate).getTime());
        } else {
            // Grouper par semaine pour les longues périodes
            const weeks = eachWeekOfInterval(
                { start: periodStartDate, end: periodEndDate },
                { locale: fr }
            );

            timelineData = weeks.map(weekStart => {
                const weekEnd = endOfWeek(weekStart, { locale: fr });
                
                const weekWorkouts = filteredWorkouts.filter(workout => {
                    const workoutDate = parseISO(workout.date);
                    return workoutDate >= weekStart && workoutDate <= weekEnd;
                });

                const volumeByGroup: { [key: string]: number } = {};

                weekWorkouts.forEach(workout => {
                    workout.exercises.forEach(exercise => {
                        const group = exerciseToGroupMap.get(exercise.name);
                        if (group) {
                            const exerciseVolume = exercise.sets.reduce((vol, set) => {
                                if (set.completed) {
                                    return vol + (Number(set.weight) || 0) * (Number(set.reps) || 0);
                                }
                                return vol;
                            }, 0);
                            volumeByGroup[group] = (volumeByGroup[group] || 0) + exerciseVolume;
                        }
                    });
                });

                return {
                    week: format(weekStart, 'dd/MM', { locale: fr }),
                    fullDate: weekStart.toISOString(),
                    ...volumeByGroup
                };
            });

            // Filtrer les semaines sans données (tous les groupes à 0 ou undefined)
            timelineData = timelineData.filter(weekData => {
                return activeGroups.some(group => (weekData[group] as number) > 0);
            });
        }

        return {
            data: timelineData,
            muscleGroups: activeGroups
        };

    }, [allWorkouts, exerciseToGroupMap, allGroupedExercises, dateRange]);

    return volumeTimeline;
};
