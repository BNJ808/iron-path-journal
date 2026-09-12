import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CalendarIcon, Scale, Target, Trash2, TrendingUp } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useBodyMeasurements } from '@/hooks/useBodyMeasurements';
import { useUserSettings } from '@/hooks/useUserSettings';
import { toast } from 'sonner';
import { DateRange } from 'react-day-picker';

const weightFormSchema = z.object({
  weight: z.number().min(20, 'Le poids doit être supérieur à 20 kg').max(300, 'Le poids doit être inférieur à 300 kg'),
  date: z.date()
});

type WeightFormValues = z.infer<typeof weightFormSchema>;

interface CombinedWeightTrackerProps {
  dateRange?: DateRange;
}

export const CombinedWeightTracker: React.FC<CombinedWeightTrackerProps> = ({ dateRange }) => {
  const { measurements, isLoading, addMeasurement, deleteMeasurement } = useBodyMeasurements();
  const { settings, updateSettings, isLoading: isLoadingSettings } = useUserSettings();
  const [goalWeight, setGoalWeight] = React.useState(70);
  const [goalDate, setGoalDate] = React.useState<Date>(new Date());
  const weightGoals = settings.weightGoals || [];
  
  const form = useForm<WeightFormValues>({
    resolver: zodResolver(weightFormSchema),
    defaultValues: {
      weight: 70,
      date: new Date()
    }
  });

  // Filtrer les mesures selon la plage de dates sélectionnée pour le graphique
  const filteredMeasurements = React.useMemo(() => {
    if (!measurements) return [];

    let filtered = measurements;

    if (dateRange?.from || dateRange?.to) {
      filtered = measurements.filter(measurement => {
        const measurementDate = parseISO(measurement.date);
        const fromDate = dateRange?.from;
        const toDate = dateRange?.to;

        if (fromDate && measurementDate < fromDate) return false;
        if (toDate && measurementDate > toDate) return false;

        return true;
      });
    }

    // Trier par date croissante pour le graphique
    return filtered
      .sort((a, b) => parseISO(a.date).getTime() - parseISO(b.date).getTime())
      .map(measurement => ({
        ...measurement,
        displayDate: format(parseISO(measurement.date), 'd MMM', { locale: fr }),
        fullDate: format(parseISO(measurement.date), 'dd/MM/yyyy', { locale: fr })
      }));
  }, [measurements, dateRange]);

  const filteredGoals = React.useMemo(() => {
    return weightGoals
      .filter((goal) => {
        const date = parseISO(goal.date);
        if (dateRange?.from && date < dateRange.from) return false;
        if (dateRange?.to && date > dateRange.to) return false;
        return true;
      })
      .sort((a, b) => parseISO(a.date).getTime() - parseISO(b.date).getTime());
  }, [weightGoals, dateRange]);

  const chartData = React.useMemo(() => {
    const points = new Map<string, {
      date: string;
      displayDate: string;
      fullDate: string;
      weight?: number;
      goalWeight?: number;
    }>();

    filteredMeasurements.forEach((measurement) => {
      points.set(measurement.date, {
        date: measurement.date,
        displayDate: measurement.displayDate,
        fullDate: measurement.fullDate,
        weight: measurement.weight,
      });
    });

    filteredGoals.forEach((goal) => {
      const existing = points.get(goal.date);
      points.set(goal.date, {
        date: goal.date,
        displayDate: format(parseISO(goal.date), 'd MMM', { locale: fr }),
        fullDate: format(parseISO(goal.date), 'dd/MM/yyyy', { locale: fr }),
        weight: existing?.weight,
        goalWeight: goal.weight,
      });
    });

    return Array.from(points.values()).sort(
      (a, b) => parseISO(a.date).getTime() - parseISO(b.date).getTime()
    );
  }, [filteredMeasurements, filteredGoals]);

  // Calculer les statistiques
  const stats = React.useMemo(() => {
    if (filteredMeasurements.length === 0) return null;

    const weights = filteredMeasurements.map(m => m.weight);
    const minWeight = Math.min(...weights);
    const maxWeight = Math.max(...weights);
    const firstWeight = weights[0];
    const lastWeight = weights[weights.length - 1];
    const weightChange = lastWeight - firstWeight;

    return {
      minWeight,
      maxWeight,
      firstWeight,
      lastWeight,
      weightChange,
      totalMeasurements: filteredMeasurements.length
    };
  }, [filteredMeasurements]);

  const onSubmit = async (data: WeightFormValues) => {
    try {
      await addMeasurement({
        weight: data.weight,
        date: format(data.date, 'yyyy-MM-dd')
      });
      toast.success('Poids enregistré avec succès');
      form.reset({
        weight: 70,
        date: new Date()
      });
    } catch (error) {
      console.error('Erreur lors de l\'ajout du poids:', error);
      toast.error('Erreur lors de l\'enregistrement du poids');
    }
  };

  const handleDelete = async (measurementId: string) => {
    try {
      await deleteMeasurement(measurementId);
      toast.success('Mesure supprimée');
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      toast.error('Erreur lors de la suppression');
    }
  };

  const handleAddGoal = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!Number.isFinite(goalWeight) || goalWeight < 20 || goalWeight > 300) {
      toast.error('Le poids objectif doit être compris entre 20 et 300 kg');
      return;
    }

    const date = format(goalDate, 'yyyy-MM-dd');
    const nextGoals = [
      ...weightGoals.filter((goal) => goal.date !== date),
      { id: crypto.randomUUID(), weight: goalWeight, date },
    ].sort((a, b) => parseISO(a.date).getTime() - parseISO(b.date).getTime());

    try {
      await updateSettings({ weightGoals: nextGoals });
      toast.success('Objectif enregistré');
    } catch (error) {
      console.error('Erreur lors de l’ajout de l’objectif:', error);
    }
  };

  const handleDeleteGoal = async (goalId: string) => {
    try {
      await updateSettings({ weightGoals: weightGoals.filter((goal) => goal.id !== goalId) });
      toast.success('Objectif supprimé');
    } catch (error) {
      console.error('Erreur lors de la suppression de l’objectif:', error);
    }
  };

  if (isLoading || isLoadingSettings) {
    return (
      <Card className="app-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Scale className="h-5 w-5 text-accent-blue" />
            Suivi du poids
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center">
            <p className="text-muted-foreground">Chargement...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="app-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Scale className="h-5 w-5 text-accent-blue" />
          Suivi du poids
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="add" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="add" className="flex items-center gap-2">
              <Scale className="h-4 w-4" />
              Ajouter
            </TabsTrigger>
            <TabsTrigger value="evolution" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Évolution
            </TabsTrigger>
            <TabsTrigger value="goals" className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              Objectifs
            </TabsTrigger>
          </TabsList>

          <TabsContent value="add" className="space-y-6 mt-6">
            {/* Formulaire d'ajout */}
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="weight">Poids (kg)</Label>
                  <Input
                    id="weight"
                    type="number"
                    step="0.1"
                    {...form.register('weight', { valueAsNumber: true })}
                    className="w-full"
                  />
                  {form.formState.errors.weight && (
                    <p className="text-sm text-destructive">{form.formState.errors.weight.message}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label>Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !form.watch('date') && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {form.watch('date') ? (
                          format(form.watch('date'), 'dd/MM/yyyy', { locale: fr })
                        ) : (
                          <span>Choisir une date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={form.watch('date')}
                        onSelect={(date) => form.setValue('date', date || new Date())}
                        disabled={(date) => date > new Date() || date < new Date('1900-01-01')}
                        initialFocus
                        locale={fr}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
              
              <Button type="submit" className="w-full">
                Enregistrer
              </Button>
            </form>

            {/* Historique */}
            <div className="space-y-3">
              <h4 className="font-medium">Historique récent</h4>
              
              {measurements && measurements.length > 0 ? (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {measurements.slice(0, 5).map((measurement) => (
                    <div key={measurement.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{measurement.weight} kg</p>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(measurement.date), 'dd/MM/yyyy', { locale: fr })}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(measurement.id)}
                        className="text-destructive hover:text-destructive/90 hover:bg-destructive/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-4">
                  Aucune mesure enregistrée
                </p>
              )}
            </div>
          </TabsContent>

          <TabsContent value="evolution" className="mt-6">
            {chartData.length === 0 ? (
              <div className="h-64 flex items-center justify-center">
                <p className="text-muted-foreground">
                  Aucune mesure de poids pour cette période
                </p>
              </div>
            ) : (
              <>
                {stats && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">Mesures</p>
                      <p className="text-lg font-semibold">{stats.totalMeasurements}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">Évolution</p>
                      <p className={`text-lg font-semibold ${stats.weightChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {stats.weightChange >= 0 ? '+' : ''}{stats.weightChange.toFixed(1)} kg
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">Min</p>
                      <p className="text-lg font-semibold">{stats.minWeight} kg</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">Max</p>
                      <p className="text-lg font-semibold">{stats.maxWeight} kg</p>
                    </div>
                  </div>
                )}

                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                      <XAxis 
                        dataKey="displayDate"
                        tick={{ fontSize: 12 }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis 
                        tick={{ fontSize: 12 }}
                        axisLine={false}
                        tickLine={false}
                        domain={['dataMin - 1', 'dataMax + 1']}
                      />
                      <Tooltip 
                        content={({ active, payload, label }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload;
                            return (
                              <div className="bg-background border rounded-lg p-3 shadow-lg">
                                <p className="font-medium">{data.fullDate}</p>
                                {data.weight !== undefined && <p className="text-accent-blue">Poids : {data.weight} kg</p>}
                                {data.goalWeight !== undefined && <p className="text-accent-yellow">Objectif : {data.goalWeight} kg</p>}
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="weight" 
                        stroke="hsl(var(--accent-blue))" 
                        strokeWidth={2}
                        dot={{ fill: 'hsl(var(--accent-blue))', strokeWidth: 2, r: 4 }}
                        activeDot={{ r: 6, stroke: 'hsl(var(--accent-blue))', strokeWidth: 2 }}
                        connectNulls
                      />
                      <Line
                        type="monotone"
                        dataKey="goalWeight"
                        name="Objectif"
                        stroke="hsl(var(--accent-yellow))"
                        strokeWidth={2}
                        strokeDasharray="5 5"
                        dot={{ fill: 'hsl(var(--accent-yellow))', strokeWidth: 2, r: 5 }}
                        activeDot={{ r: 7, stroke: 'hsl(var(--accent-yellow))', strokeWidth: 2 }}
                        connectNulls
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </>
            )}
          </TabsContent>

          <TabsContent value="goals" className="space-y-6 mt-6">
            <form onSubmit={handleAddGoal} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="goal-weight">Poids objectif (kg)</Label>
                  <Input
                    id="goal-weight"
                    type="number"
                    min="20"
                    max="300"
                    step="0.1"
                    value={goalWeight}
                    onChange={(event) => setGoalWeight(event.target.valueAsNumber)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Date cible</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left font-normal">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {format(goalDate, 'dd/MM/yyyy', { locale: fr })}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={goalDate}
                        onSelect={(date) => date && setGoalDate(date)}
                        initialFocus
                        locale={fr}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
              <Button type="submit" className="w-full">
                <Target className="mr-2 h-4 w-4" />
                Ajouter l’objectif
              </Button>
            </form>

            <div className="space-y-3">
              <h4 className="font-medium">Objectifs enregistrés</h4>
              {weightGoals.length > 0 ? (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {[...weightGoals]
                    .sort((a, b) => parseISO(a.date).getTime() - parseISO(b.date).getTime())
                    .map((goal) => (
                      <div key={goal.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{goal.weight} kg</p>
                          <p className="text-sm text-muted-foreground">
                            {format(parseISO(goal.date), 'dd/MM/yyyy', { locale: fr })}
                          </p>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteGoal(goal.id)}
                          className="text-destructive hover:text-destructive/90 hover:bg-destructive/10"
                          aria-label={`Supprimer l’objectif du ${format(parseISO(goal.date), 'dd/MM/yyyy')}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-4">Aucun objectif enregistré</p>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};