
import { EXERCISES_DATABASE } from "@/data/exercises";

export interface ExerciseSet {
  id: string;
  reps: number | string;
  weight: number | string;
}

export interface ExerciseLog {
  id: string; // unique id for the log entry in a workout
  exerciseId: string; // id from the main exercise list in data/exercises.ts
  name: string;
  sets: ExerciseSet[];
  notes?: string;
}

export interface Workout {
  id: string; // From Supabase DB (uuid)
  user_id: string; // From Supabase auth.users.id
  date: string; // ISO string
  exercises: ExerciseLog[];
  notes?: string;
  status: string; // 'in-progress' | 'completed'
}

export type MuscleGroup = keyof typeof EXERCISES_DATABASE;
