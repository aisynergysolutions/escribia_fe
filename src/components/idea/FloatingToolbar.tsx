
import React from 'react';
import { createPortal } from 'react-dom';
import { Bold, Italic, Underline, List, Smile } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

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
  const emojis = ['😀', '😊', '😍', '🤔', '👍', '👎', '❤️', '🔥', '💡', '🎉', '🚀', '💯', '✨', '🌟', '📈', '💼', '🎯', '💪', '🙌', '👏'];

  const insertEmoji = (emoji: string) => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      range.deleteContents();
      const textNode = document.createTextNode(emoji);
      range.insertNode(textNode);
      range.setStartAfter(textNode);
      range.setEndAfter(textNode);
      selection.removeAllRanges();
      selection.addRange(range);
    }
  };

  if (!visible) return null;

  const toolbar = (
    <div
      className="fixed z-[9999] bg-white border rounded-lg shadow-lg flex items-center gap-1 p-1"
      style={{
        top: position.top - 50,
        left: position.left - 50,
        transform: 'translateX(-50%)',
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
      <div className="w-px h-6 bg-gray-300 mx-1" />
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onFormat('insertUnorderedList')}
        className="h-8 w-8 p-0 hover:bg-gray-100"
      >
        <List className="h-4 w-4" />
      </Button>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 hover:bg-gray-100"
          >
            <Smile className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64 p-2">
          <div className="grid grid-cols-5 gap-1">
            {emojis.map((emoji, index) => (
              <button
                key={index}
                onClick={() => insertEmoji(emoji)}
                className="p-2 hover:bg-gray-100 rounded text-lg"
              >
                {emoji}
              </button>
            ))}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );

  return createPortal(toolbar, document.body);
};

export default FloatingToolbar;
