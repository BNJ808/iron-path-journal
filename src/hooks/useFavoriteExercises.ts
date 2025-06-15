
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { useCallback } from 'react';

export const useFavoriteExercises = () => {
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const userId = user?.id;

    const { data: favoriteExercises, isLoading } = useQuery({
        queryKey: ['favorite_exercises', userId],
        queryFn: async () => {
            if (!userId) return [];
            const { data, error } = await supabase
                .from('favorite_exercises')
                .select('exercise_id')
                .eq('user_id', userId);

            if (error) throw error;
            return data.map(fav => fav.exercise_id);
        },
        enabled: !!userId,
    });

    const addFavoriteMutation = useMutation({
        mutationFn: async (exerciseId: string) => {
            if (!userId) throw new Error("User not authenticated");
            const { error } = await supabase
                .from('favorite_exercises')
                .insert({ user_id: userId, exercise_id: exerciseId });
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['favorite_exercises', userId] });
            toast.success("Exercice ajouté aux favoris !");
        },
        onError: (error: any) => {
            toast.error("Erreur lors de l'ajout aux favoris: " + error.message);
        }
    });

    const removeFavoriteMutation = useMutation({
        mutationFn: async (exerciseId: string) => {
            if (!userId) throw new Error("User not authenticated");
            const { error } = await supabase
                .from('favorite_exercises')
                .delete()
                .match({ user_id: userId, exercise_id: exerciseId });
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['favorite_exercises', userId] });
            toast.info("Exercice retiré des favoris.");
        },
        onError: (error: any) => {
            toast.error("Erreur lors du retrait des favoris: " + error.message);
        }
    });

    const isFavorite = useCallback((exerciseId: string) => {
        return favoriteExercises?.includes(exerciseId) ?? false;
    }, [favoriteExercises]);

    const toggleFavorite = useCallback((exerciseId: string) => {
        if (isFavorite(exerciseId)) {
            removeFavoriteMutation.mutate(exerciseId);
        } else {
            addFavoriteMutation.mutate(exerciseId);
        }
    }, [isFavorite, addFavoriteMutation, removeFavoriteMutation]);

    return {
        favoriteExercises: favoriteExercises || [],
        isLoadingFavorites: isLoading,
        isFavorite,
        toggleFavorite,
    };
};
