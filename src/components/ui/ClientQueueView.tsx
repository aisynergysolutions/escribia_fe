
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
import DayCard from './DayCard';

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

interface EmptySlot {
  isEmpty: true;
  datetime: Date;
  time: string;
  id: string;
}

type DaySlot = QueueSlot | EmptySlot;

const ClientQueueView: React.FC<ClientQueueViewProps> = ({ clientId }) => {
  const navigate = useNavigate();
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [dragOverSlot, setDragOverSlot] = useState<string | null>(null);
  const [rescheduleModalOpen, setRescheduleModalOpen] = useState(false);
  const [selectedPostForReschedule, setSelectedPostForReschedule] = useState<QueueSlot | null>(null);
  const [newScheduleDate, setNewScheduleDate] = useState<Date | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [hideEmptySlots, setHideEmptySlots] = useState(false);

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

  // Group slots by day with empty placeholders
  const dayGroups = useMemo(() => {
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

    const groups: { [key: string]: DaySlot[] } = {};

    scheduledDates.sort().forEach(dateStr => {
      const date = new Date(dateStr);
      const slotsForDay = queueSlots.filter(slot => 
        format(slot.datetime, 'yyyy-MM-dd') === dateStr
      );

      groups[dateStr] = [];

      predefinedTimeSlots.forEach(timeSlot => {
        const existingSlot = slotsForDay.find(slot => 
          format(slot.datetime, 'HH:mm') === timeSlot
        );

        if (existingSlot) {
          groups[dateStr].push(existingSlot);
        } else if (!hideEmptySlots) {
          const slotDateTime = new Date(date);
          const [hours, minutes] = timeSlot.split(':').map(Number);
          slotDateTime.setHours(hours, minutes, 0, 0);
          
          groups[dateStr].push({
            isEmpty: true,
            datetime: slotDateTime,
            time: timeSlot,
            id: `empty-${dateStr}-${timeSlot}`
          });
        }
      });
    });

    return groups;
  }, [queueSlots, hideEmptySlots, predefinedTimeSlots]);

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
        const draggedSlot = queueSlots.find(slot => slot.id === draggedItem);
        if (draggedSlot) {
          setSelectedPostForReschedule(draggedSlot);
          setNewScheduleDate(targetSlot.datetime);
          setRescheduleModalOpen(true);
        }
      } else {
        // Snap-to-grid behavior when empty slots are visible
        const postIndex = mockIdeas.findIndex(idea => idea.id === draggedItem);
        if (postIndex !== -1) {
          mockIdeas[postIndex].scheduledPostAt = {
            seconds: Math.floor(targetSlot.datetime.getTime() / 1000),
            nanoseconds: 0
          };
          setRefreshKey(prev => prev + 1);
        }
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

  if (queueSlots.length === 0 && hideEmptySlots) {
    return (
      <div className="space-y-4">
        <div className="flex justify-end">
          <ViewToggle hideEmptySlots={hideEmptySlots} onToggle={setHideEmptySlots} />
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
          <ViewToggle hideEmptySlots={hideEmptySlots} onToggle={setHideEmptySlots} />
        </div>

        <div className="space-y-0">
          <TooltipProvider>
            {Object.entries(dayGroups).map(([dateStr, slots]) => {
              if (slots.length === 0) return null;
              
              const date = new Date(dateStr);
              
              return (
                <DayCard key={dateStr} date={date}>
                  {slots.map((slot) => {
                    const isDragging = draggedItem === slot.id;
                    const isDragOver = dragOverSlot === slot.id;

                    // Handle empty slots
                    if ('isEmpty' in slot && slot.isEmpty) {
                      return (
                        <EmptySlotCard
                          key={slot.id}
                          time={slot.time}
                          date={slot.datetime}
                          onSchedulePost={handleSchedulePost}
                          onDrop={(e) => handleDrop(e, slot)}
                          onDragOver={(e) => handleDragOver(e, slot.id)}
                          isDragOver={isDragOver}
                        />
                      );
                    }

                    // Handle regular post slots
                    return (
                      <div
                        key={slot.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, slot.id)}
                        onDragOver={(e) => handleDragOver(e, slot.id)}
                        onDragEnd={handleDragEnd}
                        onDrop={(e) => handleDrop(e, slot)}
                        className={`flex items-center gap-4 px-0 py-4 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 cursor-move transition-colors ${
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
                            className="text-base font-semibold text-gray-900 truncate cursor-pointer hover:underline transition-all"
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
                    );
                  })}
                </DayCard>
              );
            })}
          </TooltipProvider>
        </div>
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
