
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Calculator, Info } from 'lucide-react';
import { useState } from 'react';
import { calculateEstimated1RM } from '@/utils/calculations';
import { Badge } from '@/components/ui/badge';

export const OneRMCalculator = () => {
    const [weight, setWeight] = useState<string>('');
    const [reps, setReps] = useState<string>('');
    const [result, setResult] = useState<number | null>(null);
    const [showDetails, setShowDetails] = useState(false);

    const handleCalculate = () => {
        const weightNum = parseFloat(weight);
        const repsNum = parseInt(reps);
        
        if (weightNum > 0 && repsNum > 0 && repsNum <= 20) {
            const estimated1RM = calculateEstimated1RM(weightNum, repsNum);
            setResult(estimated1RM);
            setShowDetails(true);
        }
    };

    const handleReset = () => {
        setWeight('');
        setReps('');
        setResult(null);
        setShowDetails(false);
    };

    const isValid = parseFloat(weight) > 0 && parseInt(reps) > 0 && parseInt(reps) <= 20;

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                    <Calculator className="h-5 w-5 text-accent-blue" />
                    Calculatrice 1RM
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="weight">Poids (kg)</Label>
                        <Input
                            id="weight"
                            type="number"
                            placeholder="Ex: 80"
                            value={weight}
                            onChange={(e) => setWeight(e.target.value)}
                            min="0"
                            step="0.5"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="reps">Répétitions</Label>
                        <Input
                            id="reps"
                            type="number"
                            placeholder="Ex: 8"
                            value={reps}
                            onChange={(e) => setReps(e.target.value)}
                            min="1"
                            max="20"
                        />
                    </div>
                </div>

                <div className="flex gap-2">
                    <Button 
                        onClick={handleCalculate} 
                        disabled={!isValid}
                        className="flex-1"
                    >
                        Calculer 1RM
                    </Button>
                    {(weight || reps || result) && (
                        <Button 
                            onClick={handleReset} 
                            variant="outline"
                            size="sm"
                        >
                            Reset
                        </Button>
                    )}
                </div>

                {result && showDetails && (
                    <div className="mt-4 p-4 bg-secondary/50 rounded-lg">
                        <div className="text-center mb-3">
                            <div className="text-2xl font-bold text-accent-blue">
                                {result} kg
                            </div>
                            <div className="text-sm text-muted-foreground">
                                1RM Estimé
                            </div>
                        </div>
                        
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span>Basé sur :</span>
                                <span>{weight} kg × {reps} reps</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span>Intensité :</span>
                                <Badge variant="outline">
                                    {Math.round((parseFloat(weight) / result) * 100)}% du 1RM
                                </Badge>
                            </div>
                        </div>
                        
                        <div className="mt-3 p-2 bg-muted/50 rounded text-xs text-muted-foreground flex items-start gap-2">
                            <Info className="h-3 w-3 mt-0.5 flex-shrink-0" />
                            <span>
                                Calcul basé sur les formules d'Epley, Brzycki et Lander. 
                                Plus précis pour 1-12 répétitions.
                            </span>
                        </div>
                    </div>
                )}

                {!result && (
                    <div className="text-center text-sm text-muted-foreground">
                        <Info className="h-4 w-4 mx-auto mb-2" />
                        Entrez un poids et un nombre de répétitions (1-20) pour calculer votre 1RM estimé.
                    </div>
                )}
            </CardContent>
        </Card>
    );
};
