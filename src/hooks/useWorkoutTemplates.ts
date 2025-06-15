
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { ExerciseLog } from '@/types';
import { toast } from 'sonner';

export interface WorkoutTemplate {
    id: string;
    user_id: string;
    name: string;
    exercises: ExerciseLog[];
    notes?: string;
    created_at: string;
}

export const useWorkoutTemplates = () => {
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const userId = user?.id;

    const { data: templates = [], isLoading: isLoadingTemplates } = useQuery<WorkoutTemplate[]>({
        queryKey: ['workout_templates', userId],
        queryFn: async () => {
            if (!userId) return [];
            const { data, error } = await supabase
                .from('workout_templates')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false });

            if (error) throw new Error(error.message);
            return data.map(t => ({ ...t, exercises: (t.exercises as unknown as ExerciseLog[]) || [] }));
        },
        enabled: !!userId,
    });

    const createTemplateMutation = useMutation({
        mutationFn: async (newTemplate: { name: string; exercises: ExerciseLog[], notes?: string }) => {
            if (!userId) throw new Error("User not authenticated");
            const { data, error } = await supabase
                .from('workout_templates')
                .insert({ ...newTemplate, user_id: userId } as any)
                .select()
                .single();
            
            if (error) throw new Error(error.message);
            return { ...data, exercises: (data.exercises as unknown as ExerciseLog[]) || [] };
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['workout_templates', userId] });
        },
    });

    const updateTemplateMutation = useMutation({
        mutationFn: async ({ id, name }: { id: string; name: string }) => {
            if (!userId) throw new Error("User not authenticated");
            const { data, error } = await supabase
                .from('workout_templates')
                .update({ name })
                .eq('id', id)
                .select()
                .single();
            if (error) throw new Error(error.message);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['workout_templates', userId] });
            toast.success("Modèle mis à jour.");
        },
        onError: (error: any) => {
            toast.error(`Erreur lors de la mise à jour: ${error.message}`);
        }
    });

    const deleteTemplateMutation = useMutation({
        mutationFn: async (templateId: string) => {
            if (!userId) throw new Error("User not authenticated");
            const { error } = await supabase
                .from('workout_templates')
                .delete()
                .eq('id', templateId);
            if (error) throw new Error(error.message);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['workout_templates', userId] });
            toast.success("Modèle supprimé.");
        },
        onError: (error: any) => {
            toast.error(`Erreur lors de la suppression: ${error.message}`);
        }
    });
    
    return {
        templates,
        isLoadingTemplates,
        createTemplate: createTemplateMutation.mutateAsync,
        updateTemplate: updateTemplateMutation.mutateAsync,
        deleteTemplate: deleteTemplateMutation.mutateAsync,
    };
};
