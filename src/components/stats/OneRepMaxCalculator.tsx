
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Calculator, ChevronsUpDown } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { calculateEstimated1RM } from '@/utils/calculations';

export const OneRepMaxCalculator = () => {
    const [weight, setWeight] = useState<string>('');
    const [reps, setReps] = useState<string>('');
    const [result, setResult] = useState<number | null>(null);

    const handleCalculate = () => {
        const weightNum = parseFloat(weight);
        const repsNum = parseInt(reps);
        
        if (weightNum > 0 && repsNum > 0) {
            const estimated1RM = calculateEstimated1RM(weightNum, repsNum);
            setResult(estimated1RM);
        }
    };

    const handleReset = () => {
        setWeight('');
        setReps('');
        setResult(null);
    };

    return (
        <Collapsible defaultOpen={false}>
            <Card>
                <CollapsibleTrigger asChild>
                    <CardHeader className="cursor-pointer">
                        <div className="flex w-full items-center justify-between">
                            <CardTitle className="flex items-center gap-2 text-base">
                                <Calculator className="h-5 w-5 text-accent-red" />
                                Calculateur 1RM
                            </CardTitle>
                            <ChevronsUpDown className="h-4 w-4 shrink-0 text-muted-foreground" />
                        </div>
                    </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                    <CardHeader className="pt-0">
                        <CardDescription>
                            Calculez votre 1RM estimé en saisissant le poids et le nombre de répétitions.
                        </CardDescription>
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
                                    max="30"
                                />
                            </div>
                        </div>
                        
                        <div className="flex gap-2">
                            <Button 
                                onClick={handleCalculate} 
                                disabled={!weight || !reps}
                                className="flex-1"
                            >
                                Calculer
                            </Button>
                            <Button 
                                variant="outline" 
                                onClick={handleReset}
                                disabled={!weight && !reps && !result}
                            >
                                Reset
                            </Button>
                        </div>

                        {result && (
                            <div className="mt-4 p-4 bg-secondary/50 rounded-lg text-center">
                                <div className="text-sm text-muted-foreground mb-1">1RM Estimé</div>
                                <div className="text-2xl font-bold text-accent-red">
                                    {result.toLocaleString('fr-FR')} kg
                                </div>
                                <div className="text-xs text-muted-foreground mt-1">
                                    Basé sur {weight} kg × {reps} répétitions
                                </div>
                            </div>
                        )}
                    </CardContent>
                </CollapsibleContent>
            </Card>
        </Collapsible>
    );
};
