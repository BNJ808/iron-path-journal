
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
  id: string; // From Supabase DB (uuid)
  user_id: string; // From Supabase auth.users.id
  date: string; // ISO string
  exercises: Exercise[];
  notes?: string;
  status: string;
}

export type MuscleGroup = keyof typeof EXERCISES_DATABASE;
