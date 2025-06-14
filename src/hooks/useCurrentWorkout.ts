
import { useState, useEffect, useCallback } from 'react';
import type { Exercise, Workout } from '@/types';
import { nanoid } from 'nanoid';

const CURRENT_WORKOUT_KEY = 'currentWorkout';

interface CurrentWorkout {
    exercises: Exercise[];
    notes: string;
}

const getInitialState = (): CurrentWorkout => {
    try {
        const savedWorkout = window.sessionStorage.getItem(CURRENT_WORKOUT_KEY);
        if (savedWorkout) {
            return JSON.parse(savedWorkout);
        }
    } catch (error) {
        console.error("Impossible de charger la séance en cours depuis le sessionStorage", error);
    }
    return { exercises: [], notes: '' };
};

export const useCurrentWorkout = () => {
    const [workout, setWorkout] = useState<CurrentWorkout>(getInitialState);

    useEffect(() => {
        try {
            window.sessionStorage.setItem(CURRENT_WORKOUT_KEY, JSON.stringify(workout));
        } catch (error) {
            console.error("Impossible de sauvegarder la séance en cours dans le sessionStorage", error);
        }
    }, [workout]);
    
    const { exercises, notes } = workout;

    const addExercise = useCallback((exerciseName: string) => {
        const newExercise: Exercise = {
            id: nanoid(),
            name: exerciseName,
            sets: [{ id: nanoid(), reps: 0, weight: 0, isCompleted: false }],
        };
        setWorkout(prev => ({ ...prev, exercises: [...prev.exercises, newExercise] }));
    }, []);

    const removeExercise = useCallback((exerciseId: string) => {
        setWorkout(prev => ({ ...prev, exercises: prev.exercises.filter(ex => ex.id !== exerciseId) }));
    }, []);

    const updateExercise = useCallback((updatedExercise: Exercise) => {
        setWorkout(prev => ({
            ...prev,
            exercises: prev.exercises.map(ex => (ex.id === updatedExercise.id ? updatedExercise : ex)),
        }));
    }, []);
    
    const setNotes = useCallback((notes: string) => {
        setWorkout(prev => ({ ...prev, notes }));
    }, []);

    const startFromTemplate = useCallback((templateWorkout: Workout) => {
        const templateExercises = templateWorkout.exercises.map(ex => ({
          ...ex,
          id: nanoid(),
          sets: ex.sets.map(set => ({
            ...set,
            id: nanoid(),
            isCompleted: false,
          })),
        }));
        setWorkout({ exercises: templateExercises, notes: '' });
    }, []);

    const clearWorkout = useCallback(() => {
        setWorkout({ exercises: [], notes: '' });
    }, []);

    return { 
        exercises, 
        notes,
        addExercise, 
        removeExercise, 
        updateExercise, 
        setNotes,
        startFromTemplate,
        clearWorkout 
    };
};
