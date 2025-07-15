import { useState, useEffect } from 'react';
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

export const useScheduledPosts = (clientId?: string) => {
  const [scheduledPosts, setScheduledPosts] = useState<ScheduledPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchScheduledPosts = async (targetClientId?: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const posts: ScheduledPost[] = [];
      
      if (targetClientId) {
        // Fetch for specific client
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
      fetchScheduledPosts(clientId);
    }
  }, [clientId]);

  return {
    scheduledPosts,
    loading,
    error,
    fetchScheduledPosts,
    refetch: () => fetchScheduledPosts(clientId)
  };
};