
import type { Workout } from '@/types';
import { AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { format, differenceInMinutes } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Clock, Copy, List, StickyNote, Trash2, Edit3 } from 'lucide-react';
import { useState } from 'react';
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
} from "@/components/ui/alert-dialog";
import EditWorkoutDurationDialog from '@/components/workout/EditWorkoutDurationDialog';

interface WorkoutHistoryCardProps {
    workout: Workout;
    onDelete: () => void;
    onCopy: () => void;
    onUpdateDuration: (workoutId: string, newDurationMinutes: number) => void;
    isUpdatingDuration?: boolean;
}

const WorkoutHistoryCard = ({ workout, onDelete, onCopy, onUpdateDuration, isUpdatingDuration = false }: WorkoutHistoryCardProps) => {
    const [isEditDurationOpen, setIsEditDurationOpen] = useState(false);
    const workoutDate = new Date(workout.date);
    const workoutEndDate = workout.ended_at ? new Date(workout.ended_at) : null;

    const durationInMinutes = workoutEndDate
        ? differenceInMinutes(workoutEndDate, workoutDate)
        : null;

    const duration = durationInMinutes !== null ? `${durationInMinutes} min` : null;

    return (
        <AccordionItem value={workout.id} className="app-card border-b-0">
             <AccordionTrigger className="p-4 hover:no-underline">
                <div className="flex justify-between items-center w-full">
                    <div className="flex flex-col text-left">
                        <span className="font-bold capitalize text-base">
                            {format(workoutDate, "eeee d MMMM yyyy", { locale: fr })}
                        </span>
                        <span className="text-sm text-gray-400 mt-1">
                            Début : {format(workoutDate, "HH:mm", { locale: fr })}
                        </span>
                    </div>
                    {duration && (
                        <div className="flex items-center gap-1.5 text-sm font-medium text-gray-300">
                            <Clock className="h-4 w-4 text-accent-blue" />
                            <span>{duration}</span>
                        </div>
                    )}
                </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4">
                <div className="space-y-4">
                    {workout.notes && (
                        <div className="p-3 app-card-content">
                           <h4 className="font-semibold text-sm mb-2 flex items-center gap-2 text-gray-300"><StickyNote className="h-4 w-4 text-accent-yellow" /> Notes de séance</h4>
                           <p className="text-sm text-gray-400 whitespace-pre-wrap">{workout.notes}</p>
                        </div>
                    )}

                    <div>
                        <h4 className="font-semibold text-sm mb-2 flex items-center gap-2 text-gray-300"><List className="h-4 w-4 text-accent-blue" /> Exercices</h4>
                        <ul className="space-y-3">
                            {workout.exercises.map(exercise => (
                                <li key={exercise.id} className="text-sm app-card-content p-3">
                                    <p className="font-semibold text-base mb-2">{exercise.name}</p>
                                    <ul className="space-y-1 pl-2 border-l-2 border-border">
                                        {exercise.sets.map((set) => (
                                            <li key={set.id} className="text-gray-300">
                                                - <span className="font-semibold text-white">{set.weight} kg</span> x <span className="font-semibold text-white">{set.reps} reps</span>
                                            </li>
                                        ))}
                                    </ul>
                                    {exercise.notes && (
                                         <div className="mt-2 pt-2 border-t border-border/50">
                                            <p className="text-xs text-gray-400 whitespace-pre-wrap italic">Note: {exercise.notes}</p>
                                         </div>
                                    )}
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="mt-6 pt-4 border-t border-border/50 flex justify-end gap-2">
                        <Button variant="outline" size="sm" onClick={onCopy}>
                           <Copy /> Copier
                        </Button>
                        {durationInMinutes !== null && (
                            <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => setIsEditDurationOpen(true)}
                                disabled={isUpdatingDuration}
                            >
                                <Edit3 /> Durée
                            </Button>
                        )}
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="destructive-outline" size="sm">
                                    <Trash2 /> Supprimer
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Supprimer cette séance ?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        Cette action est irréversible. Voulez-vous vraiment
                                        supprimer cette séance de votre historique ?
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Annuler</AlertDialogCancel>
                                    <AlertDialogAction onClick={onDelete}>
                                        Oui, supprimer
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                </div>
            </AccordionContent>
            
            {durationInMinutes !== null && (
                <EditWorkoutDurationDialog
                    open={isEditDurationOpen}
                    onOpenChange={setIsEditDurationOpen}
                    currentDuration={durationInMinutes}
                    onSave={(newDuration) => {
                        onUpdateDuration(workout.id, newDuration);
                        setIsEditDurationOpen(false);
                    }}
                    isLoading={isUpdatingDuration}
                />
            )}
        </AccordionItem>
    );
};

export default WorkoutHistoryCard;
