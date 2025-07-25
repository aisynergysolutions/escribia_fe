import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { format, addMonths } from 'date-fns';
import { useAuth } from './AuthContext';
import { db } from '@/lib/firebase';
import { doc, getDoc, collection, getDocs, Timestamp } from 'firebase/firestore';

interface ScheduledPost {
    id: string;
    title: string;
    profile: string;
    status: string;
    scheduledPostAt: Timestamp;
    clientId: string;
    timeSlot: string;
    scheduledDate: string;
}

interface ScheduledPostsContextType {
    scheduledPosts: ScheduledPost[];
    loading: boolean;
    error: string | null;
    loadedMonths: string[];
    setLoadedMonths: React.Dispatch<React.SetStateAction<string[]>>;
    loadMoreMonths: () => void;
    refetch: () => void;
    optimisticallyUpdatePost: (postId: string, updates: Partial<ScheduledPost>) => void;
    optimisticallyRemovePost: (postId: string) => void;
    rollbackOptimisticUpdate: () => void;
    clearOptimisticUpdate: (postId: string) => void;
    optimisticUpdatesInProgress: Set<string>;
}

const ScheduledPostsContext = createContext<ScheduledPostsContextType | undefined>(undefined);

interface ScheduledPostsProviderProps {
    children: React.ReactNode;
    clientId?: string;
}

export const ScheduledPostsProvider: React.FC<ScheduledPostsProviderProps> = ({
    children,
    clientId
}) => {
    const { currentUser } = useAuth();
    const [scheduledPosts, setScheduledPosts] = useState<ScheduledPost[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [optimisticUpdatesInProgress, setOptimisticUpdatesInProgress] = useState<Set<string>>(new Set());
    const [loadedMonths, setLoadedMonths] = useState<string[]>([]);

    // Get the current agency ID from the authenticated user
    const agencyId = currentUser?.uid;

    // Generate default months (current + next) if not provided
    const defaultMonthsToLoad = useMemo(() => {
        const today = new Date();
        const currentMonth = format(today, 'yyyy-MM');
        const nextMonth = format(addMonths(today, 1), 'yyyy-MM');
        return [currentMonth, nextMonth];
    }, []);

    // Initialize with default months (current + next only for Queue view efficiency)
    useEffect(() => {
        if (loadedMonths.length === 0) {
            console.log('[ScheduledPostsContext] Initializing with default months (current + next):', defaultMonthsToLoad);
            setLoadedMonths(defaultMonthsToLoad);
        }
    }, [defaultMonthsToLoad, loadedMonths.length]);

    const fetchScheduledPosts = useCallback(async (targetClientId?: string, targetMonths?: string[]) => {
        if (!agencyId) {
            console.warn('[ScheduledPostsContext] No agency ID available, skipping fetch');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            console.log('[ScheduledPostsContext] Fetching scheduled posts for agency:', agencyId);
            const posts: ScheduledPost[] = [];

            if (targetClientId) {
                // Use provided months or default to current + next month
                const monthsToFetch = targetMonths && targetMonths.length > 0 ? targetMonths : defaultMonthsToLoad;

                for (const yearMonth of monthsToFetch) {
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
                // Fetch for all clients (for dashboard view)
                const clientsRef = collection(db, 'agencies', agencyId, 'clients');
                const clientsSnapshot = await getDocs(clientsRef);

                for (const clientDoc of clientsSnapshot.docs) {
                    const currentClientId = clientDoc.id;
                    const postEventsRef = collection(
                        db,
                        'agencies', agencyId,
                        'clients', currentClientId,
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
                                    clientId: currentClientId,
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

            console.log('[ScheduledPostsContext] Fetched scheduled posts:', posts.length);
            setScheduledPosts(posts);
        } catch (err: any) {
            console.error('[ScheduledPostsContext] Error fetching scheduled posts:', err);
            setError(err.message || 'Failed to fetch scheduled posts');
        } finally {
            setLoading(false);
        }
    }, [agencyId, defaultMonthsToLoad]);

    useEffect(() => {
        if (agencyId) {
            if (clientId && loadedMonths.length > 0) {
                // Fetch for specific client with loaded months
                fetchScheduledPosts(clientId, loadedMonths);
            } else if (!clientId) {
                // Fetch for all clients (dashboard/calendar view)
                fetchScheduledPosts();
            }
        }
    }, [clientId, loadedMonths, agencyId, fetchScheduledPosts]);

    const refetch = useCallback(() => {
        if (agencyId) {
            if (clientId && loadedMonths.length > 0) {
                fetchScheduledPosts(clientId, loadedMonths);
            } else if (!clientId) {
                fetchScheduledPosts();
            }
        }
    }, [clientId, loadedMonths, agencyId, fetchScheduledPosts]);

    const loadMoreMonths = useCallback(() => {
        const lastMonth = loadedMonths[loadedMonths.length - 1];
        if (lastMonth) {
            const [year, month] = lastMonth.split('-').map(Number);
            const nextMonth = format(addMonths(new Date(year, month - 1), 1), 'yyyy-MM');
            console.log('[ScheduledPostsContext] Loading more months. Adding:', nextMonth);
            setLoadedMonths(prev => [...prev, nextMonth]);
        }
    }, [loadedMonths]);

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

    const value: ScheduledPostsContextType = {
        scheduledPosts,
        loading,
        error,
        loadedMonths,
        setLoadedMonths,
        loadMoreMonths,
        refetch,
        optimisticallyUpdatePost,
        optimisticallyRemovePost,
        rollbackOptimisticUpdate,
        clearOptimisticUpdate,
        optimisticUpdatesInProgress
    };

    return (
        <ScheduledPostsContext.Provider value={value}>
            {children}
        </ScheduledPostsContext.Provider>
    );
};

export const useScheduledPostsContext = () => {
    const context = useContext(ScheduledPostsContext);
    if (context === undefined) {
        throw new Error('useScheduledPostsContext must be used within a ScheduledPostsProvider');
    }
    return context;
};
