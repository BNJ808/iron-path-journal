
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trophy, LineChart as LineChartIcon } from 'lucide-react';

interface PersonalRecord {
    weight: number;
    reps: number;
}

interface PersonalRecordsProps {
    personalRecords: { [key: string]: PersonalRecord };
    onViewProgression: (exerciseName: string) => void;
}

export const PersonalRecords = ({ personalRecords, onViewProgression }: PersonalRecordsProps) => {
    if (Object.keys(personalRecords).length === 0) {
        return null;
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                    <Trophy className="h-5 w-5 text-accent-yellow" />
                    Records Personnels (Poids max)
                </CardTitle>
            </CardHeader>
            <CardContent>
                <ul className="space-y-2">
                    {Object.entries(personalRecords)
                        .sort(([a], [b]) => a.localeCompare(b))
                        .map(([exercise, pr]) => (
                            <li key={exercise} className="flex justify-between items-center text-sm">
                                <span>{exercise}</span>
                                <div className="flex items-center gap-2">
                                  <span className="font-bold">{pr.weight} kg x {pr.reps}</span>
                                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onViewProgression(exercise)}>
                                      <LineChartIcon className="h-4 w-4" />
                                  </Button>
                                </div>
                            </li>
                    ))}
                </ul>
            </CardContent>
        </Card>
    );
};
