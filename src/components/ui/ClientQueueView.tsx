
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
import ViewToggle from './ViewToggle';
import EmptySlotCard from './EmptySlotCard';

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
  authorName?: string;
  authorAvatar?: string;
}

const ClientQueueView: React.FC<ClientQueueViewProps> = ({ clientId }) => {
  const navigate = useNavigate();
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [dragOverDate, setDragOverDate] = useState<Date | null>(null);
  const [rescheduleModalOpen, setRescheduleModalOpen] = useState(false);
  const [selectedPostForReschedule, setSelectedPostForReschedule] = useState<QueueSlot | null>(null);
  const [newScheduleDate, setNewScheduleDate] = useState<Date | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [viewMode, setViewMode] = useState<'schedule' | 'calendar'>('schedule');

  // Mock predefined time slots for this client (from client settings)
  const predefinedTimeSlots = ['09:00', '13:00', '17:00'];

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
      clientAvatar: client?.profileImage,
      authorName: 'Sarah Johnson', // Mock author data
      authorAvatar: undefined // Will use fallback
    })).sort((a, b) => a.datetime.getTime() - b.datetime.getTime());
  }, [clientId, refreshKey]);

  // Generate slots with empty placeholders for "schedule" view
  const slotsWithPlaceholders = useMemo(() => {
    if (viewMode === 'calendar') {
      return queueSlots;
    }

    // Get unique dates that have scheduled posts
    const scheduledDates = Array.from(new Set(
      queueSlots.map(slot => format(slot.datetime, 'yyyy-MM-dd'))
    ));

    // For demo purposes, add next 7 days
    const today = new Date();
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      const dateStr = format(date, 'yyyy-MM-dd');
      if (!scheduledDates.includes(dateStr)) {
        scheduledDates.push(dateStr);
      }
    }

    const allSlots: (QueueSlot | { isEmpty: true; datetime: Date; time: string })[] = [];

    scheduledDates.sort().forEach(dateStr => {
      const date = new Date(dateStr);
      const slotsForDay = queueSlots.filter(slot => 
        format(slot.datetime, 'yyyy-MM-dd') === dateStr
      );

      predefinedTimeSlots.forEach(timeSlot => {
        const existingSlot = slotsForDay.find(slot => 
          format(slot.datetime, 'HH:mm') === timeSlot
        );

        if (existingSlot) {
          allSlots.push(existingSlot);
        } else {
          const slotDateTime = new Date(date);
          const [hours, minutes] = timeSlot.split(':').map(Number);
          slotDateTime.setHours(hours, minutes, 0, 0);
          
          allSlots.push({
            isEmpty: true,
            datetime: slotDateTime,
            time: timeSlot
          });
        }
      });
    });

    return allSlots;
  }, [queueSlots, viewMode, predefinedTimeSlots]);

  const handlePostClick = (postId: string) => {
    navigate(`/clients/${clientId}/ideas/${postId}`);
  };

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
    const postIndex = mockIdeas.findIndex(idea => idea.id === slotId);
    if (postIndex !== -1) {
      mockIdeas[postIndex].status = 'Draft';
      mockIdeas[postIndex].scheduledPostAt = undefined;
      setRefreshKey(prev => prev + 1);
    }
  };

  const handleMoveToTop = (slotId: string) => {
    console.log('Move to top:', slotId);
    const earliestPost = queueSlots.filter(slot => slot.id !== slotId)[0];
    if (earliestPost) {
      const newTime = new Date(earliestPost.datetime.getTime() - 30 * 60 * 1000);
      const postIndex = mockIdeas.findIndex(idea => idea.id === slotId);
      if (postIndex !== -1) {
        mockIdeas[postIndex].scheduledPostAt = {
          seconds: Math.floor(newTime.getTime() / 1000),
          nanoseconds: 0
        };
        setRefreshKey(prev => prev + 1);
      }
    }
  };

  const handleSchedulePost = (date: Date, time: string) => {
    console.log('Create new post for:', format(date, 'yyyy-MM-dd'), 'at', time);
    navigate(`/clients/${clientId}/ideas/new?new=true`);
  };

  const handleDragStart = (e: React.DragEvent, slotId: string) => {
    setDraggedItem(slotId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDragOverIndex(index);
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
      const targetSlot = slotsWithPlaceholders[targetIndex];
      
      if (draggedSlot && targetSlot) {
        if (viewMode === 'schedule') {
          // Fast snap-to-grid logic for schedule view
          const postIndex = mockIdeas.findIndex(idea => idea.id === draggedItem);
          if (postIndex !== -1) {
            mockIdeas[postIndex].scheduledPostAt = {
              seconds: Math.floor(targetSlot.datetime.getTime() / 1000),
              nanoseconds: 0
            };
            setRefreshKey(prev => prev + 1);
          }
        } else {
          // Full calendar view - show reschedule modal
          if (!isSameDay(draggedSlot.datetime, targetSlot.datetime)) {
            setSelectedPostForReschedule(draggedSlot);
            setNewScheduleDate(targetSlot.datetime);
            setRescheduleModalOpen(true);
          }
        }
      }
    }
    
    handleDragEnd();
  };

  const handleEmptySlotDrop = (e: React.DragEvent, emptySlot: { datetime: Date; time: string }) => {
    e.preventDefault();
    
    if (draggedItem) {
      const postIndex = mockIdeas.findIndex(idea => idea.id === draggedItem);
      if (postIndex !== -1) {
        mockIdeas[postIndex].scheduledPostAt = {
          seconds: Math.floor(emptySlot.datetime.getTime() / 1000),
          nanoseconds: 0
        };
        setRefreshKey(prev => prev + 1);
      }
    }
    
    handleDragEnd();
  };

  const handleReschedule = (newDateTime: Date, time: string) => {
    if (selectedPostForReschedule) {
      console.log('Reschedule post:', selectedPostForReschedule.id, 'to:', format(newDateTime, 'yyyy-MM-dd HH:mm'), 'at:', time);
      
      const postIndex = mockIdeas.findIndex(idea => idea.id === selectedPostForReschedule.id);
      if (postIndex !== -1) {
        mockIdeas[postIndex].scheduledPostAt = {
          seconds: Math.floor(newDateTime.getTime() / 1000),
          nanoseconds: 0
        };
        
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

  if (queueSlots.length === 0 && viewMode === 'calendar') {
    return (
      <div className="space-y-4">
        <div className="flex justify-end">
          <ViewToggle value={viewMode} onValueChange={setViewMode} />
        </div>
        <Card className="p-4">
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <CalendarIcon className="h-16 w-16 text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Your queue is empty</h3>
            <p className="text-sm text-gray-500">
              Define your posting times in Queue Settings.
            </p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        <div className="flex justify-end">
          <ViewToggle value={viewMode} onValueChange={setViewMode} />
        </div>

        <Card className="p-4">
          <div className="space-y-0">
            <TooltipProvider>
              {slotsWithPlaceholders.map((slot, index) => {
                const prevSlot = index > 0 ? slotsWithPlaceholders[index - 1] : null;
                const showDateHeader = !prevSlot || !isSameDay(slot.datetime, prevSlot.datetime);
                const isDragging = 'id' in slot && draggedItem === slot.id;
                const showDropIndicator = dragOverIndex === index && draggedItem !== ('id' in slot ? slot.id : undefined);

                // Handle empty slots
                if ('isEmpty' in slot) {
                  return (
                    <div key={`empty-${slot.datetime.toISOString()}`}>
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
                      
                      <EmptySlotCard
                        time={slot.time}
                        date={slot.datetime}
                        onSchedulePost={handleSchedulePost}
                        onDrop={(e) => handleEmptySlotDrop(e, slot)}
                        onDragOver={(e) => e.preventDefault()}
                      />
                    </div>
                  );
                }

                // Handle regular post slots
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
                      <div className="flex flex-col items-center gap-2 min-w-[80px]">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={slot.authorAvatar} alt={slot.authorName} />
                          <AvatarFallback className="bg-indigo-100 text-indigo-700 font-semibold text-xs">
                            {slot.authorName?.split(' ').map(n => n[0]).join('').slice(0, 2) || 'SJ'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="text-xs text-gray-500 text-center">
                          {slot.authorName || 'Sarah Johnson'}
                        </div>
                        <div className="text-sm font-medium text-gray-500">
                          {format(slot.datetime, 'HH:mm')}
                        </div>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h4 
                          className="text-base font-semibold text-gray-900 truncate cursor-pointer hover:text-blue-600 hover:underline transition-colors"
                          onClick={() => handlePostClick(slot.id)}
                        >
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
      </div>

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
