import { useMemo, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Lightbulb, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';
import { useWorkoutHistory } from '@/hooks/useWorkoutHistory';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface AiExerciseAnalysisDialogProps {
  exerciseId: string;
  exerciseName: string;
}

export const AiExerciseAnalysisDialog = ({ exerciseId, exerciseName }: AiExerciseAnalysisDialogProps) => {
  const [open, setOpen] = useState(false);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const { workouts, isLoading: isLoadingHistory } = useWorkoutHistory();

  const exerciseHistory = useMemo(() => {
    if (!workouts) return [];
    return workouts
      .map(workout => {
        const exerciseLog = workout.exercises.find(ex => ex.exerciseId === exerciseId);
        if (!exerciseLog || exerciseLog.sets.length === 0) return null;
        return {
          date: format(new Date(workout.date), 'd MMM yyyy', { locale: fr }),
          sets: exerciseLog.sets.map(s => ({ reps: s.reps, weight: s.weight })),
        };
      })
      .filter((item): item is { date: string; sets: { reps: string | number; weight: string | number }[] } => item !== null)
      .reverse()
      .slice(0, 10);
  }, [workouts, exerciseId]);

  const { mutate, isPending } = useMutation({
    mutationFn: async () => {
        const dataForAnalysis = {
            exerciseName,
            history: exerciseHistory,
        };
        const { data: responseData, error } = await supabase.functions.invoke('get-ai-analysis', {
            body: { type: 'exercise', data: dataForAnalysis },
        });

        if (error) throw new Error(error.message);
        if (responseData.error) throw new Error(responseData.error);

        return responseData;
    },
    onSuccess: (responseData) => {
      setAnalysis(responseData.analysis);
      toast.success(`Analyse pour "${exerciseName}" générée !`);
    },
    onError: (error) => {
      toast.error(`Erreur de l'analyse IA: ${error.message}`);
      setAnalysis(null);
    },
  });

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      setAnalysis(null);
    } else {
        if(exerciseHistory.length > 0 && !analysis) {
            mutate();
        }
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <Lightbulb className="h-5 w-5 text-accent-yellow" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Analyse IA pour {exerciseName}</DialogTitle>
        </DialogHeader>
        <div className="py-4 max-h-[60vh] overflow-y-auto">
          {isPending || isLoadingHistory ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              <p className="ml-2">Génération de l'analyse...</p>
            </div>
          ) : exerciseHistory.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center p-4">Aucun historique trouvé pour cet exercice. Terminez une séance pour obtenir une analyse.</p>
          ) : analysis ? (
            <div className="prose prose-invert prose-sm max-w-none">
              <ReactMarkdown>{analysis}</ReactMarkdown>
            </div>
          ) : (
             <div className="flex items-center justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
