import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns';
import { ChevronLeft, ChevronRight, Clock } from 'lucide-react';
import { Button } from './button';
import { Card } from './card';
import { mockClients } from '../../types';
import { useParams, useNavigate } from 'react-router-dom';
import { useScheduledPosts } from '../../hooks/useScheduledPosts';
import { useQueueOperations } from '../../hooks/useQueueOperations';
import SchedulePostModal from './SchedulePostModal';
import DayPostsModal from './DayPostsModal';
import ReschedulePostModal from './ReschedulePostModal';

interface PostCalendarProps {
  showAllClients?: boolean;
  clientId?: string;
  clientName?: string;
  hideTitle?: boolean;
  onMonthChange?: (month: Date) => void;
  currentMonth?: Date;
  onPostScheduled?: () => void;
}

const PostCalendar: React.FC<PostCalendarProps> = React.memo(({
  showAllClients = false,
  clientId: propClientId,
  clientName,
  hideTitle = false,
  onMonthChange,
  currentMonth: externalCurrentMonth,
  onPostScheduled
}) => {
  const [internalCurrentMonth, setInternalCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isDayPostsModalOpen, setIsDayPostsModalOpen] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [isRescheduleModalOpen, setIsRescheduleModalOpen] = useState(false);
  const [selectedPostForReschedule, setSelectedPostForReschedule] = useState<any>(null);
  const [loadedMonths, setLoadedMonths] = useState<string[]>([]);
  const { clientId: routeClientId } = useParams<{ clientId: string }>();
  const navigate = useNavigate();

  // Use prop clientId if provided, otherwise fall back to route params
  const clientId = propClientId || routeClientId;

  // Use external month if provided, otherwise use internal state
  const currentMonth = externalCurrentMonth || internalCurrentMonth;

  // Initialize loaded months with current month only once
  useEffect(() => {
    const currentMonthStr = format(new Date(), 'yyyy-MM');
    setLoadedMonths([currentMonthStr]);
  }, []); // Empty dependency array to run only once

  // Ensure the current viewing month is always loaded
  useEffect(() => {
    const currentMonthStr = format(currentMonth, 'yyyy-MM');
    setLoadedMonths(prev => {
      if (!prev.includes(currentMonthStr)) {
        return [...prev, currentMonthStr];
      }
      return prev;
    });
  }, [currentMonth]);

  // Fetch scheduled posts with month-based loading (except for showAllClients)
  const { scheduledPosts, loading, refetch } = useScheduledPosts(
    showAllClients ? undefined : clientId,
    showAllClients ? undefined : loadedMonths
  );

  // Only refetch when clientId changes, not when refetch function changes
  useEffect(() => {
    if (!showAllClients && clientId) {
      // The refetch will happen automatically when loadedMonths changes via useScheduledPosts
    }
  }, [clientId, showAllClients]);

  // Memoize month calculations
  const monthData = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

    return { monthStart, monthEnd, monthDays };
  }, [currentMonth]);

  const getPostsForDay = useCallback((day: Date) => {
    return scheduledPosts.filter(post =>
      post.scheduledPostAt &&
      isSameDay(new Date(post.scheduledPostAt.seconds * 1000), day)
    );
  }, [scheduledPosts]);

  const getClientName = useCallback((clientId: string) => {
    const client = mockClients.find(c => c.id === clientId);
    return client?.clientName || 'Unknown Client';
  }, []);

  const handlePostClick = useCallback((post: any) => {
    navigate(`/clients/${post.clientId}/posts/${post.id}`);
  }, [navigate]);

  const handleDayClick = useCallback((day: Date) => {
    setSelectedDate(day);
    setIsDayPostsModalOpen(true);
  }, []);

  const handleSchedulePostFromDay = useCallback(() => {
    setIsDayPostsModalOpen(false);
    setIsScheduleModalOpen(true);
  }, []);

  const handleScheduleModalClose = useCallback(() => {
    setIsScheduleModalOpen(false);
    setSelectedDate(null);
  }, []);

  const handleDayPostsModalClose = useCallback(() => {
    setIsDayPostsModalOpen(false);
    setSelectedDate(null);
  }, []);

  const handleScheduleSuccess = useCallback(() => {
    // When a post is scheduled, we need to refetch to get the updated data from Firestore
    refetch();
    onPostScheduled?.(); // Notify parent component

    // Close the schedule modal and optionally reopen the day posts modal
    setIsScheduleModalOpen(false);
    if (selectedDate) {
      // Optionally reopen the day posts modal to show the updated schedule
      setIsDayPostsModalOpen(true);
    }
  }, [refetch, onPostScheduled, selectedDate]);

  const goToPreviousMonth = useCallback(() => {
    const newMonth = subMonths(currentMonth, 1);

    if (onMonthChange) {
      onMonthChange(newMonth);
    } else {
      setInternalCurrentMonth(newMonth);
    }
  }, [currentMonth, onMonthChange]);

  const goToNextMonth = useCallback(() => {
    const newMonth = addMonths(currentMonth, 1);

    if (onMonthChange) {
      onMonthChange(newMonth);
    } else {
      setInternalCurrentMonth(newMonth);
    }
  }, [currentMonth, onMonthChange]);

  const getCalendarTitle = useCallback(() => {
    if (showAllClients) {
      return 'All Clients Calendar';
    }
    return clientName ? `${clientName} Content Calendar` : 'Content Calendar';
  }, [showAllClients, clientName]);

  // Use queue operations for edit/remove functionality
  const { handleRemoveFromQueue, handleEditSlot } = useQueueOperations(() => {
    refetch(); // Refresh calendar when queue operations are performed
  });

  const handleEditSlotFromDay = useCallback((slotId: string) => {
    if (clientId) {
      const post = scheduledPosts.find(p => p.id === slotId);
      if (post) {
        setSelectedPostForReschedule(post);
        setIsRescheduleModalOpen(true);
      }
    }
  }, [clientId, scheduledPosts]);

  const handleRemoveFromQueueDay = useCallback((slotId: string) => {
    if (clientId) {
      handleRemoveFromQueue(slotId, clientId);
    }
  }, [clientId, handleRemoveFromQueue]);

  const handleRescheduleFromModal = useCallback((newDateTime: Date, time: string) => {
    if (selectedPostForReschedule && clientId) {
      handleEditSlot(selectedPostForReschedule.id, clientId, newDateTime, time);
      setIsRescheduleModalOpen(false);
      setSelectedPostForReschedule(null);
    }
  }, [selectedPostForReschedule, clientId, handleEditSlot]);

  const handleCloseRescheduleModal = useCallback(() => {
    setIsRescheduleModalOpen(false);
    setSelectedPostForReschedule(null);
  }, []);

  // Memoize calendar days rendering for better performance
  const calendarDays = useMemo(() => {
    return monthData.monthDays.map(day => {
      const postsForDay = getPostsForDay(day);
      const isCurrentMonth = isSameMonth(day, currentMonth);
      const isToday = isSameDay(day, new Date());

      return (
        <div
          key={day.toISOString()}
          className={`min-h-[80px] p-1 border rounded-sm cursor-pointer hover:bg-gray-50 ${isCurrentMonth ? 'bg-white' : 'bg-gray-50'
            } ${isToday ? 'ring-2 ring-blue-500' : ''}`}
          onClick={() => handleDayClick(day)}
        >
          <div className={`text-sm mb-1 ${isCurrentMonth ? 'text-gray-900' : 'text-gray-400'
            } ${isToday ? 'font-bold' : ''}`}>
            {format(day, 'd')}
          </div>

          <div className="space-y-1">
            {postsForDay.length > 0 && (
              <div>
                {postsForDay.length > 1 ? (
                  <div className="bg-blue-100 text-blue-800 text-xs p-1 rounded">
                    <div className="flex items-center gap-1 mb-1">
                      <Clock className="h-3 w-3 flex-shrink-0" />
                      <span className="font-medium">
                        {postsForDay.length} posts
                      </span>
                    </div>
                    <div className="text-xs">
                      Click to view
                    </div>
                  </div>
                ) : (
                  <div className="bg-blue-100 text-blue-800 text-xs p-1 rounded">
                    <div className="flex items-center gap-1 mb-1">
                      <Clock className="h-3 w-3 flex-shrink-0" />
                      <span className="truncate">
                        {format(new Date(postsForDay[0].scheduledPostAt!.seconds * 1000), 'HH:mm')}
                      </span>
                    </div>
                    <div className="truncate text-xs font-medium">
                      {postsForDay[0].title}
                    </div>
                    {showAllClients && (
                      <div className="truncate text-xs mt-0.5 text-blue-600 font-medium">
                        {getClientName(postsForDay[0].clientId)}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      );
    });
  }, [monthData.monthDays, getPostsForDay, currentMonth, handleDayClick, showAllClients, getClientName]);

  return (
    <>
      <Card className="p-4">
        {!hideTitle && (
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">
              {getCalendarTitle()}
            </h3>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={goToPreviousMonth}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="font-medium min-w-[120px] text-center">
                {format(currentMonth, 'MMMM yyyy')}
              </span>
              <Button variant="outline" size="sm" onClick={goToNextMonth}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-7 gap-1 mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {calendarDays}
        </div>

        {scheduledPosts.length === 0 && (
          <div className="text-center text-gray-500 mt-4 py-8">
            No scheduled posts found
          </div>
        )}
      </Card>

      <DayPostsModal
        isOpen={isDayPostsModalOpen}
        onClose={handleDayPostsModalClose}
        selectedDate={selectedDate}
        posts={selectedDate ? getPostsForDay(selectedDate) : []}
        onPostClick={handlePostClick}
        onSchedulePost={handleSchedulePostFromDay}
        showAllClients={showAllClients}
        onEditSlot={handleEditSlotFromDay}
        onRemoveFromQueue={handleRemoveFromQueueDay}
      />

      <SchedulePostModal
        isOpen={isScheduleModalOpen}
        onClose={handleScheduleModalClose}
        selectedDate={selectedDate || new Date()}
        selectedTime="" // Default time when opened from calendar
        clientId={clientId || ''}
        onScheduleSuccess={handleScheduleSuccess}
      />

      <ReschedulePostModal
        isOpen={isRescheduleModalOpen}
        onClose={handleCloseRescheduleModal}
        onReschedule={handleRescheduleFromModal}
        selectedDate={selectedPostForReschedule ? new Date(selectedPostForReschedule.scheduledPostAt.seconds * 1000) : null}
        postTitle={selectedPostForReschedule?.title || ''}
      />
    </>
  );
});

PostCalendar.displayName = 'PostCalendar';

export default PostCalendar;
