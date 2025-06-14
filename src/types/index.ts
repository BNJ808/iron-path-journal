
import { EXERCISES_DATABASE } from "@/data/exercises";

export interface ExerciseSet {
  id: string;
  reps: number;
  weight: number;
  isCompleted: boolean;
}

export interface Exercise {
  id:string;
  name: string;
  sets: ExerciseSet[];
  notes?: string;
}

export interface Workout {
  id: string;
  date: string; // ISO string
  exercises: Exercise[];
  notes?: string;
}

export type MuscleGroup = keyof typeof EXERCISES_DATABASE;
