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
    navigate(`/clients/${clientId}`);
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
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBack}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          
          <div className="flex-1 min-w-0">
            <EditableTitle
              title={title}
              onTitleChange={onTitleChange}
              placeholder={isNewPost ? "Enter idea title..." : "Untitled Idea"}
              className="text-2xl font-bold"
            />
          </div>
        </div>
        
        <div className="flex items-center gap-3 flex-shrink-0">
          <StatusCard
            status={status}
            onStatusChange={onStatusChange}
            onAddCustomStatus={onAddCustomStatus}
          />
          
          <Button
            onClick={onSave}
            disabled={!hasUnsavedChanges}
            variant={hasUnsavedChanges ? "default" : "outline"}
            size="sm"
            className="flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            Save
          </Button>
          
          <Button
            onClick={handleAddToQueueClick}
            className="flex items-center gap-2 bg-[#4E46DD] hover:bg-[#453fca]"
            size="sm"
          >
            <Send className="h-4 w-4" />
            Add to Queue
          </Button>
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
        onSchedule={(date, time) => {
          console.log('Scheduled for:', date, time);
          setShowScheduleModal(false);
        }}
      />
    </>
  );
};

export default IdeaHeader;
