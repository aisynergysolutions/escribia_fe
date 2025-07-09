
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
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 hover:bg-gray-100"
                    onClick={handleMenuClick}
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={() => setShowDuplicateDialog(true)}>
                    <Copy className="h-4 w-4 mr-2" />
                    Duplicate
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => setShowDeleteDialog(true)}
                    className="text-red-600 focus:text-red-600"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
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

      {/* Duplicate Confirmation Dialog */}
      <AlertDialog open={showDuplicateDialog} onOpenChange={setShowDuplicateDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Duplicate Idea</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to duplicate "{idea.title}"? This will create a copy of the idea with all its content.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDuplicate}>
              Duplicate
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Idea</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{idea.title}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
});

IdeaCard.displayName = 'IdeaCard';

export default IdeaCard;
