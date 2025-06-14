
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

  return (
    <Card 
      className="rounded-2xl shadow-md hover:shadow-lg transition-shadow cursor-pointer h-[280px] flex flex-col"
      onClick={handleClick}
    >
      <CardHeader className="pb-2 flex-shrink-0">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg font-semibold line-clamp-1 pr-2">{idea.title}</CardTitle>
          <Badge className={`${getStatusColor(idea.status)} flex-shrink-0`}>
            {idea.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="flex-1 pb-1">
        <p className="text-sm text-gray-700 line-clamp-3">
          {idea.currentDraftText}
        </p>
      </CardContent>
      <CardFooter className="pt-1 text-xs text-gray-500 flex justify-between flex-shrink-0">
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
