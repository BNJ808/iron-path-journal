
import { useMemo } from 'react';
import { groupedExercises as baseGroupedExercises, type ExerciseGroup } from '@/data/exercises';
import useCustomExercises from '@/hooks/useCustomExercises';

type CustomExercise = {
  id: string;
  name: string;
  group: string;
}

export const useExerciseDatabase = () => {
    const { customExercises }: { customExercises: CustomExercise[] } = useCustomExercises();

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

        return allExercises;
    }, [customExercises]);

    const getGroupForExercise = useMemo(() => {
        const exerciseToGroupMap = new Map<string, string>();
        allGroupedExercises.forEach(group => {
            group.exercises.forEach(exercise => {
                exerciseToGroupMap.set(exercise.id, group.group);
            });
        });
        return (exerciseId: string): string | undefined => exerciseToGroupMap.get(exerciseId);
    }, [allGroupedExercises]);

    return { getGroupForExercise, allGroupedExercises };
}
