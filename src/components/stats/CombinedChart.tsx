
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart3, LineChart as LineChartIcon, TrendingUp, Activity, ChevronDown } from 'lucide-react';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { ComposedChart, Bar, Line, XAxis, YAxis, ResponsiveContainer, Legend } from 'recharts';
import { useState, useMemo } from 'react';
import type { Workout } from '@/types';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface CombinedChartProps {
    workouts: Workout[] | undefined;
}

type ChartMetric = 'volume' | 'duration' | 'sets' | 'maxWeight' | 'exercises';

export const CombinedChart = ({ workouts }: CombinedChartProps) => {
    const [metric1, setMetric1] = useState<ChartMetric>('volume');
    const [metric2, setMetric2] = useState<ChartMetric>('duration');
    const [isExpanded, setIsExpanded] = useState(false);

    const chartData = useMemo(() => {
        if (!workouts || workouts.length === 0) return [];

        return workouts
            .filter(w => w.status === 'completed')
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
            .slice(-20) // Derniers 20 entraînements
            .map(workout => {
                const volume = workout.exercises.reduce((total, exercise) => 
                    total + exercise.sets.filter(s => s.completed).reduce((acc, set) => 
                        acc + (Number(set.reps) || 0) * (Number(set.weight) || 0), 0), 0
                );

                const duration = workout.ended_at && workout.date ? 
                    (new Date(workout.ended_at).getTime() - new Date(workout.date).getTime()) / (1000 * 60) : 0;

                const sets = workout.exercises.reduce((total, exercise) => 
                    total + exercise.sets.filter(s => s.completed).length, 0
                );

                const maxWeight = Math.max(0, ...workout.exercises.flatMap(exercise => 
                    exercise.sets.filter(s => s.completed).map(set => Number(set.weight) || 0)
                ));

                const exercises = workout.exercises.length;

                return {
                    date: format(new Date(workout.date), 'd MMM', { locale: fr }),
                    fullDate: workout.date,
                    volume: Math.round(volume),
                    duration: Math.round(duration),
                    sets,
                    maxWeight,
                    exercises
                };
            });
    }, [workouts]);

    const getMetricLabel = (metric: ChartMetric) => {
        switch (metric) {
            case 'volume': return 'Volume (kg)';
            case 'duration': return 'Durée (min)';
            case 'sets': return 'Séries';
            case 'maxWeight': return 'Poids max (kg)';
            case 'exercises': return 'Exercices';
        }
    };

    const getMetricIcon = (metric: ChartMetric) => {
        switch (metric) {
            case 'volume': return <BarChart3 className="h-4 w-4" />;
            case 'duration': return <Activity className="h-4 w-4" />;
            case 'sets': return <LineChartIcon className="h-4 w-4" />;
            case 'maxWeight': return <TrendingUp className="h-4 w-4" />;
            case 'exercises': return <BarChart3 className="h-4 w-4" />;
        }
    };

    const metrics: ChartMetric[] = ['volume', 'duration', 'sets', 'maxWeight', 'exercises'];

    if (!workouts || workouts.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                        <BarChart3 className="h-5 w-5 text-accent-blue" />
                        Graphiques Combinés
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">
                        Effectuez des entraînements pour voir les graphiques combinés.
                    </p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
                <CardHeader>
                    <CollapsibleTrigger className="flex w-full items-center justify-between text-left [&[data-state=open]>svg]:rotate-180">
                        <CardTitle className="flex items-center gap-2 text-base">
                            <BarChart3 className="h-5 w-5 text-accent-blue" />
                            Graphiques Combinés
                        </CardTitle>
                        <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200" />
                    </CollapsibleTrigger>
                </CardHeader>
                <CollapsibleContent>
                    <CardContent className="max-h-[600px] overflow-y-auto">
                        <div className="flex flex-col sm:flex-row flex-wrap gap-2 mb-4">
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-medium">Métrique 1:</span>
                                <Select value={metric1} onValueChange={(value: ChartMetric) => setMetric1(value)}>
                                    <SelectTrigger className="w-32">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {metrics.map(metric => (
                                            <SelectItem key={metric} value={metric}>
                                                <div className="flex items-center gap-2">
                                                    {getMetricIcon(metric)}
                                                    <span className="text-xs">{getMetricLabel(metric)}</span>
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-medium">Métrique 2:</span>
                                <Select value={metric2} onValueChange={(value: ChartMetric) => setMetric2(value)}>
                                    <SelectTrigger className="w-32">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {metrics.filter(m => m !== metric1).map(metric => (
                                            <SelectItem key={metric} value={metric}>
                                                <div className="flex items-center gap-2">
                                                    {getMetricIcon(metric)}
                                                    <span className="text-xs">{getMetricLabel(metric)}</span>
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="h-80 mb-4">
                            <ChartContainer
                                config={{
                                    [metric1]: {
                                        label: getMetricLabel(metric1),
                                        color: "hsl(var(--chart-1))",
                                    },
                                    [metric2]: {
                                        label: getMetricLabel(metric2),
                                        color: "hsl(var(--chart-2))",
                                    }
                                }}
                            >
                                <ResponsiveContainer width="100%" height="100%">
                                    <ComposedChart data={chartData}>
                                        <XAxis 
                                            dataKey="date" 
                                            fontSize={10}
                                            tick={{ fontSize: 10 }}
                                        />
                                        <YAxis 
                                            yAxisId="left" 
                                            fontSize={10}
                                            tick={{ fontSize: 10 }}
                                        />
                                        <YAxis 
                                            yAxisId="right" 
                                            orientation="right" 
                                            fontSize={10}
                                            tick={{ fontSize: 10 }}
                                        />
                                        <ChartTooltip content={<ChartTooltipContent />} />
                                        <Legend wrapperStyle={{ fontSize: '12px' }} />
                                        <Bar 
                                            yAxisId="left"
                                            dataKey={metric1} 
                                            fill="hsl(var(--chart-1))"
                                            name={getMetricLabel(metric1)}
                                            radius={[2, 2, 0, 0]}
                                        />
                                        <Line 
                                            yAxisId="right"
                                            type="monotone" 
                                            dataKey={metric2} 
                                            stroke="hsl(var(--chart-2))"
                                            strokeWidth={2}
                                            name={getMetricLabel(metric2)}
                                            dot={{ r: 3 }}
                                        />
                                    </ComposedChart>
                                </ResponsiveContainer>
                            </ChartContainer>
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div className="text-center p-2 bg-muted/30 rounded">
                                <div className="flex items-center justify-center gap-1 mb-1">
                                    {getMetricIcon(metric1)}
                                    <span className="font-medium text-xs">{getMetricLabel(metric1)}</span>
                                </div>
                                <div className="text-xs text-muted-foreground">
                                    Moy: {Math.round(chartData.reduce((sum, d) => sum + d[metric1], 0) / chartData.length)}
                                </div>
                            </div>
                            <div className="text-center p-2 bg-muted/30 rounded">
                                <div className="flex items-center justify-center gap-1 mb-1">
                                    {getMetricIcon(metric2)}
                                    <span className="font-medium text-xs">{getMetricLabel(metric2)}</span>
                                </div>
                                <div className="text-xs text-muted-foreground">
                                    Moy: {Math.round(chartData.reduce((sum, d) => sum + d[metric2], 0) / chartData.length)}
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </CollapsibleContent>
            </Collapsible>
        </Card>
    );
};
