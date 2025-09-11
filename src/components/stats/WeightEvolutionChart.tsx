import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Scale } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useBodyMeasurements } from '@/hooks/useBodyMeasurements';
import { DateRange } from 'react-day-picker';

interface WeightEvolutionChartProps {
  dateRange?: DateRange;
}

export const WeightEvolutionChart: React.FC<WeightEvolutionChartProps> = ({ dateRange }) => {
  const { measurements, isLoading } = useBodyMeasurements();

  // Filtrer les mesures selon la plage de dates sélectionnée
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

  if (isLoading) {
    return (
      <Card className="app-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Scale className="h-5 w-5 text-accent-blue" />
            Évolution du poids
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

  if (!filteredMeasurements || filteredMeasurements.length === 0) {
    return (
      <Card className="app-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Scale className="h-5 w-5 text-accent-blue" />
            Évolution du poids
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center">
            <p className="text-muted-foreground">
              Aucune mesure de poids pour cette période
            </p>
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
          Évolution du poids
        </CardTitle>
      </CardHeader>
      <CardContent>
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
      </CardContent>
    </Card>
  );
};