import { useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export type ExerciseOverride = {
  id: string;
  user_id: string;
  exercise_id: string;
  override_name: string | null;
  hidden: boolean;
  created_at: string;
  updated_at: string;
};

export const useExerciseOverrides = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: overrides = [], isLoading, error } = useQuery({
    queryKey: ['exercise-overrides', user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      if (!user?.id) return [] as ExerciseOverride[];
      const { data, error } = await supabase
        .from('exercise_overrides')
        .select('*')
        .eq('user_id', user.id);
      if (error) throw error;
      return (data || []) as ExerciseOverride[];
    },
  });

  const upsertMutation = useMutation({
    mutationFn: async (input: Partial<ExerciseOverride> & { exercise_id: string }) => {
      if (!user?.id) throw new Error('Utilisateur non connecté');
      const { data, error } = await supabase
        .from('exercise_overrides')
        .upsert({
          user_id: user.id,
          exercise_id: input.exercise_id,
          override_name: input.override_name ?? null,
          hidden: input.hidden ?? false,
        }, { onConflict: 'user_id,exercise_id' })
        .select()
        .single();
      if (error) throw error;
      return data as ExerciseOverride;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exercise-overrides', user?.id] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (exercise_id: string) => {
      if (!user?.id) throw new Error('Utilisateur non connecté');
      const { error } = await supabase
        .from('exercise_overrides')
        .delete()
        .eq('user_id', user.id)
        .eq('exercise_id', exercise_id);
      if (error) throw error;
      return exercise_id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exercise-overrides', user?.id] });
    },
  });

  const setOverrideName = async (exerciseId: string, name: string) => {
    await upsertMutation.mutateAsync({ exercise_id: exerciseId, override_name: name });
    toast.success('Nom de l\'exercice mis à jour');
  };

  const clearOverrideName = async (exerciseId: string) => {
    // Keep record if hidden is true, otherwise delete row
    const ov = overrides.find(o => o.exercise_id === exerciseId);
    if (ov?.hidden) {
      await upsertMutation.mutateAsync({ exercise_id: exerciseId, override_name: null });
    } else {
      await deleteMutation.mutateAsync(exerciseId);
    }
    toast.success('Nom personnalisé réinitialisé');
  };

  const setHidden = async (exerciseId: string, hidden: boolean) => {
    await upsertMutation.mutateAsync({ exercise_id: exerciseId, hidden });
    toast.success(hidden ? 'Exercice masqué' : 'Exercice réaffiché');
  };

  const resetOverride = async (exerciseId: string) => {
    await deleteMutation.mutateAsync(exerciseId);
    toast.success('Surcharge supprimée');
  };

  const overridesMap = useMemo(() => {
    const m = new Map<string, ExerciseOverride>();
    overrides.forEach(o => m.set(o.exercise_id, o));
    return m;
  }, [overrides]);

  return {
    overrides,
    overridesMap,
    isLoading,
    error,
    setOverrideName,
    clearOverrideName,
    setHidden,
    resetOverride,
  };
};
