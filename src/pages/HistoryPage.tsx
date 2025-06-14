
import { useWorkoutHistory } from '@/hooks/useWorkoutHistory';
import { Button } from '@/components/ui/button';
import { Accordion } from '@/components/ui/accordion';
import { Trash2 } from 'lucide-react';
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

const HistoryPage = () => {
    const { workouts, clearHistory, deleteWorkout } = useWorkoutHistory();

    const handleClearHistory = () => {
        clearHistory();
        toast.success("L'historique des séances a été effacé.");
    }

    const handleDeleteWorkout = (workoutId: string) => {
        deleteWorkout(workoutId);
        toast.success("La séance a été supprimée.");
    };

    // On trie par date pour afficher les plus récents en premier
    const sortedWorkouts = [...workouts].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return (
        <div className="p-4">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-accent-yellow">Historique</h1>
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

            {sortedWorkouts.length === 0 ? (
                <div className="text-center py-16">
                    <p className="text-gray-500">Aucun historique de séance pour le moment.</p>
                    <p className="text-sm text-gray-600 mt-2">Terminez une séance pour la voir apparaître ici.</p>
                </div>
            ) : (
                <Accordion type="multiple" className="space-y-4">
                    {sortedWorkouts.map(workout => (
                        <WorkoutHistoryCard 
                            key={workout.id} 
                            workout={workout} 
                            onDelete={() => handleDeleteWorkout(workout.id)}
                        />
                    ))}
                </Accordion>
            )}
        </div>
    );
};

export default HistoryPage;
