
import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const useWorkoutCalendarRealtime = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const userId = user?.id;

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
};
