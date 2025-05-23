
import React, { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Check, X } from 'lucide-react';

interface EditableTitleProps {
  title: string;
  onSave: (newTitle: string) => void;
  className?: string;
}

const EditableTitle: React.FC<EditableTitleProps> = ({ title, onSave, className }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(title);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  useEffect(() => {
    setEditValue(title);
  }, [title]);

  const handleSave = () => {
    if (editValue.trim()) {
      onSave(editValue.trim());
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setEditValue(title);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  if (isEditing) {
    return (
      <div className="flex items-center gap-2">
        <Input
          ref={inputRef}
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyDown={handleKeyDown}
          className={className}
        />
        <Button size="icon" variant="outline" onClick={handleSave}>
          <Check className="h-4 w-4" />
        </Button>
        <Button size="icon" variant="outline" onClick={handleCancel}>
          <X className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <h1 
      className={`cursor-pointer hover:bg-gray-50 px-2 py-1 rounded ${className}`}
      onClick={() => setIsEditing(true)}
    >
      {title}
    </h1>
  );
};

export default EditableTitle;
