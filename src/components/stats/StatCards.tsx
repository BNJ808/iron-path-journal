
    import StatCard from '@/components/StatCard';
    import { Dumbbell, Repeat, TrendingUp } from 'lucide-react';
    
    interface StatCardsProps {
        totalWorkouts: number;
        totalVolume: number;
        totalSets: number;
    }
    
    export const StatCards = ({ totalWorkouts, totalVolume, totalSets }: StatCardsProps) => (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <StatCard title="Séances totales" value={totalWorkouts} icon={Dumbbell} />
            <StatCard title="Volume total" value={`${totalVolume.toLocaleString('fr-FR')} kg`} icon={TrendingUp} />
            <StatCard title="Séries totales" value={totalSets} icon={Repeat} />
        </div>
    );
    