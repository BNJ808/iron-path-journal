
import StatCard from '@/components/StatCard';
import { Dumbbell, Repeat, TrendingUp, Clock } from 'lucide-react';

interface StatCardsProps {
    totalWorkouts: number;
    totalVolume: number;
    totalSets: number;
    averageDuration: number;
}

export const StatCards = ({ totalWorkouts, totalVolume, totalSets, averageDuration }: StatCardsProps) => (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Séances totales" value={totalWorkouts} icon={Dumbbell} />
        <StatCard title="Volume total" value={`${totalVolume.toLocaleString('fr-FR')} kg`} icon={TrendingUp} />
        <StatCard title="Séries totales" value={totalSets} icon={Repeat} />
        <StatCard title="Durée moyenne" value={averageDuration > 0 ? `${Math.round(averageDuration)} min` : '-'} icon={Clock} />
    </div>
);
