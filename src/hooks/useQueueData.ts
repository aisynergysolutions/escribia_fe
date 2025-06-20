
import { useState, useMemo } from 'react';
import { format } from 'date-fns';
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
  const [refreshKey, setRefreshKey] = useState(0);
  
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

  const refreshQueue = () => {
    setRefreshKey(prev => prev + 1);
  };

  return {
    queueSlots,
    dayGroups,
    refreshQueue
  };
};
