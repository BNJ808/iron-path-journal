
import { useState, useEffect, useCallback } from 'react';
import { nanoid } from 'nanoid';
import { EXERCISES_DATABASE } from '@/data/exercises';
import { toast } from 'sonner';

export type CustomExercise = {
  id: string;
  name: string;
  group: string;
};

const useCustomExercises = () => {
  const [customExercises, setCustomExercises] = useState<CustomExercise[]>([]);

  useEffect(() => {
    try {
      const item = window.localStorage.getItem('customExercises');
      if (item) {
        setCustomExercises(JSON.parse(item));
      }
    } catch (error) {
      console.warn(`Error reading localStorage key “customExercises”:`, error);
    }
  }, []);

  const addCustomExercise = useCallback((exercise: { name: string; group: keyof typeof EXERCISES_DATABASE }) => {
    const existingExercise = customExercises.find(ex => ex.name.toLowerCase() === exercise.name.toLowerCase() && ex.group === exercise.group);
    
    if (existingExercise) {
        toast.error("Cet exercice existe déjà dans ce groupe musculaire.");
        return existingExercise;
    }

    const newExercise: CustomExercise = {
      id: nanoid(),
      name: exercise.name,
      group: exercise.group,
    };
    
    const updatedExercises = [...customExercises, newExercise];
    setCustomExercises(updatedExercises);
    try {
        window.localStorage.setItem('customExercises', JSON.stringify(updatedExercises));
        toast.success(`"${newExercise.name}" ajouté !`);
    } catch (error) {
        toast.error("Erreur lors de la sauvegarde de l'exercice.");
        console.error("Failed to save custom exercises to localStorage:", error);
    }
    return newExercise;
  }, [customExercises]);
  
  return { customExercises, addCustomExercise };
};

export default useCustomExercises;
