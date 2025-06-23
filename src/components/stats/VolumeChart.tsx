
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
    console.log('=== VOLUME CHART DEBUG ===');
    console.log('VolumeChart received chartData:', chartData);
    console.log('ChartData length:', chartData?.length || 0);
    console.log('ChartData entries:', chartData);

    if (!chartData || chartData.length === 0) {
        console.log('❌ No chart data provided');
        return (
            <Collapsible defaultOpen={true}>
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
                            <div className="flex items-center justify-center h-32 text-muted-foreground">
                                Aucune donnée disponible
                            </div>
                        </CardContent>
                    </CollapsibleContent>
                </Card>
            </Collapsible>
        );
    }

    // Filtrer les données avec un volume > 0 pour l'affichage
    const filteredData = chartData.filter(item => {
        console.log(`🔍 Filtering item:`, item, `Volume: ${item.volume}, Type: ${typeof item.volume}`);
        return item.volume > 0;
    });
    
    console.log('📊 Filtered data:', filteredData);
    console.log('📊 Filtered data length:', filteredData.length);

    if (filteredData.length === 0) {
        console.log('❌ No data with volume > 0');
        return (
            <Collapsible defaultOpen={true}>
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
                            <div className="flex items-center justify-center h-32 text-muted-foreground">
                                <div className="text-center">
                                    <p>Aucun volume enregistré pour cette période</p>
                                    <p className="text-xs mt-2">Données reçues: {chartData.length} groupes</p>
                                </div>
                            </div>
                        </CardContent>
                    </CollapsibleContent>
                </Card>
            </Collapsible>
        );
    }

    console.log('✅ Rendering chart with data:', filteredData);

    return (
        <Collapsible defaultOpen={true}>
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
                        <div className="mb-4 text-sm text-muted-foreground">
                            Affichage de {filteredData.length} groupe(s) musculaire(s)
                        </div>
                        <ChartContainer config={chartConfig} className="h-[400px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart 
                                    data={filteredData} 
                                    layout="horizontal"
                                    margin={{ top: 10, right: 20, left: 10, bottom: 10 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted-foreground))" opacity={0.3} />
                                    <XAxis 
                                        type="number"
                                        tick={{ fontSize: 11, fill: "hsl(var(--foreground))" }}
                                        axisLine={false}
                                        tickLine={false}
                                    />
                                    <YAxis 
                                        type="category"
                                        dataKey="group" 
                                        tick={{ fontSize: 10, fill: "hsl(var(--foreground))" }}
                                        axisLine={false}
                                        tickLine={false}
                                        width={60}
                                    />
                                    <ChartTooltip 
                                        content={<ChartTooltipContent 
                                            formatter={(value) => [`${value} kg`, 'Volume']}
                                            labelFormatter={(label) => label}
                                        />} 
                                    />
                                    <Bar 
                                        dataKey="volume" 
                                        radius={[0, 4, 4, 0]}
                                    >
                                        {filteredData.map((entry, index) => (
                                            <Cell 
                                                key={`cell-${index}`} 
                                                fill={MUSCLE_GROUP_COLORS_HEX[entry.group] || MUSCLE_GROUP_COLORS_HEX['Autres']} 
                                            />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </ChartContainer>
                    </CardContent>
                </CollapsibleContent>
            </Card>
        </Collapsible>
    );
};
