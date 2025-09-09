import { useMemo, useState } from 'react';
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
import { Input } from '@/components/ui/input';
import { Settings, Trash2, Eye, EyeOff, Save, Undo } from 'lucide-react';
import useSupabaseCustomExercises from '@/hooks/useSupabaseCustomExercises';
import { groupedExercises as baseGroupedExercises, MUSCLE_GROUP_COLORS } from '@/data/exercises';
import { useExerciseOverrides } from '@/hooks/useExerciseOverrides';

export const CustomExerciseManagement = () => {
  const [open, setOpen] = useState(false);
  const { customExercises, deleteCustomExercise, updateCustomExerciseName, isLoading } = useSupabaseCustomExercises();
  const { overridesMap, setOverrideName, clearOverrideName, setHidden } = useExerciseOverrides();

  const [editedNames, setEditedNames] = useState<Record<string, string>>({});
  const [editedCustomNames, setEditedCustomNames] = useState<Record<string, string>>({});

  const handleDelete = async (exerciseId: string) => {
    await deleteCustomExercise(exerciseId);
  };

  const baseGroups = baseGroupedExercises;

  const baseGroupedWithState = useMemo(() => {
    return baseGroups.map(group => ({
      group: group.group,
      exercises: group.exercises.map(ex => {
        const ov = overridesMap.get(ex.id);
        return {
          id: ex.id,
          name: ov?.override_name ?? ex.name,
          originalName: ex.name,
          hidden: !!ov?.hidden,
        };
      })
    }));
  }, [baseGroups, overridesMap]);

  // Grouper les exercices personnalisés par groupe musculaire
  const groupedCustomExercises = useMemo(() => {
    return customExercises.reduce((groups, exercise) => {
      const group = exercise.group;
      if (!groups[group]) groups[group] = [];
      groups[group].push(exercise);
      return groups;
    }, {} as Record<string, typeof customExercises>);
  }, [customExercises]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full">
          <Settings className="mr-2 h-4 w-4" />
          Gérer mes exercices
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Gérer tous les exercices</DialogTitle>
          <DialogDescription>
            Renommez ou masquez les exercices de base (uniquement pour votre compte),
            et renommez/supprimez vos exercices personnalisés.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="text-center py-4">Chargement...</div>
        ) : (
          <div className="space-y-8">
            {/* Exercices de base */}
            <section>
              <h3 className="text-sm font-semibold uppercase tracking-wider mb-3">Exercices de base</h3>
              <div className="space-y-6">
                {baseGroupedWithState.map(group => (
                  <div key={group.group}>
                    <h4 className={`text-xs font-semibold uppercase tracking-wider mb-2 ${MUSCLE_GROUP_COLORS[group.group] || 'text-accent-yellow'}`}>
                      {group.group}
                    </h4>
                    <div className="space-y-2">
                      {group.exercises.map(ex => (
                        <div key={ex.id} className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30 border border-border/20">
                          <Input
                            value={editedNames[ex.id] ?? ex.name}
                            onChange={(e) => setEditedNames(prev => ({ ...prev, [ex.id]: e.target.value }))}
                            className="flex-1"
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setOverrideName(ex.id, (editedNames[ex.id] ?? ex.name).trim())}
                            title="Enregistrer"
                          >
                            <Save className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => { clearOverrideName(ex.id); setEditedNames(prev => ({ ...prev, [ex.id]: ex.originalName })); }}
                            title="Réinitialiser le nom"
                          >
                            <Undo className="h-4 w-4" />
                          </Button>
                          <Button
                            variant={ex.hidden ? 'secondary' : 'destructive-outline'}
                            size="sm"
                            onClick={() => setHidden(ex.id, !ex.hidden)}
                            title={ex.hidden ? 'Réafficher' : 'Masquer'}
                          >
                            {ex.hidden ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Exercices personnalisés */}
            <section>
              <h3 className="text-sm font-semibold uppercase tracking-wider mb-3">Mes exercices personnalisés</h3>
              {Object.entries(groupedCustomExercises).length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>Aucun exercice personnalisé trouvé.</p>
                  <p className="text-sm mt-2">Créez-en un depuis la page d'entraînement !</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {Object.entries(groupedCustomExercises).map(([groupName, exercises]) => (
                    <div key={groupName}>
                      <h4 className={`text-xs font-semibold uppercase tracking-wider mb-2 ${MUSCLE_GROUP_COLORS[groupName] || 'text-accent-yellow'}`}>
                        {groupName}
                      </h4>
                      <div className="space-y-2">
                        {exercises.map(exercise => (
                          <div key={exercise.id} className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30 border border-border/20">
                            <Input
                              value={editedCustomNames[exercise.id] ?? exercise.name}
                              onChange={(e) => setEditedCustomNames(prev => ({ ...prev, [exercise.id]: e.target.value }))}
                              className="flex-1"
                            />
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateCustomExerciseName(exercise.id, (editedCustomNames[exercise.id] ?? exercise.name).trim())}
                              title="Enregistrer"
                            >
                              <Save className="h-4 w-4" />
                            </Button>
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
                                    Êtes-vous sûr de vouloir supprimer "{exercise.name}" ? Cette action ne peut pas être annulée.
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
            </section>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
