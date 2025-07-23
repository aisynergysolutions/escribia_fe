
import { useState } from 'react';
import { DaySlot } from './useQueueData';
import { format } from 'date-fns';

interface DragAndDropHandlers {
  onEditSlot: (slotId: string, clientId: string, newDateTime: Date, newTimeSlot: string) => void;
  onShowRescheduleModal: (draggedSlot: any, targetSlot: DaySlot) => void;
}

export const useDragAndDrop = (
  hideEmptySlots: boolean, 
  refreshQueue: () => void, 
  clientId: string,
  handlers: DragAndDropHandlers
) => {
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [dragOverSlot, setDragOverSlot] = useState<string | null>(null);

  const handleDragStart = (e: React.DragEvent, slotId: string) => {
    setDraggedItem(slotId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, slotId: string) => {
    e.preventDefault();
    setDragOverSlot(slotId);
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
    setDragOverSlot(null);
  };

  const handleDrop = (e: React.DragEvent, targetSlot: DaySlot) => {
    e.preventDefault();
    
    if (draggedItem) {
      if (hideEmptySlots) {
        // Show reschedule modal when empty slots are hidden
        const draggedSlot = { id: draggedItem };
        handlers.onShowRescheduleModal(draggedSlot, targetSlot);
      } else {
        // Snap-to-grid behavior when empty slots are visible
        // Check if target slot is an empty slot
        if ('isEmpty' in targetSlot && targetSlot.isEmpty) {
          // Direct reschedule to the empty slot's time
          const newTimeSlot = format(targetSlot.datetime, 'HH:mm');
          handlers.onEditSlot(draggedItem, clientId, targetSlot.datetime, newTimeSlot);
        } else {
          // If dropping on an occupied slot, show reschedule modal
          const draggedSlot = { id: draggedItem };
          handlers.onShowRescheduleModal(draggedSlot, targetSlot);
        }
      }
    }
    
    handleDragEnd();
  };

  return {
    draggedItem,
    dragOverSlot,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
    handleDrop
  };
};
