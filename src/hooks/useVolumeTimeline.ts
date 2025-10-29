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

        if (filteredWorkouts.length === 0) {
            return { data: [], muscleGroups: [] };
        }

        // Grouper par semaine
        const weeks = eachWeekOfInterval(
            { start: periodStartDate, end: periodEndDate },
            { locale: fr }
        );

        // Calculer le volume pour chaque semaine et chaque groupe musculaire
        const timelineData = weeks.map(weekStart => {
            const weekEnd = endOfWeek(weekStart, { locale: fr });
            
            const weekWorkouts = filteredWorkouts.filter(workout => {
                const workoutDate = parseISO(workout.date);
                return workoutDate >= weekStart && workoutDate <= weekEnd;
            });

            const volumeByGroup: { [key: string]: number } = {};
            
            allGroupedExercises.forEach(groupData => {
                volumeByGroup[groupData.group] = 0;
            });

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

        // Obtenir la liste des groupes musculaires qui ont du volume
        const activeGroups = Array.from(
            new Set(
                filteredWorkouts.flatMap(workout =>
                    workout.exercises
                        .map(ex => exerciseToGroupMap.get(ex.name))
                        .filter(Boolean)
                )
            )
        ).filter(group => {
            // Vérifier que le groupe a du volume sur au moins une semaine
            return timelineData.some(week => (week as any)[group as string] > 0);
        }) as string[];

        return {
            data: timelineData,
            muscleGroups: activeGroups
        };

    }, [allWorkouts, exerciseToGroupMap, allGroupedExercises, dateRange]);

    return volumeTimeline;
};
