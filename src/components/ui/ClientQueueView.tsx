
import React, { useState } from 'react';
import { Calendar as CalendarIcon } from 'lucide-react';
import { TooltipProvider } from './tooltip';
import { useNavigate } from 'react-router-dom';
import ReschedulePostModal from './ReschedulePostModal';
import QueueHeader from './QueueHeader';
import EmptySlotCard from './EmptySlotCard';
import DayCard from './DayCard';
import PostSlotCard from './PostSlotCard';
import { useQueueData, DaySlot } from '../../hooks/useQueueData';
import { useDragAndDrop } from '../../hooks/useDragAndDrop';
import { useQueueOperations } from '../../hooks/useQueueOperations';

interface ClientQueueViewProps {
  clientId: string;
}

const ClientQueueView: React.FC<ClientQueueViewProps> = ({ clientId }) => {
  const navigate = useNavigate();
  const [rescheduleModalOpen, setRescheduleModalOpen] = useState(false);
  const [selectedPostForReschedule, setSelectedPostForReschedule] = useState<any>(null);
  const [newScheduleDate, setNewScheduleDate] = useState<Date | null>(null);
  const [hideEmptySlots, setHideEmptySlots] = useState(false);

  const { queueSlots, dayGroups, refreshQueue } = useQueueData(clientId, hideEmptySlots);
  const { handleRemoveFromQueue, handleMoveToTop, handleReschedule } = useQueueOperations(refreshQueue);
  
  const showRescheduleModal = (draggedSlot: any, targetSlot: DaySlot) => {
    const slot = queueSlots.find(s => s.id === draggedSlot.id);
    if (slot) {
      setSelectedPostForReschedule(slot);
      setNewScheduleDate(targetSlot.datetime);
      setRescheduleModalOpen(true);
    }
  };

  const { draggedItem, dragOverSlot, handleDragStart, handleDragOver, handleDragEnd, handleDrop } = useDragAndDrop(
    hideEmptySlots, 
    refreshQueue
  );

  const handlePostClick = (postId: string) => {
    navigate(`/clients/${clientId}/ideas/${postId}`);
  };

  const handleEditSlot = (slotId: string) => {
    const slot = queueSlots.find(s => s.id === slotId);
    if (slot) {
      setSelectedPostForReschedule(slot);
      setNewScheduleDate(slot.datetime);
      setRescheduleModalOpen(true);
    }
  };

  const handleSchedulePost = (date: Date, time: string) => {
    console.log('Create new post for:', date, 'at', time);
    navigate(`/clients/${clientId}/ideas/new?new=true`);
  };

  const handleRescheduleFromModal = (newDateTime: Date, time: string) => {
    handleReschedule(selectedPostForReschedule, newDateTime);
  };

  const handleCloseRescheduleModal = () => {
    setRescheduleModalOpen(false);
    setSelectedPostForReschedule(null);
    setNewScheduleDate(null);
  };

  if (queueSlots.length === 0 && hideEmptySlots) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-8">
        <QueueHeader hideEmptySlots={hideEmptySlots} onToggle={setHideEmptySlots} />
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <CalendarIcon className="h-16 w-16 text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Your queue is empty</h3>
          <p className="text-sm text-gray-500">
            Define your posting times in Queue Settings.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-8">
        <QueueHeader hideEmptySlots={hideEmptySlots} onToggle={setHideEmptySlots} />

        <div className="space-y-4">
          <TooltipProvider>
            {Object.entries(dayGroups).map(([dateStr, slots], index, array) => {
              if (slots.length === 0) return null;
              
              const date = new Date(dateStr);
              const isLastCard = index === array.length - 1;
              
              return (
                <DayCard key={dateStr} date={date} className={!isLastCard ? 'mb-4' : ''}>
                  {slots.map((slot) => {
                    const isDragging = draggedItem === slot.id;
                    const isDragOver = dragOverSlot === slot.id;

                    // Handle empty slots
                    if ('isEmpty' in slot && slot.isEmpty) {
                      return (
                        <EmptySlotCard
                          key={slot.id}
                          time={slot.time}
                          date={slot.datetime}
                          onSchedulePost={handleSchedulePost}
                          onDrop={(e) => handleDrop(e, slot, showRescheduleModal)}
                          onDragOver={(e) => handleDragOver(e, slot.id)}
                          isDragOver={isDragOver}
                        />
                      );
                    }

                    // Handle regular post slots
                    const queueSlot = slot as any;
                    
                    return (
                      <PostSlotCard
                        key={queueSlot.id}
                        slot={queueSlot}
                        isDragging={isDragging}
                        onPostClick={handlePostClick}
                        onEditSlot={handleEditSlot}
                        onRemoveFromQueue={handleRemoveFromQueue}
                        onMoveToTop={(slotId) => handleMoveToTop(slotId, queueSlots)}
                        onDragStart={handleDragStart}
                        onDragOver={handleDragOver}
                        onDragEnd={handleDragEnd}
                        onDrop={(e, slot) => handleDrop(e, slot, showRescheduleModal)}
                      />
                    );
                  })}
                </DayCard>
              );
            })}
          </TooltipProvider>
        </div>
      </div>

      <ReschedulePostModal
        isOpen={rescheduleModalOpen}
        onClose={handleCloseRescheduleModal}
        onReschedule={handleRescheduleFromModal}
        selectedDate={newScheduleDate}
        postTitle={selectedPostForReschedule?.title || ''}
      />
    </>
  );
};

export default ClientQueueView;
