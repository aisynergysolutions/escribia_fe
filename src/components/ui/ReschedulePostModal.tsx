
import React, { useState } from 'react';
import { format } from 'date-fns';
import { Clock } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from './dialog';
import { Button } from './button';
import { Input } from './input';
import { Label } from './label';

interface ReschedulePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReschedule: (time: string) => void;
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
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [customTime, setCustomTime] = useState<string>('');
  const [useCustomTime, setUseCustomTime] = useState<boolean>(false);

  // Generate suggested times
  const suggestedTimes = [
    '09:00',
    '14:00',
    '18:00'
  ];

  const handleReschedule = () => {
    const timeToUse = useCustomTime ? customTime : selectedTime;
    if (timeToUse) {
      onReschedule(timeToUse);
      handleClose();
    }
  };

  const handleClose = () => {
    setSelectedTime('');
    setCustomTime('');
    setUseCustomTime(false);
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
            <p className="text-sm text-gray-600">
              <strong>New Date:</strong> {format(selectedDate, 'EEEE, MMMM d, yyyy')}
            </p>
          </div>

          <div className="space-y-4">
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

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button 
              onClick={handleReschedule}
              disabled={!selectedTime && !customTime}
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
