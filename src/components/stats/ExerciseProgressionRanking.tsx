
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, TrendingUp, Calendar, Target } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface ExerciseProgression {
    exercise: string;
    progressionPercent: number;
    weightGain: number;
    sessions: number;
    firstMax: number;
    lastMax: number;
    timeSpan: number;
}

interface ExerciseProgressionRankingProps {
    progressions: ExerciseProgression[];
}

export const ExerciseProgressionRanking = ({ progressions }: ExerciseProgressionRankingProps) => {
    if (progressions.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                        <TrendingUp className="h-5 w-5 text-accent-green" />
                        Classement par Progression
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">
                        Effectuez plus d'entraînements pour voir votre classement de progression.
                    </p>
                </CardContent>
            </Card>
        );
    }

    const getRankIcon = (index: number) => {
        if (index === 0) return <Trophy className="h-4 w-4 text-yellow-500" />;
        if (index === 1) return <Trophy className="h-4 w-4 text-gray-400" />;
        if (index === 2) return <Trophy className="h-4 w-4 text-amber-600" />;
        return <span className="text-sm font-bold text-muted-foreground">#{index + 1}</span>;
    };

    const getProgressionColor = (percent: number) => {
        if (percent >= 20) return 'text-green-600';
        if (percent >= 10) return 'text-yellow-600';
        if (percent >= 0) return 'text-blue-600';
        return 'text-red-600';
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                    <TrendingUp className="h-5 w-5 text-accent-green" />
                    Classement par Progression
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    {progressions.slice(0, 10).map((prog, index) => (
                        <div key={index} className="flex items-center gap-3 p-2 rounded-lg bg-muted/30">
                            <div className="flex items-center justify-center w-8">
                                {getRankIcon(index)}
                            </div>
                            
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-1">
                                    <h4 className="font-medium text-sm truncate">{prog.exercise}</h4>
                                    <Badge 
                                        variant="outline" 
                                        className={`text-xs ${getProgressionColor(prog.progressionPercent)}`}
                                    >
                                        +{prog.progressionPercent}%
                                    </Badge>
                                </div>
                                
                                <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground mb-2">
                                    <div className="flex items-center gap-1">
                                        <Target className="h-3 w-3" />
                                        <span>+{prog.weightGain} kg</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Calendar className="h-3 w-3" />
                                        <span>{prog.sessions} séances</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <span>{prog.timeSpan} jours</span>
                                    </div>
                                </div>
                                
                                <div className="flex items-center gap-2 text-xs">
                                    <span>{prog.firstMax} kg</span>
                                    <Progress 
                                        value={Math.min(100, Math.max(0, prog.progressionPercent * 2))} 
                                        className="flex-1 h-1"
                                    />
                                    <span className="font-bold">{prog.lastMax} kg</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
};
