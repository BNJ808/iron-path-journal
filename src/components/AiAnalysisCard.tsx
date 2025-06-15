
import { useMemo, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lightbulb, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { subDays, startOfDay, endOfDay, subMonths } from 'date-fns';
import type { Workout } from '@/types';
import type { DateRange } from 'react-day-picker';

interface AiAnalysisCardProps {
  title: string;
  type: 'general';
  workouts: Workout[];
  currentDateRange: DateRange | undefined;
}

const periodOptions = [
    { value: 'current_range', label: 'Période sélectionnée' },
    { value: '7d', label: '7 derniers jours' },
    { value: '30d', label: '30 derniers jours' },
    { value: '90d', label: '3 derniers mois' },
    { value: '180d', label: '6 derniers mois' },
    { value: '365d', label: '1 an' },
    { value: 'all', label: 'Toute la période' },
];

export const AiAnalysisCard = ({ title, type, workouts, currentDateRange }: AiAnalysisCardProps) => {
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [analysisPeriod, setAnalysisPeriod] = useState<string>('current_range');

  const analysisData = useMemo(() => {
    if (!workouts) return null;

    let fromDate: Date | null = null;
    let toDate: Date | null = new Date();
    let periodDescription = '';

    const now = new Date();
    switch (analysisPeriod) {
        case '7d':
            fromDate = startOfDay(subDays(now, 6));
            periodDescription = 'les 7 derniers jours';
            break;
        case '30d':
            fromDate = startOfDay(subDays(now, 29));
            periodDescription = 'les 30 derniers jours';
            break;
        case '90d':
            fromDate = startOfDay(subMonths(now, 3));
            periodDescription = 'les 3 derniers mois';
            break;
        case '180d':
            fromDate = startOfDay(subMonths(now, 6));
            periodDescription = 'les 6 derniers mois';
            break;
        case '365d':
            fromDate = startOfDay(subDays(now, 365));
            periodDescription = 'la dernière année';
            break;
        case 'all':
            fromDate = null; // all time
            periodDescription = 'toute la période';
            break;
        case 'current_range':
        default:
            if (!currentDateRange?.from) return null;
            fromDate = startOfDay(currentDateRange.from);
            toDate = currentDateRange.to ? endOfDay(currentDateRange.to) : endOfDay(currentDateRange.from);
            periodDescription = 'la période sélectionnée';
            break;
    }

    const filteredWorkouts = workouts.filter(w => {
        const workoutDate = new Date(w.date);
        const afterFrom = fromDate ? workoutDate >= fromDate : true;
        const beforeTo = toDate ? workoutDate <= toDate : true;
        return afterFrom && beforeTo;
    });

    // PRs are calculated on all workouts for consistency, not just the filtered period.
    const personalRecords: { [key: string]: { weight: number; reps: number; } } = {};
    workouts.forEach(workout => {
        workout.exercises.forEach(exercise => {
            exercise.sets.forEach(set => {
                const weight = Number(set.weight) || 0;
                const reps = Number(set.reps) || 0;
                const currentPR = personalRecords[exercise.name] || { weight: 0, reps: 0 };
                if (weight > currentPR.weight) {
                    personalRecords[exercise.name] = { weight, reps };
                }
            });
        });
    });

    if (filteredWorkouts.length === 0) {
        return {
            totalWorkouts: 0,
            totalVolume: 0,
            totalSets: 0,
            personalRecords,
            chartData: [],
            periodDescription,
            hasData: false,
        };
    }
    
    let totalVolume = 0;
    let totalSets = 0;

    const chartData = filteredWorkouts
        .map(workout => {
            const workoutVolume = workout.exercises.reduce((acc, exercise) => {
                return acc + exercise.sets.reduce((setAcc, set) => {
                    totalSets++;
                    const weight = Number(set.weight) || 0;
                    const reps = Number(set.reps) || 0;
                    return setAcc + reps * weight;
                }, 0);
            }, 0);
            totalVolume += workoutVolume;
            return {
                date: workout.date,
                volume: Math.round(workoutVolume),
            };
        })
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());


    return {
        totalWorkouts: filteredWorkouts.length,
        totalVolume: Math.round(totalVolume),
        totalSets,
        personalRecords,
        chartData,
        periodDescription,
        hasData: true,
    };
  }, [analysisPeriod, workouts, currentDateRange]);

  const { mutate, isPending } = useMutation({
    mutationFn: async () => {
      if (!analysisData) throw new Error("Aucune donnée à analyser.");
      
      const { hasData, ...payload } = analysisData;

      if (!hasData) {
          throw new Error(`Aucune donnée d'entraînement pour ${analysisData.periodDescription}.`);
      }

      const { data: responseData, error } = await supabase.functions.invoke('get-ai-analysis', {
        body: { type, data: payload },
      });

      if (error) throw new Error(error.message);
      if (responseData.error) throw new Error(responseData.error);

      return responseData;
    },
    onSuccess: (responseData) => {
      setAnalysis(responseData.analysis);
      toast.success("Analyse IA générée !");
    },
    onError: (error) => {
      toast.error(`${error.message}`);
      setAnalysis(null);
    },
  });

  const handleGetAnalysis = () => {
    if (analysis) {
        setAnalysis(null);
        setTimeout(() => mutate(), 100);
    } else {
        mutate();
    }
  };

  return (
    <Card>
        <CardHeader>
            <CardTitle className="flex justify-between items-start flex-wrap gap-2">
                <div className="flex items-center gap-2 text-base">
                    <Lightbulb className="h-5 w-5 text-accent-yellow" />
                    {title}
                </div>
                <div className="flex items-center gap-2">
                    <Select value={analysisPeriod} onValueChange={setAnalysisPeriod}>
                        <SelectTrigger className="w-auto md:w-[180px] h-9 text-sm">
                            <SelectValue placeholder="Période" />
                        </SelectTrigger>
                        <SelectContent>
                            {periodOptions.map(option => (
                                <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Button onClick={handleGetAnalysis} disabled={isPending || !analysisData?.hasData} size="sm">
                        {isPending ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            analysis ? 'Rafraîchir' : 'Générer'
                        )}
                    </Button>
                </div>
            </CardTitle>
        </CardHeader>
      <CardContent>
        {isPending && (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        )}
        {analysis && !isPending && (
            <div className="prose prose-invert prose-sm max-w-none">
                <ReactMarkdown>{analysis}</ReactMarkdown>
            </div>
        )}
        {!analysis && !isPending && (
            <p className="text-sm text-muted-foreground">
                {analysisData?.hasData 
                    ? `Cliquez sur "Générer" pour obtenir une analyse de vos performances pour ${analysisData.periodDescription}.`
                    : `Aucune donnée d'entraînement trouvée pour ${analysisData?.periodDescription || 'la période sélectionnée'}.`
                }
            </p>
        )}
      </CardContent>
    </Card>
  );
};
