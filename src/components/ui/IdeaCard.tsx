import React from 'react';
import { Calendar, Clock } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Idea } from '../../types';
import { useNavigate } from 'react-router-dom';

interface IdeaCardProps {
  idea: Idea;
  onClick?: () => void;
}

// Helper to format timestamp for display
const formatDate = (timestamp: { seconds: number; nanoseconds: number }) => {
  if (!timestamp || typeof timestamp.seconds !== 'number') {
    return 'Invalid date'; // Or handle as you see fit
  }
  return new Date(timestamp.seconds * 1000).toLocaleDateString();
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Posted':
      return 'bg-green-100 text-green-800';
    case 'Scheduled':
      return 'bg-blue-100 text-blue-800';
    case 'AwaitingReview':
      return 'bg-yellow-100 text-yellow-800';
    case 'NeedsRevision':
      return 'bg-red-100 text-red-800';
    case 'Drafting':
      return 'bg-purple-100 text-purple-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const IdeaCard: React.FC<IdeaCardProps> = ({ idea, onClick }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      navigate(`/clients/${idea.clientId}/ideas/${idea.id}`);
    }
  };

  // A fixed height for the card, e.g., h-60 (240px). Adjust as needed.
  // Using flex flex-col to allow CardContent to grow and push CardFooter to the bottom.
  return (
    <Card 
      className="rounded-2xl shadow-md hover:shadow-lg transition-shadow cursor-pointer flex flex-col h-60"
      onClick={handleClick}
    >
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          {/* Title with line-clamp-1 for single line truncation */}
          <CardTitle className="text-lg font-semibold line-clamp-1">
            {idea.title}
          </CardTitle>
          <Badge className={`${getStatusColor(idea.status)}`}>
            {idea.status}
          </Badge>
        </div>
      </CardHeader>
      {/* CardContent with flex-grow to take available space.
          Overriding default p-6 pt-0 to control bottom padding explicitly.
          p-6 sets all padding to 1.5rem. pt-0 sets top padding to 0. pb-1 sets bottom padding to 0.25rem.
          This means: pl-1.5rem, pr-1.5rem, pt-0, pb-0.25rem
      */}
      <CardContent className="flex-grow p-6 pt-0 pb-1">
        <p className="text-sm text-gray-700 line-clamp-3">
          {idea.currentDraftText}
        </p>
      </CardContent>
      {/* CardFooter will now be at the bottom. Reducing pt-2 to pt-1. */}
      <CardFooter className="pt-1 text-xs text-gray-500 flex justify-between">
        <div className="flex items-center">
          <Clock className="w-3 h-3 mr-1" />
          Updated {formatDate(idea.updatedAt)}
        </div>
        {idea.scheduledPostAt && (
          <div className="flex items-center">
            <Calendar className="w-3 h-3 mr-1" />
            Scheduled {formatDate(idea.scheduledPostAt)}
          </div>
        )}
      </CardFooter>
    </Card>
  );
};

export default IdeaCard;
