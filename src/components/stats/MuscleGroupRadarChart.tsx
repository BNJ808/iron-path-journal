
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Hexagon } from 'lucide-react';
import { PolarGrid, PolarAngleAxis, Radar, RadarChart as RechartsRadarChart, PolarRadiusAxis } from 'recharts';

interface MuscleGroupRadarChartProps {
    data: { subject: string; sets: number }[];
    maxSets: number;
    timePeriod: string;
    onTimePeriodChange: (value: string) => void;
}

const chartConfig = {
    sets: {
      label: "Séries",
      color: "hsl(var(--chart-1))",
    },
};

export const MuscleGroupRadarChart = ({ data, maxSets, timePeriod, onTimePeriodChange }: MuscleGroupRadarChartProps) => {
    return (
        <Card>
            <CardHeader className="items-center pb-0">
                <CardTitle className="flex items-center gap-2 text-base">
                    <Hexagon className="h-5 w-5 text-accent-cyan" />
                    Distribution par Groupe Musculaire
                </CardTitle>
                <CardDescription>Nombre de séries par groupe musculaire</CardDescription>
                <Tabs value={timePeriod} onValueChange={onTimePeriodChange} className="pt-2">
                    <TabsList>
                        <TabsTrigger value="1w">1S</TabsTrigger>
                        <TabsTrigger value="1m">1M</TabsTrigger>
                        <TabsTrigger value="3m">3M</TabsTrigger>
                        <TabsTrigger value="6m">6M</TabsTrigger>
                        <TabsTrigger value="1y">1A</TabsTrigger>
                        <TabsTrigger value="all">Tout</TabsTrigger>
                    </TabsList>
                </Tabs>
            </CardHeader>
            <CardContent className="pb-0">
                <ChartContainer config={chartConfig} className="mx-auto aspect-square max-h-[300px]">
                    <RechartsRadarChart data={data}>
                        <ChartTooltip
                            cursor={false}
                            content={<ChartTooltipContent indicator="line" />}
                        />
                        <PolarGrid />
                        <PolarAngleAxis dataKey="subject" />
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
        </Card>
    );
};
