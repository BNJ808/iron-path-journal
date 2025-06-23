
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
        console.log('exerciseToGroupMap:', map);
        return map;
    }, [allGroupedExercises]);
    
    const volumeByMuscleGroup = useMemo(() => {
        console.log('useMuscleGroupStats - filteredWorkouts:', filteredWorkouts);
        console.log('useMuscleGroupStats - allGroupedExercises:', allGroupedExercises);
        console.log('useMuscleGroupStats - exerciseToGroupMap size:', exerciseToGroupMap.size);
        
        if (!filteredWorkouts || !exerciseToGroupMap.size || !allGroupedExercises) {
            console.log('Early return - missing data');
            return [];
        }

        const initialVolumeByGroup = Object.fromEntries(
            allGroupedExercises.map(groupData => [groupData.group, 0])
        );

        const volumeByGroup = filteredWorkouts.reduce((acc, workout) => {
            console.log('Processing workout:', workout.id, 'exercises:', workout.exercises);
            workout.exercises.forEach(exercise => {
                console.log('Processing exercise:', exercise.name);
                const group = exerciseToGroupMap.get(exercise.name);
                console.log('Found group for exercise:', exercise.name, '->', group);
                if (group && acc.hasOwnProperty(group)) {
                    const exerciseVolume = exercise.sets.reduce((vol, set) => {
                        if (set.completed) {
                            const setVolume = (Number(set.weight) || 0) * (Number(set.reps) || 0);
                            console.log('Set volume:', setVolume, 'weight:', set.weight, 'reps:', set.reps);
                            return vol + setVolume;
                        }
                        return vol;
                    }, 0);
                    console.log('Exercise total volume:', exerciseVolume);
                    acc[group] += exerciseVolume;
                }
            });
            return acc;
        }, { ...initialVolumeByGroup });

        console.log('Final volumeByGroup:', volumeByGroup);

        const result = Object.entries(volumeByGroup)
            .map(([group, volume]) => ({ group, volume: Math.round(volume) }))
            .sort((a, b) => b.volume - a.volume);
            
        console.log('Final result for VolumeChart:', result);
        return result;

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
