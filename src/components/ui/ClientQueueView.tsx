import React, { useState, useMemo } from 'react';
import { format, isSameDay } from 'date-fns';
import { MoreVertical, Calendar as CalendarIcon } from 'lucide-react';
import { Card } from './card';
import { Button } from './button';
import { Badge } from './badge';
import { Avatar, AvatarFallback, AvatarImage } from './avatar';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from './dropdown-menu';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './tooltip';
import { mockIdeas, mockClients } from '../../types';
import { useNavigate } from 'react-router-dom';
import ReschedulePostModal from './ReschedulePostModal';

interface ClientQueueViewProps {
  clientId: string;
}

interface QueueSlot {
  id: string;
  datetime: Date;
  title: string;
  preview: string;
  status: string;
  clientId: string;
  clientName: string;
  clientAvatar?: string;
}

const ClientQueueView: React.FC<ClientQueueViewProps> = ({ clientId }) => {
  const navigate = useNavigate();
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [dragOverDate, setDragOverDate] = useState<Date | null>(null);
  const [rescheduleModalOpen, setRescheduleModalOpen] = useState(false);
  const [selectedPostForReschedule, setSelectedPostForReschedule] = useState<QueueSlot | null>(null);
  const [newScheduleDate, setNewScheduleDate] = useState<Date | null>(null);
  const [refreshKey, setRefreshKey] = useState(0); // Force re-render after updates

  // Get scheduled posts for this client
  const queueSlots = useMemo(() => {
    const scheduledPosts = mockIdeas.filter(idea => 
      idea.scheduledPostAt && 
      idea.status === 'Scheduled' &&
      idea.clientId === clientId
    );

    const client = mockClients.find(c => c.id === clientId);

    return scheduledPosts.map(post => ({
      id: post.id,
      datetime: new Date(post.scheduledPostAt!.seconds * 1000),
      title: post.title,
      preview: post.currentDraftText ? 
        (post.currentDraftText.length > 60 ? 
          post.currentDraftText.substring(0, 60) + '...' : 
          post.currentDraftText) : 
        'No content',
      status: post.status,
      clientId: post.clientId,
      clientName: client?.clientName || 'Unknown Client',
      clientAvatar: client?.profileImage
    })).sort((a, b) => a.datetime.getTime() - b.datetime.getTime());
  }, [clientId, refreshKey]); // Add refreshKey to dependencies

  const handleEditSlot = (slotId: string) => {
    const slot = queueSlots.find(s => s.id === slotId);
    if (slot) {
      setSelectedPostForReschedule(slot);
      setNewScheduleDate(slot.datetime);
      setRescheduleModalOpen(true);
    }
  };

  const handleRemoveFromQueue = (slotId: string) => {
    console.log('Remove from queue:', slotId);
    // Find and update the post status
    const postIndex = mockIdeas.findIndex(idea => idea.id === slotId);
    if (postIndex !== -1) {
      mockIdeas[postIndex].status = 'Draft';
      mockIdeas[postIndex].scheduledPostAt = undefined;
      setRefreshKey(prev => prev + 1); // Force refresh
    }
  };

  const handleMoveToTop = (slotId: string) => {
    console.log('Move to top:', slotId);
    // Find the earliest scheduled time and move this post 30 minutes before it
    const earliestPost = queueSlots.filter(slot => slot.id !== slotId)[0];
    if (earliestPost) {
      const newTime = new Date(earliestPost.datetime.getTime() - 30 * 60 * 1000);
      const postIndex = mockIdeas.findIndex(idea => idea.id === slotId);
      if (postIndex !== -1) {
        mockIdeas[postIndex].scheduledPostAt = {
          seconds: Math.floor(newTime.getTime() / 1000),
          nanoseconds: 0
        };
        setRefreshKey(prev => prev + 1); // Force refresh
      }
    }
  };

  const handleDragStart = (e: React.DragEvent, slotId: string) => {
    setDraggedItem(slotId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    const targetSlot = queueSlots[index];
    if (targetSlot) {
      setDragOverIndex(index);
      setDragOverDate(targetSlot.datetime);
    }
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
    setDragOverIndex(null);
    setDragOverDate(null);
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    
    if (draggedItem) {
      const draggedSlot = queueSlots.find(slot => slot.id === draggedItem);
      const targetSlot = queueSlots[targetIndex];
      
      if (draggedSlot && targetSlot) {
        // Check if dropping on a different day
        if (!isSameDay(draggedSlot.datetime, targetSlot.datetime)) {
          setSelectedPostForReschedule(draggedSlot);
          setNewScheduleDate(targetSlot.datetime);
          setRescheduleModalOpen(true);
        } else {
          // Same day reordering
          console.log('Reorder within same day:', draggedItem, 'to index:', targetIndex);
        }
      }
    }
    
    setDraggedItem(null);
    setDragOverIndex(null);
    setDragOverDate(null);
  };

  const handleReschedule = (newDateTime: Date, time: string) => {
    if (selectedPostForReschedule) {
      console.log('Reschedule post:', selectedPostForReschedule.id, 'to:', format(newDateTime, 'yyyy-MM-dd HH:mm'), 'at:', time);
      
      // Find and update the post in mockIdeas
      const postIndex = mockIdeas.findIndex(idea => idea.id === selectedPostForReschedule.id);
      if (postIndex !== -1) {
        // Update the scheduledPostAt with the new date and time
        mockIdeas[postIndex].scheduledPostAt = {
          seconds: Math.floor(newDateTime.getTime() / 1000),
          nanoseconds: 0
        };
        
        // Force a re-render to show the updated schedule
        setRefreshKey(prev => prev + 1);
        console.log('Post successfully rescheduled to:', newDateTime);
      }
    }
  };

  const handleCloseRescheduleModal = () => {
    setRescheduleModalOpen(false);
    setSelectedPostForReschedule(null);
    setNewScheduleDate(null);
  };

  if (queueSlots.length === 0) {
    return (
      <Card className="p-4">
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <CalendarIcon className="h-16 w-16 text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Your queue is empty</h3>
          <p className="text-sm text-gray-500">
            Define your posting times in Queue Settings.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <>
      <Card className="p-4">
        <div className="space-y-0">
          <TooltipProvider>
            {queueSlots.map((slot, index) => {
              const prevSlot = index > 0 ? queueSlots[index - 1] : null;
              const showDateHeader = !prevSlot || !isSameDay(slot.datetime, prevSlot.datetime);
              const isDragging = draggedItem === slot.id;
              const showDropIndicator = dragOverIndex === index && draggedItem !== slot.id;

              return (
                <div key={slot.id}>
                  {showDateHeader && (
                    <div className="sticky top-0 bg-gray-50 border-b border-gray-200 px-6 py-4 z-10">
                      <h4 className="text-sm font-medium text-gray-900">
                        📅 {format(slot.datetime, 'EEEE, MMM d')}
                      </h4>
                    </div>
                  )}
                  
                  {showDropIndicator && (
                    <div className="h-0.5 bg-blue-500 mx-6" />
                  )}
                  
                  <div
                    draggable
                    onDragStart={(e) => handleDragStart(e, slot.id)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDragEnd={handleDragEnd}
                    onDrop={(e) => handleDrop(e, index)}
                    className={`flex items-center gap-4 px-6 py-4 border-b border-gray-100 hover:bg-gray-50 cursor-move transition-colors ${
                      isDragging ? 'opacity-50' : ''
                    }`}
                  >
                    <Avatar className="h-10 w-10 flex-shrink-0">
                      <AvatarImage src={slot.clientAvatar} alt={slot.clientName} />
                      <AvatarFallback className="bg-indigo-100 text-indigo-700 font-semibold">
                        {slot.clientName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="text-sm font-medium text-gray-500 min-w-[80px]">
                      {format(slot.datetime, 'HH:mm')}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h4 className="text-base font-semibold text-gray-900 truncate">
                        {slot.title}
                      </h4>
                      <p className="text-sm text-gray-600 truncate">
                        {slot.preview}
                      </p>
                    </div>
                    
                    <Badge variant="secondary" className="flex-shrink-0">
                      {slot.status}
                    </Badge>
                    
                    <div className="flex-shrink-0">
                      <DropdownMenu>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <DropdownMenuTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="icon"
                                className="h-8 w-8 text-gray-400 hover:text-gray-600"
                              >
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Actions</p>
                          </TooltipContent>
                        </Tooltip>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEditSlot(slot.id)}>
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
                </div>
              );
            })}
          </TooltipProvider>
        </div>
      </Card>

      <ReschedulePostModal
        isOpen={rescheduleModalOpen}
        onClose={handleCloseRescheduleModal}
        onReschedule={handleReschedule}
        selectedDate={newScheduleDate}
        postTitle={selectedPostForReschedule?.title || ''}
      />
    </>
  );
};

export default ClientQueueView;
