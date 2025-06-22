
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ChevronDown, Crystal, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface Prediction {
    exercise: string;
    currentMax: number;
    predicted1Month: number;
    predicted3Months: number;
    trend: 'ascending' | 'descending' | 'stable';
    confidence: number;
}

interface ProgressionPredictionsProps {
    predictions: Prediction[];
}

export const ProgressionPredictions = ({ predictions }: ProgressionPredictionsProps) => {
    if (predictions.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                        <Crystal className="h-5 w-5 text-amber-500" />
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
            case 'ascending':
                return <TrendingUp className="h-3 w-3 text-green-500" />;
            case 'descending':
                return <TrendingDown className="h-3 w-3 text-red-500" />;
            default:
                return <Minus className="h-3 w-3 text-gray-500" />;
        }
    };

    const getConfidenceColor = (confidence: number) => {
        if (confidence >= 80) return 'bg-green-500';
        if (confidence >= 60) return 'bg-yellow-500';
        return 'bg-red-500';
    };

    return (
        <Collapsible defaultOpen={false}>
            <Card>
                <CollapsibleTrigger className="flex w-full items-center justify-between text-left [&[data-state=open]>div>svg]:rotate-180">
                    <CardHeader className="cursor-pointer flex-1">
                        <div className="flex w-full items-center justify-between">
                            <CardTitle className="flex items-center gap-2 text-base">
                                <Crystal className="h-5 w-5 text-amber-500" />
                                Prédictions de Progression
                            </CardTitle>
                            <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200" />
                        </div>
                    </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                    <CardHeader className="pt-0">
                        <CardDescription>
                            Prédictions basées sur vos performances récentes et tendances.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {predictions.slice(0, 5).map((prediction, index) => (
                                <div key={index} className="p-3 rounded-lg bg-muted/30 space-y-2">
                                    <div className="flex items-center justify-between">
                                        <h4 className="font-medium text-sm">{prediction.exercise}</h4>
                                        <div className="flex items-center gap-2">
                                            {getTrendIcon(prediction.trend)}
                                            <Badge variant="secondary" className="text-xs">
                                                {prediction.currentMax} kg
                                            </Badge>
                                        </div>
                                    </div>
                                    
                                    <div className="grid grid-cols-2 gap-3 text-xs">
                                        <div>
                                            <span className="text-muted-foreground">1 mois:</span>
                                            <span className="ml-1 font-bold">{prediction.predicted1Month} kg</span>
                                        </div>
                                        <div>
                                            <span className="text-muted-foreground">3 mois:</span>
                                            <span className="ml-1 font-bold">{prediction.predicted3Months} kg</span>
                                        </div>
                                    </div>
                                    
                                    <div className="space-y-1">
                                        <div className="flex items-center justify-between text-xs">
                                            <span className="text-muted-foreground">Confiance</span>
                                            <span>{prediction.confidence}%</span>
                                        </div>
                                        <Progress 
                                            value={prediction.confidence} 
                                            className="h-1" 
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </CollapsibleContent>
            </Card>
        </Collapsible>
    );
};
