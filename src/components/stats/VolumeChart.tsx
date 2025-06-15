
    import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
    import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell, ResponsiveContainer } from 'recharts';
    import { ChartContainer, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart';
    import { BarChart as BarChartIcon } from 'lucide-react';
    
    const chartConfig = {
      volume: {
        label: "Volume",
      },
    } satisfies ChartConfig;
    
    const barColors = ["hsl(var(--accent-purple))", "hsl(var(--accent-blue))", "hsl(var(--accent-yellow))"];
    
    interface VolumeChartProps {
        chartData: { date: string; volume: number }[];
    }
    
    export const VolumeChart = ({ chartData }: VolumeChartProps) => (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                    <BarChartIcon className="h-5 w-5 text-accent-purple" />
                    Volume par séance (kg)
                </CardTitle>
            </CardHeader>
            <CardContent>
                <ChartContainer config={chartConfig} className="h-[250px] w-full">
                    <BarChart accessibilityLayer data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                        <CartesianGrid vertical={false} stroke="hsl(var(--muted-foreground) / 0.2)" />
                        <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={10} minTickGap={10} fontSize={12} />
                        <YAxis tickLine={false} axisLine={false} tickMargin={10} width={80} fontSize={12} />
                        <Tooltip
                            cursor={false}
                            content={<ChartTooltipContent 
                                indicator="dot"
                                hideLabel
                            />} 
                        />
                        <Bar dataKey="volume" radius={4}>
                            {chartData.map((_entry, index) => (
                                <Cell key={`cell-${index}`} fill={barColors[index % barColors.length]} />
                            ))}
                        </Bar>
                    </BarChart>
                </ChartContainer>
            </CardContent>
        </Card>
    );
    