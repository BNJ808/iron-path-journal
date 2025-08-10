
import { useMemo } from 'react';
import { groupedExercises as baseGroupedExercises, type ExerciseGroup } from '@/data/exercises';
import useSupabaseCustomExercises from '@/hooks/useSupabaseCustomExercises';
import { useExerciseOverrides } from '@/hooks/useExerciseOverrides';

export const useExerciseDatabase = () => {
    const { customExercises } = useSupabaseCustomExercises();
    const { overridesMap } = useExerciseOverrides();
    const allGroupedExercises = useMemo((): ExerciseGroup[] => {
        // Deep copy to avoid modifying the original data
        const allExercises: ExerciseGroup[] = JSON.parse(JSON.stringify(baseGroupedExercises));

        customExercises.forEach(customEx => {
          let group = allExercises.find(g => g.group === customEx.group);
          if (!group) {
            group = { group: customEx.group, exercises: [] };
            allExercises.push(group);
          }
          if (!group.exercises.some(ex => ex.id === customEx.id)) {
            group.exercises.push({ id: customEx.id, name: customEx.name });
          }
        });

        // Apply per-user overrides: rename and hide
        allExercises.forEach(group => {
          group.exercises = group.exercises
            .filter(ex => !overridesMap.get(ex.id)?.hidden)
            .map(ex => {
              const ov = overridesMap.get(ex.id);
              return ov?.override_name ? { ...ex, name: ov.override_name } : ex;
            });
        });

        return allExercises;
    }, [customExercises, overridesMap]);

    const getGroupForExercise = useMemo(() => {
        const exerciseToGroupMap = new Map<string, string>();
        // Base exercises
        baseGroupedExercises.forEach(group => {
            group.exercises.forEach(exercise => {
                exerciseToGroupMap.set(exercise.id, group.group);
            });
        });
        // Custom exercises
        customExercises.forEach(customEx => {
            exerciseToGroupMap.set(customEx.id, customEx.group);
        });
        return (exerciseId: string): string | undefined => exerciseToGroupMap.get(exerciseId);
    }, [customExercises]);

    return { getGroupForExercise, allGroupedExercises };
}
