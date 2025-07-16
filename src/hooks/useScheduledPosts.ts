import { useState, useEffect, useCallback } from 'react';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { format } from 'date-fns';

interface ScheduledPost {
  id: string;
  title: string;
  profile: string;
  status: string;
scheduledPostAt: import('firebase/firestore').Timestamp;
  clientId: string;
  timeSlot: string;
  scheduledDate: string;
}

export const useScheduledPosts = (clientId?: string, monthsToLoad?: string[]) => {
  const [scheduledPosts, setScheduledPosts] = useState<ScheduledPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchScheduledPosts = async (targetClientId?: string, targetMonths?: string[]) => {
    setLoading(true);
    setError(null);
    
    try {
      const posts: ScheduledPost[] = [];
      
      if (targetClientId) {
        // If specific months are provided, fetch only those months
        if (targetMonths && targetMonths.length > 0) {
          for (const yearMonth of targetMonths) {
            try {
              const postEventRef = doc(
                db, 
                'agencies', 'agency1', 
                'clients', targetClientId, 
                'postEvents', yearMonth
              );
              
              const postEventSnap = await getDoc(postEventRef);
              
              if (postEventSnap.exists()) {
                const data = postEventSnap.data();
                
                // Each document is a year-month with postId fields
                Object.entries(data).forEach(([postId, postData]: [string, any]) => {
                  if (postData && typeof postData === 'object' && postData.scheduledPostAt) {
                    posts.push({
                      id: postId,
                      title: postData.title || '',
                      profile: postData.profile || '',
                      status: postData.status || 'Scheduled',
                      scheduledPostAt: postData.scheduledPostAt,
                      clientId: targetClientId,
                      timeSlot: postData.timeSlot || '',
                      scheduledDate: postData.scheduledDate || ''
                    });
                  }
                });
              }
            } catch (docError) {
              console.log(`Month document ${yearMonth} doesn't exist or error accessing it, skipping...`);
            }
          }
        } else {
          // Fallback to fetching all months (old behavior)
          const postEventsRef = collection(
            db, 
            'agencies', 'agency1', 
            'clients', targetClientId, 
            'postEvents'
          );
          
          const postEventsSnapshot = await getDocs(postEventsRef);
          
          for (const docSnap of postEventsSnapshot.docs) {
            const data = docSnap.data();
            
            // Each document is a year-month with postId fields
            Object.entries(data).forEach(([postId, postData]: [string, any]) => {
              if (postData && typeof postData === 'object' && postData.scheduledPostAt) {
                posts.push({
                  id: postId,
                  title: postData.title || '',
                  profile: postData.profile || '',
                  status: postData.status || 'Scheduled',
                  scheduledPostAt: postData.scheduledPostAt,
                  clientId: targetClientId,
                  timeSlot: postData.timeSlot || '',
                  scheduledDate: postData.scheduledDate || ''
                });
              }
            });
          }
        }
      } else {
        // Fetch for all clients (for dashboard view)
        const clientsRef = collection(db, 'agencies', 'agency1', 'clients');
        const clientsSnapshot = await getDocs(clientsRef);
        
        for (const clientDoc of clientsSnapshot.docs) {
          const clientId = clientDoc.id;
          const postEventsRef = collection(
            db, 
            'agencies', 'agency1', 
            'clients', clientId, 
            'postEvents'
          );
          
          const postEventsSnapshot = await getDocs(postEventsRef);
          
          for (const docSnap of postEventsSnapshot.docs) {
            const data = docSnap.data();
            
            Object.entries(data).forEach(([postId, postData]: [string, any]) => {
              if (postData && typeof postData === 'object' && postData.scheduledPostAt) {
                posts.push({
                  id: postId,
                  title: postData.title || '',
                  profile: postData.profile || '',
                  status: postData.status || 'Scheduled',
                  scheduledPostAt: postData.scheduledPostAt,
                  clientId: clientId,
                  timeSlot: postData.timeSlot || '',
                  scheduledDate: postData.scheduledDate || ''
                });
              }
            });
          }
        }
      }
      
      // Sort by scheduled date
      posts.sort((a, b) => a.scheduledPostAt.seconds - b.scheduledPostAt.seconds);
      
      setScheduledPosts(posts);
    } catch (err: any) {
      console.error('Error fetching scheduled posts:', err);
      setError(err.message || 'Failed to fetch scheduled posts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (clientId) {
      fetchScheduledPosts(clientId, monthsToLoad);
    }
  }, [clientId, monthsToLoad]);

  const refetch = useCallback(() => {
    if (clientId) {
      fetchScheduledPosts(clientId, monthsToLoad);
    }
  }, [clientId, monthsToLoad]);

  return {
    scheduledPosts,
    loading,
    error,
    fetchScheduledPosts,
    refetch
  };
};