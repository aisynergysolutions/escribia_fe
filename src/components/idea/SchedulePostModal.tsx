import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Calendar, Clock, ChevronDown, ChevronUp, AlertCircle, User, Building2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { format, addMinutes, isSameDay, isBefore } from 'date-fns';
import { cn } from '@/lib/utils';
import { doc, setDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { usePostDetails, Poll } from '@/context/PostDetailsContext';
import { useAuth } from '@/context/AuthContext';
import MediaPreview from './MediaPreview';
import { MediaFile } from './MediaUploadModal';

interface SchedulePostModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  postContent: string;
  onSchedule: (date: Date, time: string, status: string) => void;
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

const SchedulePostModal: React.FC<SchedulePostModalProps> = ({
  open,
  onOpenChange,
  postContent,
  onSchedule,
  clientId,
  postId,
  mediaFiles = [],
  pollData,
  profileData
}) => {
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedHour, setSelectedHour] = useState<number>(9);
  const [selectedMinute, setSelectedMinute] = useState<number>(0);
  const [isAM, setIsAM] = useState<boolean>(true);
  const [selectedStatus, setSelectedStatus] = useState('Scheduled');
  const [isExpanded, setIsExpanded] = useState(false);
  const [shouldShowMore, setShouldShowMore] = useState(false);
  const [truncatedContent, setTruncatedContent] = useState('');
  const [isEditingHour, setIsEditingHour] = useState(false);
  const [isEditingMinute, setIsEditingMinute] = useState(false);
  const [hourInput, setHourInput] = useState('09');
  const [minuteInput, setMinuteInput] = useState('00');
  const [isScheduling, setIsScheduling] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const hourInputRef = useRef<HTMLInputElement>(null);
  const minuteInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { post, updatePostScheduling } = usePostDetails();
  const { currentUser } = useAuth();

  // Get the current agency ID from the authenticated user
  const agencyId = currentUser?.uid;

  // Calculate minimum allowed date and time
  const now = new Date();
  const minDateTime = addMinutes(now, 6);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Memoize validation logic
  const validation = useMemo(() => {
    if (!selectedDate) return { isValid: false, errorMessage: 'Please select a date' };

    // Check if date is in the past
    const selectedDateOnly = new Date(selectedDate);
    selectedDateOnly.setHours(0, 0, 0, 0);

    if (isBefore(selectedDateOnly, today)) {
      return { isValid: false, errorMessage: 'Cannot schedule for past dates' };
    }

    // Create the full datetime for validation
    let hours = selectedHour;
    if (!isAM && hours !== 12) {
      hours += 12;
    } else if (isAM && hours === 12) {
      hours = 0;
    }

    const selectedDateTime = new Date(selectedDate);
    selectedDateTime.setHours(hours, selectedMinute + 1, 0, 0);

    // If it's today, check if time is at least 6 minutes from now
    if (isSameDay(selectedDateTime, now)) {
      if (isBefore(selectedDateTime, minDateTime)) {
        return {
          isValid: false,
          errorMessage: `Time must be at least ${format(minDateTime, 'HH:mm')} (6 minutes from now)`
        };
      }
    }

    return { isValid: true, errorMessage: '' };
  }, [selectedDate, selectedHour, selectedMinute, isAM, minDateTime, today, now]);

  // Generate hours array (00-23)
  const hours = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));

  // Generate minutes array (00, 15, 30, 45)
  const minutes = ['00', '15', '30', '45'];

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

  useEffect(() => {
    setHourInput(selectedHour.toString().padStart(2, '0'));
  }, [selectedHour]);

  useEffect(() => {
    setMinuteInput(selectedMinute.toString().padStart(2, '0'));
  }, [selectedMinute]);

  const handleSchedule = async () => {
    if (!selectedDate || !clientId || !postId || !agencyId) {
      console.error('[SchedulePostModal] Missing required data for scheduling');
      toast({
        title: "Missing Information",
        description: "Please select a date and time, and ensure all required data is available.",
        variant: "destructive",
      });
      return;
    }

    // Check validation
    if (!validation.isValid) {
      toast({
        title: "Invalid Schedule Time",
        description: validation.errorMessage,
        variant: "destructive",
      });
      return;
    }

    setIsScheduling(true);

    try {
      // Create the scheduled datetime
      const scheduledDate = new Date(selectedDate);
      let hours = selectedHour;
      if (!isAM && hours !== 12) {
        hours += 12;
      } else if (isAM && hours === 12) {
        hours = 0;
      }
      scheduledDate.setHours(hours, selectedMinute, 0, 0);

      const newYearMonth = format(scheduledDate, 'yyyy-MM');
      const timeString = `${hours.toString().padStart(2, '0')}:${selectedMinute.toString().padStart(2, '0')}`;

      // Prepare the post event data for scheduling
      const postEventData = {
        title: post?.title || '',
        profile: typeof post?.profile === 'object' ? post.profile.profileName : (post?.profile || ''),
        profileId: post?.profileId || '',
        status: selectedStatus,
        updatedAt: Timestamp.now(),
        scheduledPostAt: Timestamp.fromDate(scheduledDate),
        postId: postId,
        scheduledDate: scheduledDate.toISOString(),
        timeSlot: timeString
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
        scheduledPostAt: Timestamp.fromDate(scheduledDate),
        updatedAt: Timestamp.now()
      }, { merge: true });

      // Update the PostDetailsContext with the new scheduling info
      if (updatePostScheduling) {
        await updatePostScheduling(agencyId, clientId, postId, selectedStatus, Timestamp.fromDate(scheduledDate));
      }

      console.log('[SchedulePostModal] Post successfully scheduled for agency:', agencyId, {
        postId,
        scheduledDate,
        status: selectedStatus
      });

      // Show success message
      toast({
        title: "Post Scheduled",
        description: `Post successfully scheduled for ${format(scheduledDate, 'EEEE, MMMM d, yyyy')} at ${formatDisplayTime()}`,
      });

      // Call the parent callback and close modal
      const displayTimeString = `${selectedHour.toString().padStart(2, '0')}:${selectedMinute.toString().padStart(2, '0')} ${isAM ? 'AM' : 'PM'}`;
      onSchedule(scheduledDate, displayTimeString, selectedStatus);
      onOpenChange(false);

    } catch (error) {
      console.error('[SchedulePostModal] Error scheduling post for agency:', agencyId, error);

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

  const formatDisplayTime = () => {
    const hourDisplay = selectedHour.toString().padStart(2, '0');
    const minuteDisplay = selectedMinute.toString().padStart(2, '0');
    return `${hourDisplay}:${minuteDisplay} ${isAM ? 'AM' : 'PM'}`;
  };

  const adjustHour = (increment: boolean) => {
    if (increment) {
      setSelectedHour(prev => prev === 12 ? 1 : prev + 1);
    } else {
      setSelectedHour(prev => prev === 1 ? 12 : prev - 1);
    }
  };

  const adjustMinute = (increment: boolean) => {
    if (increment) {
      setSelectedMinute(prev => prev >= 59 ? 0 : prev + 1);
    } else {
      setSelectedMinute(prev => prev <= 0 ? 59 : prev - 1);
    }
  };

  const handleHourClick = () => {
    setIsEditingHour(true);
    setTimeout(() => hourInputRef.current?.focus(), 0);
  };

  const handleMinuteClick = () => {
    setIsEditingMinute(true);
    setTimeout(() => minuteInputRef.current?.focus(), 0);
  };

  const handleHourInputBlur = () => {
    setIsEditingHour(false);
    const value = parseInt(hourInput);
    if (value >= 1 && value <= 12) {
      setSelectedHour(value);
    } else {
      setHourInput(selectedHour.toString().padStart(2, '0'));
    }
  };

  const handleMinuteInputBlur = () => {
    setIsEditingMinute(false);
    const value = parseInt(minuteInput);
    if (value >= 0 && value <= 59) {
      setSelectedMinute(value);
    } else {
      setMinuteInput(selectedMinute.toString().padStart(2, '0'));
    }
  };

  const handleHourInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleHourInputBlur();
    }
  };

  const handleMinuteInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleMinuteInputBlur();
    }
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
              Please sign in to schedule posts.
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
        <DialogHeader className="flex-shrink-0 pb-0">
          <DialogTitle className="flex items-center gap-3 text-xl font-bold">
            <Calendar className="h-6 w-6" />
            Schedule Post
          </DialogTitle>
          <p className="text-sm text-gray-600 mt-2">
            Choose when to publish your post and set its status
          </p>
        </DialogHeader>

        <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Post Preview - Left Column with Independent Scroll */}
          <div className="flex flex-col min-h-0">
            {/* <h4 className="text-base font-medium mb-4 flex-shrink-0 text-gray-700">Post Preview</h4> */}
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
                          {selectedDate
                            ? `Scheduled for ${format(selectedDate, 'MMM d, yyyy')} at ${formatDisplayTime()}`
                            : 'Scheduling...'
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

          {/* Scheduling Interface - Right Column */}
          <div className="flex flex-col min-h-0">
            {/* <h4 className="text-base font-medium mb-4 flex-shrink-0 text-gray-700">Date & Time Settings</h4> */}

            <div className="flex-1 overflow-y-auto space-y-6">
              {/* Date Selection */}
              <div>
                <label className="block text-sm font-medium mb-2">Select Date</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !selectedDate && "text-muted-foreground"
                      )}
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      {selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      disabled={(date) => isBefore(date, today)}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Time Selection */}
              <div>
                <label className="block text-sm font-medium mb-2">Enter Time</label>
                <div className="flex items-center justify-center gap-1.5 p-1.5 bg-gray-50 rounded-lg">
                  {/* Hour Selection */}
                  <div className="flex flex-col items-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => adjustHour(true)}
                      className="h-3 w-3 p-0 mb-0.5"
                    >
                      <ChevronUp className="h-2.5 w-2.5" />
                    </Button>
                    <div className="bg-white rounded border px-1.5 py-0.5 min-w-[28px] text-center cursor-pointer" onClick={handleHourClick}>
                      {isEditingHour ? (
                        <Input
                          ref={hourInputRef}
                          value={hourInput}
                          onChange={(e) => setHourInput(e.target.value)}
                          onBlur={handleHourInputBlur}
                          onKeyDown={handleHourInputKeyDown}
                          className="text-xs font-medium text-center border-0 p-0 h-auto bg-transparent"
                          maxLength={2}
                        />
                      ) : (
                        <span className="text-xs font-medium text-gray-900">
                          {selectedHour.toString().padStart(2, '0')}
                        </span>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => adjustHour(false)}
                      className="h-3 w-3 p-0 mt-0.5"
                    >
                      <ChevronDown className="h-2.5 w-2.5" />
                    </Button>
                    <span className="text-xs text-gray-500 mt-0.5">Hour</span>
                  </div>

                  {/* Colon Separator */}
                  <div className="text-xs font-medium text-gray-900 pb-1">:</div>

                  {/* Minute Selection */}
                  <div className="flex flex-col items-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => adjustMinute(true)}
                      className="h-3 w-3 p-0 mb-0.5"
                    >
                      <ChevronUp className="h-2.5 w-2.5" />
                    </Button>
                    <div className="bg-white rounded border px-1.5 py-0.5 min-w-[28px] text-center cursor-pointer" onClick={handleMinuteClick}>
                      {isEditingMinute ? (
                        <Input
                          ref={minuteInputRef}
                          value={minuteInput}
                          onChange={(e) => setMinuteInput(e.target.value)}
                          onBlur={handleMinuteInputBlur}
                          onKeyDown={handleMinuteInputKeyDown}
                          className="text-xs font-medium text-center border-0 p-0 h-auto bg-transparent"
                          maxLength={2}
                        />
                      ) : (
                        <span className="text-xs font-medium text-gray-900">
                          {selectedMinute.toString().padStart(2, '0')}
                        </span>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => adjustMinute(false)}
                      className="h-3 w-3 p-0 mt-0.5"
                    >
                      <ChevronDown className="h-2.5 w-2.5" />
                    </Button>
                    <span className="text-xs text-gray-500 mt-0.5">Minute</span>
                  </div>

                  {/* AM/PM Selection */}
                  <div className="flex flex-col gap-0.5 ml-2">
                    <Badge
                      variant={isAM ? "default" : "outline"}
                      className={cn(
                        "cursor-pointer px-1.5 py-0.5 text-xs",
                        isAM
                          ? "bg-blue-500 hover:bg-blue-600 text-white"
                          : "hover:bg-gray-100 text-gray-600"
                      )}
                      onClick={() => setIsAM(true)}
                    >
                      AM
                    </Badge>
                    <Badge
                      variant={!isAM ? "default" : "outline"}
                      className={cn(
                        "cursor-pointer px-1.5 py-0.5 text-xs",
                        !isAM
                          ? "bg-blue-500 hover:bg-blue-600 text-white"
                          : "hover:bg-gray-100 text-gray-600"
                      )}
                      onClick={() => setIsAM(false)}
                    >
                      PM
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Validation error message */}
              {!validation.isValid && selectedDate && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-red-600" />
                    <p className="text-sm text-red-700">
                      {validation.errorMessage}
                    </p>
                  </div>
                </div>
              )}

              <Separator />

              {/* Status Selection */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h5 className="text-sm font-medium text-gray-700">Post Status</h5>
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
                  The status will be automatically updated to "{selectedStatus}" when scheduled.
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
            onClick={handleSchedule}
            disabled={!selectedDate || !validation.isValid || isScheduling}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            <Calendar className="w-4 h-4 mr-2" />
            {isScheduling ? 'Scheduling...' : 'Schedule Post'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SchedulePostModal;
