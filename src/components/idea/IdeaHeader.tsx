import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import StatusCard from './StatusCard';
import EditableTitle from '../EditableTitle';
import AddToQueueModal from './AddToQueueModal';
import SchedulePostModal from './SchedulePostModal';

interface IdeaHeaderProps {
  clientId: string;
  title: string;
  onTitleChange: (title: string) => void;
  isNewPost: boolean;
  hasUnsavedChanges: boolean;
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
  isNewPost,
  hasUnsavedChanges,
  onSave,
  status,
  onStatusChange,
  onAddCustomStatus,
  onAddToQueue
}) => {
  const navigate = useNavigate();
  const [showAddToQueueModal, setShowAddToQueueModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);

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
            onSave={onTitleChange}
            className="text-2xl font-bold"
          />
          <StatusCard
            status={status}
            onStatusChange={onStatusChange}
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
