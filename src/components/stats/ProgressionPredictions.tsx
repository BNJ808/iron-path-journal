
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Minus, Brain, ChevronDown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useState } from 'react';

interface ProgressionPrediction {
    exercise: string;
    currentMax: number;
    predicted1Month: number;
    predicted3Months: number;
    trend: 'ascending' | 'descending' | 'stable';
    confidence: number;
}

interface ProgressionPredictionsProps {
    predictions: ProgressionPrediction[];
}

export const ProgressionPredictions = ({ predictions = [] }: ProgressionPredictionsProps) => {
    const [isExpanded, setIsExpanded] = useState(false);

    if (!predictions || predictions.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                        <Brain className="h-5 w-5 text-accent-purple" />
                        Prédictions de Progression
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">
                        Effectuez plus d'entraînements pour obtenir des prédictions de progression.
                    </p>
                </CardContent>
            </Card>
        );
    }

    const getTrendIcon = (trend: string) => {
        switch (trend) {
            case 'ascending': return <TrendingUp className="h-4 w-4 text-green-500" />;
            case 'descending': return <TrendingDown className="h-4 w-4 text-red-500" />;
            default: return <Minus className="h-4 w-4 text-yellow-500" />;
        }
    };

    const getTrendColor = (trend: string) => {
        switch (trend) {
            case 'ascending': return 'text-green-600';
            case 'descending': return 'text-red-600';
            default: return 'text-yellow-600';
        }
    };

    const displayedPredictions = isExpanded ? predictions : predictions.slice(0, 3);

    return (
        <Card>
            <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
                <CardHeader>
                    <CollapsibleTrigger className="flex w-full items-center justify-between text-left [&[data-state=open]>svg]:rotate-180">
                        <CardTitle className="flex items-center gap-2 text-base">
                            <Brain className="h-5 w-5 text-accent-purple" />
                            Prédictions de Progression
                        </CardTitle>
                        <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200" />
                    </CollapsibleTrigger>
                </CardHeader>
                <CollapsibleContent>
                    <CardContent>
                        <div className="space-y-4">
                            {displayedPredictions.map((prediction, index) => (
                                <div key={index} className="border rounded-lg p-3">
                                    <div className="flex items-center justify-between mb-2">
                                        <h4 className="font-medium text-sm truncate">{prediction.exercise}</h4>
                                        <div className="flex items-center gap-1">
                                            {getTrendIcon(prediction.trend)}
                                            <Badge variant="outline" className="text-xs">
                                                {prediction.confidence}% confiance
                                            </Badge>
                                        </div>
                                    </div>
                                    
                                    <div className="grid grid-cols-3 gap-2 text-xs mb-2">
                                        <div className="text-center">
                                            <div className="text-muted-foreground">Actuel</div>
                                            <div className="font-bold">{prediction.currentMax} kg</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-muted-foreground">1 mois</div>
                                            <div className={`font-bold ${getTrendColor(prediction.trend)}`}>
                                                {Math.round(prediction.predicted1Month)} kg
                                            </div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-muted-foreground">3 mois</div>
                                            <div className={`font-bold ${getTrendColor(prediction.trend)}`}>
                                                {Math.round(prediction.predicted3Months)} kg
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="space-y-1">
                                        <div className="flex justify-between text-xs">
                                            <span>Progression 1M</span>
                                            <span>{Math.round(((prediction.predicted1Month - prediction.currentMax) / prediction.currentMax) * 100)}%</span>
                                        </div>
                                        <Progress 
                                            value={Math.min(100, Math.max(0, prediction.confidence))} 
                                            className="h-1"
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </CollapsibleContent>
            </Collapsible>
        </Card>
    );
};
