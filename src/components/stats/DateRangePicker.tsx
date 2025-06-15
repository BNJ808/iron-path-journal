
import * as React from "react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { Calendar as CalendarIcon } from "lucide-react"
import { DateRange } from "react-day-picker"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface DateRangePickerProps extends React.HTMLAttributes<HTMLDivElement> {
  date: DateRange | undefined
  onDateChange: (date: DateRange | undefined) => void
}

export function DateRangePicker({
  className,
  date,
  onDateChange,
}: DateRangePickerProps) {
  const handleFromDateChange = (day: Date | undefined) => {
    // If user clears the from date, we should probably clear the to date as well or handle it.
    // For now, just updating from date. If 'to' is before new 'from', it might be an issue.
    // The disabled prop on the calendar should prevent this.
    // Let's also ensure `to` is not before `from`.
    if (day && date?.to && day > date.to) {
        onDateChange({ from: day, to: day })
    } else {
        onDateChange({ from: day, to: date?.to })
    }
  }

  const handleToDateChange = (day: Date | undefined) => {
    onDateChange({ from: date?.from, to: day })
  }

  return (
    <div className={cn("grid gap-2 sm:flex sm:items-center sm:gap-4", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date-from"
            variant={"outline"}
            className={cn(
              "w-full justify-start text-left font-normal md:w-[240px]",
              !date?.from && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date?.from ? (
              format(date.from, "dd LLL, y", { locale: fr })
            ) : (
              <span>Date de début</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="single"
            selected={date?.from}
            onSelect={handleFromDateChange}
            disabled={{ after: date?.to }}
            numberOfMonths={1}
          />
        </PopoverContent>
      </Popover>
      
      <span className="self-center hidden sm:inline-block">-</span>

      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date-to"
            variant={"outline"}
            className={cn(
              "w-full justify-start text-left font-normal md:w-[240px]",
              !date?.to && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date?.to ? (
              format(date.to, "dd LLL, y", { locale: fr })
            ) : (
              <span>Date de fin</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="single"
            selected={date?.to}
            onSelect={handleToDateChange}
            disabled={{ before: date?.from }}
            numberOfMonths={1}
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}
