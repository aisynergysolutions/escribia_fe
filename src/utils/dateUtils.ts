
/**
 * Utility functions for formatting dates and timestamps
 */

export interface Timestamp {
  seconds: number;
  nanoseconds?: number;
}

// Union type to handle all possible timestamp formats
export type TimestampInput = Timestamp | number | Date | string | null | undefined;

/**
 * Normalize different timestamp formats to a valid Date object
 */
const normalizeTimestamp = (timestamp: TimestampInput): Date | null => {
  if (!timestamp) return null;
  
  let date: Date;
  
  try {
    if (typeof timestamp === 'number') {
      // Handle both milliseconds and seconds timestamps
      // If the number is less than a reasonable millisecond timestamp (year 2001),
      // assume it's in seconds
      const msTimestamp = timestamp < 1000000000000 ? timestamp * 1000 : timestamp;
      date = new Date(msTimestamp);
    } else if (timestamp && typeof timestamp === 'object' && 'seconds' in timestamp) {
      // Firestore Timestamp object
      date = new Date(timestamp.seconds * 1000);
    } else if (timestamp instanceof Date) {
      // Native Date object
      date = timestamp;
    } else if (typeof timestamp === 'string') {
      // Date string
      date = new Date(timestamp);
    } else {
      // Fallback for any other format
      date = new Date(timestamp as any);
    }
    
    // Validate the date is valid
    if (isNaN(date.getTime())) {
      return null;
    }
    
    return date;
  } catch (error) {
    console.warn('Error normalizing timestamp:', error, { timestamp });
    return null;
  }
};

/**
 * Format a timestamp to a readable date string
 */
export const formatDate = (timestamp: TimestampInput): string => {
  const date = normalizeTimestamp(timestamp);
  if (!date) return 'Invalid date';
  
  return date.toLocaleDateString();
};

/**
 * Format a timestamp to a readable date and time string
 */
export const formatDateTime = (timestamp: TimestampInput): string => {
  const date = normalizeTimestamp(timestamp);
  if (!date) return 'Invalid date';
  
  return date.toLocaleString();
};

/**
 * Format a timestamp to a relative time string (e.g., "2 days ago" or "in 3 days")
 */
export const formatRelativeTime = (timestamp: TimestampInput): string => {
  const date = normalizeTimestamp(timestamp);
  if (!date) return 'Invalid date';
  
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const absDiffInMs = Math.abs(diffInMs);
  const diffInDays = Math.floor(absDiffInMs / (1000 * 60 * 60 * 24));
  const diffInHours = Math.floor(absDiffInMs / (1000 * 60 * 60));
  const diffInMinutes = Math.floor(absDiffInMs / (1000 * 60));
  
  // Debug logging for scheduled posts (remove in production)
  if (process.env.NODE_ENV === 'development') {
    try {
      console.log('formatRelativeTime debug:', {
        timestamp,
        date: date.toISOString(),
        now: now.toISOString(),
        diffInMs,
        absDiffInMs,
        diffInDays,
        diffInHours,
        diffInMinutes,
        isFuture: diffInMs < 0
      });
    } catch (error) {
      console.warn('Error in formatRelativeTime debug logging:', error, { timestamp });
    }
  }
  
  const isFuture = diffInMs < 0;
  
  if (diffInDays > 0) {
    return isFuture 
      ? `in ${diffInDays} day${diffInDays > 1 ? 's' : ''}`
      : `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
  } else if (diffInHours > 0) {
    return isFuture 
      ? `in ${diffInHours} hour${diffInHours > 1 ? 's' : ''}`
      : `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
  } else if (diffInMinutes > 0) {
    return isFuture 
      ? `in ${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''}`
      : `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
  } else {
    return 'Just now';
  }
};

/**
 * Check if a timestamp is today
 */
export const isToday = (timestamp: TimestampInput): boolean => {
  const date = normalizeTimestamp(timestamp);
  if (!date) return false;
  
  const today = new Date();
  return date.toDateString() === today.toDateString();
};

/**
 * Format timestamp for display in cards (e.g., "Updated 2 days ago")
 */
export const formatCardDate = (timestamp: TimestampInput, prefix: string = 'Updated'): string => {
  return `${prefix} ${formatRelativeTime(timestamp)}`;
};
