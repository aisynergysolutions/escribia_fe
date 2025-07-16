
import React, { useState, useRef, useEffect } from 'react';
import { Calendar, Clock, Send, ChevronDown } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { format, addMonths, addDays, isSameDay, startOfDay } from 'date-fns';
import { useNavigate } from 'react-router-dom';

interface AddToQueueModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  postContent: string;
  onAddToQueue: (selectedTime: string, status: string) => void;
  onOpenScheduleModal: () => void;
  clientId?: string;
}

const predefinedStatuses = ['Drafted', 'Needs Visual', 'Waiting for Approval', 'Approved', 'Scheduled', 'Posted'];

const getStatusColor = (status: string) => {
  const normalizedStatus = status.toLowerCase();
  switch (normalizedStatus) {
    case 'posted':
      return 'bg-green-100 text-green-800 hover:bg-green-100 hover:text-green-800';
    case 'scheduled':
      return 'bg-blue-100 text-blue-800 hover:bg-blue-100 hover:text-blue-800';
    case 'waitingforapproval':
    case 'waiting for approval':
      return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100 hover:text-yellow-800';
    case 'approved':
      return 'bg-green-100 text-green-800 hover:bg-green-100 hover:text-green-800';
    case 'drafted':
      return 'bg-purple-100 text-purple-800 hover:bg-purple-100 hover:text-purple-800';
    case 'needsvisual':
    case 'needs visual':
      return 'bg-orange-100 text-orange-800 hover:bg-orange-100 hover:text-orange-800';
    default:
      return 'bg-gray-100 text-gray-800 hover:bg-gray-100 hover:text-gray-800';
  }
};

