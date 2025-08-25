
import React, { useCallback, useState } from 'react';
import { Calendar, Clock, MoreHorizontal, Copy, Trash2 } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import StatusBadge from '../common/StatusBadge';
import { Idea } from '../../types';
import { useNavigate } from 'react-router-dom';
import { formatCardDate } from '../../utils/dateUtils';
import { stripHtmlTags } from '../../lib/utils';

interface IdeaCardProps {
  idea: Idea;
  onClick?: () => void;
}

const IdeaCard: React.FC<IdeaCardProps> = React.memo(({ idea, onClick }) => {
  const navigate = useNavigate();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showDuplicateDialog, setShowDuplicateDialog] = useState(false);

  const handleClick = useCallback(() => {
    if (onClick) {
      onClick();
    } else {
      navigate(`/clients/${idea.clientId}/posts/${idea.id}`);
    }
  }, [onClick, navigate, idea.clientId, idea.id]);

  const handleMenuClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
  }, []);

  const handleDuplicate = useCallback(() => {
    console.log('Duplicating idea:', idea.id);
    // TODO: Implement actual duplication logic
    setShowDuplicateDialog(false);
  }, [idea.id]);

  const handleDelete = useCallback(() => {
    console.log('Deleting idea:', idea.id);
    // TODO: Implement actual deletion logic
    setShowDeleteDialog(false);
  }, [idea.id]);

  return (
    <>
      <Card
        className="rounded-2xl shadow-md hover:shadow-lg transition-shadow cursor-pointer h-full flex flex-col"
        onClick={handleClick}
      >
        <CardHeader className="pb-3 flex-shrink-0">
          <div className="flex justify-between items-start gap-2">
            <CardTitle className="text-lg font-medium truncate flex-1 min-w-0" title={idea.title}>
              {idea.title}
            </CardTitle>
            <div className="flex items-center gap-2 flex-shrink-0">
              <StatusBadge status={idea.status} type="idea" />
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col pb-3">
          <p className="text-sm text-gray-600 line-clamp-3 flex-1">
            {stripHtmlTags(
              idea.drafts && idea.drafts.length > 0
                ? idea.drafts[idea.drafts.length - 1].text
                : idea.currentDraftText || idea.initialIdeaPrompt || 'No content available'
            )}
          </p>
        </CardContent>
        <CardFooter className="pt-0 text-xs text-gray-500 flex justify-between flex-shrink-0">
          <div className="flex items-center">
            <Clock className="w-3 h-3 mr-1" />
            {formatCardDate(idea.updatedAt)}
          </div>
          {/* {idea.scheduledPostAt && (
            <div className="flex items-center">
              <Calendar className="w-3 h-3 mr-1" />
              Scheduled {formatCardDate(idea.scheduledPostAt, '')}
            </div>
          )} */}
        </CardFooter>
      </Card>
    </>
  );
});

IdeaCard.displayName = 'IdeaCard';

export default IdeaCard;
