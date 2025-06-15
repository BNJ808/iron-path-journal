import { useWorkoutHistory } from '@/hooks/useWorkoutHistory';
import { Button } from '@/components/ui/button';
import { Accordion } from '@/components/ui/accordion';
import { Trash2, History } from 'lucide-react';
import WorkoutHistoryCard from '@/components/WorkoutHistoryCard';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { useWorkouts } from '@/hooks/useWorkouts';
import type { Workout } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';
import { nanoid } from 'nanoid';

const HistoryPage = () => {
    const { workouts, clearHistory, deleteWorkout, isLoading } = useWorkoutHistory();
    const { createWorkout, todayWorkout, isLoadingWorkout } = useWorkouts();
    const navigate = useNavigate();


    const handleClearHistory = () => {
        clearHistory(undefined, {
            onSuccess: () => toast.success("L'historique des séances a été effacé."),
            onError: (error) => toast.error(`Erreur: ${error.message}`),
        });
    }

    const handleDeleteWorkout = (workoutId: string) => {
        deleteWorkout(workoutId, {
            onSuccess: () => toast.success("La séance a été supprimée."),
            onError: (error) => toast.error(`Erreur: ${error.message}`),
        });
    };

    const handleCopyWorkout = async (workout: Workout) => {
        if (isLoadingWorkout) {
            toast.info("Veuillez patienter...");
            return;
        }

        if (todayWorkout) {
            toast.error("Un entraînement est déjà en cours. Terminez-le avant d'en commencer un nouveau.");
            return;
        }

        try {
            const newExercises = workout.exercises.map(exercise => ({
                id: nanoid(),
                exerciseId: exercise.exerciseId,
                name: exercise.name,
                notes: exercise.notes || '',
                sets: exercise.sets.map(set => ({
                    id: nanoid(),
                    reps: String(set.reps),
                    weight: String(set.weight),
                })),
            }));

            await createWorkout({
                exercises: newExercises,
                notes: workout.notes || ''
            });

            navigate('/workout');
            toast.success("Séance copiée. Un nouvel entraînement a été créé.");

        } catch (error: any) {
            toast.error("Erreur lors de la copie de la séance: " + error.message);
        }
    };

    if (isLoading) {
        return (
            <div className="p-4 space-y-4">
                 <div className="flex justify-between items-center mb-2">
                    <Skeleton className="h-8 w-32" />
                    <Skeleton className="h-9 w-24" />
                </div>
                <Skeleton className="h-4 w-2/3" />
                <div className="space-y-4 pt-4">
                    <Skeleton className="h-20 w-full" />
                    <Skeleton className="h-20 w-full" />
                    <Skeleton className="h-20 w-full" />
                </div>
            </div>
        );
    }
    
    return (
        <div className="p-4">
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-2">
                    <History className="h-6 w-6 text-accent-yellow" />
                    <h1 className="text-2xl font-bold text-foreground">Historique</h1>
                </div>
                {workouts.length > 0 && (
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="sm">
                                <Trash2 className="mr-2 h-4 w-4" /> Vider
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Êtes-vous absolument sûr(e) ?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    Cette action est irréversible. Cela supprimera définitivement
                                    tout votre historique de séances.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Annuler</AlertDialogCancel>
                                <AlertDialogAction onClick={handleClearHistory}>
                                    Oui, tout supprimer
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                )}
            </div>
            
            <p className="text-gray-400 mt-2 mb-6">Retrouvez toutes vos séances passées.</p>

            {workouts.length === 0 ? (
                <div className="text-center py-16">
                    <p className="text-gray-500">Aucun historique de séance pour le moment.</p>
                    <p className="text-sm text-gray-600 mt-2">Terminez une séance pour la voir apparaître ici.</p>
                </div>
            ) : (
                <Accordion type="multiple" className="space-y-4">
                    {workouts.map(workout => (
                        <WorkoutHistoryCard 
                            key={workout.id} 
                            workout={workout} 
                            onDelete={() => handleDeleteWorkout(workout.id)}
                            onCopy={() => handleCopyWorkout(workout)}
                        />
                    ))}
                </Accordion>
            )}
        </div>
    );
};

export default HistoryPage;
