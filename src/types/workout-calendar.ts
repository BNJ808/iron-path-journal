
export interface WorkoutPlan {
  id: string;
  name: string;
  color: string;
  exercises: string[];
  duration?: number;
}

export interface WorkoutCalendarData {
  plans: WorkoutPlan[];
  scheduledWorkouts: { [date: string]: string[] };
}
