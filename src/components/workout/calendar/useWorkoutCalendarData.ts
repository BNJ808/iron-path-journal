
import { useState, useEffect } from 'react';
import { WorkoutCalendarData, WorkoutPlan } from '@/types/workout-calendar';

export const useWorkoutCalendarData = () => {
  const [calendar, setCalendar] = useState<WorkoutCalendarData>({
    plans: [
      { id: '1', name: 'Push', color: 'bg-blue-500', exercises: ['Développé couché', 'Développé incliné', 'Dips'] },
      { id: '2', name: 'Pull', color: 'bg-green-500', exercises: ['Tractions', 'Rowing', 'Biceps'] },
      { id: '3', name: 'Legs', color: 'bg-red-500', exercises: ['Squat', 'Soulevé de terre', 'Mollets'] },
    ],
    scheduledWorkouts: {}
  });

  useEffect(() => {
    const saved = localStorage.getItem('workoutCalendar');
    if (saved) {
      try {
        setCalendar(JSON.parse(saved));
      } catch (error) {
        console.error('Error loading calendar:', error);
      }
    }
  }, []);

  const saveCalendar = (newCalendar: WorkoutCalendarData) => {
    setCalendar(newCalendar);
    localStorage.setItem('workoutCalendar', JSON.stringify(newCalendar));
  };

  const removePlanFromDay = (planId: string, dateKey: string) => {
    const newScheduledWorkouts = { ...calendar.scheduledWorkouts };
    if (newScheduledWorkouts[dateKey]) {
      newScheduledWorkouts[dateKey] = newScheduledWorkouts[dateKey].filter(id => id !== planId);
      if (newScheduledWorkouts[dateKey].length === 0) {
        delete newScheduledWorkouts[dateKey];
      }
    }
    saveCalendar({ ...calendar, scheduledWorkouts: newScheduledWorkouts });
  };

  const addPlan = (plan: Omit<WorkoutPlan, 'id'>) => {
    const newPlan = { ...plan, id: Date.now().toString() };
    saveCalendar({ 
      ...calendar, 
      plans: [...calendar.plans, newPlan] 
    });
  };

  const updatePlan = (planId: string, updates: Partial<WorkoutPlan>) => {
    const newPlans = calendar.plans.map(plan => 
      plan.id === planId ? { ...plan, ...updates } : plan
    );
    saveCalendar({ ...calendar, plans: newPlans });
  };

  const deletePlan = (planId: string) => {
    const newPlans = calendar.plans.filter(plan => plan.id !== planId);
    const newScheduledWorkouts = { ...calendar.scheduledWorkouts };
    
    Object.keys(newScheduledWorkouts).forEach(dateKey => {
      newScheduledWorkouts[dateKey] = newScheduledWorkouts[dateKey].filter(id => id !== planId);
      if (newScheduledWorkouts[dateKey].length === 0) {
        delete newScheduledWorkouts[dateKey];
      }
    });

    saveCalendar({ plans: newPlans, scheduledWorkouts: newScheduledWorkouts });
  };

  return {
    calendar,
    saveCalendar,
    removePlanFromDay,
    addPlan,
    updatePlan,
    deletePlan
  };
};
