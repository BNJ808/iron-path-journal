
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { BarChart, ChevronsUpDown } from 'lucide-react';
import { MuscleGroupRadarChart } from './MuscleGroupRadarChart';

interface MuscleGroupStatsProps {
  volumeByMuscleGroup: { group: string; volume: number }[];
  muscleGroupStats: { chartData: { subject: string; sets: number }[]; maxSets: number };
}

export const MuscleGroupStats = ({ 
  volumeByMuscleGroup = [], 
  muscleGroupStats = { chartData: [], maxSets: 0 } 
}: MuscleGroupStatsProps) => {
  return (
    <div className="space-y-4">
      {/* Volume by Muscle Group */}
      <Collapsible defaultOpen={false}>
        <Card>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer">
              <div className="flex w-full items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-base">
                  <BarChart className="h-5 w-5 text-accent-blue" />
                  Volume par Groupe Musculaire
                </CardTitle>
                <ChevronsUpDown className="h-4 w-4 shrink-0 text-muted-foreground" />
              </div>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent>
              {volumeByMuscleGroup && volumeByMuscleGroup.length > 0 ? (
                <div className="space-y-2">
                  {volumeByMuscleGroup.slice(0, 5).map((item) => (
                    <div key={item.group} className="flex justify-between items-center p-2 rounded bg-secondary/30">
                      <span className="font-medium">{item.group}</span>
                      <span className="text-sm font-bold">{item.volume.toLocaleString('fr-FR')} kg</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Aucune donnée de volume disponible.</p>
              )}
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* Radar Chart */}
      <MuscleGroupRadarChart 
        data={muscleGroupStats?.chartData || []} 
        maxSets={muscleGroupStats?.maxSets || 0} 
      />
    </div>
  );
};
