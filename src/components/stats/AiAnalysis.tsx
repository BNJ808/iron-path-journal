
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { BrainCircuit, ChevronsUpDown } from 'lucide-react';

interface AiAnalysisProps {
  personalRecordsTimeline: any;
}

export const AiAnalysis = ({ personalRecordsTimeline }: AiAnalysisProps) => {
  return (
    <Collapsible defaultOpen={false}>
      <Card>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer">
            <div className="flex w-full items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-base">
                <BrainCircuit className="h-5 w-5 text-accent-purple" />
                Analyse IA
              </CardTitle>
              <ChevronsUpDown className="h-4 w-4 shrink-0 text-muted-foreground" />
            </div>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              L'analyse IA de vos performances sera bientôt disponible.
            </p>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
};
