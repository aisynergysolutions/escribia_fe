
import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { ArrowUp, Edit, Minus, Plus, RefreshCw, CheckSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AIEditToolbarProps {
  position: { top: number; left: number };
  visible: boolean;
  selectedText: string;
  onClose: () => void;
  onApplyEdit: (instruction: string) => void;
}

const AIEditToolbar: React.FC<AIEditToolbarProps> = ({
  position,
  visible,
  selectedText,
  onClose,
  onApplyEdit
}) => {
  const [customInstruction, setCustomInstruction] = useState('');

  if (!visible) return null;

  const handleQuickEdit = (instruction: string) => {
    onApplyEdit(instruction);
    onClose();
  };

  const handleCustomEdit = () => {
    if (customInstruction.trim()) {
      onApplyEdit(customInstruction);
      setCustomInstruction('');
      onClose();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleCustomEdit();
    }
    if (e.key === 'Escape') {
      onClose();
    }
  };

  const toolbar = (
    <div
      className="fixed z-[10000] bg-white border rounded-lg shadow-lg p-2 min-w-80"
      style={{
        top: position.top + 50,
        left: position.left,
        pointerEvents: 'auto'
      }}
    >
      {/* Custom instruction input */}
      <div className="flex items-center gap-2 mb-3 p-2 bg-gray-50 rounded">
        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
          <Edit className="h-4 w-4 text-white" />
        </div>
        <input
          type="text"
          placeholder="Describe how you want it to be changed..."
          value={customInstruction}
          onChange={(e) => setCustomInstruction(e.target.value)}
          onKeyDown={handleKeyPress}
          className="flex-1 bg-transparent border-none outline-none text-sm"
          autoFocus
        />
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCustomEdit}
          disabled={!customInstruction.trim()}
          className="h-8 w-8 p-0"
        >
          <ArrowUp className="h-4 w-4" />
        </Button>
      </div>

      {/* Quick edit options */}
      <div className="space-y-1">
        <button
          onClick={() => handleQuickEdit('Make this text shorter and more concise')}
          className="w-full flex items-center gap-3 p-2 hover:bg-gray-100 rounded text-left text-sm"
        >
          <Minus className="h-4 w-4" />
          Make shorter
        </button>
        
        <button
          onClick={() => handleQuickEdit('Make this text longer and more detailed')}
          className="w-full flex items-center gap-3 p-2 hover:bg-gray-100 rounded text-left text-sm"
        >
          <Plus className="h-4 w-4" />
          Make longer
        </button>
        
        <button
          onClick={() => handleQuickEdit('Rewrite this text in a different way while keeping the same meaning')}
          className="w-full flex items-center gap-3 p-2 hover:bg-gray-100 rounded text-left text-sm"
        >
          <RefreshCw className="h-4 w-4" />
          Say differently
        </button>
        
        <button
          onClick={() => handleQuickEdit('Fix any spelling and grammar errors in this text')}
          className="w-full flex items-center gap-3 p-2 hover:bg-gray-100 rounded text-left text-sm"
        >
          <CheckSquare className="h-4 w-4" />
          Fix spelling & grammar
        </button>
      </div>
    </div>
  );

  return createPortal(toolbar, document.body);
};

export default AIEditToolbar;
