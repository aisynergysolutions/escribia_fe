
import React from 'react';
import { format } from 'date-fns';
import { X, Plus, Clock, ExternalLink } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './dialog';
import { Button } from './button';
import { mockClients } from '../../types';
import PostSlotCard from './PostSlotCard';
import { TooltipProvider } from './tooltip';

interface DayPostsModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: Date | null;
  posts: any[];
  onPostClick: (post: any) => void;
  onSchedulePost: () => void;
  onEditSlot: (slotId: string) => void;
  onRemoveFromQueue: (slotId: string) => void;
  showAllClients?: boolean;
}

const DayPostsModal: React.FC<DayPostsModalProps> = ({
  isOpen,
  onClose,
  selectedDate,
  posts,
  onPostClick,
  onSchedulePost,
  onEditSlot,
  onRemoveFromQueue,
  showAllClients = false
}) => {
  const getClientName = (clientId: string) => {
    const client = mockClients.find(c => c.id === clientId);
    return client?.clientName || 'Unknown Client';
  };

  const sortedPosts = posts.sort((a, b) => {
    const timeA = new Date(a.scheduledPostAt!.seconds * 1000).getTime();
    const timeB = new Date(b.scheduledPostAt!.seconds * 1000).getTime();
    return timeA - timeB;
  });

  // Transform scheduled posts to match QueueSlot interface
  const transformedSlots = sortedPosts.map(post => {
    const client = mockClients.find(c => c.id === post.clientId);
    return {
      id: post.id,
      datetime: new Date(post.scheduledPostAt!.seconds * 1000),
      title: post.title,
      preview: post.title.length > 60 ?
        post.title.substring(0, 60) + '...' :
        post.title,
      status: post.status,
      clientId: post.clientId,
      clientName: client?.clientName || 'Unknown Client',
      clientAvatar: client?.profileImage,
      authorName: post.profile || 'Unknown Profile',
      authorAvatar: undefined
    };
  });

  const handleSchedulePost = () => {
    onSchedulePost();
  };

  // Dummy handlers for drag and drop (not used in this modal)
  const handleDragStart = () => { };
  const handleDragOver = () => { };
  const handleDragEnd = () => { };
  const handleDrop = () => { };
  const handleMoveToTop = () => { };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>
              {selectedDate && format(selectedDate, 'MMMM d, yyyy')}
            </span>

          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3 max-h-96 overflow-y-auto">
          <TooltipProvider>
            {transformedSlots.map((slot) => (
              <PostSlotCard
                key={slot.id}
                slot={slot}
                isDragging={false}
                onPostClick={onPostClick}
                onEditSlot={onEditSlot}
                onRemoveFromQueue={onRemoveFromQueue}
                onMoveToTop={handleMoveToTop}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDragEnd={handleDragEnd}
                onDrop={handleDrop}
              />
            ))}
          </TooltipProvider>
        </div>

        {transformedSlots.length === 0 && (
          <div className="text-center text-muted-foreground py-8">
            No posts scheduled for this day
          </div>
        )}

        <div className="border-t pt-4">
          <Button
            onClick={handleSchedulePost}
            className="w-full"
            variant="outline"
          >
            <Plus className="h-4 w-4 mr-2" />
            Schedule a post
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DayPostsModal;
