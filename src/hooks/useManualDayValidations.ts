import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { format } from 'date-fns';

export const useManualDayValidations = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch all manual validations
  const { data: validations = [], isLoading } = useQuery({
    queryKey: ['manual-validations'],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('manual_day_validations')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });

  // Get validated dates as array of date strings (YYYY-MM-DD)
  const validatedDates = validations.map(v => v.date);

  // Add manual validation
  const addValidation = useMutation({
    mutationFn: async ({ date, note }: { date: Date; note?: string }) => {
      if (!user) throw new Error('User not authenticated');

      const dateStr = format(date, 'yyyy-MM-dd');
      
      const { data, error } = await supabase
        .from('manual_day_validations')
        .insert({
          user_id: user.id,
          date: dateStr,
          note: note || null,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['manual-validations'] });
      toast.success('Jour validé manuellement');
    },
    onError: (error: any) => {
      if (error.code === '23505') {
        toast.error('Ce jour est déjà validé');
      } else {
        toast.error('Erreur lors de la validation du jour');
      }
    },
  });

  // Remove manual validation
  const removeValidation = useMutation({
    mutationFn: async (date: Date) => {
      if (!user) throw new Error('User not authenticated');

      const dateStr = format(date, 'yyyy-MM-dd');
      
      const { error } = await supabase
        .from('manual_day_validations')
        .delete()
        .eq('user_id', user.id)
        .eq('date', dateStr);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['manual-validations'] });
      toast.success('Validation manuelle supprimée');
    },
    onError: () => {
      toast.error('Erreur lors de la suppression');
    },
  });

  return {
    validations,
    validatedDates,
    isLoading,
    addValidation: addValidation.mutate,
    removeValidation: removeValidation.mutate,
  };
};
