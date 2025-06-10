
import React, { useEffect, useState } from 'react';
import { Bold, Italic, Underline, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FloatingToolbarProps {
  onFormat: (format: string) => void;
  onComment: () => void;
}

const FloatingToolbar: React.FC<FloatingToolbarProps> = ({ onFormat, onComment }) => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleSelectionChange = () => {
      const selection = window.getSelection();
      if (selection && selection.toString().length > 0) {
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        
        setPosition({
          x: rect.left + rect.width / 2,
          y: rect.top - 60
        });
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    document.addEventListener('selectionchange', handleSelectionChange);
    return () => document.removeEventListener('selectionchange', handleSelectionChange);
  }, []);

  if (!isVisible) return null;

  return (
    <div 
      className="fixed z-50 bg-gray-900 text-white rounded-lg shadow-lg p-2 flex items-center gap-1 pointer-events-auto"
      style={{ 
        left: position.x - 100, 
        top: position.y,
        transform: 'translateX(-50%)',
        position: 'fixed'
      }}
    >
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onFormat('bold')}
        className="h-8 w-8 p-0 text-white hover:bg-gray-700"
      >
        <Bold className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onFormat('italic')}
        className="h-8 w-8 p-0 text-white hover:bg-gray-700"
      >
        <Italic className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onFormat('underline')}
        className="h-8 w-8 p-0 text-white hover:bg-gray-700"
      >
        <Underline className="h-4 w-4" />
      </Button>
      <div className="w-px h-6 bg-gray-600 mx-1" />
      <Button
        variant="ghost"
        size="sm"
        onClick={onComment}
        className="h-8 w-8 p-0 text-white hover:bg-gray-700"
      >
        <MessageCircle className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default FloatingToolbar;
