import React, { useState, useCallback } from 'react';
import { format } from 'date-fns';
import { MoreVertical, GripVertical, Calendar as CalendarIcon } from 'lucide-react';
import { Card } from './card';
import { Button } from './button';
import { Avatar, AvatarImage, AvatarFallback } from './avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './dropdown-menu';
import StatusBadge from '../common/StatusBadge';
import { mockIdeas, mockClients } from '../../types';
import { useNavigate } from 'react-router-dom';

interface QueueSlot {
  id: string;
  ideaId: string;
  clientId: string;
  scheduledTime: Date;
  title: string;
  preview: string;
  status: string;
  clientName: string;
  clientAvatar?: string;
}

const QueueView: React.FC = () => {
  const navigate = useNavigate();
  
  // Generate queue slots from scheduled ideas
  const [queueSlots, setQueueSlots] = useState<QueueSlot[]>(() => {
    const scheduledIdeas = mockIdeas.filter(idea => 
      idea.scheduledPostAt && idea.status === 'Scheduled'
    );
    
    return scheduledIdeas.map(idea => {
      const client = mockClients.find(c => c.id === idea.clientId);
      return {
        id: idea.id,
        ideaId: idea.id,
        clientId: idea.clientId,
        scheduledTime: new Date(idea.scheduledPostAt!.seconds * 1000),
        title: idea.title,
        preview: idea.currentDraftText.substring(0, 60) + (idea.currentDraftText.length > 60 ? '...' : ''),
        status: idea.status,
        clientName: client?.clientName || 'Unknown Client',
        clientAvatar: client?.profileImage,
      };
    }).sort((a, b) => a.scheduledTime.getTime() - b.scheduledTime.getTime());
  });

  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dropIndicatorIndex, setDropIndicatorIndex] = useState<number | null>(null);

  const handleDragStart = useCallback((e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDropIndicatorIndex(index);
  }, []);

  const handleDragLeave = useCallback(() => {
    setDropIndicatorIndex(null);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    
    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      setDropIndicatorIndex(null);
      return;
    }

    const newSlots = [...queueSlots];
    const draggedSlot = newSlots[draggedIndex];
    
    // Remove the dragged item
    newSlots.splice(draggedIndex, 1);
    
    // Insert at new position
    const insertIndex = draggedIndex < dropIndex ? dropIndex - 1 : dropIndex;
    newSlots.splice(insertIndex, 0, draggedSlot);
    
    setQueueSlots(newSlots);
    setDraggedIndex(null);
    setDropIndicatorIndex(null);
  }, [draggedIndex, queueSlots]);

  const handleDragEnd = useCallback(() => {
    setDraggedIndex(null);
    setDropIndicatorIndex(null);
  }, []);

  const handleEditSlot = useCallback((slot: QueueSlot) => {
    // Navigate to the idea details page where scheduling can be edited
    navigate(`/clients/${slot.clientId}/ideas/${slot.ideaId}`);
  }, [navigate]);

  const handleRemoveFromQueue = useCallback((slotId: string) => {
    setQueueSlots(prev => prev.filter(slot => slot.id !== slotId));
  }, []);

  const handleMoveToTop = useCallback((slotId: string) => {
    setQueueSlots(prev => {
      const slotIndex = prev.findIndex(slot => slot.id === slotId);
      if (slotIndex === -1) return prev;
      
      const slot = prev[slotIndex];
      const newSlots = prev.filter(s => s.id !== slotId);
      return [slot, ...newSlots];
    });
  }, []);

  const getClientInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  if (queueSlots.length === 0) {
    return (
      <Card className="p-12">
        <div className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
            <CalendarIcon className="h-8 w-8 text-gray-400" />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-medium text-gray-900">Your queue is empty</h3>
            <p className="text-sm text-gray-500">
              Define your posting times in Queue Settings.
            </p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="divide-y divide-gray-200">
      {queueSlots.map((slot, index) => (
        <div key={slot.id}>
          {dropIndicatorIndex === index && (
            <div className="h-0.5 bg-blue-500 mx-6" />
          )}
          <div
            draggable
            onDragStart={(e) => handleDragStart(e, index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, index)}
            onDragEnd={handleDragEnd}
            className={`flex items-center gap-4 px-6 py-4 hover:bg-gray-50 cursor-move transition-colors ${
              draggedIndex === index ? 'opacity-50' : ''
            }`}
          >
            <GripVertical className="h-4 w-4 text-gray-400 flex-shrink-0" />
            
            <Avatar className="h-10 w-10 flex-shrink-0">
              {slot.clientAvatar && (
                <AvatarImage src={slot.clientAvatar} alt={slot.clientName} />
              )}
              <AvatarFallback className="text-sm font-medium">
                {getClientInitials(slot.clientName)}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-shrink-0 min-w-[120px]">
              <div className="text-sm font-medium text-gray-900">
                {format(slot.scheduledTime, 'MMM d')}
              </div>
              <div className="text-xs text-gray-500">
                {format(slot.scheduledTime, 'h:mm a')}
              </div>
            </div>
            
            <div className="flex-grow min-w-0 space-y-1">
              <div className="text-sm font-medium text-gray-900 truncate">
                {slot.title}
              </div>
              <div className="text-xs text-gray-500 truncate">
                {slot.preview}
              </div>
            </div>
            
            <div className="flex-shrink-0">
              <StatusBadge status={slot.status} type="idea" />
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 flex-shrink-0">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleEditSlot(slot)}>
                  Edit slot
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleRemoveFromQueue(slot.id)}>
                  Remove from queue
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleMoveToTop(slot.id)}>
                  Move to top
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      ))}
    </Card>
  );
};

export default QueueView;
