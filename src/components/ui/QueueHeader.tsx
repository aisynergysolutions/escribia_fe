
import React from 'react';
import { Button } from '@/components/ui/button';
import { EyeOff, Settings } from 'lucide-react';

interface QueueHeaderProps {
  hideEmptySlots: boolean;
  onToggle: (hide: boolean) => void;
  onEditTimeslots: () => void;
}

const QueueHeader: React.FC<QueueHeaderProps> = ({ 
  hideEmptySlots, 
  onToggle, 
  onEditTimeslots 
}) => {
  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Queue</h2>
        <p className="text-sm text-gray-500 mt-1">
          Manage your scheduled posts
        </p>
      </div>
      
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="sm"
          onClick={onEditTimeslots}
          className="flex items-center gap-2"
        >
          <Settings className="h-4 w-4" />
          Edit defined timeslots
        </Button>
        
        <Button
          variant={hideEmptySlots ? "default" : "outline"}
          size="sm"
          onClick={() => onToggle(!hideEmptySlots)}
          className="flex items-center gap-2"
        >
          <EyeOff className="h-4 w-4" />
          Hide empty slots
        </Button>
      </div>
    </div>
  );
};

export default QueueHeader;
