import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { EXERCISES_DATABASE } from '@/data/exercises';
import { handleSupabaseError } from '@/utils/errorHandling';

export type SupabaseCustomExercise = {
  id: string;
  name: string;
  muscle_group: string;
  user_id: string;
  created_at: string;
};

export type CustomExercise = {
  id: string;
  name: string;
  group: string;
};

const useSupabaseCustomExercises = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [migrationCompleted, setMigrationCompleted] = useState(false);

  // Récupérer les exercices personnalisés depuis Supabase
  const { data: supabaseExercises = [], isLoading, error } = useQuery({
    queryKey: ['custom-exercises', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('custom_exercises')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });

      if (error) {
        handleSupabaseError(error, 'récupération des exercices personnalisés');
        throw error;
      }

      return data || [];
    },
    enabled: !!user?.id,
  });

  // Convertir les exercices Supabase au format attendu par l'app
  const customExercises: CustomExercise[] = supabaseExercises.map(exercise => ({
    id: exercise.id,
    name: exercise.name,
    group: exercise.muscle_group
  }));

  // Mutation pour ajouter un exercice
  const addExerciseMutation = useMutation({
    mutationFn: async (exercise: { name: string; group: keyof typeof EXERCISES_DATABASE }) => {
      if (!user?.id) {
        throw new Error('Utilisateur non connecté');
      }

      const { data, error } = await supabase
        .from('custom_exercises')
        .insert({
          user_id: user.id,
          name: exercise.name,
          muscle_group: exercise.group
        })
        .select()
        .single();

      if (error) {
        handleSupabaseError(error, 'ajout d\'exercice personnalisé');
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['custom-exercises', user?.id] });
    },
  });

  // Mutation pour supprimer un exercice
  const deleteExerciseMutation = useMutation({
    mutationFn: async (exerciseId: string) => {
      if (!user?.id) {
        throw new Error('Utilisateur non connecté');
      }

      const { error } = await supabase
        .from('custom_exercises')
        .delete()
        .eq('id', exerciseId)
        .eq('user_id', user.id);

      if (error) {
        handleSupabaseError(error, 'suppression d\'exercice personnalisé');
        throw error;
      }

      return exerciseId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['custom-exercises', user?.id] });
    },
  });

  // Mutation pour renommer un exercice personnalisé
  const updateExerciseMutation = useMutation({
    mutationFn: async ({ exerciseId, name }: { exerciseId: string; name: string }) => {
      if (!user?.id) {
        throw new Error('Utilisateur non connecté');
      }

      const { data, error } = await supabase
        .from('custom_exercises')
        .update({ name })
        .eq('id', exerciseId)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        handleSupabaseError(error, 'mise à jour de l\'exercice personnalisé');
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['custom-exercises', user?.id] });
    },
  });

  const migrateFromLocalStorage = useCallback(async () => {
    if (!user?.id || migrationCompleted) return;

    try {
      const localExercises = localStorage.getItem('customExercises');
      if (!localExercises) {
        setMigrationCompleted(true);
        return;
      }

      const parsedExercises: CustomExercise[] = JSON.parse(localExercises);
      
      if (parsedExercises.length === 0) {
        setMigrationCompleted(true);
        return;
      }

      // Vérifier quels exercices existent déjà dans Supabase
      const existingExercises = supabaseExercises.map(ex => ex.name.toLowerCase());
      const exercisesToMigrate = parsedExercises.filter(
        ex => !existingExercises.includes(ex.name.toLowerCase())
      );

      if (exercisesToMigrate.length > 0) {
        const { error } = await supabase
          .from('custom_exercises')
          .insert(
            exercisesToMigrate.map(ex => ({
              user_id: user.id,
              name: ex.name,
              muscle_group: ex.group
            }))
          );

        if (error) {
          handleSupabaseError(error, 'migration des exercices');
        } else {
          toast.success(`${exercisesToMigrate.length} exercice(s) migré(s) vers votre compte !`);
          queryClient.invalidateQueries({ queryKey: ['custom-exercises', user?.id] });
        }
      }

      // Supprimer les données du localStorage après migration
      localStorage.removeItem('customExercises');
      setMigrationCompleted(true);
    } catch (error) {
      console.error('Error during migration:', error);
      setMigrationCompleted(true);
    }
  }, [user?.id, supabaseExercises, migrationCompleted, queryClient]);

  // Effectuer la migration au chargement
  useEffect(() => {
    if (user?.id && !isLoading && !migrationCompleted) {
      migrateFromLocalStorage();
    }
  }, [user?.id, isLoading, migrationCompleted, migrateFromLocalStorage]);

  const addCustomExercise = useCallback(async (exercise: { name: string; group: keyof typeof EXERCISES_DATABASE }) => {
    // Vérifier si l'exercice existe déjà
    const existingExercise = customExercises.find(
      ex => ex.name.toLowerCase() === exercise.name.toLowerCase() && ex.group === exercise.group
    );
    
    if (existingExercise) {
      toast.error("Cet exercice existe déjà dans ce groupe musculaire.");
      return existingExercise;
    }

    try {
      const result = await addExerciseMutation.mutateAsync(exercise);
      toast.success(`"${exercise.name}" ajouté !`);
      return {
        id: result.id,
        name: result.name,
        group: result.muscle_group
      };
    } catch (error: any) {
      toast.error("Erreur lors de l'ajout de l'exercice: " + error.message);
      throw error;
    }
  }, [customExercises, addExerciseMutation]);

  const deleteCustomExercise = useCallback(async (exerciseId: string) => {
    const exerciseToDelete = customExercises.find(ex => ex.id === exerciseId);
    
    if (!exerciseToDelete) {
      toast.error("Exercice introuvable.");
      return false;
    }

    try {
      await deleteExerciseMutation.mutateAsync(exerciseId);
      toast.success(`"${exerciseToDelete.name}" supprimé !`);
      return true;
    } catch (error: any) {
      toast.error("Erreur lors de la suppression de l'exercice: " + error.message);
      return false;
    }
  }, [customExercises, deleteExerciseMutation]);

  const updateTemplatesExerciseName = async (exerciseId: string, newName: string) => {
    if (!user?.id) return;
    try {
      const { data: templates, error } = await supabase
        .from('workout_templates')
        .select('id, exercises')
        .eq('user_id', user.id);
      if (error) throw error;

      const updates = (templates || []).map(async (t: any) => {
        const exercises = (t.exercises as any[]) || [];
        let changed = false;
        const newExercises = exercises.map((ex: any) => {
          if (ex.exerciseId === exerciseId && ex.name !== newName) {
            changed = true;
            return { ...ex, name: newName };
          }
          return ex;
        });
        if (changed) {
          const { error: updError } = await supabase
            .from('workout_templates')
            .update({ exercises: newExercises as any })
            .eq('id', t.id);
          if (updError) throw updError;
        }
      });

      if (updates.length) {
        await Promise.all(updates);
        queryClient.invalidateQueries({ queryKey: ['workout_templates', user.id] });
      }
    } catch (e) {
      console.error('Erreur lors de la propagation du nom dans les modèles:', e);
    }
  };

  const updateCustomExerciseName = useCallback(async (exerciseId: string, name: string) => {
    console.log('updateCustomExerciseName called with:', { exerciseId, name });
    const exercise = customExercises.find(ex => ex.id === exerciseId);
    console.log('Found exercise:', exercise);
    
    if (!exercise) {
      console.log('Exercise not found');
      toast.error("Exercice introuvable.");
      return false;
    }
    if (!name.trim()) {
      console.log('Empty name');
      toast.error("Le nom ne peut pas être vide.");
      return false;
    }
    if (exercise.name === name.trim()) {
      console.log('Name unchanged');
      return true;
    }
    
    try {
      console.log('Starting mutation...');
      await updateExerciseMutation.mutateAsync({ exerciseId, name: name.trim() });
      console.log('Mutation successful, updating templates...');
      // Propager le changement dans les modèles
      await updateTemplatesExerciseName(exerciseId, name.trim());
      console.log('Templates updated successfully');
      toast.success('Nom de l\'exercice mis à jour');
      return true;
    } catch (error: any) {
      console.error('Error updating custom exercise:', error);
      toast.error("Erreur lors de la mise à jour de l'exercice: " + error.message);
      return false;
    }
  }, [customExercises, updateExerciseMutation, user?.id, queryClient]);

  return { 
    customExercises, 
    addCustomExercise,
    deleteCustomExercise,
    updateCustomExerciseName,
    isLoading,
    error
  };
};

export default useSupabaseCustomExercises;
