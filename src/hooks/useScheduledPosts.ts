import { useState, useEffect, useCallback } from 'react';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { format } from 'date-fns';
import { useAuth } from '@/context/AuthContext';

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
  const { currentUser } = useAuth();
  const [scheduledPosts, setScheduledPosts] = useState<ScheduledPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [optimisticUpdatesInProgress, setOptimisticUpdatesInProgress] = useState<Set<string>>(new Set());

  // Get the current agency ID from the authenticated user
  const agencyId = currentUser?.uid;

  const fetchScheduledPosts = async (targetClientId?: string, targetMonths?: string[]) => {
    if (!agencyId) {
      console.warn('[useScheduledPosts] No agency ID available, skipping fetch');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      console.log('[useScheduledPosts] Fetching scheduled posts for agency:', agencyId);
      const posts: ScheduledPost[] = [];
      
      if (targetClientId) {
        // If specific months are provided, fetch only those months
        if (targetMonths && targetMonths.length > 0) {
          for (const yearMonth of targetMonths) {
            try {
              const postEventRef = doc(
                db, 
                'agencies', agencyId, 
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
            'agencies', agencyId, 
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
        const clientsRef = collection(db, 'agencies', agencyId, 'clients');
        const clientsSnapshot = await getDocs(clientsRef);
        
        for (const clientDoc of clientsSnapshot.docs) {
          const clientId = clientDoc.id;
          const postEventsRef = collection(
            db, 
            'agencies', agencyId, 
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
      
      console.log('[useScheduledPosts] Fetched scheduled posts:', posts.length);
      setScheduledPosts(posts);
    } catch (err: any) {
      console.error('[useScheduledPosts] Error fetching scheduled posts:', err);
      setError(err.message || 'Failed to fetch scheduled posts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (clientId && agencyId) {
      fetchScheduledPosts(clientId, monthsToLoad);
    }
  }, [clientId, monthsToLoad, agencyId]);

  const refetch = useCallback(() => {
    if (clientId && agencyId) {
      fetchScheduledPosts(clientId, monthsToLoad);
    }
  }, [clientId, monthsToLoad, agencyId]);

  // Optimistic update functions
  const optimisticallyUpdatePost = useCallback((postId: string, updates: Partial<ScheduledPost>) => {
    setOptimisticUpdatesInProgress(prev => new Set(prev).add(postId));
    setScheduledPosts(prevPosts => 
      prevPosts.map(post => 
        post.id === postId 
          ? { ...post, ...updates }
          : post
      )
    );
  }, []);

  const optimisticallyRemovePost = useCallback((postId: string) => {
    setOptimisticUpdatesInProgress(prev => new Set(prev).add(postId));
    setScheduledPosts(prevPosts => 
      prevPosts.filter(post => post.id !== postId)
    );
  }, []);

  const rollbackOptimisticUpdate = useCallback(() => {
    // Refetch from database to restore original state
    setOptimisticUpdatesInProgress(new Set());
    refetch();
  }, [refetch]);

  const clearOptimisticUpdate = useCallback((postId: string) => {
    setOptimisticUpdatesInProgress(prev => {
      const newSet = new Set(prev);
      newSet.delete(postId);
      return newSet;
    });
  }, []);

  return {
    scheduledPosts,
    loading,
    error,
    fetchScheduledPosts,
    refetch,
    optimisticallyUpdatePost,
    optimisticallyRemovePost,
    rollbackOptimisticUpdate,
    clearOptimisticUpdate,
    optimisticUpdatesInProgress
  };
};