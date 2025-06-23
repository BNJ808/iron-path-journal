
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

export const VolumeChart = ({ chartData }: VolumeChartProps) => {
    if (chartData.length === 0) {
        return null;
    }

    return (
        <Collapsible defaultOpen={false}>
            <Card>
                <CollapsibleTrigger className="flex w-full items-center justify-between text-left [&[data-state=open]>div>svg]:rotate-180">
                    <CardHeader className="cursor-pointer flex-1">
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
                    <CardContent>
                        <ChartContainer config={chartConfig} className="h-[300px] w-full">
                            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted-foreground))" opacity={0.3} />
                                <XAxis 
                                    dataKey="group" 
                                    tick={{ fontSize: 12, fill: "hsl(var(--foreground))" }}
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <YAxis 
                                    tick={{ fontSize: 12, fill: "hsl(var(--foreground))" }}
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <ChartTooltip content={<ChartTooltipContent />} />
                                <Bar 
                                    dataKey="volume" 
                                    radius={[4, 4, 0, 0]}
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
