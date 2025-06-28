
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Plus, X } from 'lucide-react';

interface TimeslotDefinitionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (timeslots: string[], days: string[]) => void;
  initialTimeslots?: string[];
  initialDays?: string[];
}

const DAYS_OF_WEEK = [
  'Monday',
  'Tuesday', 
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday'
];

const TimeslotDefinitionModal: React.FC<TimeslotDefinitionModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialTimeslots = [],
  initialDays = []
}) => {
  const [timeslots, setTimeslots] = useState<string[]>(
    initialTimeslots.length > 0 ? initialTimeslots : ['09:00', '13:00']
  );
  const [selectedDays, setSelectedDays] = useState<string[]>(
    initialDays.length > 0 ? initialDays : ['Monday', 'Tuesday']
  );
  const [newTimeslot, setNewTimeslot] = useState('');

  const addTimeslot = () => {
    if (newTimeslot && !timeslots.includes(newTimeslot)) {
      setTimeslots([...timeslots, newTimeslot].sort());
      setNewTimeslot('');
    }
  };

  const removeTimeslot = (timeslot: string) => {
    setTimeslots(timeslots.filter(t => t !== timeslot));
  };

  const toggleDay = (day: string) => {
    if (selectedDays.includes(day)) {
      setSelectedDays(selectedDays.filter(d => d !== day));
    } else {
      setSelectedDays([...selectedDays, day]);
    }
  };

  const handleSave = () => {
    if (timeslots.length >= 2 && selectedDays.length >= 2) {
      onSave(timeslots, selectedDays);
      onClose();
    }
  };

  const isValid = timeslots.length >= 2 && selectedDays.length >= 2;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Define Posting Timeslots</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div>
            <h3 className="text-sm font-medium mb-3">Days of the week</h3>
            <p className="text-xs text-gray-500 mb-3">Select at least 2 days</p>
            <div className="grid grid-cols-2 gap-2">
              {DAYS_OF_WEEK.map((day) => (
                <div key={day} className="flex items-center space-x-2">
                  <Checkbox
                    id={day}
                    checked={selectedDays.includes(day)}
                    onCheckedChange={() => toggleDay(day)}
                  />
                  <label htmlFor={day} className="text-sm">{day}</label>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium mb-3">Time slots</h3>
            <p className="text-xs text-gray-500 mb-3">Define at least 2 time slots</p>
            
            <div className="space-y-2 mb-3">
              {timeslots.map((timeslot) => (
                <div key={timeslot} className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded">
                  <span className="text-sm">{timeslot}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => removeTimeslot(timeslot)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <Input
                type="time"
                value={newTimeslot}
                onChange={(e) => setNewTimeslot(e.target.value)}
                className="flex-1"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={addTimeslot}
                disabled={!newTimeslot || timeslots.includes(newTimeslot)}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={!isValid}>
              Save Timeslots
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TimeslotDefinitionModal;
