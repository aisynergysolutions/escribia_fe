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
    postedAt?: Timestamp; // Add optional postedAt field for posted posts
    message?: string; // Add optional message field for error posts
}

interface ScheduledPostsContextType {
    scheduledPosts: ScheduledPost[];
    loading: boolean;
    error: string | null;
    loadedMonths: string[];
    setLoadedMonths: React.Dispatch<React.SetStateAction<string[]>>;
    loadMoreMonths: () => void;
    loadPreviousMonths: () => void; // Add function to load previous months
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
    const [fetchedMonths, setFetchedMonths] = useState<Set<string>>(new Set()); // Track which months have been fetched

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

    // Reset fetched months when client changes
    useEffect(() => {
        if (clientId) {
            console.log('[ScheduledPostsContext] Client changed, resetting fetched months');
            setFetchedMonths(new Set());
        }
    }, [clientId]);

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
                                // Include posts with either scheduledPostAt (scheduled) or postedAt (posted)
                                if (postData && typeof postData === 'object' && (postData.scheduledPostAt || postData.postedAt)) {
                                    posts.push({
                                        id: postId,
                                        title: postData.title || '',
                                        profile: postData.profile || '',
                                        status: postData.status || (postData.postedAt ? 'Posted' : 'Scheduled'),
                                        scheduledPostAt: postData.scheduledPostAt || postData.postedAt, // Use postedAt as fallback for display
                                        clientId: targetClientId,
                                        timeSlot: postData.timeSlot || '',
                                        scheduledDate: postData.scheduledDate || '',
                                        postedAt: postData.postedAt, // Add postedAt field for posted posts
                                        message: postData.message // Add message field for error posts
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
                            // Include posts with either scheduledPostAt (scheduled) or postedAt (posted)
                            if (postData && typeof postData === 'object' && (postData.scheduledPostAt || postData.postedAt)) {
                                posts.push({
                                    id: postId,
                                    title: postData.title || '',
                                    profile: postData.profile || '',
                                    status: postData.status || (postData.postedAt ? 'Posted' : 'Scheduled'),
                                    scheduledPostAt: postData.scheduledPostAt || postData.postedAt, // Use postedAt as fallback for display
                                    clientId: currentClientId,
                                    timeSlot: postData.timeSlot || '',
                                    scheduledDate: postData.scheduledDate || '',
                                    postedAt: postData.postedAt, // Add postedAt field for posted posts
                                    message: postData.message // Add message field for error posts
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

    // Optimized function to fetch only new months and merge with existing data
    const fetchNewMonthsAndMerge = useCallback(async (targetClientId: string, newMonths: string[]) => {
        if (!agencyId) {
            console.warn('[ScheduledPostsContext] No agency ID available, skipping fetch');
            return;
        }

        // Identify which months are actually new (not already fetched)
        const monthsToFetch = newMonths.filter(month => !fetchedMonths.has(month));

        if (monthsToFetch.length === 0) {
            console.log('[ScheduledPostsContext] No new months to fetch');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            console.log('[ScheduledPostsContext] Fetching new months:', monthsToFetch);
            const newPosts: ScheduledPost[] = [];

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
                            // Include posts with either scheduledPostAt (scheduled) or postedAt (posted)
                            if (postData && typeof postData === 'object' && (postData.scheduledPostAt || postData.postedAt)) {
                                newPosts.push({
                                    id: postId,
                                    title: postData.title || '',
                                    profile: postData.profile || '',
                                    status: postData.status || (postData.postedAt ? 'Posted' : 'Scheduled'),
                                    scheduledPostAt: postData.scheduledPostAt || postData.postedAt, // Use postedAt as fallback for display
                                    clientId: targetClientId,
                                    timeSlot: postData.timeSlot || '',
                                    scheduledDate: postData.scheduledDate || '',
                                    postedAt: postData.postedAt, // Add postedAt field for posted posts
                                    message: postData.message // Add message field for error posts
                                });
                            }
                        });
                    }

                    // Mark this month as fetched
                    setFetchedMonths(prev => new Set(prev).add(yearMonth));
                } catch (docError) {
                    console.log(`Month document ${yearMonth} doesn't exist or error accessing it, skipping...`);
                    // Still mark as "fetched" to avoid retrying
                    setFetchedMonths(prev => new Set(prev).add(yearMonth));
                }
            }

            // Merge new posts with existing posts
            setScheduledPosts(prevPosts => {
                const allPosts = [...prevPosts, ...newPosts];
                // Remove duplicates based on post ID
                const uniquePosts = allPosts.reduce((acc, post) => {
                    if (!acc.find(p => p.id === post.id)) {
                        acc.push(post);
                    }
                    return acc;
                }, [] as ScheduledPost[]);

                // Sort by scheduled date
                uniquePosts.sort((a, b) => a.scheduledPostAt.seconds - b.scheduledPostAt.seconds);

                console.log('[ScheduledPostsContext] Merged posts. New:', newPosts.length, 'Total:', uniquePosts.length);
                return uniquePosts;
            });
        } catch (err: any) {
            console.error('[ScheduledPostsContext] Error fetching new months:', err);
            setError(err.message || 'Failed to fetch new months');
        } finally {
            setLoading(false);
        }
    }, [agencyId, fetchedMonths]);

    useEffect(() => {
        if (agencyId) {
            if (clientId && loadedMonths.length > 0) {
                // Check if this is the initial load or if we have new months
                const isInitialLoad = fetchedMonths.size === 0;

                if (isInitialLoad) {
                    // Initial load: fetch all months and mark them as fetched
                    console.log('[ScheduledPostsContext] Initial load for months:', loadedMonths);
                    fetchScheduledPosts(clientId, loadedMonths);
                    setFetchedMonths(new Set(loadedMonths));
                } else {
                    // Incremental load: fetch only new months
                    fetchNewMonthsAndMerge(clientId, loadedMonths);
                }
            } else if (!clientId) {
                // Fetch for all clients (dashboard/calendar view)
                fetchScheduledPosts();
            }
        }
    }, [clientId, loadedMonths, agencyId, fetchScheduledPosts, fetchNewMonthsAndMerge, fetchedMonths]);

    const refetch = useCallback(() => {
        if (agencyId) {
            if (clientId && loadedMonths.length > 0) {
                // Reset fetched months and do a full refetch
                console.log('[ScheduledPostsContext] Full refetch requested');
                setFetchedMonths(new Set());
                fetchScheduledPosts(clientId, loadedMonths);
                setFetchedMonths(new Set(loadedMonths));
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

    const loadPreviousMonths = useCallback(() => {
        const firstMonth = loadedMonths[0];
        if (firstMonth) {
            const [year, month] = firstMonth.split('-').map(Number);
            const previousMonth = format(addMonths(new Date(year, month - 1), -1), 'yyyy-MM');
            console.log('[ScheduledPostsContext] Loading previous months. Adding:', previousMonth);
            setLoadedMonths(prev => [previousMonth, ...prev]);
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
        loadPreviousMonths,
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
