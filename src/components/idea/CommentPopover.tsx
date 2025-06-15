
import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';

interface CommentPopoverProps {
  position: { top: number; left: number };
  onSave: (commentText: string) => void;
  onCancel: () => void;
  visible: boolean;
}

const CommentPopover: React.FC<CommentPopoverProps> = ({ position, onSave, onCancel, visible }) => {
  const [text, setText] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (visible) {
      // Reset text and focus textarea when popover becomes visible
      setText('');
      textareaRef.current?.focus();
    }
  }, [visible]);

  if (!visible) return null;

  const handleSave = () => {
    if (text.trim()) {
      onSave(text);
    }
  };

  const popover = (
    <div
      className="fixed z-[9999]"
      style={{
        top: position.top,
        left: position.left,
        transform: 'translateX(-50%)',
      }}
      // Prevent clicks inside popover from closing it via editor's blur/click handlers
      onMouseDown={(e) => e.stopPropagation()}
    >
      <Card className="w-80 shadow-2xl animate-in fade-in-0 zoom-in-95">
        <CardContent className="p-4">
          <Textarea
            ref={textareaRef}
            placeholder="Add a comment..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="min-h-[60px]"
          />
        </CardContent>
        <CardFooter className="p-4 flex justify-end gap-2 bg-slate-50">
          <Button variant="ghost" onClick={onCancel}>Cancel</Button>
          <Button onClick={handleSave} disabled={!text.trim()}>Save</Button>
        </CardFooter>
      </Card>
    </div>
  );

  return createPortal(popover, document.body);
};

export default CommentPopover;
