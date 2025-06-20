
import { format } from 'date-fns';
import { mockIdeas } from '../types';

export const useQueueOperations = (refreshQueue: () => void) => {
  const handleRemoveFromQueue = (slotId: string) => {
    console.log('Remove from queue:', slotId);
    const postIndex = mockIdeas.findIndex(idea => idea.id === slotId);
    if (postIndex !== -1) {
      mockIdeas[postIndex].status = 'Draft';
      mockIdeas[postIndex].scheduledPostAt = undefined;
      refreshQueue();
    }
  };

  const handleMoveToTop = (slotId: string, queueSlots: any[]) => {
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
        refreshQueue();
      }
    }
  };

  const handleReschedule = (selectedPost: any, newDateTime: Date) => {
    if (selectedPost) {
      console.log('Reschedule post:', selectedPost.id, 'to:', format(newDateTime, 'yyyy-MM-dd HH:mm'));
      
      const postIndex = mockIdeas.findIndex(idea => idea.id === selectedPost.id);
      if (postIndex !== -1) {
        mockIdeas[postIndex].scheduledPostAt = {
          seconds: Math.floor(newDateTime.getTime() / 1000),
          nanoseconds: 0
        };
        
        refreshQueue();
        console.log('Post successfully rescheduled to:', newDateTime);
      }
    }
  };

  return {
    handleRemoveFromQueue,
    handleMoveToTop,
    handleReschedule
  };
};
