
import React from 'react';
import { Badge } from '@/components/ui/badge';

interface StatusBadgeProps {
  status: string;
  type?: 'client' | 'idea' | 'ai' | 'default';
  className?: string;
}

const getStatusColor = (status: string, type: string = 'default') => {
  const normalizedStatus = status.toLowerCase();
  
  // Client status colors
  if (type === 'client') {
    switch (normalizedStatus) {
      case 'active':
        return 'bg-green-100 text-green-800 hover:bg-green-100 hover:text-green-800';
      case 'onboarding':
        return 'bg-blue-100 text-blue-800 hover:bg-blue-100 hover:text-blue-800';
      case 'paused':
        return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100 hover:text-yellow-800';
      case 'archived':
        return 'bg-gray-100 text-gray-800 hover:bg-gray-100 hover:text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-100 hover:text-gray-800';
    }
  }
  
  // Idea status colors
  if (type === 'idea') {
    switch (normalizedStatus) {
      case 'posted':
        return 'bg-green-100 text-green-800 hover:bg-green-100 hover:text-green-800';
      case 'scheduled':
        return 'bg-blue-100 text-blue-800 hover:bg-blue-100 hover:text-blue-800';
      case 'awaitingreview':
        return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100 hover:text-yellow-800';
      case 'needsrevision':
        return 'bg-red-100 text-red-800 hover:bg-red-100 hover:text-red-800';
      case 'drafting':
        return 'bg-purple-100 text-purple-800 hover:bg-purple-100 hover:text-purple-800';
      case 'needsvisual':
        return 'bg-orange-100 text-orange-800 hover:bg-orange-100 hover:text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-100 hover:text-gray-800';
    }
  }
  
  // AI training status colors
  if (type === 'ai') {
    switch (normalizedStatus) {
      case 'completed':
        return 'bg-green-100 text-green-800 hover:bg-green-100 hover:text-green-800';
      case 'training_queued':
        return 'bg-blue-100 text-blue-800 hover:bg-blue-100 hover:text-blue-800';
      case 'pending_data':
        return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100 hover:text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800 hover:bg-red-100 hover:text-red-800';
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-100 hover:text-gray-800';
    }
  }
  
  // Default status colors
  return 'bg-gray-100 text-gray-800 hover:bg-gray-100 hover:text-gray-800';
};

const StatusBadge: React.FC<StatusBadgeProps> = ({ 
  status, 
  type = 'default', 
  className = '' 
}) => {
  return (
    <Badge className={`${getStatusColor(status, type)} ${className}`}>
      {status}
    </Badge>
  );
};

export default StatusBadge;
