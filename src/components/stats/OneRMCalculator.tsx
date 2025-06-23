
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Calculator, ChevronDown } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { calculateEstimated1RM } from '@/utils/calculations';

export const OneRMCalculator = () => {
    const [weight, setWeight] = useState<string>('');
    const [reps, setReps] = useState<string>('');
    const [result, setResult] = useState<number | null>(null);
    const [formulaUsed, setFormulaUsed] = useState<string>('');

    const calculateOneRM = () => {
        const w = parseFloat(weight);
        const r = parseInt(reps);
        
        if (w > 0 && r > 0 && r <= 20) {
            const oneRM = calculateEstimated1RM(w, r);
            setResult(oneRM);
            
            // Déterminer quelle formule est principalement utilisée
            if (r === 1) {
                setFormulaUsed('Poids réel (1 répétition)');
            } else if (r <= 6) {
                setFormulaUsed('Moyenne de Epley, Brzycki et Lander (optimale pour 2-6 reps)');
            } else if (r <= 10) {
                setFormulaUsed('Formule de Epley (recommandée pour 7-10 reps)');
            } else {
                setFormulaUsed('Formule de Epley (estimation approximative pour >10 reps)');
            }
        } else {
            setResult(null);
            setFormulaUsed('');
        }
    };

    const handleReset = () => {
        setWeight('');
        setReps('');
        setResult(null);
        setFormulaUsed('');
    };

    return (
        <Collapsible defaultOpen={false}>
            <Card>
                <CollapsibleTrigger className="flex w-full items-center justify-between text-left [&[data-state=open]>div>svg]:rotate-180">
                    <CardHeader className="cursor-pointer flex-1">
                        <div className="flex w-full items-center justify-between">
                            <CardTitle className="flex items-center gap-2 text-base">
                                <Calculator className="h-5 w-5 text-orange-500" />
                                Calculateur 1RM
                            </CardTitle>
                            <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200" />
                        </div>
                    </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                    <CardHeader className="pt-0">
                        <CardDescription>
                            Calculez votre maximum théorique sur une répétition (1RM) avec des formules adaptées au nombre de répétitions.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="weight">Poids (kg)</Label>
                                <Input
                                    id="weight"
                                    type="number"
                                    placeholder="80"
                                    value={weight}
                                    onChange={(e) => setWeight(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="reps">Répétitions</Label>
                                <Input
                                    id="reps"
                                    type="number"
                                    placeholder="8"
                                    value={reps}
                                    onChange={(e) => setReps(e.target.value)}
                                    max="20"
                                />
                            </div>
                        </div>
                        
                        <div className="flex gap-2">
                            <Button onClick={calculateOneRM} className="flex-1">
                                Calculer
                            </Button>
                            <Button onClick={handleReset} variant="outline">
                                Reset
                            </Button>
                        </div>
                        
                        {result && (
                            <div className="mt-4 p-4 bg-primary/10 rounded-lg text-center">
                                <p className="text-sm text-muted-foreground mb-1">Votre 1RM estimé</p>
                                <p className="text-2xl font-bold text-primary">{result} kg</p>
                                <p className="text-xs text-muted-foreground mt-1">
                                    {formulaUsed}
                                </p>
                            </div>
                        )}
                        
                        <div className="text-xs text-muted-foreground space-y-1">
                            <p><strong>Formules utilisées :</strong></p>
                            <p>• <strong>2-6 reps</strong> : Moyenne de Epley, Brzycki et Lander (plus précise)</p>
                            <p>• <strong>7-10 reps</strong> : Formule de Epley (recommandée)</p>
                            <p>• <strong>11+ reps</strong> : Formule de Epley (estimation moins fiable)</p>
                        </div>
                    </CardContent>
                </CollapsibleContent>
            </Card>
        </Collapsible>
    );
};
