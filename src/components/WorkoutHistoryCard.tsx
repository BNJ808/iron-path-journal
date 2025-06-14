
import type { Workout } from '@/types';
import { AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { List, StickyNote } from 'lucide-react';

interface WorkoutHistoryCardProps {
    workout: Workout;
}

const WorkoutHistoryCard = ({ workout }: WorkoutHistoryCardProps) => {
    const workoutDate = new Date(workout.date);

    return (
        <AccordionItem value={workout.id} className="custom-card border-b-0">
             <AccordionTrigger className="p-4 hover:no-underline">
                <div className="flex flex-col text-left">
                    <span className="font-bold capitalize text-base">
                        {format(workoutDate, "eeee d MMMM", { locale: fr })}
                    </span>
                    <span className="text-sm text-gray-400">
                        {format(workoutDate, "yyyy, HH:mm", { locale: fr })}
                    </span>
                </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4">
                <div className="space-y-4">
                    {workout.notes && (
                        <div className="p-3 bg-gray-900/70 rounded-md">
                           <h4 className="font-semibold text-sm mb-2 flex items-center gap-2 text-gray-300"><StickyNote className="h-4 w-4 text-accent-yellow" /> Notes de séance</h4>
                           <p className="text-sm text-gray-400 whitespace-pre-wrap">{workout.notes}</p>
                        </div>
                    )}

                    <div>
                        <h4 className="font-semibold text-sm mb-2 flex items-center gap-2 text-gray-300"><List className="h-4 w-4 text-accent-blue" /> Exercices</h4>
                        <ul className="space-y-3">
                            {workout.exercises.map(exercise => (
                                <li key={exercise.id} className="text-sm bg-gray-900/70 p-3 rounded-md">
                                    <p className="font-semibold text-base mb-2">{exercise.name}</p>
                                    <ul className="space-y-1 pl-2 border-l-2 border-gray-700">
                                        {exercise.sets.map((set) => (
                                            <li key={set.id} className="text-gray-300">
                                                - <span className="font-semibold text-white">{set.weight} kg</span> x <span className="font-semibold text-white">{set.reps} reps</span>
                                            </li>
                                        ))}
                                    </ul>
                                    {exercise.notes && (
                                         <div className="mt-2 pt-2 border-t border-gray-700/50">
                                            <p className="text-xs text-gray-400 whitespace-pre-wrap italic">Note: {exercise.notes}</p>
                                         </div>
                                    )}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </AccordionContent>
        </AccordionItem>
    );
};

export default WorkoutHistoryCard;
