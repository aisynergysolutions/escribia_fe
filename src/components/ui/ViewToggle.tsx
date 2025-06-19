
import React from 'react';
import { ToggleGroup, ToggleGroupItem } from './toggle-group';

interface ViewToggleProps {
  value: 'schedule' | 'calendar';
  onValueChange: (value: 'schedule' | 'calendar') => void;
}

const ViewToggle: React.FC<ViewToggleProps> = ({ value, onValueChange }) => {
  return (
    <ToggleGroup 
      type="single" 
      value={value} 
      onValueChange={(newValue) => newValue && onValueChange(newValue as 'schedule' | 'calendar')}
      className="bg-white border rounded-lg"
    >
      <ToggleGroupItem value="schedule" className="px-4 py-2 text-sm font-medium">
        View Posting Schedule
      </ToggleGroupItem>
      <ToggleGroupItem value="calendar" className="px-4 py-2 text-sm font-medium">
        View Full Calendar
      </ToggleGroupItem>
    </ToggleGroup>
  );
};

export default ViewToggle;
