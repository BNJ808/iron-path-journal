
import { useState, useEffect, useCallback } from 'react';
import type { Workout } from '@/types';

const WORKOUT_HISTORY_KEY = 'workoutHistory';

export const useWorkoutHistory = () => {
    const [workouts, setWorkouts] = useState<Workout[]>(() => {
        try {
            const savedWorkouts = window.localStorage.getItem(WORKOUT_HISTORY_KEY);
            return savedWorkouts ? JSON.parse(savedWorkouts) : [];
        } catch (error) {
            console.error("Impossible de charger l'historique des séances depuis le localStorage", error);
            return [];
        }
    });

    useEffect(() => {
        try {
            window.localStorage.setItem(WORKOUT_HISTORY_KEY, JSON.stringify(workouts));
        } catch (error) {
            console.error("Impossible de sauvegarder l'historique des séances dans le localStorage", error);
        }
    }, [workouts]);

    const addWorkout = useCallback((workout: Workout) => {
        setWorkouts(prevWorkouts => [...prevWorkouts, workout]);
    }, []);
    
    const clearHistory = useCallback(() => {
        setWorkouts([]);
    }, []);

    return { workouts, addWorkout, clearHistory };
};
