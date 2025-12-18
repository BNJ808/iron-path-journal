import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, FileSpreadsheet, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface WorkoutExercise {
  id: string;
  name: string;
  muscleGroup: string;
  sets: Array<{
    reps: number;
    weight: number;
    completed: boolean;
  }>;
}

interface Workout {
  id: string;
  date: string;
  ended_at: string | null;
  status: string;
  exercises: WorkoutExercise[];
  notes: string | null;
}

export const DataExport = () => {
  const { user } = useAuth();
  const [isExporting, setIsExporting] = useState(false);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('fr-FR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const escapeCsvValue = (value: string | number | null | undefined): string => {
    if (value === null || value === undefined) return '';
    const stringValue = String(value);
    if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
      return `"${stringValue.replace(/"/g, '""')}"`;
    }
    return stringValue;
  };

  const generateWorkoutsCsv = (workouts: Workout[]): string => {
    const headers = ['Date', 'Heure fin', 'Statut', 'Exercice', 'Groupe musculaire', 'Série', 'Répétitions', 'Poids (kg)', 'Complété', 'Notes'];
    const rows: string[][] = [headers];

    workouts.forEach((workout) => {
      const exercises = workout.exercises as WorkoutExercise[];
      if (exercises && exercises.length > 0) {
        exercises.forEach((exercise) => {
          if (exercise.sets && exercise.sets.length > 0) {
            exercise.sets.forEach((set, setIndex) => {
              rows.push([
                escapeCsvValue(formatDate(workout.date)),
                escapeCsvValue(workout.ended_at ? formatDateTime(workout.ended_at) : ''),
                escapeCsvValue(workout.status),
                escapeCsvValue(exercise.name),
                escapeCsvValue(exercise.muscleGroup),
                escapeCsvValue(setIndex + 1),
                escapeCsvValue(set.reps),
                escapeCsvValue(set.weight),
                escapeCsvValue(set.completed ? 'Oui' : 'Non'),
                escapeCsvValue(workout.notes),
              ]);
            });
          }
        });
      }
    });

    return rows.map(row => row.join(',')).join('\n');
  };

  const generateBodyMeasurementsCsv = (measurements: Array<{ date: string; weight: number }>): string => {
    const headers = ['Date', 'Poids (kg)'];
    const rows: string[][] = [headers];

    measurements.forEach((measurement) => {
      rows.push([
        escapeCsvValue(formatDate(measurement.date)),
        escapeCsvValue(measurement.weight),
      ]);
    });

    return rows.map(row => row.join(',')).join('\n');
  };

  const downloadCsv = (content: string, filename: string) => {
    const BOM = '\uFEFF';
    const blob = new Blob([BOM + content], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExportWorkouts = async () => {
    if (!user) return;
    
    setIsExporting(true);
    try {
      const { data, error } = await supabase
        .from('workouts')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false });

      if (error) throw error;

      if (!data || data.length === 0) {
        toast.info('Aucun entraînement à exporter');
        return;
      }

      const csv = generateWorkoutsCsv(data as unknown as Workout[]);
      const date = new Date().toISOString().split('T')[0];
      downloadCsv(csv, `entrainements_${date}.csv`);
      toast.success(`${data.length} entraînements exportés avec succès`);
    } catch (error: any) {
      console.error('Export error:', error);
      toast.error('Erreur lors de l\'export: ' + error.message);
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportBodyMeasurements = async () => {
    if (!user) return;
    
    setIsExporting(true);
    try {
      const { data, error } = await supabase
        .from('body_measurements')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false });

      if (error) throw error;

      if (!data || data.length === 0) {
        toast.info('Aucune mesure corporelle à exporter');
        return;
      }

      const csv = generateBodyMeasurementsCsv(data);
      const date = new Date().toISOString().split('T')[0];
      downloadCsv(csv, `mesures_corporelles_${date}.csv`);
      toast.success(`${data.length} mesures exportées avec succès`);
    } catch (error: any) {
      console.error('Export error:', error);
      toast.error('Erreur lors de l\'export: ' + error.message);
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportAll = async () => {
    if (!user) return;
    
    setIsExporting(true);
    try {
      // Fetch all data in parallel
      const [workoutsResult, measurementsResult] = await Promise.all([
        supabase
          .from('workouts')
          .select('*')
          .eq('user_id', user.id)
          .order('date', { ascending: false }),
        supabase
          .from('body_measurements')
          .select('*')
          .eq('user_id', user.id)
          .order('date', { ascending: false }),
      ]);

      if (workoutsResult.error) throw workoutsResult.error;
      if (measurementsResult.error) throw measurementsResult.error;

      const date = new Date().toISOString().split('T')[0];
      let exportedCount = 0;

      if (workoutsResult.data && workoutsResult.data.length > 0) {
        const workoutsCsv = generateWorkoutsCsv(workoutsResult.data as unknown as Workout[]);
        downloadCsv(workoutsCsv, `entrainements_${date}.csv`);
        exportedCount++;
      }

      if (measurementsResult.data && measurementsResult.data.length > 0) {
        const measurementsCsv = generateBodyMeasurementsCsv(measurementsResult.data);
        downloadCsv(measurementsCsv, `mesures_corporelles_${date}.csv`);
        exportedCount++;
      }

      if (exportedCount === 0) {
        toast.info('Aucune donnée à exporter');
      } else {
        toast.success(`${exportedCount} fichier(s) exporté(s) avec succès`);
      }
    } catch (error: any) {
      console.error('Export error:', error);
      toast.error('Erreur lors de l\'export: ' + error.message);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Card className="app-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <FileSpreadsheet className="h-5 w-5 text-primary" />
          Exporter mes données
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Téléchargez vos données au format CSV, compatible avec Google Sheets et Excel.
        </p>
        
        <div className="flex flex-col gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportWorkouts}
            disabled={isExporting}
            className="flex items-center gap-2 justify-start"
          >
            {isExporting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            Exporter les entraînements
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportBodyMeasurements}
            disabled={isExporting}
            className="flex items-center gap-2 justify-start"
          >
            {isExporting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            Exporter les mesures corporelles
          </Button>
          
          <Button
            variant="default"
            size="sm"
            onClick={handleExportAll}
            disabled={isExporting}
            className="flex items-center gap-2 justify-start"
          >
            {isExporting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            Tout exporter
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
