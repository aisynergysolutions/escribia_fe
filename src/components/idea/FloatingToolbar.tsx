
import React from 'react';
import { Bold, Italic, Underline } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FloatingToolbarProps {
  position: { top: number; left: number };
  onFormat: (format: string) => void;
  visible: boolean;
}

const FloatingToolbar: React.FC<FloatingToolbarProps> = ({
  position,
  onFormat,
  visible
}) => {
  if (!visible) return null;

  return (
    <div
      className="fixed z-50 bg-white border rounded-lg shadow-lg flex items-center gap-1 p-1"
      style={{
        top: position.top - 50,
        left: position.left,
        pointerEvents: 'auto'
      }}
    >
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onFormat('bold')}
        className="h-8 w-8 p-0 hover:bg-gray-100"
      >
        <Bold className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onFormat('italic')}
        className="h-8 w-8 p-0 hover:bg-gray-100"
      >
        <Italic className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onFormat('underline')}
        className="h-8 w-8 p-0 hover:bg-gray-100"
      >
        <Underline className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default FloatingToolbar;
