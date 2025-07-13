import type { Workout } from '@/types';

/**
 * Filtre les workouts pour exclure les sorties running des statistiques
 */
export const filterWorkoutsForStats = (workouts: Workout[] | undefined): Workout[] => {
  if (!workouts) return [];
  
  // Exclure les workouts marqués comme sorties running
  return workouts.filter(workout => workout.notes !== "RUNNING_SESSION");
};

/**
 * Vérifie si un workout est une sortie running
 */
export const isRunningSession = (workout: Workout): boolean => {
  return workout.notes === "RUNNING_SESSION";
};