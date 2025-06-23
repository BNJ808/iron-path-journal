
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer } from '@/components/ui/chart';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Tooltip, TooltipProps } from 'recharts';
import { Target, ChevronDown } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { MUSCLE_GROUP_COLORS_HEX } from '@/data/exercises';

interface MuscleGroupRadarChartProps {
    chartData: { subject: string; sets: number }[];
    maxSets: number;
}

const chartConfig = {
    sets: {
        label: "Séries",
        color: "hsl(var(--chart-1))",
    },
};

// Tooltip personnalisé avec couleur du groupe musculaire
const CustomTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
    if (active && payload && payload.length) {
        const muscleGroup = label;
        const color = MUSCLE_GROUP_COLORS_HEX[muscleGroup] || MUSCLE_GROUP_COLORS_HEX['Autres'];
        
        return (
            <div className="bg-background border border-border rounded-lg shadow-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                    <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: color }}
                    />
                    <p className="font-medium text-foreground">{muscleGroup}</p>
                </div>
                <p className="text-sm text-muted-foreground">
                    Séries: <span className="font-medium text-foreground">{payload[0].value}</span>
                </p>
            </div>
        );
    }
    return null;
};

export const MuscleGroupRadarChart = ({ chartData, maxSets }: MuscleGroupRadarChartProps) => {
    if (chartData.length === 0) {
        return null;
    }

    return (
        <Collapsible defaultOpen={false}>
            <Card>
                <CollapsibleTrigger className="flex w-full items-center justify-between text-left [&[data-state=open]>div>svg]:rotate-180">
                    <CardHeader className="cursor-pointer flex-1 pb-3">
                        <div className="flex w-full items-center justify-between">
                            <CardTitle className="flex items-center gap-2 text-base">
                                <Target className="h-5 w-5 text-accent-blue" />
                                Séries par Groupe Musculaire
                            </CardTitle>
                            <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200" />
                        </div>
                    </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                    <CardContent className="pt-0 pb-1">
                        <ChartContainer config={chartConfig} className="h-[280px] w-full">
                            <RadarChart data={chartData} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                                <PolarGrid stroke="hsl(var(--muted-foreground))" opacity={0.3} />
                                <PolarAngleAxis 
                                    dataKey="subject" 
                                    tick={{ fontSize: 11, fill: "hsl(var(--foreground))" }}
                                />
                                <PolarRadiusAxis
                                    angle={90}
                                    domain={[0, maxSets]}
                                    tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                                    tickCount={5}
                                />
                                <Tooltip content={<CustomTooltip />} />
                                <Radar
                                    name="Séries"
                                    dataKey="sets"
                                    stroke="hsl(var(--chart-1))"
                                    fill="hsl(var(--chart-1))"
                                    fillOpacity={0.1}
                                    strokeWidth={2}
                                    dot={{ r: 4, strokeWidth: 2, fill: "hsl(var(--chart-1))" }}
                                />
                            </RadarChart>
                        </ChartContainer>
                    </CardContent>
                </CollapsibleContent>
            </Card>
        </Collapsible>
    );
};
