import * as React from "react";
import { format, isBefore, startOfToday } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface DatePickerProps {
  date?: Date | null; // Allow null
  onDateChange?: (date: Date | null) => void; // Allow null
  className?: string;
}

export function DatePicker({ date, onDateChange, className }: DatePickerProps) {
  // Adjust handleSelect to handle both undefined and null
  const handleSelect = React.useCallback(
    (day: Date | undefined) => {
      onDateChange?.(day ?? null); // Convert undefined to null
    },
    [onDateChange]
  );

  const today = startOfToday();

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-full justify-start text-left font-normal",
            !date && "text-muted-foreground",
            className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, "PPP") : <span>Pick a date</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar
          mode="single"
          selected={date || undefined} // Convert null to undefined
          onSelect={handleSelect} // Adjusted handler
          initialFocus
          disabled={(date) => isBefore(date, today)} // Disable past dates
        />
      </PopoverContent>
    </Popover>
  );
}
