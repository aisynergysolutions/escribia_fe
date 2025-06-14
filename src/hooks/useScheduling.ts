
import { useState, useEffect } from 'react';
import { Idea } from '../types';

interface UseSchedulingProps {
  idea?: Idea;
}

export const useScheduling = ({ idea }: UseSchedulingProps) => {
  const [postDate, setPostDate] = useState('');
  const [postTime, setPostTime] = useState('');
  const [timezone, setTimezone] = useState('UTC-5');

  useEffect(() => {
    if (idea?.scheduledPostAt) {
      const date = new Date(idea.scheduledPostAt.seconds * 1000);
      setPostDate(date.toISOString().split('T')[0]);
      setPostTime(`${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`);
    }
  }, [idea]);

  return {
    postDate,
    postTime,
    timezone,
    setPostDate,
    setPostTime,
    setTimezone
  };
};
