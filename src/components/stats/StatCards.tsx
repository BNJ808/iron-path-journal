
import StatCard from '@/components/StatCard';
import { Dumbbell, Repeat, TrendingUp, Clock, ChevronsUpDown, LayoutGrid } from 'lucide-react';
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
            <CollapsibleTrigger asChild>
                 <CardHeader className="cursor-pointer">
                    <div className="flex w-full items-center justify-between">
                        <CardTitle className="flex items-center gap-2 text-base">
                            <LayoutGrid className="h-5 w-5 text-accent-blue" />
                            Statistiques Générales
                        </CardTitle>
                        <ChevronsUpDown className="h-4 w-4 shrink-0 text-muted-foreground" />
                    </div>
                </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
                <CardContent>
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                        <StatCard title="Séances totales" value={totalWorkouts} icon={Dumbbell} />
                        <StatCard title="Volume total" value={`${totalVolume.toLocaleString('fr-FR')} kg`} icon={TrendingUp} />
                        <StatCard title="Séries totales" value={totalSets} icon={Repeat} />
                        <StatCard title="Durée moyenne" value={averageDuration > 0 ? `${Math.round(averageDuration)} min` : '-'} icon={Clock} />
                    </div>
                </CardContent>
            </CollapsibleContent>
        </Card>
    </Collapsible>
);
