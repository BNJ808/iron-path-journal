
import { WorkoutCalendarData } from '@/types/workout-calendar';
import { useWorkoutPlans } from './useWorkoutPlans';
import { useWorkoutSchedule } from './useWorkoutSchedule';
import { useWorkoutCalendarRealtime } from './useWorkoutCalendarRealtime';

export const useWorkoutCalendarSync = () => {
  const {
    plans,
    isLoadingPlans,
    addPlan,
    updatePlan,
    deletePlan
  } = useWorkoutPlans();

  const {
    scheduledWorkouts,
    isLoadingSchedule,
    addPlanToDate,
    removePlanFromDate
  } = useWorkoutSchedule();

  // Activer la synchronisation en temps réel
  useWorkoutCalendarRealtime();

  const calendar: WorkoutCalendarData = {
    plans,
    scheduledWorkouts
  };

  const saveCalendar = async (newCalendar: WorkoutCalendarData) => {
    // Cette fonction n'est plus nécessaire avec Supabase mais on la garde pour la compatibilité
    console.log('saveCalendar called but not needed with Supabase sync');
  };

  return {
    calendar,
    isLoading: isLoadingPlans || isLoadingSchedule,
    addPlan,
    updatePlan,
    deletePlan,
    addPlanToDate,
    removePlanFromDate,
    saveCalendar
  };
};
