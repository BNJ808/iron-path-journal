
import StatCard from '@/components/StatCard';
import { AnimatedCard } from '@/components/AnimatedCard';
import { Dumbbell, Repeat, TrendingUp, Clock, ChevronDown, LayoutGrid } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface StatCardsProps {
    totalWorkouts: number;
    totalVolume: number;
    totalSets: number;
    averageDuration: number;
}

export const StatCards = ({ totalWorkouts, totalVolume, totalSets, averageDuration }: StatCardsProps) => (
    <Collapsible defaultOpen={false}>
        <Card>
            <CollapsibleTrigger className="flex w-full items-center justify-between text-left [&[data-state=open]>div>svg]:rotate-180">
                <CardHeader className="cursor-pointer flex-1">
                    <div className="flex w-full items-center justify-between">
                        <CardTitle className="flex items-center gap-2 text-base">
                            <LayoutGrid className="h-5 w-5 text-purple-500" />
                            Statistiques Générales
                        </CardTitle>
                        <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200" />
                    </div>
                </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
                <CardContent>
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                        <AnimatedCard index={0}><StatCard title="Séances totales" value={totalWorkouts} icon={Dumbbell} /></AnimatedCard>
                        <AnimatedCard index={1}><StatCard title="Volume total" value={`${totalVolume.toLocaleString('fr-FR')} kg`} icon={TrendingUp} /></AnimatedCard>
                        <AnimatedCard index={2}><StatCard title="Séries totales" value={totalSets} icon={Repeat} /></AnimatedCard>
                        <AnimatedCard index={3}><StatCard title="Durée moyenne" value={averageDuration > 0 ? `${Math.round(averageDuration)} min` : '-'} icon={Clock} /></AnimatedCard>
                    </div>
                </CardContent>
            </CollapsibleContent>
        </Card>
    </Collapsible>
);
