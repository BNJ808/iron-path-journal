
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const PRESET_DURATIONS = [
  { label: '30s', value: 30 },
  { label: '1m', value: 60 },
  { label: '1m 30s', value: 90 },
  { label: '2m', value: 120 },
  { label: '3m', value: 180 },
];

interface TimerPresetsProps {
  currentDuration: number;
  onDurationSelect: (duration: number) => void;
}

export const TimerPresets = ({ currentDuration, onDurationSelect }: TimerPresetsProps) => {
  return (
    <div className="text-center">
      <p className="text-muted-foreground mb-4">Choisissez une durée prédéfinie :</p>
      <div className="flex flex-wrap justify-center gap-2 mb-8">
        {PRESET_DURATIONS.map(({ label, value }) => (
          <Button
            key={value}
            variant={currentDuration === value ? 'default' : 'outline'}
            onClick={() => onDurationSelect(value)}
            className={cn(
              'rounded-xl',
              currentDuration === value && 'bg-accent-green hover:bg-accent-green/90 text-primary-foreground border-accent-green'
            )}
          >
            {label}
          </Button>
        ))}
      </div>
    </div>
  );
};
