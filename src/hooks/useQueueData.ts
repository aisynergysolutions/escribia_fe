import { useState, useMemo, useEffect } from 'react';
import { format } from 'date-fns';
import { useEvents } from '../context/EventsContext';
import { mockIdeas, mockClients } from '../types';

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
  const { timeslotData, loadingTimeslotData, fetchTimeslotData, updateTimeslots } = useEvents(); // Include updateTimeslots
  const [refreshKey, setRefreshKey] = useState(0);
  const [weeksToShow, setWeeksToShow] = useState(3);

  // Fetch timeslot data when the clientId changes
  useEffect(() => {
    fetchTimeslotData(clientId);
  }, [clientId, fetchTimeslotData]);

  const predefinedTimeSlots = timeslotData?.predefinedTimeSlots || [];
  const activeDays = timeslotData?.activeDays || [];
  const isInitialized = timeslotData?.isInitialized || false;
  const hasTimeslotsConfigured = isInitialized && predefinedTimeSlots.length >= 2 && activeDays.length >= 2;

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
    if (!isInitialized || !hasTimeslotsConfigured) return {};

    // Get unique dates that have scheduled posts
    const scheduledDates = Array.from(new Set(
      queueSlots.map(slot => format(slot.datetime, 'yyyy-MM-dd'))
    ));

    // Add dates for the specified number of weeks that match active days
    const today = new Date();
    const daysToShow = weeksToShow * 7;
    
    for (let i = 0; i < daysToShow; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      const dayName = format(date, 'EEEE');
      
      if (activeDays.includes(dayName)) {
        const dateStr = format(date, 'yyyy-MM-dd');
        if (!scheduledDates.includes(dateStr)) {
          scheduledDates.push(dateStr);
        }
      }
    }

    const groups: { [key: string]: DaySlot[] } = {};

    scheduledDates.sort().forEach(dateStr => {
      const date = new Date(dateStr);
      const dayName = format(date, 'EEEE');
      
      // Only include days that are in activeDays
      if (!activeDays.includes(dayName)) return;
      
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
  }, [queueSlots, hideEmptySlots, predefinedTimeSlots, activeDays, hasTimeslotsConfigured, weeksToShow, isInitialized]);

  const refreshQueue = () => {
    setRefreshKey(prev => prev + 1);
  };

  const loadMoreDays = () => {
    setWeeksToShow(prev => prev + 3);
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
  };
};
