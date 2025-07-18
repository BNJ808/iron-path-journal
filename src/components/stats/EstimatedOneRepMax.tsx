
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TrendingUp, BarChart2, ChevronDown } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface EstimatedOneRepMaxProps {
    records: { exerciseName: string, estimated1RM: number }[];
    onViewProgression: (exerciseName: string) => void;
}

export const EstimatedOneRepMax = ({ records, onViewProgression }: EstimatedOneRepMaxProps) => {
    return (
        <Collapsible defaultOpen={false}>
            <Card>
                <CollapsibleTrigger className="flex w-full items-center justify-between text-left [&[data-state=open]>div>svg]:rotate-180">
                    <CardHeader className="cursor-pointer flex-1">
                        <div className="flex w-full items-center justify-between">
                            <CardTitle className="flex items-center gap-2 text-base">
                                <TrendingUp className="h-5 w-5 text-accent-red" />
                                1RM Estimé (Top 5)
                            </CardTitle>
                            <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200" />
                        </div>
                    </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                    <CardHeader className="pt-0">
                        <CardDescription>
                            Votre force maximale estimée sur une répétition, basée sur vos meilleures performances.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {records.length === 0 ? (
                            <p className="text-sm text-muted-foreground">Aucune donnée pour estimer le 1RM. Complétez des séries pour voir vos résultats.</p>
                        ) : (
                            <ul className="space-y-3">
                                {records.slice(0, 5).map(({ exerciseName, estimated1RM }) => (
                                    <li key={exerciseName} className="flex items-center justify-between gap-4 p-2 rounded-lg bg-secondary/50">
                                        <span className="font-medium text-foreground truncate">{exerciseName}</span>
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-lg text-accent-red">{estimated1RM.toLocaleString('fr-FR')} kg</span>
                                            <Button size="sm" variant="ghost" onClick={() => onViewProgression(exerciseName)} className="text-muted-foreground hover:text-foreground">
                                                <BarChart2 className="h-4 w-4 mr-1" />
                                                Voir
                                            </Button>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </CardContent>
                </CollapsibleContent>
            </Card>
        </Collapsible>
    );
};
