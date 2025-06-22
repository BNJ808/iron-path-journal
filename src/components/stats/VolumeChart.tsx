
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell, ResponsiveContainer } from 'recharts';
import { ChartContainer, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart';
import { BarChart as BarChartIcon, ChevronDown } from 'lucide-react';
import { MUSCLE_GROUP_COLORS_HEX } from '@/data/exercises';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

const chartConfig = {
  volume: {
    label: "Volume (kg)",
  },
} satisfies ChartConfig;

interface VolumeChartProps {
    chartData: { group: string; volume: number }[];
}

export const VolumeChart = ({ chartData }: VolumeChartProps) => (
    <Collapsible defaultOpen={false}>
        <Card>
            <CollapsibleTrigger className="flex w-full items-center justify-between text-left [&[data-state=open]>div>svg]:rotate-180">
                <CardHeader className="cursor-pointer flex-1">
                    <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2 text-base">
                            <BarChartIcon className="h-5 w-5 text-accent-purple" />
                            Volume par groupe musculaire (kg)
                        </CardTitle>
                        <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200" />
                    </div>
                </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
                <CardContent>
                    <ChartContainer config={chartConfig} className="h-[250px] w-full">
                        <BarChart accessibilityLayer data={chartData} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                            <CartesianGrid horizontal={false} stroke="hsl(var(--muted-foreground) / 0.2)" />
                            <XAxis type="number" hide />
                            <YAxis 
                                dataKey="group" 
                                type="category" 
                                tickLine={false} 
                                axisLine={false} 
                                tickMargin={5} 
                                width={80} 
                                fontSize={12} 
                                tick={{ fill: 'hsl(var(--foreground))' }}
                            />
                            <Tooltip
                                cursor={false}
                                content={<ChartTooltipContent 
                                    indicator="dot"
                                />} 
                            />
                            <Bar dataKey="volume" layout="vertical" radius={4}>
                                {chartData.map((entry) => (
                                    <Cell key={`cell-${entry.group}`} fill={MUSCLE_GROUP_COLORS_HEX[entry.group as keyof typeof MUSCLE_GROUP_COLORS_HEX] || '#8884d8'} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ChartContainer>
                </CardContent>
            </CollapsibleContent>
        </Card>
    </Collapsible>
);
