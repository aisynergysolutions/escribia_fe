
import React, { useState, useEffect, useMemo } from 'react';
import { format, addMinutes, isSameDay, isAfter, isBefore } from 'date-fns';
import { Clock, Calendar as CalendarIcon, AlertCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from './dialog';
import { Button } from './button';
import { Input } from './input';
import { Label } from './label';
import { Calendar } from './calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from './popover';

interface ReschedulePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReschedule: (date: Date, time: string) => void;
  selectedDate: Date | null;
  postTitle: string;
}

const ReschedulePostModal: React.FC<ReschedulePostModalProps> = ({
  isOpen,
  onClose,
  onReschedule,
  selectedDate,
  postTitle
}) => {
  const [newDate, setNewDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [customTime, setCustomTime] = useState<string>('');
  const [useCustomTime, setUseCustomTime] = useState<boolean>(false);

  // Calculate minimum allowed date and time
  const now = new Date();
  const minDateTime = addMinutes(now, 6);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Memoize validation logic
  const validation = useMemo(() => {
    if (!newDate) return { isValid: false, errorMessage: 'Please select a date' };

    const timeToUse = useCustomTime ? customTime : selectedTime;
    if (!timeToUse) return { isValid: false, errorMessage: 'Please select a time' };

    // Check if date is in the past
    const selectedDateOnly = new Date(newDate);
    selectedDateOnly.setHours(0, 0, 0, 0);

    if (isBefore(selectedDateOnly, today)) {
      return { isValid: false, errorMessage: 'Cannot schedule for past dates' };
    }

    // Create the full datetime for validation
    const [hours, minutes] = timeToUse.split(':').map(Number);
    const selectedDateTime = new Date(newDate);
    selectedDateTime.setHours(hours, minutes + 1, 0, 0);

    // If it's today, check if time is at least 6 minutes from now
    if (isSameDay(selectedDateTime, now)) {
      if (isBefore(selectedDateTime, minDateTime)) {
        return {
          isValid: false,
          errorMessage: `Time must be at least ${format(minDateTime, 'HH:mm')} (6 minutes from now)`
        };
      }
    }

    return { isValid: true, errorMessage: '' };
  }, [newDate, selectedTime, customTime, useCustomTime, minDateTime, today, now]);

  // Generate suggested times (don't filter - show all times like SchedulePostModal)
  const suggestedTimes = ['09:00', '14:00', '18:00'];

  // Update the date when selectedDate changes
  useEffect(() => {
    if (selectedDate) {
      setNewDate(selectedDate);
    }
  }, [selectedDate]);

  const handleReschedule = () => {
    if (validation.isValid) {
      const timeToUse = useCustomTime ? customTime : selectedTime;
      if (timeToUse && newDate) {
        // Create a new date with the selected time
        const [hours, minutes] = timeToUse.split(':').map(Number);
        const rescheduleDate = new Date(newDate);
        rescheduleDate.setHours(hours, minutes, 0, 0);

        onReschedule(rescheduleDate, timeToUse);
        handleClose();
      }
    }
  };

  const handleClose = () => {
    setSelectedTime('');
    setCustomTime('');
    setUseCustomTime(false);
    setNewDate(null);
    onClose();
  };

  if (!selectedDate) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Reschedule Post
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div>
            <p className="text-sm text-gray-600 mb-2">
              <strong>Post:</strong> {postTitle}
            </p>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-base font-medium">Select date:</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {newDate ? format(newDate, 'EEEE, MMMM d, yyyy') : 'Pick a date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={newDate || undefined}
                    onSelect={(date) => setNewDate(date || null)}
                    disabled={(date) => isBefore(date, today)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-3">
              <Label className="text-base font-medium">Select a time:</Label>

              <div className="grid grid-cols-3 gap-2">
                {suggestedTimes.map((time) => (
                  <Button
                    key={time}
                    variant={selectedTime === time && !useCustomTime ? "default" : "outline"}
                    className="h-12"
                    onClick={() => {
                      setSelectedTime(time);
                      setUseCustomTime(false);
                    }}
                  >
                    {time}
                  </Button>
                ))}
              </div>

              <div className="space-y-2">
                <Label className="text-sm text-gray-600">
                  Or specify a custom time:
                </Label>
                <Input
                  type="time"
                  value={customTime}
                  onChange={(e) => {
                    setCustomTime(e.target.value);
                    setUseCustomTime(true);
                    setSelectedTime('');
                  }}
                  className="w-full"
                />
              </div>
            </div>

            {/* Validation error message - consistent with SchedulePostModal */}
            {!validation.isValid && (selectedTime || customTime) && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <p className="text-sm text-red-700">
                    {validation.errorMessage}
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              onClick={handleReschedule}
              disabled={!validation.isValid}
            >
              Reschedule Post
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ReschedulePostModal;
