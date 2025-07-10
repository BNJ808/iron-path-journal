
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { ExerciseLog } from '@/types';
import { toast } from 'sonner';

export type { ExerciseLog };

export interface WorkoutTemplate {
    id: string;
    user_id: string;
    name: string;
    exercises: ExerciseLog[];
    notes?: string;
    color?: string;
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
            return data.map(t => ({ 
                ...t, 
                exercises: (t.exercises as unknown as ExerciseLog[]) || [],
                color: t.color || 'bg-blue-500'
            }));
        },
        enabled: !!userId,
    });

    const createTemplateMutation = useMutation({
        mutationFn: async (newTemplate: { name: string; exercises: ExerciseLog[], notes?: string, color?: string }) => {
            if (!userId) throw new Error("User not authenticated");
            const { data, error } = await supabase
                .from('workout_templates')
                .insert({ ...newTemplate, user_id: userId })
                .select()
                .single();
            
            if (error) throw new Error(error.message);
            return { ...data, exercises: (data.exercises as unknown as ExerciseLog[]) || [], color: data.color || 'bg-blue-500' };
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['workout_templates', userId] });
            toast.success(`Modèle "${data.name}" créé !`);
        },
        onError: (error: any) => {
            toast.error(`Erreur lors de la création du modèle: ${error.message}`);
        }
    });

    const updateTemplateMutation = useMutation({
        mutationFn: async ({ id, name, exercises, color }: { id: string; name: string; exercises: ExerciseLog[]; color?: string }) => {
            if (!userId) throw new Error("User not authenticated");
            const { data, error } = await supabase
                .from('workout_templates')
                .update({ name, exercises: exercises as any, color })
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
