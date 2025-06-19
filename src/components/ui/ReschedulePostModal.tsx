
import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Clock, Calendar as CalendarIcon } from 'lucide-react';
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

  // Update the date when selectedDate changes
  useEffect(() => {
    if (selectedDate) {
      setNewDate(selectedDate);
    }
  }, [selectedDate]);

  // Generate suggested times
  const suggestedTimes = [
    '09:00',
    '14:00',
    '18:00'
  ];

  const handleReschedule = () => {
    const timeToUse = useCustomTime ? customTime : selectedTime;
    if (timeToUse && newDate) {
      // Create a new date with the selected time
      const [hours, minutes] = timeToUse.split(':').map(Number);
      const rescheduleDate = new Date(newDate);
      rescheduleDate.setHours(hours, minutes, 0, 0);
      
      onReschedule(rescheduleDate, timeToUse);
      handleClose();
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
          </div>

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button 
              onClick={handleReschedule}
              disabled={!newDate || (!selectedTime && !customTime)}
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
