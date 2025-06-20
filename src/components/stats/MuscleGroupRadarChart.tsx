

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Hexagon, ChevronsUpDown } from 'lucide-react';
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
    return (
        <text
            {...rest}
            x={x}
            y={y}
            textAnchor={textAnchor}
            dominantBaseline="central"
            fill={color}
            fontSize={12}
        >
            {payload.value}
        </text>
    );
};

export const MuscleGroupRadarChart = ({ data, maxSets }: MuscleGroupRadarChartProps) => {
    return (
        <Collapsible defaultOpen={false}>
            <Card>
                <CollapsibleTrigger asChild>
                    <CardHeader className="cursor-pointer pb-0">
                        <div className="flex w-full items-center justify-between">
                            <CardTitle className="flex items-center gap-2 text-base">
                                <Hexagon className="h-5 w-5 text-accent-cyan" />
                                Séries par Groupe Musculaire
                            </CardTitle>
                            <ChevronsUpDown className="h-4 w-4 shrink-0 text-muted-foreground" />
                        </div>
                    </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                    <CardContent className="pb-0">
                        <ChartContainer config={chartConfig} className="mx-auto aspect-square max-h-[300px]">
                            <RechartsRadarChart data={data}>
                                <ChartTooltip
                                    cursor={false}
                                    content={<ChartTooltipContent indicator="line" />}
                                />
                                <PolarGrid stroke="hsl(var(--foreground))" />
                                <PolarAngleAxis dataKey="subject" tick={renderColorfulTick} />
                                <PolarRadiusAxis angle={30} domain={[0, maxSets > 0 ? maxSets : 1]} tick={false} axisLine={false} />
                                <Radar
                                    dataKey="sets"
                                    fill="var(--color-sets)"
                                    fillOpacity={0.6}
                                    stroke="var(--color-sets)"
                                />
                            </RechartsRadarChart>
                        </ChartContainer>
                    </CardContent>
                </CollapsibleContent>
            </Card>
        </Collapsible>
    );
};

