
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Cell } from 'recharts';
import { BarChart3, ChevronDown } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { MUSCLE_GROUP_COLORS_HEX } from '@/data/exercises';

interface VolumeChartProps {
    chartData: { group: string; volume: number }[];
}

const chartConfig = {
    volume: {
        label: "Volume (kg)",
        color: "hsl(var(--chart-1))",
    },
};

// Custom tooltip component
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
                                Volume (kg)
                            </span>
                            <span className="font-mono font-medium tabular-nums text-foreground">
                                {value}
                            </span>
                        </div>
                    </div>
                    <div className="text-muted-foreground text-xs">
                        {muscleGroup}
                    </div>
                </div>
            </div>
        );
    }
    return null;
};

export const VolumeChart = ({ chartData }: VolumeChartProps) => {
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
                                <BarChart3 className="h-5 w-5 text-emerald-500" />
                                Volume par Groupe Musculaire
                            </CardTitle>
                            <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200" />
                        </div>
                    </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                    <CardContent className="pt-0 pb-1 pl-6">
                        <ChartContainer config={chartConfig} className="h-[280px] w-full">
                            <BarChart 
                                data={chartData} 
                                margin={{ top: 10, right: 5, left: 5, bottom: 20 }}
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
                                    height={30}
                                    interval={0}
                                />
                                <YAxis 
                                    tick={{ fontSize: 11, fill: "hsl(var(--foreground))" }}
                                    axisLine={false}
                                    tickLine={false}
                                    width={30}
                                />
                                <ChartTooltip content={<CustomTooltipContent />} />
                                <Bar 
                                    dataKey="volume" 
                                    radius={[6, 6, 0, 0]}
                                    maxBarSize={80}
                                >
                                    {chartData.map((entry, index) => (
                                        <Cell 
                                            key={`cell-${index}`} 
                                            fill={MUSCLE_GROUP_COLORS_HEX[entry.group] || MUSCLE_GROUP_COLORS_HEX['Autres']} 
                                        />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ChartContainer>
                    </CardContent>
                </CollapsibleContent>
            </Card>
        </Collapsible>
    );
};
