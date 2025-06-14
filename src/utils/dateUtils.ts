
/**
 * Utility functions for formatting dates and timestamps
 */

export interface Timestamp {
  seconds: number;
  nanoseconds?: number;
}

/**
 * Format a timestamp to a readable date string
 */
export const formatDate = (timestamp: Timestamp | number): string => {
  if (!timestamp) return 'N/A';
  
  const date = typeof timestamp === 'number' 
    ? new Date(timestamp * 1000)
    : new Date(timestamp.seconds * 1000);
  
  return date.toLocaleDateString();
};

/**
 * Format a timestamp to a readable date and time string
 */
export const formatDateTime = (timestamp: Timestamp | number): string => {
  if (!timestamp) return 'N/A';
  
  const date = typeof timestamp === 'number' 
    ? new Date(timestamp * 1000)
    : new Date(timestamp.seconds * 1000);
  
  return date.toLocaleString();
};

/**
 * Format a timestamp to a relative time string (e.g., "2 days ago")
 */
export const formatRelativeTime = (timestamp: Timestamp | number): string => {
  if (!timestamp) return 'N/A';
  
  const date = typeof timestamp === 'number' 
    ? new Date(timestamp * 1000)
    : new Date(timestamp.seconds * 1000);
  
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  
  if (diffInDays > 0) {
    return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
  } else if (diffInHours > 0) {
    return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
  } else if (diffInMinutes > 0) {
    return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
  } else {
    return 'Just now';
  }
};

/**
 * Check if a timestamp is today
 */
export const isToday = (timestamp: Timestamp | number): boolean => {
  if (!timestamp) return false;
  
  const date = typeof timestamp === 'number' 
    ? new Date(timestamp * 1000)
    : new Date(timestamp.seconds * 1000);
  
  const today = new Date();
  return date.toDateString() === today.toDateString();
};

/**
 * Format timestamp for display in cards (e.g., "Updated 2 days ago")
 */
export const formatCardDate = (timestamp: Timestamp | number, prefix: string = 'Updated'): string => {
  return `${prefix} ${formatRelativeTime(timestamp)}`;
};
