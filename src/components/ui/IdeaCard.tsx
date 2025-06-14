
import React, { useCallback } from 'react';
import { Calendar, Clock } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import StatusBadge from '../common/StatusBadge';
import { Idea } from '../../types';
import { useNavigate } from 'react-router-dom';
import { formatCardDate } from '../../utils/dateUtils';

interface IdeaCardProps {
  idea: Idea;
  onClick?: () => void;
}

const IdeaCard: React.FC<IdeaCardProps> = React.memo(({ idea, onClick }) => {
  const navigate = useNavigate();

  const handleClick = useCallback(() => {
    if (onClick) {
      onClick();
    } else {
      navigate(`/clients/${idea.clientId}/ideas/${idea.id}`);
    }
  }, [onClick, navigate, idea.clientId, idea.id]);

  return (
    <Card 
      className="rounded-2xl shadow-md hover:shadow-lg transition-shadow cursor-pointer h-full flex flex-col"
      onClick={handleClick}
    >
      <CardHeader className="pb-3 flex-shrink-0">
        <div className="flex justify-between items-start gap-2">
          <CardTitle className="text-lg font-medium truncate flex-1 min-w-0" title={idea.title}>
            {idea.title}
          </CardTitle>
          <StatusBadge status={idea.status} type="idea" className="flex-shrink-0" />
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col pb-3">
        <p className="text-sm text-gray-600 line-clamp-3 flex-1">
          {idea.currentDraftText}
        </p>
      </CardContent>
      <CardFooter className="pt-0 text-xs text-gray-500 flex justify-between flex-shrink-0">
        <div className="flex items-center">
          <Clock className="w-3 h-3 mr-1" />
          {formatCardDate(idea.updatedAt)}
        </div>
        {idea.scheduledPostAt && (
          <div className="flex items-center">
            <Calendar className="w-3 h-3 mr-1" />
            Scheduled {formatCardDate(idea.scheduledPostAt, '')}
          </div>
        )}
      </CardFooter>
    </Card>
  );
});

IdeaCard.displayName = 'IdeaCard';

export default IdeaCard;
