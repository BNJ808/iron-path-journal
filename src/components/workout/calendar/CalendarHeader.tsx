
import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { format, addMonths, subMonths } from 'date-fns';
import { fr } from 'date-fns/locale';

interface CalendarHeaderProps {
  currentDate: Date;
  onDateChange: (date: Date) => void;
}

export const CalendarHeader = ({ currentDate, onDateChange }: CalendarHeaderProps) => {
  return (
    <div className="flex items-center justify-between">
      <Button
        variant="outline"
        size="sm"
        onClick={() => onDateChange(subMonths(currentDate, 1))}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <h3 className="text-lg font-semibold">
        {format(currentDate, 'MMMM yyyy', { locale: fr })}
      </h3>
      <Button
        variant="outline"
        size="sm"
        onClick={() => onDateChange(addMonths(currentDate, 1))}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
};
