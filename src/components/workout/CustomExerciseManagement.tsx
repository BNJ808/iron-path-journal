
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
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
} from '@/components/ui/alert-dialog';
import { Settings, Trash2 } from 'lucide-react';
import useSupabaseCustomExercises from '@/hooks/useSupabaseCustomExercises';
import { MUSCLE_GROUP_COLORS } from '@/data/exercises';

export const CustomExerciseManagement = () => {
  const [open, setOpen] = useState(false);
  const { customExercises, deleteCustomExercise, isLoading } = useSupabaseCustomExercises();

  const handleDelete = async (exerciseId: string) => {
    const success = await deleteCustomExercise(exerciseId);
    // Le dialog se ferme automatiquement après suppression
  };

  // Grouper les exercices par groupe musculaire
  const groupedExercises = customExercises.reduce((groups, exercise) => {
    const group = exercise.group;
    if (!groups[group]) {
      groups[group] = [];
    }
    groups[group].push(exercise);
    return groups;
  }, {} as Record<string, typeof customExercises>);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full">
          <Settings className="mr-2 h-4 w-4" />
          Gérer mes exercices
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Mes exercices personnalisés</DialogTitle>
          <DialogDescription>
            Gérez vos exercices personnalisés. Vous pouvez les supprimer si vous ne les utilisez plus.
          </DialogDescription>
        </DialogHeader>
        
        {isLoading ? (
          <div className="text-center py-4">Chargement...</div>
        ) : customExercises.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>Aucun exercice personnalisé trouvé.</p>
            <p className="text-sm mt-2">Créez-en un depuis la page d'entraînement !</p>
          </div>
        ) : (
          <div className="space-y-4">
            {Object.entries(groupedExercises).map(([groupName, exercises]) => (
              <div key={groupName}>
                <h3 className={`text-sm font-semibold uppercase tracking-wider mb-2 ${MUSCLE_GROUP_COLORS[groupName] || 'text-accent-yellow'}`}>
                  {groupName}
                </h3>
                <div className="space-y-2">
                  {exercises.map(exercise => (
                    <div key={exercise.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 border border-border/20">
                      <span className="font-medium">{exercise.name}</span>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive-outline" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Supprimer l'exercice ?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Êtes-vous sûr de vouloir supprimer "{exercise.name}" ? 
                              Cette action ne peut pas être annulée.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Annuler</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={() => handleDelete(exercise.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Supprimer
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
