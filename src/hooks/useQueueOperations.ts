
import { format, addMonths } from 'date-fns';
import { mockIdeas } from '../types';
import { Timestamp, doc, setDoc, getDoc, updateDoc, deleteField } from 'firebase/firestore';
import { db } from '../lib/firebase';

export const useQueueOperations = (refreshQueue: () => void) => {
  const handleRemoveFromQueue = async (slotId: string, clientId: string) => {
    console.log('Remove from queue:', slotId);
    
    try {
      // Search through month documents to find and remove the scheduled post
      const currentDate = new Date();
      const monthsToCheck = [];
      
      // Generate a list of month documents to check (current month + 5 months ahead)
      for (let i = 0; i <= 5; i++) {
        const monthDate = addMonths(currentDate, i);
        monthsToCheck.push(format(monthDate, 'yyyy-MM'));
      }
      
      // Search through month documents to find the existing scheduled post
      for (const yearMonth of monthsToCheck) {
        const postEventRef = doc(
          db, 
          'agencies', 'agency1', 
          'clients', clientId, 
          'postEvents', yearMonth
        );
        
        try {
          const monthDocSnap = await getDoc(postEventRef);
          
          if (monthDocSnap.exists()) {
            const data = monthDocSnap.data();
            // Check if this post exists in this month document
            if (data[slotId]) {
              console.log(`Found scheduled post in ${yearMonth}, removing it...`);
              
              // Remove the post from this month document
              await updateDoc(postEventRef, {
                [slotId]: deleteField()
              });
              
              break; // Found and removed, no need to check other months
            }
          }
        } catch (error) {
          console.log(`Month document ${yearMonth} doesn't exist or error accessing it, skipping...`);
        }
      }
      
      // Update the post status in the ideas collection back to 'Draft'
      const postRef = doc(
        db,
        'agencies', 'agency1',
        'clients', clientId,
        'ideas', slotId
      );

      await setDoc(postRef, {
        status: 'Drafted',
        scheduledPostAt: Timestamp.fromMillis(0),
        updatedAt: Timestamp.now()
      }, { merge: true });
      
      refreshQueue();
      console.log('Post successfully removed from queue');
    } catch (error) {
      console.error('Error removing post from queue:', error);
    }
  };

  const handleEditSlot = async (slotId: string, clientId: string, newDateTime: Date, newTimeSlot: string) => {
    console.log('Edit slot:', slotId, 'to:', format(newDateTime, 'yyyy-MM-dd HH:mm'));
    
    try {
      // First, remove the post from its current location (reuse the remove logic)
      const currentDate = new Date();
      const monthsToCheck = [];
      
      // Generate a list of month documents to check (current month + 5 months ahead)
      for (let i = 0; i <= 5; i++) {
        const monthDate = addMonths(currentDate, i);
        monthsToCheck.push(format(monthDate, 'yyyy-MM'));
      }
      
      let postData = null;
      
      // Search through month documents to find the existing scheduled post
      for (const yearMonth of monthsToCheck) {
        const postEventRef = doc(
          db, 
          'agencies', 'agency1', 
          'clients', clientId, 
          'postEvents', yearMonth
        );
        
        try {
          const monthDocSnap = await getDoc(postEventRef);
          
          if (monthDocSnap.exists()) {
            const data = monthDocSnap.data();
            // Check if this post exists in this month document
            if (data[slotId]) {
              console.log(`Found existing scheduled post in ${yearMonth}, moving it...`);
              
              // Store the post data for rescheduling
              postData = data[slotId];
              
              // Remove the post from this month document
              await updateDoc(postEventRef, {
                [slotId]: deleteField()
              });
              
              break; // Found and removed, no need to check other months
            }
          }
        } catch (error) {
          console.log(`Month document ${yearMonth} doesn't exist or error accessing it, skipping...`);
        }
      }
      
      if (!postData) {
        console.error('Could not find the post to reschedule');
        return;
      }
      
      // Create year-month document name for the new schedule
      const newYearMonth = format(newDateTime, 'yyyy-MM');
      
      // Prepare the updated post event data
      const updatedPostEventData = {
        ...postData,
        scheduledPostAt: Timestamp.fromDate(newDateTime),
        scheduledDate: newDateTime.toISOString(),
        timeSlot: newTimeSlot,
        updatedAt: Timestamp.now()
      };

      // Save to Firestore in the new postEvents collection
      const newPostEventRef = doc(
        db, 
        'agencies', 'agency1', 
        'clients', clientId, 
        'postEvents', newYearMonth
      );

      // Update the new year-month document with the post field
      await setDoc(newPostEventRef, {
        [slotId]: updatedPostEventData
      }, { merge: true });

      // Update the post status in the ideas collection
      const postRef = doc(
        db,
        'agencies', 'agency1',
        'clients', clientId,
        'ideas', slotId
      );

      await setDoc(postRef, {
        status: 'Scheduled',
        scheduledPostAt: Timestamp.fromDate(newDateTime),
        updatedAt: Timestamp.now()
      }, { merge: true });
      
      refreshQueue();
      console.log('Post successfully rescheduled to:', newDateTime);
    } catch (error) {
      console.error('Error rescheduling post:', error);
    }
  };

  const handleMoveToTop = (slotId: string, queueSlots: any[]) => {
    console.log('Move to top:', slotId);
    const earliestPost = queueSlots.filter(slot => slot.id !== slotId)[0];
    if (earliestPost) {
      const newTime = new Date(earliestPost.datetime.getTime() - 30 * 60 * 1000);
      const postIndex = mockIdeas.findIndex(idea => idea.id === slotId);
      if (postIndex !== -1) {
        mockIdeas[postIndex].scheduledPostAt = Timestamp.fromMillis(newTime.getTime());
        refreshQueue();
      }
    }
  };

  const handleReschedule = (selectedPost: any, newDateTime: Date) => {
    if (selectedPost) {
      console.log('Reschedule post:', selectedPost.id, 'to:', format(newDateTime, 'yyyy-MM-dd HH:mm'));
      
      const postIndex = mockIdeas.findIndex(idea => idea.id === selectedPost.id);
      if (postIndex !== -1) {
        mockIdeas[postIndex].scheduledPostAt = Timestamp.fromMillis(newDateTime.getTime());
        
        refreshQueue();
        console.log('Post successfully rescheduled to:', newDateTime);
      }
    }
  };

  return {
    handleRemoveFromQueue,
    handleEditSlot,
    handleMoveToTop,
    handleReschedule
  };
};
