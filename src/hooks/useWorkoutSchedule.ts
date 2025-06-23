
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { handleSupabaseError } from '@/utils/errorHandling';
import { format } from 'date-fns';

export const useWorkoutSchedule = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const userId = user?.id;

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

  const addPlanToDate = async (planId: string, dateKey: string) => {
    // Vérifier si le plan n'est pas déjà planifié ce jour-là
    if (!scheduledWorkouts[dateKey]?.includes(planId)) {
      await addPlanToDateMutation.mutateAsync({ planId, dateKey });
    }
  };

  const removePlanFromDate = async (planId: string, dateKey: string) => {
    await removePlanFromDateMutation.mutateAsync({ planId, dateKey });
  };

  return {
    scheduledWorkouts,
    isLoadingSchedule,
    addPlanToDate,
    removePlanFromDate
  };
};
