
import { Calendar } from 'lucide-react';
import { WorkoutCalendar } from '@/components/workout/WorkoutCalendar';

const CalendarPage = () => {
  return (
    <div className="p-2 sm:p-4 space-y-4 max-w-4xl mx-auto">
      <div className="flex items-center gap-2">
        <Calendar className="h-6 w-6 text-accent-green" />
        <h1 className="text-2xl font-bold text-foreground">Calendrier d'Entraînement</h1>
      </div>
      
      <WorkoutCalendar />
    </div>
  );
};

export default CalendarPage;
