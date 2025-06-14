
import { Skeleton } from '@/components/ui/skeleton';

export const WorkoutLoadingSkeleton = () => {
  return (
    <div className="p-4 space-y-4 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-100">Entraînement du jour</h1>
      <Skeleton className="h-8 w-1/2 mb-4" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-40 w-full" />
      <Skeleton className="h-40 w-full" />
    </div>
  );
};
