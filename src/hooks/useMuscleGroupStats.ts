
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
                map.set(ex.id, group.group);
            });
        });
        console.log('=== MUSCLE GROUP STATS DEBUG ===');
        console.log('allGroupedExercises:', allGroupedExercises);
        console.log('exerciseToGroupMap size:', map.size);
        console.log('exerciseToGroupMap entries:', Array.from(map.entries()));
        return map;
    }, [allGroupedExercises]);
    
    const volumeByMuscleGroup = useMemo(() => {
        console.log('=== VOLUME CALCULATION DEBUG ===');
        console.log('filteredWorkouts length:', filteredWorkouts?.length || 0);
        console.log('filteredWorkouts:', filteredWorkouts);
        console.log('exerciseToGroupMap size:', exerciseToGroupMap.size);
        console.log('allGroupedExercises:', allGroupedExercises);
        
        if (!filteredWorkouts || filteredWorkouts.length === 0) {
            console.log('❌ No filtered workouts');
            return [];
        }

        if (!exerciseToGroupMap.size) {
            console.log('❌ No exercise to group mapping');
            return [];
        }

        if (!allGroupedExercises || allGroupedExercises.length === 0) {
            console.log('❌ No grouped exercises');
            return [];
        }

        const initialVolumeByGroup = Object.fromEntries(
            allGroupedExercises.map(groupData => [groupData.group, 0])
        );
        console.log('initialVolumeByGroup:', initialVolumeByGroup);

        const volumeByGroup = filteredWorkouts.reduce((acc, workout) => {
            console.log('🏋️ Processing workout:', workout.id, 'date:', workout.date);
            console.log('Workout exercises count:', workout.exercises?.length || 0);
            console.log('Workout exercises:', workout.exercises);
            
            if (!workout.exercises || workout.exercises.length === 0) {
                console.log('⚠️ Workout has no exercises');
                return acc;
            }

            workout.exercises.forEach((exercise, index) => {
                console.log(`💪 Exercise ${index + 1}:`, {
                    name: exercise.name,
                    exerciseId: exercise.exerciseId,
                    setsCount: exercise.sets?.length || 0
                });
                
                const group = exerciseToGroupMap.get(exercise.exerciseId);
                console.log(`🎯 Mapping exerciseId "${exercise.exerciseId}" -> group "${group}"`);
                
                if (!group) {
                    console.log('❌ No group found for exerciseId:', exercise.exerciseId);
                    console.log('Available exercise IDs in map:', Array.from(exerciseToGroupMap.keys()));
                    return;
                }

                if (!acc.hasOwnProperty(group)) {
                    console.log('❌ Group not found in accumulator:', group);
                    console.log('Available groups in accumulator:', Object.keys(acc));
                    return;
                }

                if (!exercise.sets || exercise.sets.length === 0) {
                    console.log('⚠️ Exercise has no sets');
                    return;
                }

                const exerciseVolume = exercise.sets.reduce((vol, set, setIndex) => {
                    console.log(`📊 Set ${setIndex + 1}:`, {
                        completed: set.completed,
                        weight: set.weight,
                        reps: set.reps
                    });
                    
                    if (set.completed) {
                        const weight = Number(set.weight) || 0;
                        const reps = Number(set.reps) || 0;
                        const setVolume = weight * reps;
                        console.log(`✅ Set volume: ${weight} × ${reps} = ${setVolume}`);
                        return vol + setVolume;
                    } else {
                        console.log('⏭️ Set not completed, skipping');
                        return vol;
                    }
                }, 0);
                
                console.log(`💯 Total exercise volume for "${exercise.name}": ${exerciseVolume}`);
                console.log(`📈 Adding to group "${group}": ${acc[group]} + ${exerciseVolume} = ${acc[group] + exerciseVolume}`);
                acc[group] += exerciseVolume;
            });
            
            console.log('Current accumulator state:', acc);
            return acc;
        }, { ...initialVolumeByGroup });

        console.log('=== FINAL VOLUME BY GROUP ===');
        console.log('volumeByGroup:', volumeByGroup);

        const result = Object.entries(volumeByGroup)
            .map(([group, volume]) => {
                const roundedVolume = Math.round(volume);
                console.log(`📋 Group "${group}": ${volume} -> ${roundedVolume}`);
                return { group, volume: roundedVolume };
            })
            .sort((a, b) => b.volume - a.volume);
            
        console.log('=== FINAL CHART DATA ===');
        console.log('Final result for VolumeChart:', result);
        console.log('Non-zero entries:', result.filter(item => item.volume > 0));
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
                const group = exerciseToGroupMap.get(exercise.exerciseId);
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
