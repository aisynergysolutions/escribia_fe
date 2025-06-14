
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
      return 'bg-green-100 text-green-800 border-green-200';
    case 'Scheduled':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'AwaitingReview':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'NeedsRevision':
      return 'bg-red-100 text-red-800 border-red-200';
    case 'Drafting':
      return 'bg-purple-100 text-purple-800 border-purple-200';
    case 'Reviewed':
      return 'bg-indigo-100 text-indigo-800 border-indigo-200';
    case 'Published':
      return 'bg-green-100 text-green-800 border-green-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
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
      className="h-[280px] flex flex-col rounded-xl shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer border border-gray-200 hover:border-gray-300 bg-white"
      onClick={handleClick}
    >
      <CardHeader className="pb-3 px-6 pt-6 flex-shrink-0">
        <div className="flex justify-between items-start gap-3">
          <CardTitle className="text-lg font-semibold text-gray-900 line-clamp-2 leading-tight">
            {idea.title}
          </CardTitle>
          <Badge 
            className={`${getStatusColor(idea.status)} text-xs font-medium px-2.5 py-1 rounded-full border flex-shrink-0`}
          >
            {idea.status}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="px-6 pb-4 flex-1 flex flex-col">
        <p className="text-sm text-gray-600 line-clamp-4 leading-relaxed flex-1">
          {idea.currentDraftText}
        </p>
      </CardContent>
      
      <CardFooter className="px-6 pb-6 pt-0 flex-shrink-0">
        <div className="w-full flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            <span>Updated {formatDate(idea.updatedAt)}</span>
          </div>
          {idea.scheduledPostAt && (
            <div className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              <span>Scheduled {formatDate(idea.scheduledPostAt)}</span>
            </div>
          )}
        </div>
      </CardFooter>
    </Card>
  );
};

export default IdeaCard;
