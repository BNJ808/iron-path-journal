
import { useMemo } from 'react';
import type { Workout } from '@/types';
import { useExerciseDatabase } from '@/hooks/useExerciseDatabase';

export const useMuscleGroupStats = (filteredWorkouts: Workout[]) => {
    const { allGroupedExercises } = useExerciseDatabase();
    
    const exerciseToGroupMap = useMemo(() => {
        const map = new Map<string, string>();
        if (!allGroupedExercises) return map;
        allGroupedExercises.forEach(group => {
            group.exercises.forEach(ex => {
                map.set(ex.name, group.group);
            });
        });
        return map;
    }, [allGroupedExercises]);
    
    const volumeByMuscleGroup = useMemo(() => {
        if (!filteredWorkouts || !exerciseToGroupMap.size || !allGroupedExercises) {
            return [];
        }

        const initialVolumeByGroup = Object.fromEntries(
            allGroupedExercises.map(groupData => [groupData.group, 0])
        );

        const volumeByGroup = filteredWorkouts.reduce((acc, workout) => {
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

        return Object.entries(volumeByGroup)
            .map(([group, volume]) => ({ group, volume: Math.round(volume) }))
            .sort((a, b) => b.volume - a.volume);

    }, [filteredWorkouts, exerciseToGroupMap, allGroupedExercises]);

    const muscleGroupStats = useMemo(() => {
        if (!filteredWorkouts || !exerciseToGroupMap.size || !allGroupedExercises) {
            return { chartData: [], maxSets: 0 };
        }

        const initialSetsByGroup = Object.fromEntries(
            allGroupedExercises.map(groupData => [groupData.group, 0])
        );

        const setsByGroup = filteredWorkouts.reduce((acc, workout) => {
            workout.exercises.forEach(exercise => {
                const group = exerciseToGroupMap.get(exercise.name);
                if (group && acc.hasOwnProperty(group)) {
                    acc[group] += exercise.sets.filter(s => s.completed).length;
                }
            });
            return acc;
        }, { ...initialSetsByGroup });

        const chartData = Object.entries(setsByGroup).map(([group, sets]) => ({
            subject: group,
            sets,
        }));
        
        const maxSets = Math.max(...chartData.map(d => d.sets));
        
        return { chartData, maxSets: Math.max(10, maxSets) };
    }, [filteredWorkouts, exerciseToGroupMap, allGroupedExercises]);

    return {
        volumeByMuscleGroup,
        muscleGroupStats
    };
};
