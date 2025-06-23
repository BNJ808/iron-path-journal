
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Hexagon, ChevronDown } from 'lucide-react';
import { PolarGrid, PolarAngleAxis, Radar, RadarChart as RechartsRadarChart, PolarRadiusAxis } from 'recharts';
import { MUSCLE_GROUP_COLORS_HEX } from '@/data/exercises';

interface MuscleGroupRadarChartProps {
    data: { subject: string; sets: number }[];
    maxSets: number;
}

const chartConfig = {
    sets: {
      label: "Séries",
      color: "hsl(48, 96%, 51%)",
    },
};

const renderColorfulTick = (props: any) => {
    const { payload, x, y, textAnchor, ...rest } = props;
    const color = MUSCLE_GROUP_COLORS_HEX[payload.value] || MUSCLE_GROUP_COLORS_HEX['Autres'];
    
    // Ajuster la position Y spécifiquement pour "Pectoraux"
    const adjustedY = payload.value === 'Pectoraux' ? y - 8 : y;
    
    return (
        <text
            {...rest}
            x={x}
            y={adjustedY}
            textAnchor={textAnchor}
            dominantBaseline="central"
            fill={color}
            fontSize={12}
        >
            {payload.value}
        </text>
    );
};

// Custom tooltip component with muscle group color
const CustomTooltipContent = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        const muscleGroup = label;
        const color = MUSCLE_GROUP_COLORS_HEX[muscleGroup] || MUSCLE_GROUP_COLORS_HEX['Autres'];
        const value = payload[0].value;
        
        return (
            <div className="grid min-w-[8rem] items-start gap-1.5 rounded-lg border border-border/50 bg-background px-2.5 py-1.5 text-xs shadow-xl">
                <div className="grid gap-1.5">
                    <div className="flex w-full flex-wrap items-stretch gap-2 items-center">
                        <div
                            className="shrink-0 rounded-[2px] h-2.5 w-2.5"
                            style={{ backgroundColor: color }}
                        />
                        <div className="flex flex-1 justify-between leading-none items-center">
                            <span className="text-muted-foreground">
                                {muscleGroup}
                            </span>
                            <span className="font-mono font-medium tabular-nums text-foreground">
                                {value}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
    return null;
};

export const MuscleGroupRadarChart = ({ data, maxSets }: MuscleGroupRadarChartProps) => {
    return (
        <Collapsible defaultOpen={false}>
            <Card>
                <CollapsibleTrigger className="flex w-full items-center justify-between text-left [&[data-state=open]>div>svg]:rotate-180">
                    <CardHeader className="cursor-pointer flex-1">
                        <div className="flex w-full items-center justify-between">
                            <CardTitle className="flex items-center gap-2 text-base">
                                <Hexagon className="h-5 w-5 text-cyan-500" />
                                Séries par Groupe Musculaire
                            </CardTitle>
                            <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200" />
                        </div>
                    </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                    <CardContent className="pb-0">
                        <ChartContainer config={chartConfig} className="mx-auto aspect-square max-h-[300px]">
                            <RechartsRadarChart data={data}>
                                <ChartTooltip
                                    cursor={false}
                                    content={<CustomTooltipContent />}
                                />
                                <PolarGrid stroke="hsl(var(--foreground))" />
                                <PolarAngleAxis dataKey="subject" tick={renderColorfulTick} />
                                <PolarRadiusAxis angle={30} domain={[0, maxSets > 0 ? maxSets : 1]} tick={false} axisLine={false} />
                                <Radar
                                    dataKey="sets"
                                    fill="var(--color-sets)"
                                    fillOpacity={0.6}
                                    stroke="var(--color-sets)"
                                    dot={(props: any) => {
                                        const { cx, cy, payload } = props;
                                        // Essayons différentes façons d'accéder au nom du groupe musculaire
                                        const muscleGroup = payload?.subject || payload?.name || '';
                                        const color = MUSCLE_GROUP_COLORS_HEX[muscleGroup] || MUSCLE_GROUP_COLORS_HEX['Autres'];
                                        console.log('Dot payload:', payload, 'muscleGroup:', muscleGroup, 'color:', color);
                                        return (
                                            <circle
                                                cx={cx}
                                                cy={cy}
                                                r={4}
                                                fill={color}
                                                stroke="white"
                                                strokeWidth={2}
                                            />
                                        );
                                    }}
                                />
                            </RechartsRadarChart>
                        </ChartContainer>
                    </CardContent>
                </CollapsibleContent>
            </Card>
        </Collapsible>
    );
};
