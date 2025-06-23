
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { WorkoutPlan } from '@/types/workout-calendar';
import { handleSupabaseError } from '@/utils/errorHandling';

export const useWorkoutPlans = () => {
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

  const addPlan = async (plan: Omit<WorkoutPlan, 'id'>) => {
    await createPlanMutation.mutateAsync(plan);
  };

  const updatePlan = async (planId: string, updates: Partial<WorkoutPlan>) => {
    await updatePlanMutation.mutateAsync({ planId, updates });
  };

  const deletePlan = async (planId: string) => {
    await deletePlanMutation.mutateAsync(planId);
  };

  return {
    plans,
    isLoadingPlans,
    addPlan,
    updatePlan,
    deletePlan
  };
};
