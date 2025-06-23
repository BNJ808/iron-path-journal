
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { WorkoutCalendarData, WorkoutPlan } from '@/types/workout-calendar';
import { handleSupabaseError } from '@/utils/errorHandling';
import { format } from 'date-fns';

export const useWorkoutCalendarSync = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const userId = user?.id;

  // Récupérer les plans d'entraînement
  const { data: plans = [], isLoading: isLoadingPlans } = useQuery({
    queryKey: ['workout-plans', userId],
    queryFn: async () => {
      if (!userId) return [];

      const { data, error } = await supabase
        .from('workout_plans')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: true });

      if (error) {
        handleSupabaseError(error, 'récupération des plans d\'entraînement');
        throw error;
      }

      return data.map(plan => ({
        id: plan.id,
        name: plan.name,
        color: plan.color,
        exercises: plan.exercises as string[]
      })) as WorkoutPlan[];
    },
    enabled: !!userId,
  });

  // Récupérer la planification
  const { data: scheduledWorkouts = {}, isLoading: isLoadingSchedule } = useQuery({
    queryKey: ['workout-schedule', userId],
    queryFn: async () => {
      if (!userId) return {};

      const { data, error } = await supabase
        .from('workout_schedule')
        .select('date, workout_plan_id')
        .eq('user_id', userId);

      if (error) {
        handleSupabaseError(error, 'récupération de la planification');
        throw error;
      }

      // Grouper par date
      const grouped: { [date: string]: string[] } = {};
      data.forEach(item => {
        const dateKey = format(new Date(item.date), 'yyyy-MM-dd');
        if (!grouped[dateKey]) {
          grouped[dateKey] = [];
        }
        grouped[dateKey].push(item.workout_plan_id);
      });

      return grouped;
    },
    enabled: !!userId,
  });

  // Créer un plan
  const createPlanMutation = useMutation({
    mutationFn: async (plan: Omit<WorkoutPlan, 'id'>) => {
      if (!userId) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from('workout_plans')
        .insert({
          user_id: userId,
          name: plan.name,
          color: plan.color,
          exercises: plan.exercises
        })
        .select()
        .single();

      if (error) {
        handleSupabaseError(error, 'création du plan d\'entraînement');
        throw error;
      }

      return {
        id: data.id,
        name: data.name,
        color: data.color,
        exercises: data.exercises as string[]
      } as WorkoutPlan;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workout-plans', userId] });
    },
  });

  // Mettre à jour un plan
  const updatePlanMutation = useMutation({
    mutationFn: async ({ planId, updates }: { planId: string; updates: Partial<WorkoutPlan> }) => {
      if (!userId) throw new Error("User not authenticated");

      const { error } = await supabase
        .from('workout_plans')
        .update({
          name: updates.name,
          color: updates.color,
          exercises: updates.exercises,
          updated_at: new Date().toISOString()
        })
        .eq('id', planId)
        .eq('user_id', userId);

      if (error) {
        handleSupabaseError(error, 'mise à jour du plan d\'entraînement');
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workout-plans', userId] });
    },
  });

  // Supprimer un plan
  const deletePlanMutation = useMutation({
    mutationFn: async (planId: string) => {
      if (!userId) throw new Error("User not authenticated");

      const { error } = await supabase
        .from('workout_plans')
        .delete()
        .eq('id', planId)
        .eq('user_id', userId);

      if (error) {
        handleSupabaseError(error, 'suppression du plan d\'entraînement');
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workout-plans', userId] });
      queryClient.invalidateQueries({ queryKey: ['workout-schedule', userId] });
    },
  });

  // Ajouter un plan à une date
  const addPlanToDateMutation = useMutation({
    mutationFn: async ({ planId, dateKey }: { planId: string; dateKey: string }) => {
      if (!userId) throw new Error("User not authenticated");

      const { error } = await supabase
        .from('workout_schedule')
        .insert({
          user_id: userId,
          date: dateKey,
          workout_plan_id: planId
        });

      if (error) {
        handleSupabaseError(error, 'ajout du plan au calendrier');
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workout-schedule', userId] });
    },
  });

  // Supprimer un plan d'une date
  const removePlanFromDateMutation = useMutation({
    mutationFn: async ({ planId, dateKey }: { planId: string; dateKey: string }) => {
      if (!userId) throw new Error("User not authenticated");

      const { error } = await supabase
        .from('workout_schedule')
        .delete()
        .eq('user_id', userId)
        .eq('date', dateKey)
        .eq('workout_plan_id', planId);

      if (error) {
        handleSupabaseError(error, 'suppression du plan du calendrier');
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workout-schedule', userId] });
    },
  });

  // Écouter les changements en temps réel
  useEffect(() => {
    if (!userId) return;

    const planChannel = supabase
      .channel('workout-plans-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'workout_plans',
          filter: `user_id=eq.${userId}`
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['workout-plans', userId] });
        }
      )
      .subscribe();

    const scheduleChannel = supabase
      .channel('workout-schedule-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'workout_schedule',
          filter: `user_id=eq.${userId}`
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['workout-schedule', userId] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(planChannel);
      supabase.removeChannel(scheduleChannel);
    };
  }, [userId, queryClient]);

  const calendar: WorkoutCalendarData = {
    plans,
    scheduledWorkouts
  };

  const addPlan = async (plan: Omit<WorkoutPlan, 'id'>) => {
    await createPlanMutation.mutateAsync(plan);
  };

  const updatePlan = async (planId: string, updates: Partial<WorkoutPlan>) => {
    await updatePlanMutation.mutateAsync({ planId, updates });
  };

  const deletePlan = async (planId: string) => {
    await deletePlanMutation.mutateAsync(planId);
  };

  const addPlanToDate = async (planId: string, dateKey: string) => {
    // Vérifier si le plan n'est pas déjà planifié ce jour-là
    if (!scheduledWorkouts[dateKey]?.includes(planId)) {
      await addPlanToDateMutation.mutateAsync({ planId, dateKey });
    }
  };

  const removePlanFromDate = async (planId: string, dateKey: string) => {
    await removePlanFromDateMutation.mutateAsync({ planId, dateKey });
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
