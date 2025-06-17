
import React, { useState, useRef, useEffect } from 'react';
import { Calendar, Clock, ChevronDown, ChevronUp } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface SchedulePostModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  postContent: string;
  onSchedule: (date: Date, time: string, status: string) => void;
}

const predefinedStatuses = ['Idea', 'Drafting', 'AwaitingReview', 'Approved', 'Scheduled', 'Posted', 'NeedsRevision', 'NeedsVisual'];

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Posted':
      return 'bg-green-100 text-green-800 hover:bg-green-100 hover:text-green-800';
    case 'Scheduled':
      return 'bg-blue-100 text-blue-800 hover:bg-blue-100 hover:text-blue-800';
    case 'AwaitingReview':
      return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100 hover:text-yellow-800';
    case 'NeedsRevision':
      return 'bg-red-100 text-red-800 hover:bg-red-100 hover:text-red-800';
    case 'Drafting':
      return 'bg-purple-100 text-purple-800 hover:bg-purple-100 hover:text-purple-800';
    case 'NeedsVisual':
      return 'bg-orange-100 text-orange-800 hover:bg-orange-100 hover:text-orange-800';
    default:
      return 'bg-gray-100 text-gray-800 hover:bg-gray-100 hover:text-gray-800';
  }
};

const SchedulePostModal: React.FC<SchedulePostModalProps> = ({
  open,
  onOpenChange,
  postContent,
  onSchedule
}) => {
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedHour, setSelectedHour] = useState<number>(9);
  const [selectedMinute, setSelectedMinute] = useState<number>(0);
  const [isAM, setIsAM] = useState<boolean>(true);
  const [selectedStatus, setSelectedStatus] = useState('Scheduled');
  const [isExpanded, setIsExpanded] = useState(false);
  const [shouldShowMore, setShouldShowMore] = useState(false);
  const [truncatedContent, setTruncatedContent] = useState('');
  const contentRef = useRef<HTMLDivElement>(null);

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

  const handleSchedule = () => {
    if (selectedDate) {
      const scheduledDate = new Date(selectedDate);
      let hours = selectedHour;
      if (!isAM && hours !== 12) {
        hours += 12;
      } else if (isAM && hours === 12) {
        hours = 0;
      }
      scheduledDate.setHours(hours, selectedMinute);
      const timeString = `${selectedHour.toString().padStart(2, '0')}:${selectedMinute.toString().padStart(2, '0')} ${isAM ? 'AM' : 'PM'}`;
      onSchedule(scheduledDate, timeString, selectedStatus);
      onOpenChange(false);
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
      setSelectedMinute(prev => prev === 45 ? 0 : prev + 15);
    } else {
      setSelectedMinute(prev => prev === 0 ? 45 : prev - 15);
    }
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
            <Calendar className="h-5 w-5" />
            Schedule Post
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Post Preview - Left Column with Independent Scroll */}
          <div className="flex flex-col min-h-0">
            <h3 className="text-lg font-semibold mb-4 flex-shrink-0">Post Preview</h3>
            <ScrollArea className="flex-1">
              <div className="pr-4">
                <div className="bg-white rounded-lg border shadow-sm">
                  <div className="p-4 border-b">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-gray-300"></div>
                      <div>
                        <div className="font-semibold text-gray-900">Your Name</div>
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

          {/* Scheduling Interface - Right Column */}
          <div className="flex flex-col min-h-0">
            <h3 className="text-lg font-semibold mb-4 flex-shrink-0">Choose Date & Time</h3>
            
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
                      disabled={(date) => date < new Date()}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Time Selection */}
              <div>
                <label className="block text-sm font-medium mb-4">Enter Time</label>
                <div className="flex items-center justify-center gap-4 p-6 bg-gray-50 rounded-lg">
                  {/* Hour Selection */}
                  <div className="flex flex-col items-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => adjustHour(true)}
                      className="h-8 w-8 p-0 mb-2"
                    >
                      <ChevronUp className="h-4 w-4" />
                    </Button>
                    <div className="bg-gray-200 rounded-lg px-4 py-6 min-w-[80px] text-center">
                      <span className="text-4xl font-bold text-gray-900">
                        {selectedHour.toString().padStart(2, '0')}
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => adjustHour(false)}
                      className="h-8 w-8 p-0 mt-2"
                    >
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                    <span className="text-sm text-gray-500 mt-2">Hour</span>
                  </div>

                  {/* Colon Separator */}
                  <div className="text-4xl font-bold text-gray-900 pb-4">:</div>

                  {/* Minute Selection */}
                  <div className="flex flex-col items-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => adjustMinute(true)}
                      className="h-8 w-8 p-0 mb-2"
                    >
                      <ChevronUp className="h-4 w-4" />
                    </Button>
                    <div className="bg-gray-200 rounded-lg px-4 py-6 min-w-[80px] text-center">
                      <span className="text-4xl font-bold text-gray-900">
                        {selectedMinute.toString().padStart(2, '0')}
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => adjustMinute(false)}
                      className="h-8 w-8 p-0 mt-2"
                    >
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                    <span className="text-sm text-gray-500 mt-2">Minute</span>
                  </div>

                  {/* AM/PM Selection */}
                  <div className="flex flex-col gap-2 ml-4">
                    <Button
                      variant={isAM ? "default" : "outline"}
                      size="sm"
                      onClick={() => setIsAM(true)}
                      className="w-16 bg-purple-500 hover:bg-purple-600 text-white"
                    >
                      AM
                    </Button>
                    <Button
                      variant={!isAM ? "default" : "outline"}
                      size="sm"
                      onClick={() => setIsAM(false)}
                      className="w-16"
                    >
                      PM
                    </Button>
                  </div>
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
            disabled={!selectedDate}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            <Calendar className="w-4 h-4 mr-2" />
            Schedule Post
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SchedulePostModal;
