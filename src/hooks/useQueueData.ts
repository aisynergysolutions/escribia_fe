import { useState, useMemo, useEffect } from 'react';
import { format, addMonths, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';
import { useEvents } from '../context/EventsContext';
import { useScheduledPosts } from './useScheduledPosts';
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
  const [monthsToLoad, setMonthsToLoad] = useState<string[]>([]);

  // Generate initial months (current month and next month)
  useEffect(() => {
    const today = new Date();
    const currentMonth = format(today, 'yyyy-MM');
    const nextMonth = format(addMonths(today, 1), 'yyyy-MM');
    setMonthsToLoad([currentMonth, nextMonth]);
  }, []);

  const { 
    scheduledPosts, 
    refetch: refetchScheduledPosts, 
    optimisticallyUpdatePost, 
    optimisticallyRemovePost, 
    rollbackOptimisticUpdate,
    clearOptimisticUpdate,
    optimisticUpdatesInProgress
  } = useScheduledPosts(clientId, monthsToLoad);

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

    // Get unique dates that have scheduled posts
    const scheduledDates = Array.from(new Set(
      queueSlots.map(slot => format(slot.datetime, 'yyyy-MM-dd'))
    ));

    // Add dates for the loaded months that match active days
    const today = new Date();
    
    // Generate all days for the loaded months
    for (const yearMonth of monthsToLoad) {
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
            if (!scheduledDates.includes(dateStr)) {
              scheduledDates.push(dateStr);
            }
          }
        }
      }
    }

    const groups: { [key: string]: DaySlot[] } = {};

    scheduledDates.sort().forEach((dateStr: string) => {
      const date = new Date(dateStr);
      const dayName = format(date, 'EEEE');
      
      const slotsForDay = queueSlots.filter(slot => 
        format(slot.datetime, 'yyyy-MM-dd') === dateStr
      );

      // Always include days that have scheduled posts, even if not in activeDays
      const hasScheduledPosts = slotsForDay.length > 0;
      const isActiveDay = activeDays.includes(dayName);
      
      // Skip this day only if it has no scheduled posts AND is not an active day
      if (!hasScheduledPosts && !isActiveDay) return;

      groups[dateStr] = [];

      // First, add all scheduled posts for this day (including custom times)
      const addedTimes = new Set<string>();
      
      slotsForDay.forEach(slot => {
        groups[dateStr].push(slot);
        addedTimes.add(format(slot.datetime, 'HH:mm'));
      });

      // Then, add empty slots for predefined timeslots that don't have posts
      // But only for active days (don't add empty slots to non-active days)
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
  }, [queueSlots, hideEmptySlots, predefinedTimeSlots, activeDays, hasTimeslotsConfigured, monthsToLoad, isInitialized]);

  const refreshQueue = () => {
    setRefreshKey(prev => prev + 1);
    refetchScheduledPosts(); // Also refresh scheduled posts from Firestore
  };

  const loadMoreDays = () => {
    // Add the next month to the loaded months
    const lastMonth = monthsToLoad[monthsToLoad.length - 1];
    if (lastMonth) {
      const [year, month] = lastMonth.split('-').map(Number);
      const nextMonth = format(addMonths(new Date(year, month - 1), 1), 'yyyy-MM');
      setMonthsToLoad(prev => [...prev, nextMonth]);
    }
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
