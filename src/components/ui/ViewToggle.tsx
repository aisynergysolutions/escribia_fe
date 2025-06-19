
import React from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Button } from './button';

interface ViewToggleProps {
  hideEmptySlots: boolean;
  onToggle: (hide: boolean) => void;
}

const ViewToggle: React.FC<ViewToggleProps> = ({ hideEmptySlots, onToggle }) => {
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => onToggle(!hideEmptySlots)}
      className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900"
    >
      {hideEmptySlots ? (
        <>
          <EyeOff className="h-4 w-4" />
          Show empty slots
        </>
      ) : (
        <>
          <Eye className="h-4 w-4" />
          Hide empty slots
        </>
      )}
    </Button>
  );
};

export default ViewToggle;
