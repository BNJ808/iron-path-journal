import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Skeleton } from '@/components/ui/skeleton';
import { CalendarIcon, Scale, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useBodyMeasurements } from '@/hooks/useBodyMeasurements';
import { toast } from 'sonner';

const weightFormSchema = z.object({
  weight: z.number().min(20, 'Le poids doit être supérieur à 20 kg').max(300, 'Le poids doit être inférieur à 300 kg'),
  date: z.date()
});

type WeightFormValues = z.infer<typeof weightFormSchema>;

export const WeightTracker: React.FC = () => {
  const { measurements, isLoading, addMeasurement, deleteMeasurement } = useBodyMeasurements();
  
  const form = useForm<WeightFormValues>({
    resolver: zodResolver(weightFormSchema),
    defaultValues: {
      weight: 70,
      date: new Date()
    }
  });

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

  return (
    <Card className="app-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Scale className="h-5 w-5 text-accent-blue" />
          Suivi du poids
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
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
          <h4 className="font-medium">Historique</h4>
          
          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="space-y-1">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                  <Skeleton className="h-8 w-8" />
                </div>
              ))}
            </div>
          ) : measurements && measurements.length > 0 ? (
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {measurements.map((measurement) => (
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
      </CardContent>
    </Card>
  );
};