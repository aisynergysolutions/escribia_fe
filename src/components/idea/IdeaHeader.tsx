import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import StatusCard from './StatusCard';
import EditableTitle from '../EditableTitle';
import AddToQueueModal from './AddToQueueModal';
import SchedulePostModal from './SchedulePostModal';
import { usePostDetails } from '@/context/PostDetailsContext'; // Change from PostsContext to PostsDetailsContext

interface IdeaHeaderProps {
  clientId: string;
  title: string;
  onTitleChange: (title: string) => void;
  onSave: () => void;
  status: string;
  onStatusChange: (status: string) => void;
  onAddCustomStatus: (status: string) => void;
  onAddToQueue?: () => void;
}

const IdeaHeader: React.FC<IdeaHeaderProps> = ({
  clientId,
  title,
  onTitleChange,
  onSave,
  status,
  onStatusChange,
  onAddCustomStatus,
  onAddToQueue
}) => {
  const navigate = useNavigate();
  const [showAddToQueueModal, setShowAddToQueueModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);

  // Get agencyId and postId from params or props as needed
  const agencyId = 'agency1'; // TODO: Replace with real agencyId logic as needed
  const { postId } = useParams<{ postId: string }>();
  const { updatePostTitle, updatePostStatus } = usePostDetails(); // Use PostsDetailsContext

  // Handler for updating title in Firestore and context
  const handleTitleChange = async (newTitle: string) => {
    onTitleChange(newTitle);
    if (agencyId && clientId && postId) {
      await updatePostTitle(agencyId, clientId, postId, newTitle);
    }
  };

  // Handler for updating status in Firestore and context
  const handleStatusChange = async (newStatus: string) => {
    onStatusChange(newStatus);
    if ( agencyId && clientId && postId) {
      await updatePostStatus(agencyId, clientId, postId, newStatus);
    }
  };

  const handleBack = () => {
    navigate(`/clients/${clientId}/posts`);
  };

  const handleAddToQueueClick = () => {
    if (onAddToQueue) {
      onAddToQueue();
    } else {
      setShowAddToQueueModal(true);
    }
  };

  const handleAddToQueue = (selectedTime: string, status: string) => {
    console.log('Adding to queue:', selectedTime, status);
    setShowAddToQueueModal(false);
  };

  const handleOpenScheduleModal = () => {
    setShowAddToQueueModal(false);
    setShowScheduleModal(true);
  };

  return (
    <>
      <div className="flex items-center gap-1 py-0 px-0">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleBack}
          className="flex items-center justify-center rounded-full h-8 w-8 bg-transparent shadow-none border border-gray-100"
          aria-label="Back"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex items-center min-w-0 gap-4">
          <EditableTitle
            title={title}
            onSave={handleTitleChange}
            className="text-2xl font-bold"
          />
          <StatusCard
            status={status}
            onStatusChange={handleStatusChange}
            onAddCustomStatus={onAddCustomStatus}
          />
        </div>
      </div>

      <AddToQueueModal
        open={showAddToQueueModal}
        onOpenChange={setShowAddToQueueModal}
        postContent="Sample post content for preview"
        onAddToQueue={handleAddToQueue}
        onOpenScheduleModal={handleOpenScheduleModal}
      />

      <SchedulePostModal
        open={showScheduleModal}
        onOpenChange={setShowScheduleModal}
        postContent="Sample post content for preview"
        onSchedule={(date, time) => {
          console.log('Scheduled for:', date, time);
          setShowScheduleModal(false);
        }}
      />
    </>
  );
};

export default IdeaHeader;
