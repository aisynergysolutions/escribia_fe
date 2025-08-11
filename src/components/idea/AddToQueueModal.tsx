import React, { useState, useRef, useEffect } from 'react';
import { Calendar, Clock, Send, ChevronDown, AlertCircle, User, Building2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { doc, getDoc, setDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { format, addMonths, addDays, isSameDay, startOfDay } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { usePostDetails, Poll } from '@/context/PostDetailsContext';
import { useAuth } from '@/context/AuthContext';
import MediaPreview from './MediaPreview';
import { MediaFile } from './MediaUploadModal';

interface AddToQueueModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  postContent: string;
  onAddToQueue: (selectedTime: string, status: string) => void;
  onOpenScheduleModal: () => void;
  clientId?: string;
  postId?: string;
  mediaFiles?: MediaFile[];
  pollData?: Poll | null;
  profileData?: {
    name: string;
    role: string;
    profileImage?: string;
  };
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
  clientId,
  postId,
  mediaFiles = [],
  pollData,
  profileData
}) => {
  const [selectedTime, setSelectedTime] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('Scheduled');
  const [isExpanded, setIsExpanded] = useState(false);
  const [shouldShowMore, setShouldShowMore] = useState(false);
  const [truncatedContent, setTruncatedContent] = useState('');
  const [suggestedSlots, setSuggestedSlots] = useState<QueueSlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [hasTimeslotConfig, setHasTimeslotConfig] = useState(true);
  const [isScheduling, setIsScheduling] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { post, updatePostScheduling } = usePostDetails();
  const { currentUser } = useAuth();

  // Get the current agency ID from the authenticated user
  const agencyId = currentUser?.uid;

  // Types for queue slot data
  type QueueSlot = {
    date: Date;
    timeSlot: string;
    formattedDisplay: string;
  };

  // Function to find the next five empty slots in the queue
  const findNextEmptySlot = async (agencyId: string, clientId: string): Promise<QueueSlot[]> => {
    try {
      // Step 1: Fetch timeslots configuration
      const timeslotDocRef = doc(db, 'agencies', agencyId, 'clients', clientId, 'postEvents', 'timeslots');
      const timeslotSnap = await getDoc(timeslotDocRef);

      if (!timeslotSnap.exists()) {
        console.log('[AddToQueueModal] No timeslots configuration found for agency:', agencyId);
        return []; // Return empty array if no configuration exists
      }

      const timeslotData = timeslotSnap.data();
      const activeDays: string[] = timeslotData.activeDays || [];
      const predefinedTimeSlots: string[] = timeslotData.predefinedTimeSlots || [];

      if (activeDays.length === 0 || predefinedTimeSlots.length === 0) {
        console.log('[AddToQueueModal] No active days or time slots configured for agency:', agencyId);
        return [];
      }

      // Step 2: Find the next 5 empty slots
      const emptySlots: QueueSlot[] = [];
      const today = startOfDay(new Date());
      let currentDate = today;
      let currentMonth = format(currentDate, 'yyyy-MM');
      let monthData: any = null;

      // Fetch the current month's data initially
      const monthDocRef = doc(db, 'agencies', agencyId, 'clients', clientId, 'postEvents', currentMonth);
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
          const newMonthDocRef = doc(db, 'agencies', agencyId, 'clients', clientId, 'postEvents', currentMonth);
          const newMonthSnap = await getDoc(newMonthDocRef);
          monthData = newMonthSnap.exists() ? newMonthSnap.data() : {};
        }

        // Safety check to prevent infinite loop (don't search more than 90 days ahead)
        if (currentDate > addDays(today, 90)) {
          break;
        }
      }

      console.log('[AddToQueueModal] Found empty slots for agency:', agencyId, emptySlots);
      return emptySlots;

    } catch (error) {
      console.error('[AddToQueueModal] Error finding empty slots for agency:', agencyId, error);
      return [];
    }
  };

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
      measuringDiv.style.whiteSpace = 'pre-wrap'; // Preserve line breaks
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
      if (open && clientId && agencyId) {
        setLoadingSlots(true);
        try {
          console.log('[AddToQueueModal] Fetching suggested slots for agency:', agencyId, 'client:', clientId);
          const slots = await findNextEmptySlot(agencyId, clientId);
          setSuggestedSlots(slots);
          setHasTimeslotConfig(slots.length > 0);

          // Automatically preselect the first recommended timeslot
          if (slots.length > 0) {
            setSelectedTime(slots[0].formattedDisplay);
          }
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
  }, [open, clientId, agencyId]);

  const handleAddToQueue = async () => {
    if (!selectedTime || !clientId || !postId || !agencyId) {
      console.error('[AddToQueueModal] Missing required data for scheduling');
      toast({
        title: "Missing Information",
        description: "Please select a time slot and ensure all required data is available.",
        variant: "destructive",
      });
      return;
    }

    // Find the selected slot data
    const selectedSlot = suggestedSlots.find(slot => slot.formattedDisplay === selectedTime);
    if (!selectedSlot) {
      console.error('[AddToQueueModal] Selected time slot not found');
      toast({
        title: "Invalid Time Slot",
        description: "The selected time slot is no longer available. Please choose another.",
        variant: "destructive",
      });
      return;
    }

    setIsScheduling(true);

    try {
      // Create the scheduled datetime from the selected slot
      const scheduledDateTime = selectedSlot.date;
      const newYearMonth = format(scheduledDateTime, 'yyyy-MM');

      // Prepare the post event data for scheduling
      const postEventData = {
        title: post?.title || '',
        profile: typeof post?.profile === 'object' ? post.profile.profileName : (post?.profile || ''),
        status: selectedStatus,
        updatedAt: Timestamp.now(),
        scheduledPostAt: Timestamp.fromDate(scheduledDateTime),
        postId: postId,
        scheduledDate: scheduledDateTime.toISOString(),
        timeSlot: selectedSlot.timeSlot
      };

      // Save to Firestore in the postEvents collection
      const postEventRef = doc(
        db,
        'agencies', agencyId,
        'clients', clientId,
        'postEvents', newYearMonth
      );

      // Update the year-month document with the post field
      await setDoc(postEventRef, {
        [postId]: postEventData
      }, { merge: true });

      // Update the post status in the ideas collection
      const postRef = doc(
        db,
        'agencies', agencyId,
        'clients', clientId,
        'ideas', postId
      );

      await setDoc(postRef, {
        status: selectedStatus,
        scheduledPostAt: Timestamp.fromDate(scheduledDateTime),
        updatedAt: Timestamp.now()
      }, { merge: true });

      // Update the PostDetailsContext with the new scheduling info
      if (updatePostScheduling) {
        await updatePostScheduling(agencyId, clientId, postId, selectedStatus, Timestamp.fromDate(scheduledDateTime));
      }

      console.log('[AddToQueueModal] Post successfully scheduled for agency:', agencyId, {
        postId,
        scheduledDateTime,
        status: selectedStatus
      });

      // Show success message
      toast({
        title: "Post Scheduled",
        description: `Post successfully added to queue for ${selectedTime}`,
      });

      // Call the parent callback and close modal
      onAddToQueue(selectedTime, selectedStatus);
      onOpenChange(false);

    } catch (error) {
      console.error('[AddToQueueModal] Error scheduling post for agency:', agencyId, error);

      // Show error message
      toast({
        title: "Scheduling Failed",
        description: "There was an error scheduling your post. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsScheduling(false);
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

  const renderMediaPreview = () => {
    if (!mediaFiles || mediaFiles.length === 0) return null;

    return (
      <div className="mb-4">
        <MediaPreview
          mediaFiles={mediaFiles}
          onRemove={() => { }} // Disabled in preview mode
          onEdit={() => { }} // Disabled in preview mode
          viewMode="desktop"
          isUploading={false}
          isRemoving={false}
          isLoadingInitial={false}
        />
      </div>
    );
  };

  const renderPollPreview = () => {
    if (!pollData) return null;

    return (
      <div className="mb-4">
        <div className="border rounded-lg p-4 border-gray-200 bg-white">
          <div className="space-y-4">
            <div className="font-medium text-gray-900">
              {pollData.question}
            </div>
            <div className="text-sm text-gray-600">
              You can see how people vote. <span className="text-blue-600 cursor-pointer">Learn More</span>
            </div>

            <div className="space-y-2">
              {pollData.options.map((option, index) => (
                <div
                  key={index}
                  className="border border-blue-500 rounded-full py-3 px-4 text-center text-blue-600 cursor-pointer hover:bg-blue-50 transition-colors"
                >
                  {option}
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span>0 votes</span>
              <span>•</span>
              <span>1w left</span>
              <span>•</span>
              <span className="text-blue-600 cursor-pointer">View results</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Show authentication error if no agency ID
  if (!agencyId) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
              Authentication Required
            </DialogTitle>
          </DialogHeader>
          <div className="text-center py-6">
            <p className="text-gray-600 mb-4">
              Please sign in to add posts to queue.
            </p>
            <Button onClick={() => onOpenChange(false)} className="w-full">
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

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
              <div className="pr-4">
                <div className="bg-white rounded-lg border shadow-sm">
                  <div className="p-4 border-b">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={profileData?.profileImage || (typeof post?.profile === 'object' ? post.profile.imageUrl : undefined)} />
                        <AvatarFallback className="bg-gray-300">
                          {profileData?.role?.toLowerCase().includes('company') ? (
                            <Building2 className="h-6 w-6 text-gray-600" />
                          ) : (
                            <User className="h-6 w-6 text-gray-600" />
                          )}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-semibold text-gray-900">{profileData?.name || (typeof post?.profile === 'object' ? post.profile.profileName : post?.profile) || 'Your Profile'}</div>
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
                        className="text-sm leading-relaxed text-gray-900 mb-4 whitespace-pre-wrap"
                        style={{
                          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                          fontSize: '14px',
                          lineHeight: '1.5'
                        }}
                      >
                        {isExpanded ? (
                          <div>
                            <span dangerouslySetInnerHTML={{ __html: postContent.replace(/\n/g, '<br>') }} />
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
                              <span dangerouslySetInnerHTML={{ __html: postContent.replace(/\n/g, '<br>') }} />
                            )}
                          </div>
                        )}
                      </div>

                      {/* Separator line at 3rd line position when collapsed */}
                      {!isExpanded && shouldShowMore && (
                        <Separator className="mb-4" />
                      )}
                    </div>

                    {/* Media Preview */}
                    {renderMediaPreview()}

                    {/* Poll Preview */}
                    {renderPollPreview()}
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
                  <div className="space-y-4">
                    {/* Recommended time skeleton */}
                    <div className="mb-4">
                      <Skeleton className="h-4 w-48 mb-2" />
                      <div className="p-4 rounded-lg border-2 border-gray-200 bg-white">
                        <div className="flex items-center gap-3">
                          <Skeleton className="w-8 h-8 rounded-full" />
                          <div className="flex-1 space-y-1">
                            <Skeleton className="h-4 w-48" />
                            <Skeleton className="h-3 w-32" />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Other suggested times skeleton */}
                    <div className="mb-4">
                      <Skeleton className="h-4 w-36 mb-2" />
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {Array.from({ length: 4 }).map((_, index) => (
                          <div key={index} className="p-3 rounded-lg border border-gray-200 bg-white">
                            <Skeleton className="h-3 w-full" />
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Custom time skeleton */}
                    <div>
                      <Skeleton className="h-10 w-full rounded-lg" />
                    </div>
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
                              <div className="font-medium text-xs">{slot.formattedDisplay}</div>
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
            disabled={!selectedTime || isScheduling}
            className="bg-[#4E46DD] hover:bg-[#453fca]"
          >
            <Send className="w-4 h-4 mr-2" />
            {isScheduling ? 'Scheduling...' : 'Add to Queue'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddToQueueModal;
