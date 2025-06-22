
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trophy, LineChart as LineChartIcon, ChevronDown, Calendar } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';

interface PersonalRecord {
    weight: number;
    reps: number;
}

interface TimelineRecord {
    date: string;
    displayDate: string;
    exercise: string;
    weight: number;
    reps: number;
    isNewRecord: boolean;
}

interface InteractivePersonalRecordsProps {
    personalRecords: { [key: string]: PersonalRecord };
    timeline: TimelineRecord[];
    onViewProgression: (exerciseName: string) => void;
}

export const InteractivePersonalRecords = ({ 
    personalRecords, 
    timeline, 
    onViewProgression 
}: InteractivePersonalRecordsProps) => {
    const [viewMode, setViewMode] = useState<'records' | 'timeline'>('records');

    if (Object.keys(personalRecords).length === 0) {
        return null;
    }

    return (
        <Collapsible defaultOpen={false}>
            <Card>
                <CollapsibleTrigger asChild>
                    <CardHeader className="cursor-pointer">
                        <div className="flex items-center justify-between">
                            <CardTitle className="flex items-center gap-2 text-base">
                                <Trophy className="h-5 w-5 text-accent-yellow" />
                                Records Personnels
                            </CardTitle>
                            <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 data-[state=open]:rotate-180" />
                        </div>
                    </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                    <CardContent>
                        <div className="flex gap-2 mb-4">
                            <Button
                                variant={viewMode === 'records' ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setViewMode('records')}
                            >
                                <Trophy className="h-4 w-4 mr-1" />
                                Records
                            </Button>
                            <Button
                                variant={viewMode === 'timeline' ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setViewMode('timeline')}
                            >
                                <Calendar className="h-4 w-4 mr-1" />
                                Timeline
                            </Button>
                        </div>

                        {viewMode === 'records' ? (
                            <ul className="space-y-2">
                                {Object.entries(personalRecords)
                                    .sort(([a], [b]) => a.localeCompare(b))
                                    .map(([exercise, pr]) => (
                                        <li key={exercise} className="flex justify-between items-center text-sm">
                                            <span className="truncate mr-2">{exercise}</span>
                                            <div className="flex items-center gap-2 flex-shrink-0">
                                                <span className="font-bold">{pr.weight} kg x {pr.reps}</span>
                                                <Button 
                                                    variant="ghost" 
                                                    size="icon" 
                                                    className="h-8 w-8" 
                                                    onClick={() => onViewProgression(exercise)}
                                                >
                                                    <LineChartIcon className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </li>
                                ))}
                            </ul>
                        ) : (
                            <div className="space-y-3 max-h-64 overflow-y-auto">
                                {timeline.slice(0, 20).map((record, index) => (
                                    <div key={index} className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
                                        <div className="flex items-center gap-3">
                                            <div className="w-2 h-2 rounded-full bg-accent-yellow"></div>
                                            <div>
                                                <div className="font-medium text-sm">{record.exercise}</div>
                                                <div className="text-xs text-muted-foreground">{record.displayDate}</div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Badge variant="secondary" className="text-xs">
                                                {record.weight} kg × {record.reps}
                                            </Badge>
                                            <Button 
                                                variant="ghost" 
                                                size="icon" 
                                                className="h-6 w-6"
                                                onClick={() => onViewProgression(record.exercise)}
                                            >
                                                <LineChartIcon className="h-3 w-3" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                                {timeline.length > 20 && (
                                    <div className="text-center text-sm text-muted-foreground">
                                        Et {timeline.length - 20} autres records...
                                    </div>
                                )}
                            </div>
                        )}
                    </CardContent>
                </CollapsibleContent>
            </Card>
        </Collapsible>
    );
};
