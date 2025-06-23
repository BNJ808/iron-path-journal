
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Cell, Tooltip } from 'recharts';
import { BarChart3, ChevronDown } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { MUSCLE_GROUP_COLORS_HEX } from '@/data/exercises';

interface VolumeChartProps {
    chartData: { group: string; volume: number }[];
}

export const VolumeChart = ({ chartData }: VolumeChartProps) => {
    console.log('=== VOLUME CHART DEBUG ===');
    console.log('VolumeChart received chartData:', chartData);
    console.log('ChartData length:', chartData?.length || 0);

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
                    <CardContent className="pt-6">
                        <div className="mb-4 text-sm text-muted-foreground">
                            Affichage de {filteredData.length} groupe(s) musculaire(s)
                        </div>
                        <div className="w-full h-[400px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart 
                                    data={filteredData} 
                                    layout="horizontal"
                                    margin={{ top: 20, right: 30, left: 80, bottom: 20 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                                    <XAxis 
                                        type="number"
                                        fontSize={12}
                                    />
                                    <YAxis 
                                        type="category"
                                        dataKey="group" 
                                        fontSize={12}
                                        width={70}
                                    />
                                    <Tooltip 
                                        formatter={(value, name) => [`${value} kg`, 'Volume']}
                                        labelFormatter={(label) => label}
                                        contentStyle={{
                                            backgroundColor: 'hsl(var(--background))',
                                            border: '1px solid hsl(var(--border))',
                                            borderRadius: '8px',
                                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                                        }}
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
                        </div>
                    </CardContent>
                </CollapsibleContent>
            </Card>
        </Collapsible>
    );
};
