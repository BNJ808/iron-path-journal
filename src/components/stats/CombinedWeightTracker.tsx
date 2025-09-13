import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CalendarIcon, Scale, Trash2, TrendingUp } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useBodyMeasurements } from '@/hooks/useBodyMeasurements';
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

  if (isLoading) {
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
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="add" className="flex items-center gap-2">
              <Scale className="h-4 w-4" />
              Ajouter
            </TabsTrigger>
            <TabsTrigger value="evolution" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Évolution
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
                    <p className="text-sm text-red-500">{form.formState.errors.weight.message}</p>
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
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
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
            {filteredMeasurements.length === 0 ? (
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
                    <LineChart data={filteredMeasurements}>
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
                                <p className="text-accent-blue">
                                  Poids: {payload[0].value} kg
                                </p>
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
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};