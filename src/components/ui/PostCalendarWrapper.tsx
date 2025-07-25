import React from 'react';
import { useScheduledPosts } from '../../hooks/useScheduledPosts';
import PostCalendar from './PostCalendar';
import { ScheduledPostsProvider } from '../../context/ScheduledPostsContext';

interface PostCalendarWrapperProps {
    showAllClients?: boolean;
    clientId?: string;
    clientName?: string;
    hideTitle?: boolean;
    onMonthChange?: (month: Date) => void;
    currentMonth?: Date;
    onPostScheduled?: () => void;
}

const PostCalendarWrapper: React.FC<PostCalendarWrapperProps> = (props) => {
    // If showing all clients, use the component without context provider
    if (props.showAllClients) {
        return <PostCalendarLegacy {...props} />;
    }

    // If specific client, wrap with provider
    return (
        <ScheduledPostsProvider clientId={props.clientId}>
            <PostCalendar {...props} />
        </ScheduledPostsProvider>
    );
};

// Legacy component for all-clients view
const PostCalendarLegacy: React.FC<PostCalendarWrapperProps> = (props) => {
    const { scheduledPosts, loading, refetch } = useScheduledPosts();

    // Create a mock context value for the legacy component
    const mockContextValue = {
        scheduledPosts,
        loading,
        error: null,
        loadedMonths: [],
        setLoadedMonths: () => { },
        loadMoreMonths: () => { },
        refetch,
        optimisticallyUpdatePost: () => { },
        optimisticallyRemovePost: () => { },
        rollbackOptimisticUpdate: () => { },
        clearOptimisticUpdate: () => { },
        optimisticUpdatesInProgress: new Set()
    };

    // Create a temporary provider just for this component
    return (
        <ScheduledPostsProvider clientId={undefined}>
            <PostCalendar {...props} />
        </ScheduledPostsProvider>
    );
};

export default PostCalendarWrapper;
