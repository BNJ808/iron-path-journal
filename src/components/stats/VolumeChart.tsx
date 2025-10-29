
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';
import { TrendingUp, ChevronDown } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { MUSCLE_GROUP_COLORS_HEX } from '@/data/exercises';
import { useVolumeTimeline } from '@/hooks/useVolumeTimeline';
import type { Workout } from '@/types';
import { DateRange } from 'react-day-picker';
import { format, subDays, subMonths, subYears } from 'date-fns';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useState } from 'react';

interface VolumeChartProps {
    allWorkouts: Workout[] | undefined;
    dateRange: DateRange | undefined;
}


export const VolumeChart = ({ allWorkouts, dateRange }: VolumeChartProps) => {
    const [selectedPeriod, setSelectedPeriod] = useState<string>('30');
    
    // Calculer la dateRange basée sur la période sélectionnée
    const effectiveDateRange: DateRange | undefined = selectedPeriod === 'all' 
        ? undefined 
        : {
            from: selectedPeriod === '7' ? subDays(new Date(), 7) :
                  selectedPeriod === '30' ? subDays(new Date(), 30) :
                  selectedPeriod === '90' ? subMonths(new Date(), 3) :
                  selectedPeriod === '180' ? subMonths(new Date(), 6) :
                  selectedPeriod === '365' ? subYears(new Date(), 1) :
                  dateRange?.from,
            to: new Date()
        };
    
    const { data: volumeData, muscleGroups } = useVolumeTimeline(allWorkouts, effectiveDateRange);

    // Créer la config du chart dynamiquement
    const chartConfig: ChartConfig = muscleGroups.reduce((acc, group, index) => {
        acc[group] = {
            label: group,
            color: MUSCLE_GROUP_COLORS_HEX[group] || MUSCLE_GROUP_COLORS_HEX['Autres']
        };
        return acc;
    }, {} as ChartConfig);

    if (volumeData.length === 0 || muscleGroups.length === 0) {
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
                        <div className="mb-4 space-y-3">
                            <div className="flex items-center gap-2">
                                <label className="text-sm font-medium">Période:</label>
                                <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                                    <SelectTrigger className="w-[180px]">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="7">7 derniers jours</SelectItem>
                                        <SelectItem value="30">30 derniers jours</SelectItem>
                                        <SelectItem value="90">3 derniers mois</SelectItem>
                                        <SelectItem value="180">6 derniers mois</SelectItem>
                                        <SelectItem value="365">1 dernière année</SelectItem>
                                        <SelectItem value="all">Tout l'historique</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            {effectiveDateRange?.from && (
                                <p className="text-sm text-muted-foreground">
                                    Volume en kg par semaine ({format(effectiveDateRange.from, 'dd/MM/yyyy')} - {format(effectiveDateRange.to || new Date(), 'dd/MM/yyyy')})
                                </p>
                            )}
                        </div>
                        
                        <ChartContainer config={chartConfig} className="h-[350px] w-full">
                            <LineChart 
                                data={volumeData} 
                                margin={{ top: 10, right: 20, left: 0, bottom: 5 }}
                            >
                                <CartesianGrid vertical={false} stroke="hsl(var(--muted-foreground) / 0.2)" />
                                <XAxis 
                                    dataKey="week" 
                                    tickLine={false}
                                    axisLine={false}
                                    tickMargin={10}
                                    fontSize={12}
                                />
                                <YAxis 
                                    tickLine={false}
                                    axisLine={false}
                                    tickMargin={10}
                                    fontSize={12}
                                    label={{ value: 'Volume (kg)', angle: -90, position: 'insideLeft', style: { fontSize: 12 } }}
                                />
                                <ChartTooltip content={<ChartTooltipContent />} />
                                <Legend />
                                {muscleGroups.map((group) => (
                                    <Line
                                        key={group}
                                        type="monotone"
                                        dataKey={group}
                                        stroke={chartConfig[group]?.color || MUSCLE_GROUP_COLORS_HEX['Autres']}
                                        strokeWidth={2}
                                        dot={false}
                                        name={group}
                                    />
                                ))}
                            </LineChart>
                        </ChartContainer>
                    </CardContent>
                </CollapsibleContent>
            </Card>
        </Collapsible>
    );
};
