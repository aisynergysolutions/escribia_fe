
import React, { useState, useMemo } from 'react';
import { format, isSameDay } from 'date-fns';
import { MoreVertical, Calendar, Trash2, MoveUp } from 'lucide-react';
import { Card } from './card';
import { Avatar, AvatarFallback, AvatarImage } from './avatar';
import { Badge } from './badge';
import { Button } from './button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './dropdown-menu';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './tooltip';
import { mockIdeas, mockClients } from '../../types';

interface ClientQueueViewProps {
  clientId: string;
}

interface QueueSlot {
  id: string;
  ideaId: string;
  scheduledAt: Date;
  title: string;
  preview: string;
  status: 'Queued' | 'Scheduled' | 'Draft';
  clientId: string;
}

const ClientQueueView: React.FC<ClientQueueViewProps> = ({ clientId }) => {
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [dropIndicator, setDropIndicator] = useState<number | null>(null);

  // Mock queue data - filter ideas for this client that are scheduled
  const queueSlots = useMemo(() => {
    const clientIdeas = mockIdeas.filter(idea => 
      idea.clientId === clientId && 
      idea.scheduledPostAt &&
      idea.status === 'Scheduled'
    );

    return clientIdeas.map(idea => ({
      id: idea.id,
      ideaId: idea.id,
      scheduledAt: new Date(idea.scheduledPostAt!.seconds * 1000),
      title: idea.title,
      preview: idea.currentDraftText?.substring(0, 60) + (idea.currentDraftText && idea.currentDraftText.length > 60 ? '...' : '') || '',
      status: 'Scheduled' as const,
      clientId: idea.clientId
    })).sort((a, b) => a.scheduledAt.getTime() - b.scheduledAt.getTime());
  }, [clientId]);

  const client = mockClients.find(c => c.id === clientId);

  const handleDragStart = (e: React.DragEvent, itemId: string) => {
    setDraggedItem(itemId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDropIndicator(index);
  };

  const handleDragLeave = () => {
    setDropIndicator(null);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDraggedItem(null);
    setDropIndicator(null);
    // In a real app, this would update the order in the backend
    console.log('Reordered queue');
  };

  const handleEditSlot = (slot: QueueSlot) => {
    console.log('Edit slot:', slot);
    // Open schedule modal with pre-filled data
  };

  const handleRemoveFromQueue = (slot: QueueSlot) => {
    console.log('Remove from queue:', slot);
    // Remove from queue logic
  };

  const handleMoveToTop = (slot: QueueSlot) => {
    console.log('Move to top:', slot);
    // Move to top logic
  };

  const groupedSlots = useMemo(() => {
    const groups: { [date: string]: QueueSlot[] } = {};
    
    queueSlots.forEach(slot => {
      const dateKey = format(slot.scheduledAt, 'yyyy-MM-dd');
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(slot);
    });

    return Object.entries(groups).map(([dateKey, slots]) => ({
      date: new Date(dateKey),
      slots
    }));
  }, [queueSlots]);

  if (queueSlots.length === 0) {
    return (
      <Card className="p-12">
        <div className="text-center space-y-4">
          <div className="text-6xl">📅</div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-gray-900">Your queue is empty</h3>
            <p className="text-sm text-gray-600">Define your posting times in Queue Settings.</p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <TooltipProvider>
      <Card className="overflow-hidden">
        <div className="max-h-[600px] overflow-y-auto">
          {groupedSlots.map((group, groupIndex) => (
            <div key={group.date.toISOString()}>
              {/* Sticky Date Header */}
              <div className="sticky top-0 bg-white z-10 border-b border-gray-200">
                <div className="px-6 py-4">
                  <h3 className="text-base font-medium text-gray-900">
                    📅 {format(group.date, 'EEEE, MMM d')}
                  </h3>
                </div>
              </div>

              {/* Queue Slots for this date */}
              {group.slots.map((slot, index) => (
                <div key={slot.id}>
                  {/* Drop indicator */}
                  {dropIndicator === index && (
                    <div className="h-0.5 bg-blue-500 mx-6" />
                  )}
                  
                  <div
                    draggable
                    onDragStart={(e) => handleDragStart(e, slot.id)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`flex items-center px-6 py-4 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 cursor-move transition-colors ${
                      draggedItem === slot.id ? 'opacity-50' : ''
                    }`}
                  >
                    {/* Avatar */}
                    <Avatar className="h-10 w-10 mr-4 flex-shrink-0">
                      <AvatarImage src={client?.profileImage} alt={client?.clientName} />
                      <AvatarFallback className="bg-indigo-100 text-indigo-700 font-semibold">
                        {client?.clientName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>

                    {/* Slot time */}
                    <div className="mr-4 flex-shrink-0 min-w-[80px]">
                      <span className="text-sm font-medium text-gray-600">
                        {format(slot.scheduledAt, 'h:mm a')}
                      </span>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0 mr-4">
                      <h4 className="text-base font-semibold text-gray-900 truncate">
                        {slot.title}
                      </h4>
                      <p className="text-sm text-gray-600 truncate">
                        {slot.preview}
                      </p>
                    </div>

                    {/* Status */}
                    <div className="mr-4 flex-shrink-0">
                      <Badge 
                        variant={slot.status === 'Scheduled' ? 'default' : 'secondary'}
                        className={
                          slot.status === 'Scheduled' 
                            ? 'bg-green-100 text-green-800 hover:bg-green-100' 
                            : ''
                        }
                      >
                        {slot.status}
                      </Badge>
                    </div>

                    {/* Actions menu */}
                    <div className="flex-shrink-0">
                      <DropdownMenu>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <DropdownMenuTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                className="h-8 w-8 p-0 hover:bg-gray-100"
                              >
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Actions</p>
                          </TooltipContent>
                        </Tooltip>
                        
                        <DropdownMenuContent align="end" className="w-40">
                          <DropdownMenuItem 
                            onClick={() => handleEditSlot(slot)}
                            className="flex items-center gap-2"
                          >
                            <Calendar className="h-4 w-4" />
                            Edit slot
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleMoveToTop(slot)}
                            className="flex items-center gap-2"
                          >
                            <MoveUp className="h-4 w-4" />
                            Move to top
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleRemoveFromQueue(slot)}
                            className="flex items-center gap-2 text-red-600 focus:text-red-600"
                          >
                            <Trash2 className="h-4 w-4" />
                            Remove from queue
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </Card>
    </TooltipProvider>
  );
};

export default ClientQueueView;
