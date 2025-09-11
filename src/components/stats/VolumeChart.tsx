
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Cell } from 'recharts';
import { TrendingUp, TrendingDown, Minus, ChevronDown } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { MUSCLE_GROUP_COLORS_HEX } from '@/data/exercises';
import { useVolumeEvolution } from '@/hooks/useVolumeEvolution';
import type { Workout } from '@/types';
import { DateRange } from 'react-day-picker';
import { format } from 'date-fns';

interface VolumeChartProps {
    allWorkouts: Workout[] | undefined;
    dateRange: DateRange | undefined;
}

const chartConfig = {
    evolutionPercent: {
        label: "Évolution (%)",
        color: "hsl(var(--chart-1))",
    },
};

// Custom tooltip component
const CustomTooltipContent = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload;
        const muscleGroup = label;
        const color = MUSCLE_GROUP_COLORS_HEX[muscleGroup] || MUSCLE_GROUP_COLORS_HEX['Autres'];
        
        return (
            <div className="grid min-w-[12rem] items-start gap-1.5 rounded-lg border border-border/50 bg-background px-2.5 py-1.5 text-xs shadow-xl">
                <div className="grid gap-1.5">
                    <div className="flex w-full flex-wrap items-stretch gap-2 items-center">
                        <div
                            className="shrink-0 rounded-[2px] h-2.5 w-2.5"
                            style={{ backgroundColor: color }}
                        />
                        <div className="flex flex-1 justify-between leading-none items-center">
                            <span className="text-muted-foreground">
                                Évolution
                            </span>
                            <span className={`font-mono font-medium tabular-nums ${
                                data.evolutionPercent > 0 ? 'text-green-500' : 
                                data.evolutionPercent < 0 ? 'text-red-500' : 'text-muted-foreground'
                            }`}>
                                {data.evolutionPercent > 0 ? '+' : ''}{data.evolutionPercent}%
                            </span>
                        </div>
                    </div>
                    <div className="text-muted-foreground text-xs">
                        {muscleGroup}
                    </div>
                    <div className="text-xs">
                        <div>Volume actuel: {data.currentVolume} kg</div>
                        <div>Volume précédent: {data.previousVolume} kg</div>
                    </div>
                </div>
            </div>
        );
    }
    return null;
};

const TrendIcon = ({ trend }: { trend: 'positive' | 'negative' | 'stable' }) => {
    switch (trend) {
        case 'positive':
            return <TrendingUp className="h-4 w-4 text-green-500" />;
        case 'negative':
            return <TrendingDown className="h-4 w-4 text-red-500" />;
        case 'stable':
            return <Minus className="h-4 w-4 text-muted-foreground" />;
    }
};

export const VolumeChart = ({ allWorkouts, dateRange }: VolumeChartProps) => {
    const { volumeEvolution } = useVolumeEvolution(allWorkouts, dateRange);

    if (volumeEvolution.length === 0) {
        return null;
    }

    return (
        <Collapsible defaultOpen={false}>
            <Card>
                <CollapsibleTrigger className="flex w-full items-center justify-between text-left [&[data-state=open]>div>svg]:rotate-180">
                    <CardHeader className="cursor-pointer flex-1 pb-3">
                        <div className="flex w-full items-center justify-between">
                            <CardTitle className="flex items-center gap-2 text-base">
                                <TrendingUp className="h-5 w-5 text-emerald-500" />
                                Évolution du Volume par Groupe Musculaire
                            </CardTitle>
                            <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200" />
                        </div>
                    </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                    <CardContent className="pt-0 pb-4 pl-6">
                        {dateRange?.from && dateRange?.to && (
                            <div className="mb-4">
                                <p className="text-sm text-muted-foreground">
                                    Évolution comparée à la période précédente ({format(dateRange.from, 'dd/MM/yyyy')} - {format(dateRange.to, 'dd/MM/yyyy')})
                                </p>
                            </div>
                        )}
                        
                        <ChartContainer config={chartConfig} className="h-[320px] w-full">
                            <BarChart 
                                data={volumeEvolution} 
                                margin={{ top: 10, right: 5, left: 50, bottom: 20 }}
                                barCategoryGap="8%"
                            >
                                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted-foreground))" opacity={0.3} />
                                <XAxis 
                                    dataKey="group" 
                                    tick={{ fontSize: 11, fill: "hsl(var(--foreground))" }}
                                    axisLine={false}
                                    tickLine={false}
                                    angle={-45}
                                    textAnchor="end"
                                    height={40}
                                    interval={0}
                                />
                                <YAxis 
                                    tick={{ fontSize: 11, fill: "hsl(var(--foreground))" }}
                                    axisLine={false}
                                    tickLine={false}
                                    width={50}
                                    label={{ value: '%', angle: 0, position: 'insideLeft' }}
                                />
                                <ChartTooltip content={<CustomTooltipContent />} />
                                <Bar 
                                    dataKey="evolutionPercent" 
                                    radius={[6, 6, 0, 0]}
                                    maxBarSize={80}
                                >
                                    {volumeEvolution.map((entry, index) => {
                                        let color = MUSCLE_GROUP_COLORS_HEX[entry.group] || MUSCLE_GROUP_COLORS_HEX['Autres'];
                                        
                                        // Modifier l'opacité selon la tendance
                                        if (entry.trend === 'negative') {
                                            color = color + '80'; // 50% d'opacité pour les valeurs négatives
                                        }
                                        
                                        return (
                                            <Cell 
                                                key={`cell-${index}`} 
                                                fill={color}
                                            />
                                        );
                                    })}
                                </Bar>
                            </BarChart>
                        </ChartContainer>

                        <div className="mt-4 space-y-2">
                            <h4 className="text-sm font-medium mb-2">Résumé des évolutions</h4>
                            <div className="grid gap-2 max-h-32 overflow-y-auto">
                                {volumeEvolution.slice(0, 5).map((item) => (
                                    <div key={item.group} className="flex items-center justify-between text-sm">
                                        <div className="flex items-center gap-2">
                                            <div
                                                className="w-3 h-3 rounded"
                                                style={{ backgroundColor: MUSCLE_GROUP_COLORS_HEX[item.group] || MUSCLE_GROUP_COLORS_HEX['Autres'] }}
                                            />
                                            <span className="text-muted-foreground">{item.group}</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <TrendIcon trend={item.trend} />
                                            <span className={`font-mono ${
                                                item.evolutionPercent > 0 ? 'text-green-500' : 
                                                item.evolutionPercent < 0 ? 'text-red-500' : 'text-muted-foreground'
                                            }`}>
                                                {item.evolutionPercent > 0 ? '+' : ''}{item.evolutionPercent}%
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </CollapsibleContent>
            </Card>
        </Collapsible>
    );
};