const AddToQueueModal: React.FC<AddToQueueModalProps> = ({
  open,
  onOpenChange,
  postContent,
  onAddToQueue,
  onOpenScheduleModal,
  clientId
}) => {
  const [selectedTime, setSelectedTime] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('Scheduled');
  const [isExpanded, setIsExpanded] = useState(false);
  const [shouldShowMore, setShouldShowMore] = useState(false);
  const [truncatedContent, setTruncatedContent] = useState('');
  const [suggestedSlots, setSuggestedSlots] = useState<QueueSlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [hasTimeslotConfig, setHasTimeslotConfig] = useState(true);
  const contentRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Types for queue slot data
  type QueueSlot = {
    date: Date;
    timeSlot: string;
    formattedDisplay: string;
  };

  // Function to find the next five empty slots in the queue
  const findNextEmptySlot = async (clientId: string): Promise<QueueSlot[]> => {
    try {
      // Step 1: Fetch timeslots configuration
      const timeslotDocRef = doc(db, 'agencies', 'agency1', 'clients', clientId, 'postEvents', 'timeslots');
      const timeslotSnap = await getDoc(timeslotDocRef);

      if (!timeslotSnap.exists()) {
        console.log('[AddToQueueModal] No timeslots configuration found');
        return []; // Return empty array if no configuration exists
      }

      const timeslotData = timeslotSnap.data();
      const activeDays: string[] = timeslotData.activeDays || [];
      const predefinedTimeSlots: string[] = timeslotData.predefinedTimeSlots || [];

      if (activeDays.length === 0 || predefinedTimeSlots.length === 0) {
        console.log('[AddToQueueModal] No active days or time slots configured');
        return [];
      }

      // Step 2: Find the next 5 empty slots
      const emptySlots: QueueSlot[] = [];
      const today = startOfDay(new Date());
      let currentDate = today;
      let currentMonth = format(currentDate, 'yyyy-MM');
      let monthData: any = null;

      // Fetch the current month's data initially
      const monthDocRef = doc(db, 'agencies', 'agency1', 'clients', clientId, 'postEvents', currentMonth);
      const monthSnap = await getDoc(monthDocRef);
      monthData = monthSnap.exists() ? monthSnap.data() : {};

      while (emptySlots.length < 5) {
        const dayName = format(currentDate, 'EEEE'); // Get day name (Monday, Tuesday, etc.)

        // Check if current date is an active day
        if (activeDays.includes(dayName)) {
          // Check each predefined time slot for this day
          for (const timeSlot of predefinedTimeSlots) {
            if (emptySlots.length >= 5) break;

            // Create a unique slot identifier
            const slotDateTime = new Date(currentDate);
            const [hours, minutes] = timeSlot.split(':').map(Number);
            slotDateTime.setHours(hours, minutes, 0, 0);

            // Check if this slot is in the past (skip if so)
            if (slotDateTime < new Date()) {
              continue;
            }

            // Check if this slot is already occupied
            const isSlotOccupied = Object.keys(monthData).some(postId => {
              const postData = monthData[postId];
              if (!postData || !postData.scheduledPostAt) return false;

              const scheduledDate = new Date(postData.scheduledPostAt.seconds * 1000);
              return isSameDay(scheduledDate, slotDateTime) &&
                format(scheduledDate, 'HH:mm') === timeSlot;
            });

            if (!isSlotOccupied) {
              // Convert 24-hour time to 12-hour format for display
              const displayTime = format(slotDateTime, 'h:mm a');
              const displayDate = format(slotDateTime, 'EEEE, MMMM d');

              emptySlots.push({
                date: new Date(slotDateTime),
                timeSlot: timeSlot,
                formattedDisplay: `${displayDate}, at ${displayTime}`
              });
            }
          }
        }

        // Move to next day
        currentDate = addDays(currentDate, 1);
        const newMonth = format(currentDate, 'yyyy-MM');

        // If we've moved to a new month, fetch the new month's data
        if (newMonth !== currentMonth) {
          currentMonth = newMonth;
          const newMonthDocRef = doc(db, 'agencies', 'agency1', 'clients', clientId, 'postEvents', currentMonth);
          const newMonthSnap = await getDoc(newMonthDocRef);
          monthData = newMonthSnap.exists() ? newMonthSnap.data() : {};
        }

        // Safety check to prevent infinite loop (don't search more than 90 days ahead)
        if (currentDate > addDays(today, 90)) {
          break;
        }
      }

      console.log('[AddToQueueModal] Found empty slots:', emptySlots);
      return emptySlots;

    } catch (error) {
      console.error('[AddToQueueModal] Error finding empty slots:', error);
      return [];
    }
  };

  // Mock suggested times based on user's onboarding preferences
  const suggestedMainTime = "Tuesday 26, at 9:00 AM";
  const otherSuggestedTimes = [
    "Tuesday 26, at 1:00 PM",
    "Tuesday 26, at 5:00 PM",
    "Wednesday 27, at 9:00 AM",
    "Wednesday 27, at 1:00 PM"
  ];

  useEffect(() => {
    if (contentRef.current && open && postContent) {
      // Strip HTML tags for text measurement
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = postContent;
      const plainText = tempDiv.textContent || tempDiv.innerText || '';

      // Create a temporary element to measure text
      const measuringDiv = document.createElement('div');
      measuringDiv.style.visibility = 'hidden';
      measuringDiv.style.position = 'absolute';
      measuringDiv.style.width = '504px'; // LinkedIn post width
      measuringDiv.style.fontSize = '14px';
      measuringDiv.style.lineHeight = '1.5';
      measuringDiv.style.fontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      measuringDiv.style.padding = '0';
      measuringDiv.style.margin = '0';
      document.body.appendChild(measuringDiv);

      // Calculate how much text fits in exactly 3 lines
      const lineHeight = 21; // 14px * 1.5 line-height
      const maxHeight = lineHeight * 3;

      // Binary search to find the optimal truncation point
      let start = 0;
      let end = plainText.length;
      let bestFit = 0;

      while (start <= end) {
        const mid = Math.floor((start + end) / 2);
        const testText = plainText.substring(0, mid);
        measuringDiv.textContent = testText;

        if (measuringDiv.offsetHeight <= maxHeight) {
          bestFit = mid;
          start = mid + 1;
        } else {
          end = mid - 1;
        }
      }

      document.body.removeChild(measuringDiv);

      // Check if we need truncation
      if (bestFit < plainText.length && bestFit > 0) {
        setShouldShowMore(true);
        // Find the last complete word within the character limit
        let truncateAt = bestFit;
        while (truncateAt > 0 && plainText[truncateAt] !== ' ') {
          truncateAt--;
        }
        // If we went too far back, use the original truncation point
        if (truncateAt < bestFit * 0.8) {
          truncateAt = bestFit;
        }
        setTruncatedContent(plainText.substring(0, truncateAt).trim());
      } else {
        setShouldShowMore(false);
        setTruncatedContent(plainText);
      }
    }
  }, [postContent, open]);

  // Fetch suggested time slots when modal opens
  useEffect(() => {
    const fetchSuggestedSlots = async () => {
      if (open && clientId) {
        setLoadingSlots(true);
        try {
          const slots = await findNextEmptySlot(clientId);
          setSuggestedSlots(slots);
          setHasTimeslotConfig(slots.length > 0);
        } catch (error) {
          console.error('[AddToQueueModal] Error fetching suggested slots:', error);
          setSuggestedSlots([]);
          setHasTimeslotConfig(false);
        } finally {
          setLoadingSlots(false);
        }
      }
    };

    fetchSuggestedSlots();
  }, [open, clientId]);

  const handleAddToQueue = () => {
    if (selectedTime) {
      onAddToQueue(selectedTime, selectedStatus);
      onOpenChange(false);
    }
  };

  const handleCustomTime = () => {
    onOpenChange(false);
    onOpenScheduleModal();
  };

  const handleSeeMore = () => {
    setIsExpanded(true);
  };

  const handleSeeLess = () => {
    setIsExpanded(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <Send className="h-5 w-5" />
            Add to Queue
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Post Preview - Left Column */}
          <div className="flex flex-col min-h-0">
            <h3 className="text-lg font-semibold mb-4 flex-shrink-0">Post Preview</h3>
            <ScrollArea className="flex-1">
              <div className="pr-0">
                <div className="bg-white rounded-lg border shadow-sm">
                  <div className="p-4 border-b">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-gray-300"></div>
                      <div>
                        <div className="font-semibold text-gray-900">Your Name</div>
                        <div className="text-sm text-gray-500">
                          {selectedTime
                            ? `Queued for ${selectedTime}`
                            : 'Adding to queue...'
                          }
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="relative">
                      <div
                        ref={contentRef}
                        className="text-sm leading-relaxed text-gray-900 mb-4"
                        style={{
                          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                          fontSize: '14px',
                          lineHeight: '1.5'
                        }}
                      >
                        {isExpanded ? (
                          <div>
                            <span dangerouslySetInnerHTML={{ __html: postContent }} />
                            {shouldShowMore && (
                              <span>
                                {' '}
                                <button
                                  onClick={handleSeeLess}
                                  className="font-medium text-blue-600 hover:text-blue-700 cursor-pointer"
                                >
                                  ...see less
                                </button>
                              </span>
                            )}
                          </div>
                        ) : (
                          <div>
                            {shouldShowMore ? (
                              <span>
                                {truncatedContent}
                                <button
                                  onClick={handleSeeMore}
                                  className="font-medium text-blue-600 hover:text-blue-700 cursor-pointer ml-1"
                                >
                                  ...see more
                                </button>
                              </span>
                            ) : (
                              <span dangerouslySetInnerHTML={{ __html: postContent }} />
                            )}
                          </div>
                        )}
                      </div>

                      {/* Separator line at 3rd line position when collapsed */}
                      {!isExpanded && shouldShowMore && (
                        <Separator className="mb-4" />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </ScrollArea>
          </div>

          {/* Queue Options - Right Column */}
          <div className="flex flex-col min-h-0">
            <h3 className="text-lg font-semibold mb-4 flex-shrink-0">Choose Time</h3>

            <div className="flex-1 overflow-y-auto space-y-6">
              {/* Suggested Posting Time */}
              <div>
                {loadingSlots ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="text-gray-500">Finding the best time slots...</div>
                  </div>
                ) : !hasTimeslotConfig || suggestedSlots.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-gray-500 mb-2">No queue timeslots configured</div>
                    <div className="text-sm text-gray-400">
                      Configure your posting schedule in the{' '}
                      <button
                        onClick={() => {
                          if (clientId) {
                            onOpenChange(false); // Close the modal first
                            navigate(`/clients/${clientId}/calendar`);
                          }
                        }}
                        className="text-blue-600 hover:text-blue-700 underline"
                      >
                        Calendar tab
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Main Suggested Time */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Recommended time (next available slot)
                      </label>
                      <button
                        onClick={() => setSelectedTime(suggestedSlots[0].formattedDisplay)}
                        className={`w-full p-4 text-left rounded-lg border-2 transition-colors ${selectedTime === suggestedSlots[0].formattedDisplay
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300 bg-white'
                          }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full">
                            <Clock className="h-4 w-4 text-blue-600" />
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">{suggestedSlots[0].formattedDisplay}</div>
                            <div className="text-sm text-gray-500">Next available slot</div>
                          </div>
                        </div>
                      </button>
                    </div>

                    {/* Other Suggested Times */}
                    {suggestedSlots.length > 1 && (
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Other suggested times
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {suggestedSlots.slice(1, 5).map((slot, index) => (
                            <button
                              key={slot.formattedDisplay}
                              onClick={() => setSelectedTime(slot.formattedDisplay)}
                              className={`p-3 text-left rounded-lg border transition-colors ${selectedTime === slot.formattedDisplay
                                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                                  : 'border-gray-200 hover:border-gray-300 bg-white text-gray-700'
                                }`}
                            >
                              <div className="font-medium text-sm">{slot.formattedDisplay}</div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}

                {/* Custom Time Option */}
                <div>
                  <Button
                    variant="outline"
                    onClick={handleCustomTime}
                    className="w-full flex items-center justify-center gap-2 p-3 border-dashed border-gray-300 hover:border-gray-400 text-gray-600 hover:text-gray-700"
                  >
                    <Calendar className="h-4 w-4" />
                    Choose custom time
                  </Button>
                </div>
              </div>

              <Separator />

              {/* Status Selection */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-semibold">Update Status</h3>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <div className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded">
                        <Badge className={`${getStatusColor(selectedStatus)}`}>
                          {selectedStatus}
                        </Badge>
                        <ChevronDown className="h-4 w-4 text-gray-400" />
                      </div>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56">
                      {predefinedStatuses.map(status => (
                        <DropdownMenuItem key={status} onClick={() => setSelectedStatus(status)} className="p-2">
                          <Badge className={`${getStatusColor(status)} cursor-pointer`}>
                            {status}
                          </Badge>
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <p className="text-sm text-gray-500">
                  The status will be automatically updated to "{selectedStatus}" when added to queue.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 pt-4 border-t flex-shrink-0">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleAddToQueue}
            disabled={!selectedTime}
            className="bg-[#4E46DD] hover:bg-[#453fca]"
          >
            <Send className="w-4 h-4 mr-2" />
            Add to Queue
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddToQueueModal;
