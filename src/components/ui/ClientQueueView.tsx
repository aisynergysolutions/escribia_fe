import React, { useState } from 'react';
import { Calendar as CalendarIcon, Plus } from 'lucide-react';
import { TooltipProvider } from './tooltip';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import ReschedulePostModal from './ReschedulePostModal';
import TimeslotDefinitionModal from './TimeslotDefinitionModal';
import SchedulePostModal from './SchedulePostModal';
import QueueHeader from './QueueHeader';
import EmptySlotCard from './EmptySlotCard';
import DayCard from './DayCard';
import PostSlotCard from './PostSlotCard';
import { useQueueData, DaySlot } from '../../hooks/useQueueData';
import { useDragAndDrop } from '../../hooks/useDragAndDrop';
import { useQueueOperations } from '../../hooks/useQueueOperations';
import QueueViewSkeleton from '../../skeletons/QueueViewSkeleton';
import { TimeslotsDataMap } from '../../context/EventsContext';

interface ClientQueueViewProps {
  clientId: string;
  onPostScheduled?: () => void;
}

const ClientQueueView: React.FC<ClientQueueViewProps> = ({ clientId, onPostScheduled }) => {
  const navigate = useNavigate();
  const [rescheduleModalOpen, setRescheduleModalOpen] = useState(false);
  const [timeslotModalOpen, setTimeslotModalOpen] = useState(false);
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [selectedPostForReschedule, setSelectedPostForReschedule] = useState<any>(null);
  const [newScheduleDate, setNewScheduleDate] = useState<Date | null>(null);
  const [selectedScheduleTime, setSelectedScheduleTime] = useState<string>('');
  const [hideEmptySlots, setHideEmptySlots] = useState(false);

  const {
    queueSlots,
    dayGroups,
    refreshQueue,
    hasTimeslotsConfigured,
    predefinedTimeSlots,
    activeDays,
    timeslotsData,
    updateTimeslots,
    loadMoreDays,
    loadingTimeslotData,
    isInitialized,
    optimisticallyUpdatePost,
    optimisticallyRemovePost,
    rollbackOptimisticUpdate,
    clearOptimisticUpdate,
    optimisticUpdatesInProgress,
  } = useQueueData(clientId, hideEmptySlots);

  const { handleRemoveFromQueue, handleEditSlot, handleMoveToTop, handleReschedule } = useQueueOperations(
    refreshQueue,
    optimisticallyUpdatePost,
    optimisticallyRemovePost,
    rollbackOptimisticUpdate,
    clearOptimisticUpdate
  );

  // Show timeslot modal automatically if no timeslots are configured
  // Only trigger after loading is complete AND data has been initialized for the current client
  React.useEffect(() => {
    if (!loadingTimeslotData && isInitialized && !hasTimeslotsConfigured) {
      setTimeslotModalOpen(true);
    }
  }, [hasTimeslotsConfigured, loadingTimeslotData, isInitialized]);

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
    refreshQueue,
    clientId,
    {
      onEditSlot: handleEditSlot,
      onShowRescheduleModal: showRescheduleModal
    }
  );

  const handlePostClick = (postId: string) => {
    navigate(`/clients/${clientId}/posts/${postId}`);
  };

  const handleEditSlotModal = (slotId: string) => {
    const slot = queueSlots.find(s => s.id === slotId);
    if (slot) {
      setSelectedPostForReschedule(slot);
      setNewScheduleDate(slot.datetime);
      setRescheduleModalOpen(true);
    }
  };

  const handleSchedulePost = (date: Date, time: string) => {
    setNewScheduleDate(date);
    setSelectedScheduleTime(time);
    setScheduleModalOpen(true);
  };

  const handleScheduleSuccess = () => {
    refreshQueue();
    onPostScheduled?.(); // Notify parent component about the scheduling
  };

  const handleCloseScheduleModal = () => {
    setScheduleModalOpen(false);
    setNewScheduleDate(null);
    setSelectedScheduleTime('');
  };

  const handleRescheduleFromModal = (newDateTime: Date, time: string) => {
    if (selectedPostForReschedule) {
      handleEditSlot(selectedPostForReschedule.id, clientId, newDateTime, time);
    }
  };

  const handleCloseRescheduleModal = () => {
    setRescheduleModalOpen(false);
    setSelectedPostForReschedule(null);
    setNewScheduleDate(null);
  };

  const handleSaveTimeslots = (timeslotsData: TimeslotsDataMap) => {
    updateTimeslots(clientId, timeslotsData); // Pass clientId and timeslotsData to updateTimeslots
  };

  // Show greyed out state if data is initialized for current client but no timeslots configured
  if (isInitialized && !hasTimeslotsConfigured) {
    return (
      <>
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-8 opacity-50 pointer-events-none">
          <QueueHeader
            hideEmptySlots={hideEmptySlots}
            onToggle={setHideEmptySlots}
            onEditTimeslots={() => setTimeslotModalOpen(true)}
          />
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <CalendarIcon className="h-16 w-16 text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Configure your posting schedule</h3>
            <p className="text-sm text-gray-500">
              Define at least 2 timeslots on at least 2 days to get started.
            </p>
          </div>
        </div>

        <TimeslotDefinitionModal
          isOpen={timeslotModalOpen}
          onClose={() => setTimeslotModalOpen(false)}
          onSave={handleSaveTimeslots}
          initialTimeslotsData={timeslotsData}
          clientId={clientId}
        />
      </>
    );
  }

  if (queueSlots.length === 0 && hideEmptySlots) {
    return (
      <>
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-8">
          <QueueHeader
            hideEmptySlots={hideEmptySlots}
            onToggle={setHideEmptySlots}
            onEditTimeslots={() => setTimeslotModalOpen(true)}
          />
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <CalendarIcon className="h-16 w-16 text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Your queue is empty</h3>
            <p className="text-sm text-gray-500">
              Create posts to fill your posting schedule.
            </p>
          </div>
        </div>

        <TimeslotDefinitionModal
          isOpen={timeslotModalOpen}
          onClose={() => setTimeslotModalOpen(false)}
          onSave={handleSaveTimeslots}
          initialTimeslotsData={timeslotsData}
          clientId={clientId}
        />
      </>
    );
  }

  // Show loading state if data is loading OR if we don't have data for the current client yet
  if (loadingTimeslotData || !isInitialized) {
    return <QueueViewSkeleton />;
  }

  return (
    <>
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-8">
        <QueueHeader
          hideEmptySlots={hideEmptySlots}
          onToggle={setHideEmptySlots}
          onEditTimeslots={() => setTimeslotModalOpen(true)}
        />

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
                      const handleEmptySlotDrop = (e: React.DragEvent) => {
                        handleDrop(e, slot);
                      };

                      return (
                        <EmptySlotCard
                          key={slot.id}
                          time={slot.time}
                          date={slot.datetime}
                          onSchedulePost={handleSchedulePost}
                          onDrop={handleEmptySlotDrop}
                          onDragOver={(e) => handleDragOver(e, slot.id)}
                          isDragOver={isDragOver}
                        />
                      );
                    }

                    // Handle regular post slots
                    const queueSlot = slot as any;
                    const isOptimisticUpdate = optimisticUpdatesInProgress.has(queueSlot.id);

                    const handlePostSlotDrop = (e: React.DragEvent, targetSlot: any) => {
                      handleDrop(e, targetSlot);
                    };

                    return (
                      <div key={queueSlot.id} className={`transition-opacity ${isOptimisticUpdate ? 'opacity-60' : ''}`}>
                        <PostSlotCard
                          slot={queueSlot}
                          isDragging={isDragging}
                          onPostClick={handlePostClick}
                          onEditSlot={handleEditSlotModal}
                          onRemoveFromQueue={(slotId) => handleRemoveFromQueue(slotId, clientId)}
                          onMoveToTop={(slotId) => handleMoveToTop(slotId, queueSlots)}
                          onDragStart={handleDragStart}
                          onDragOver={handleDragOver}
                          onDragEnd={handleDragEnd}
                          onDrop={handlePostSlotDrop}
                        />
                      </div>
                    );
                  })}
                </DayCard>
              );
            })}
          </TooltipProvider>
        </div>

        {/* Load More Days Button */}
        <div className="flex justify-center mt-8">
          <Button
            onClick={loadMoreDays}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Load more days
          </Button>
        </div>
      </div>

      <ReschedulePostModal
        isOpen={rescheduleModalOpen}
        onClose={handleCloseRescheduleModal}
        onReschedule={handleRescheduleFromModal}
        selectedDate={newScheduleDate}
        postTitle={selectedPostForReschedule?.title || ''}
      />

      <SchedulePostModal
        isOpen={scheduleModalOpen}
        onClose={handleCloseScheduleModal}
        selectedDate={newScheduleDate || new Date()}
        selectedTime={selectedScheduleTime}
        clientId={clientId}
        onScheduleSuccess={handleScheduleSuccess}
      />

      <TimeslotDefinitionModal
        isOpen={timeslotModalOpen}
        onClose={() => setTimeslotModalOpen(false)}
        onSave={handleSaveTimeslots}
        initialTimeslotsData={timeslotsData}
        clientId={clientId}
      />
    </>
  );
};

export default ClientQueueView;
