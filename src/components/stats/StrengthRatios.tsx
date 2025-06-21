
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Scale, CheckCircle, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface StrengthRatio {
    name: string;
    ratio: number;
    exercise1: string;
    exercise2: string;
    weight1: number;
    weight2: number;
    status: 'équilibré' | 'déséquilibré' | 'normal';
}

interface StrengthRatiosProps {
    ratios: StrengthRatio[];
}

export const StrengthRatios = ({ ratios }: StrengthRatiosProps) => {
    if (ratios.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                        <Scale className="h-5 w-5 text-accent-orange" />
                        Ratios de Force
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">
                        Effectuez des exercices de base (squat, développé couché, soulevé de terre) pour analyser vos ratios de force.
                    </p>
                </CardContent>
            </Card>
        );
    }

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'équilibré': return <CheckCircle className="h-4 w-4 text-green-500" />;
            case 'déséquilibré': return <AlertTriangle className="h-4 w-4 text-red-500" />;
            default: return <CheckCircle className="h-4 w-4 text-blue-500" />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'équilibré': return 'bg-green-100 text-green-800 border-green-200';
            case 'déséquilibré': return 'bg-red-100 text-red-800 border-red-200';
            default: return 'bg-blue-100 text-blue-800 border-blue-200';
        }
    };

    const getIdealRange = (name: string) => {
        if (name.includes('Squat / Développé')) return '1.2 - 1.5';
        if (name.includes('Soulevé de terre / Développé')) return '1.3 - 1.6';
        if (name.includes('Développé couché / Développé militaire')) return '1.4 - 1.8';
        return 'Variable';
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                    <Scale className="h-5 w-5 text-accent-orange" />
                    Ratios de Force
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {ratios.map((ratio, index) => (
                        <div key={index} className="border rounded-lg p-3">
                            <div className="flex items-center justify-between mb-3">
                                <h4 className="font-medium text-sm">{ratio.name}</h4>
                                <div className="flex items-center gap-2">
                                    {getStatusIcon(ratio.status)}
                                    <Badge className={`text-xs ${getStatusColor(ratio.status)}`}>
                                        {ratio.status}
                                    </Badge>
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-3 mb-3">
                                <div className="text-center p-2 bg-muted/30 rounded">
                                    <div className="text-xs text-muted-foreground">{ratio.exercise1}</div>
                                    <div className="font-bold">{ratio.weight1} kg</div>
                                </div>
                                <div className="text-center p-2 bg-muted/30 rounded">
                                    <div className="text-xs text-muted-foreground">{ratio.exercise2}</div>
                                    <div className="font-bold">{ratio.weight2} kg</div>
                                </div>
                            </div>
                            
                            <div className="text-center mb-2">
                                <div className="text-lg font-bold text-primary">
                                    {ratio.ratio}:1
                                </div>
                                <div className="text-xs text-muted-foreground">
                                    Idéal: {getIdealRange(ratio.name)}
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-2">
                                <span className="text-xs">{ratio.exercise2}</span>
                                <Progress 
                                    value={Math.min(100, (ratio.weight2 / ratio.weight1) * 100)} 
                                    className="flex-1 h-1"
                                />
                                <span className="text-xs">{ratio.exercise1}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
};
