
import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lightbulb, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';

interface AiAnalysisCardProps {
  title: string;
  type: 'general';
  data: any;
}

export const AiAnalysisCard = ({ title, type, data }: AiAnalysisCardProps) => {
  const [analysis, setAnalysis] = useState<string | null>(null);

  const { mutate, isPending } = useMutation({
    mutationFn: async () => {
      const { data: responseData, error } = await supabase.functions.invoke('get-ai-analysis', {
        body: { type, data },
      });

      if (error) throw new Error(error.message);
      if (responseData.error) throw new Error(responseData.error);

      return responseData;
    },
    onSuccess: (responseData) => {
      setAnalysis(responseData.analysis);
      toast.success("Analyse IA générée !");
    },
    onError: (error) => {
      toast.error(`Erreur de l'analyse IA: ${error.message}`);
      setAnalysis(null);
    },
  });

  const handleGetAnalysis = () => {
    if (analysis) {
        setAnalysis(null);
        setTimeout(() => mutate(), 100);
    } else {
        mutate();
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <div className="flex items-center gap-2 text-base">
            <Lightbulb className="h-5 w-5 text-accent-yellow" />
            {title}
          </div>
          <Button onClick={handleGetAnalysis} disabled={isPending} size="sm">
            {isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
                analysis ? 'Rafraîchir' : 'Générer'
            )}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isPending && (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        )}
        {analysis && (
            <div className="prose prose-invert prose-sm max-w-none">
                <ReactMarkdown>{analysis}</ReactMarkdown>
            </div>
        )}
        {!analysis && !isPending && (
            <p className="text-sm text-muted-foreground">Cliquez sur "Générer" pour obtenir une analyse de vos performances par l'IA.</p>
        )}
      </CardContent>
    </Card>
  );
};

