import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, startOfWeek, endOfWeek } from 'date-fns';
import { ArrowLeft, ArrowRight, SquareCheckBig, ChevronLeft, ChevronRight, Clock, AlertTriangle } from 'lucide-react';
import { Button } from './button';
import { mockClients } from '../../types';
import { useParams, useNavigate } from 'react-router-dom';
import { useScheduledPostsContext } from '../../context/ScheduledPostsContext';
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
  const { clientId: routeClientId } = useParams<{ clientId: string }>();
  const navigate = useNavigate();

  // Use prop clientId if provided, otherwise fall back to route params
  const clientId = propClientId || routeClientId;

  // Use external month if provided, otherwise use internal state
  const currentMonth = externalCurrentMonth || internalCurrentMonth;

  // Use the shared scheduled posts context
  const {
    scheduledPosts,
    loading,
    loadedMonths,
    setLoadedMonths,
    loadPreviousMonths,
    refetch
  } = useScheduledPostsContext();

  // Ensure the current viewing month is always loaded
  useEffect(() => {
    const currentMonthStr = format(currentMonth, 'yyyy-MM');
    setLoadedMonths(prevMonths => {
      if (!prevMonths.includes(currentMonthStr)) {
        return [...prevMonths, currentMonthStr];
      }
      return prevMonths;
    });
  }, [currentMonth, setLoadedMonths]);

  // Memoize month calculations
  const monthData = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);

    // Get the start of the week for the first day of the month (includes padding from previous month)
    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 }); // 1 = Monday

    // Get the end of the week for the last day of the month (includes padding from next month)
    const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

    // Get all days to display in the calendar grid (typically 42 days: 6 weeks × 7 days)
    const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

    return { monthStart, monthEnd, calendarDays };
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
    const newMonthStr = format(newMonth, 'yyyy-MM');

    // Load previous month data if not already loaded
    if (!loadedMonths.includes(newMonthStr)) {
      loadPreviousMonths();
    }

    if (onMonthChange) {
      onMonthChange(newMonth);
    } else {
      setInternalCurrentMonth(newMonth);
    }
  }, [currentMonth, onMonthChange, loadedMonths, loadPreviousMonths]);

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
    return monthData.calendarDays.map(day => {
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
                  <div>
                    {/* Group posts by status and display separate indicators */}
                    {(() => {
                      const scheduledPosts = postsForDay.filter(p => p.status !== 'Posted' && p.status !== 'Error');
                      const postedPosts = postsForDay.filter(p => p.status === 'Posted');
                      const errorPosts = postsForDay.filter(p => p.status === 'Error');

                      return (
                        <>
                          {scheduledPosts.length > 0 && (
                            <div className="bg-blue-100 text-blue-800 text-xs p-1 rounded mb-1">
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3 flex-shrink-0" />
                                <span className="font-medium">
                                  {scheduledPosts.length} scheduled
                                </span>
                              </div>
                            </div>
                          )}
                          {postedPosts.length > 0 && (
                            <div className="bg-green-100 text-green-800 text-xs p-1 rounded mb-1">
                              <div className="flex items-center gap-1">
                                <SquareCheckBig className="h-3 w-3 flex-shrink-0" />
                                <span className="font-medium">
                                  {postedPosts.length} posted
                                </span>
                              </div>
                            </div>
                          )}
                          {errorPosts.length > 0 && (
                            <div className="bg-red-100 text-red-800 text-xs p-1 rounded">
                              <div className="flex items-center gap-1">
                                <AlertTriangle className="h-3 w-3 flex-shrink-0" />
                                <span className="font-medium">
                                  {errorPosts.length} failed
                                </span>
                              </div>
                            </div>
                          )}
                        </>
                      );
                    })()}
                  </div>
                ) : (
                  (() => {
                    const post = postsForDay[0];
                    const isPosted = post.status === 'Posted';
                    const isError = post.status === 'Error';

                    let bgColor, textColor, profileTextColor, icon;

                    if (isError) {
                      bgColor = 'bg-red-100';
                      textColor = 'text-red-800';
                      profileTextColor = 'text-red-600';
                      icon = <AlertTriangle className="h-3 w-3 flex-shrink-0" />;
                    } else if (isPosted) {
                      bgColor = 'bg-green-100';
                      textColor = 'text-green-800';
                      profileTextColor = 'text-green-600';
                      icon = <SquareCheckBig className="h-3 w-3 flex-shrink-0" />;
                    } else {
                      bgColor = 'bg-blue-100';
                      textColor = 'text-blue-800';
                      profileTextColor = 'text-blue-600';
                      icon = <Clock className="h-3 w-3 flex-shrink-0" />;
                    }

                    return (
                      <div className={`${bgColor} ${textColor} text-xs p-1 rounded`} title={isError ? post.message : undefined}>
                        <div className="flex items-center gap-1 mb-0">
                          {icon}
                          <span className="truncate">
                            {format(new Date(post.scheduledPostAt!.seconds * 1000), 'HH:mm')}
                          </span>
                        </div>
                        <div className="truncate text-xs font-medium">
                          {post.title}
                        </div>
                        {isError && post.message && (
                          <div className="truncate text-xs mt-0.5 text-red-500">
                            {post.message}
                          </div>
                        )}
                        {showAllClients && (
                          <div className={`truncate text-xs mt-0.5 ${profileTextColor} font-medium`}>
                            {post.profile || 'Unknown Profile'}
                          </div>
                        )}
                      </div>
                    );
                  })()
                )}
              </div>
            )}
          </div>
        </div>
      );
    });
  }, [monthData.calendarDays, getPostsForDay, currentMonth, handleDayClick, showAllClients, getClientName]);

  return (
    <>
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-8">
        {!hideTitle && (
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {getCalendarTitle()}
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                View and manage your scheduled content
              </p>
            </div>
            <div className="flex items-center gap-0">
              <Button variant="ghost" size="icon" onClick={goToPreviousMonth}>
                <ArrowLeft className="h-3 w-3 text-gray-500" />
              </Button>
              <span className="font-medium min-w-[80px] text-center">
                {format(currentMonth, 'MMMM yyyy')}
              </span>
              <Button variant="ghost" size="icon" onClick={goToNextMonth}>
                <ArrowRight className="h-3 w-3 text-gray-500" />
              </Button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-7 gap-1 mb-2">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
            <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {calendarDays}
        </div>

        {/* {scheduledPosts.length === 0 && (
          <div className="text-center text-gray-500 mt-4 py-8">
            No scheduled posts found
          </div>
        )} */}
      </div>

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
