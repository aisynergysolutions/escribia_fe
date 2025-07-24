import { useState, useMemo, useEffect } from 'react';
import { format, addMonths, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';
import { useEvents } from '../context/EventsContext';
import { useScheduledPostsContext } from '../context/ScheduledPostsContext';
import { mockClients } from '../types';

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

export type DaySlot = QueueSlot | EmptySlot;

export const useQueueData = (clientId: string, hideEmptySlots: boolean) => {
  const { timeslotData, loadingTimeslotData, fetchTimeslotData, updateTimeslots } = useEvents();
  const [refreshKey, setRefreshKey] = useState(0);

  // Use the shared scheduled posts context
  const { 
    scheduledPosts, 
    loadedMonths,
    loadMoreMonths,
    refetch: refetchScheduledPosts, 
    optimisticallyUpdatePost, 
    optimisticallyRemovePost, 
    rollbackOptimisticUpdate,
    clearOptimisticUpdate,
    optimisticUpdatesInProgress
  } = useScheduledPostsContext();

  // Fetch timeslot data when the clientId changes
  useEffect(() => {
    fetchTimeslotData(clientId);
  }, [clientId, fetchTimeslotData]);

  const predefinedTimeSlots = timeslotData?.predefinedTimeSlots || [];
  const activeDays = timeslotData?.activeDays || [];
  const isInitialized = timeslotData?.isInitialized || false;
  const hasTimeslotsConfigured = isInitialized && predefinedTimeSlots.length >= 2 && activeDays.length >= 2;

  // Get scheduled posts for this client (from Firestore via useScheduledPosts)
  const queueSlots = useMemo(() => {
    const client = mockClients.find(c => c.id === clientId);

    return scheduledPosts.map(post => ({
      id: post.id,
      datetime: new Date(post.scheduledPostAt.seconds * 1000),
      title: post.title,
      preview: post.title.length > 60 ? 
        post.title.substring(0, 60) + '...' : 
        post.title,
      status: post.status,
      clientId: post.clientId,
      clientName: client?.clientName || 'Unknown Client',
      clientAvatar: client?.profileImage,
      authorName: post.profile || 'Unknown Profile', // Use the actual profile name from Firestore
      authorAvatar: undefined // Will use fallback
    })).sort((a, b) => a.datetime.getTime() - b.datetime.getTime());
  }, [scheduledPosts, clientId, refreshKey]);

  // Group slots by day with empty placeholders
  const dayGroups = useMemo(() => {
    if (!isInitialized || !hasTimeslotsConfigured) return {};

    // Get dates that have scheduled posts
    const datesWithPosts = new Set(
      queueSlots.map(slot => format(slot.datetime, 'yyyy-MM-dd'))
    );

    // Generate ALL dates to display (both scheduled and empty active days)
    const allDatesToShow = new Set<string>();
    const today = new Date();
    
    // First, add all dates that have scheduled posts
    datesWithPosts.forEach(dateStr => allDatesToShow.add(dateStr));
    
    // Then, add all active days from loaded months (regardless of posts)
    for (const yearMonth of loadedMonths) {
      const [year, month] = yearMonth.split('-').map(Number);
      const monthStart = startOfMonth(new Date(year, month - 1));
      const monthEnd = endOfMonth(new Date(year, month - 1));
      const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });
      
      for (const day of monthDays) {
        // Only include days from today onwards
        if (day >= today) {
          const dayName = format(day, 'EEEE');
          
          if (activeDays.includes(dayName)) {
            const dateStr = format(day, 'yyyy-MM-dd');
            allDatesToShow.add(dateStr);
          }
        }
      }
    }

    // Convert to sorted array
    const scheduledDates = Array.from(allDatesToShow).sort();

    const groups: { [key: string]: DaySlot[] } = {};

    scheduledDates.forEach((dateStr: string) => {
      const date = new Date(dateStr);
      const dayName = format(date, 'EEEE');
      
      const slotsForDay = queueSlots.filter(slot => 
        format(slot.datetime, 'yyyy-MM-dd') === dateStr
      );

      // This date is either an active day or has scheduled posts (filtered in collection phase)
      const isActiveDay = activeDays.includes(dayName);

      groups[dateStr] = [];

      // First, add all scheduled posts for this day (including custom times)
      const addedTimes = new Set<string>();
      
      slotsForDay.forEach(slot => {
        groups[dateStr].push(slot);
        addedTimes.add(format(slot.datetime, 'HH:mm'));
      });

      // Then, add empty slots for predefined timeslots that don't have posts
      // But only for active days and when not hiding empty slots
      if (!hideEmptySlots && isActiveDay) {
        predefinedTimeSlots.forEach(timeSlot => {
          if (!addedTimes.has(timeSlot)) {
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
      }

      // Sort slots by time
      groups[dateStr].sort((a, b) => {
        const timeA = 'isEmpty' in a ? a.datetime.getTime() : a.datetime.getTime();
        const timeB = 'isEmpty' in b ? b.datetime.getTime() : b.datetime.getTime();
        return timeA - timeB;
      });
    });

    return groups;
  }, [queueSlots, hideEmptySlots, predefinedTimeSlots, activeDays, hasTimeslotsConfigured, loadedMonths, isInitialized]);

  const refreshQueue = () => {
    setRefreshKey(prev => prev + 1);
    refetchScheduledPosts(); // Also refresh scheduled posts from Firestore
  };

  const loadMoreDays = () => {
    // Use the shared context function to load more months
    loadMoreMonths();
  };

  return {
    queueSlots,
    dayGroups,
    refreshQueue,
    hasTimeslotsConfigured,
    predefinedTimeSlots,
    activeDays,
    loadMoreDays,
    loadingTimeslotData,
    updateTimeslots, // Expose the function
    isInitialized,
    optimisticallyUpdatePost,
    optimisticallyRemovePost,
    rollbackOptimisticUpdate,
    clearOptimisticUpdate,
    optimisticUpdatesInProgress,
  };
};
