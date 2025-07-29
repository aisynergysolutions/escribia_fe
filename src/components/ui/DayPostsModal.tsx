
import React, { useState } from 'react';
import { format, addMinutes, isSameDay, isBefore } from 'date-fns';
import { X, Plus, Clock, ExternalLink } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './dialog';
import { Button } from './button';
import { mockClients } from '../../types';
import PostSlotCard from './PostSlotCard';
import { TooltipProvider } from './tooltip';
import ErrorDetailsModal from './ErrorDetailsModal';

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
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
  const [selectedErrorPost, setSelectedErrorPost] = useState<any>(null);

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
      authorAvatar: undefined,
      message: post.message // Add message field for error posts
    };
  });

  const handleSchedulePost = () => {
    onSchedulePost();
  };

  // Create a wrapper function to handle post clicks
  const handlePostClick = (postId: string) => {
    const post = posts.find(p => p.id === postId);
    if (post) {
      // If it's an error post, show error details modal instead of navigating
      if (post.status === 'Error') {
        setSelectedErrorPost(post);
        setIsErrorModalOpen(true);
      } else {
        onPostClick(post);
      }
    }
  };

  const handleViewErrorDetails = (postId: string) => {
    const post = posts.find(p => p.id === postId);
    if (post && post.status === 'Error') {
      setSelectedErrorPost(post);
      setIsErrorModalOpen(true);
    }
  };

  const handleCloseErrorModal = () => {
    setIsErrorModalOpen(false);
    setSelectedErrorPost(null);
  };

  // Check if selected date is before today or if it's today but too late to schedule
  const now = new Date();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const minDateTime = addMinutes(now, 6);

  const isDateInPast = selectedDate ? isBefore(selectedDate, today) : false;
  const isTodayButTooLate = selectedDate && isSameDay(selectedDate, now) && now >= new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 50); // If it's after 23:50, can't schedule 6 minutes ahead

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
                onPostClick={handlePostClick}
                onEditSlot={onEditSlot}
                onRemoveFromQueue={onRemoveFromQueue}
                onMoveToTop={handleMoveToTop}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDragEnd={handleDragEnd}
                onDrop={handleDrop}
                onViewErrorDetails={handleViewErrorDetails}
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
            disabled={isDateInPast || isTodayButTooLate}
          >
            <Plus className="h-4 w-4 mr-2" />
            {isDateInPast
              ? 'Cannot schedule for past dates'
              : isTodayButTooLate
                ? 'Too late to schedule for today'
                : 'Schedule a post'}
          </Button>
        </div>
      </DialogContent>

      <ErrorDetailsModal
        isOpen={isErrorModalOpen}
        onClose={handleCloseErrorModal}
        errorMessage={selectedErrorPost?.message || ''}
        postTitle={selectedErrorPost?.title || ''}
      />
    </Dialog>
  );
};

export default DayPostsModal;
