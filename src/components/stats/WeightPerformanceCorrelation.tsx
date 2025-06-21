
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, TrendingUp, TrendingDown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { ScatterChart, Scatter, XAxis, YAxis, ResponsiveContainer } from 'recharts';

interface CorrelationData {
    exercise: string;
    correlation: number;
    significance: 'forte' | 'modérée' | 'faible';
    dataPoints: Array<{ bodyWeight: number; performance: number; date: string }>;
}

interface WeightPerformanceCorrelationProps {
    correlations: CorrelationData[] | null;
}

export const WeightPerformanceCorrelation = ({ correlations }: WeightPerformanceCorrelationProps) => {
    if (!correlations || correlations.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                        <Activity className="h-5 w-5 text-accent-blue" />
                        Poids Corporel vs Performance
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">
                        Ajoutez des mesures de poids corporel pour analyser les corrélations avec vos performances.
                    </p>
                </CardContent>
            </Card>
        );
    }

    const getSignificanceColor = (significance: string) => {
        switch (significance) {
            case 'forte': return 'bg-green-500';
            case 'modérée': return 'bg-yellow-500';
            default: return 'bg-gray-500';
        }
    };

    const getCorrelationText = (correlation: number) => {
        if (correlation > 0.3) return "Corrélation positive";
        if (correlation < -0.3) return "Corrélation négative";
        return "Peu de corrélation";
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                    <Activity className="h-5 w-5 text-accent-blue" />
                    Poids Corporel vs Performance
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {correlations.slice(0, 4).map((corr, index) => (
                        <div key={index} className="border rounded-lg p-3">
                            <div className="flex items-center justify-between mb-3">
                                <h4 className="font-medium text-sm truncate">{corr.exercise}</h4>
                                <div className="flex items-center gap-2">
                                    {corr.correlation > 0 ? (
                                        <TrendingUp className="h-4 w-4 text-green-500" />
                                    ) : (
                                        <TrendingDown className="h-4 w-4 text-red-500" />
                                    )}
                                    <Badge 
                                        variant="outline" 
                                        className={`text-xs ${getSignificanceColor(corr.significance)}`}
                                    >
                                        {corr.significance}
                                    </Badge>
                                </div>
                            </div>
                            
                            <div className="mb-2">
                                <div className="flex justify-between text-xs mb-1">
                                    <span>{getCorrelationText(corr.correlation)}</span>
                                    <span>r = {Math.round(corr.correlation * 100) / 100}</span>
                                </div>
                            </div>

                            {corr.dataPoints.length >= 3 && (
                                <div className="h-24">
                                    <ChartContainer
                                        config={{
                                            performance: {
                                                label: "Performance (kg)",
                                                color: "hsl(var(--chart-1))",
                                            }
                                        }}
                                    >
                                        <ResponsiveContainer width="100%" height="100%">
                                            <ScatterChart data={corr.dataPoints}>
                                                <XAxis 
                                                    type="number" 
                                                    dataKey="bodyWeight"
                                                    name="Poids corporel"
                                                    unit="kg"
                                                    fontSize={10}
                                                />
                                                <YAxis 
                                                    type="number" 
                                                    dataKey="performance"
                                                    name="Performance"
                                                    unit="kg"
                                                    fontSize={10}
                                                />
                                                <ChartTooltip
                                                    content={<ChartTooltipContent />}
                                                    formatter={(value, name) => [
                                                        `${value} kg`,
                                                        name === 'bodyWeight' ? 'Poids corporel' : 'Performance'
                                                    ]}
                                                />
                                                <Scatter 
                                                    dataKey="performance" 
                                                    fill="hsl(var(--chart-1))"
                                                    name="Performance"
                                                />
                                            </ScatterChart>
                                        </ResponsiveContainer>
                                    </ChartContainer>
                                </div>
                            )}
                            
                            <div className="text-xs text-muted-foreground mt-2">
                                {corr.dataPoints.length} points de données
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
};
