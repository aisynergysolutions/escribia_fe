
import { useState } from 'react';
import { mockIdeas } from '../types';
import { DaySlot } from './useQueueData';
import { Timestamp } from 'firebase/firestore';

export const useDragAndDrop = (hideEmptySlots: boolean, refreshQueue: () => void) => {
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

  const handleDrop = (e: React.DragEvent, targetSlot: DaySlot, onShowRescheduleModal: (draggedSlot: any, targetSlot: DaySlot) => void) => {
    e.preventDefault();
    
    if (draggedItem) {
      if (hideEmptySlots) {
        // Show reschedule modal when empty slots are hidden
        const draggedSlot = { id: draggedItem };
        onShowRescheduleModal(draggedSlot, targetSlot);
      } else {
        // Snap-to-grid behavior when empty slots are visible
        const postIndex = mockIdeas.findIndex(idea => idea.id === draggedItem);
        if (postIndex !== -1) {
          mockIdeas[postIndex].scheduledPostAt = Timestamp.fromMillis(targetSlot.datetime.getTime());
          refreshQueue();
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
