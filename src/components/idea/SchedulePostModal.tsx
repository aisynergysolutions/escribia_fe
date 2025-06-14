
import React, { useState, useRef, useEffect } from 'react';
import { Calendar, Clock } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface SchedulePostModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  postContent: string;
  onSchedule: (date: Date, time: string) => void;
}

const SchedulePostModal: React.FC<SchedulePostModalProps> = ({
  open,
  onOpenChange,
  postContent,
  onSchedule
}) => {
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [shouldShowMore, setShouldShowMore] = useState(false);
  const [truncatedContent, setTruncatedContent] = useState('');
  const contentRef = useRef<HTMLDivElement>(null);

  // Recommended time slots
  const recommendedTimes = [
    { time: '09:00', label: '9:00 AM - Peak Engagement' },
    { time: '13:00', label: '1:00 PM - Lunch Break' },
    { time: '17:00', label: '5:00 PM - End of Workday' }
  ];

  const customTimes = [
    '08:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '18:00', '19:00', '20:00'
  ];

  useEffect(() => {
    if (contentRef.current && open) {
      // Strip HTML tags for text measurement
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = postContent;
      const plainText = tempDiv.textContent || tempDiv.innerText || '';
      
      // Create a temporary element to measure text
      const measuringDiv = document.createElement('div');
      measuringDiv.style.visibility = 'hidden';
      measuringDiv.style.position = 'absolute';
      measuringDiv.style.width = contentRef.current.offsetWidth + 'px';
      measuringDiv.style.fontSize = '14px';
      measuringDiv.style.lineHeight = '1.5';
      measuringDiv.style.fontFamily = window.getComputedStyle(contentRef.current).fontFamily;
      document.body.appendChild(measuringDiv);
      
      // Calculate how much text fits in 3 lines
      const lineHeight = 21; // 14px * 1.5 line-height
      const maxHeight = lineHeight * 3;
      
      let truncateAt = plainText.length;
      let testText = plainText;
      
      while (testText.length > 0) {
        measuringDiv.textContent = testText + '...more';
        if (measuringDiv.offsetHeight <= maxHeight) {
          truncateAt = testText.length;
          break;
        }
        testText = testText.substring(0, testText.length - 10);
      }
      
      document.body.removeChild(measuringDiv);
      
      if (truncateAt < plainText.length) {
        setShouldShowMore(true);
        setTruncatedContent(plainText.substring(0, truncateAt));
      } else {
        setShouldShowMore(false);
        setTruncatedContent(plainText);
      }
    }
  }, [postContent, open]);

  const handleSchedule = () => {
    if (selectedDate && selectedTime) {
      const scheduledDate = new Date(selectedDate);
      const [hours, minutes] = selectedTime.split(':');
      scheduledDate.setHours(parseInt(hours), parseInt(minutes));
      onSchedule(scheduledDate, selectedTime);
      onOpenChange(false);
    }
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const handleSeeMore = () => {
    setIsExpanded(true);
  };

  const handleSeeLess = () => {
    setIsExpanded(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Schedule Post
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 min-h-0">
          <ScrollArea className="h-full">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pr-4">
              {/* Post Preview */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Post Preview</h3>
                <div className="bg-white rounded-lg border shadow-sm">
                  <div className="p-4 border-b">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-gray-300"></div>
                      <div>
                        <div className="font-semibold text-gray-900">Your Name</div>
                        <div className="text-sm text-gray-500">
                          {selectedDate && selectedTime 
                            ? `Scheduled for ${format(selectedDate, 'MMM d, yyyy')} at ${formatTime(selectedTime)}`
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
                      >
                        {isExpanded ? (
                          <div>
                            <span dangerouslySetInnerHTML={{ __html: postContent }} />
                            {shouldShowMore && (
                              <span>
                                {' '}
                                <button
                                  onClick={handleSeeLess}
                                  className="font-medium text-blue-600 hover:text-blue-700"
                                >
                                  See less
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
                                  className="font-medium text-blue-600 hover:text-blue-700"
                                >
                                  ...more
                                </button>
                              </span>
                            ) : (
                              <span dangerouslySetInnerHTML={{ __html: postContent }} />
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Scheduling Interface */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Choose Date & Time</h3>
                  
                  {/* Date Selection */}
                  <div className="mb-6">
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

                  {/* Recommended Times */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-2">Recommended Times</label>
                    <div className="grid gap-2">
                      {recommendedTimes.map((timeSlot) => (
                        <button
                          key={timeSlot.time}
                          onClick={() => setSelectedTime(timeSlot.time)}
                          className={cn(
                            "p-3 text-left rounded-lg border transition-colors",
                            selectedTime === timeSlot.time
                              ? "bg-indigo-50 border-indigo-300 text-indigo-700"
                              : "bg-gray-50 border-gray-200 hover:bg-gray-100"
                          )}
                        >
                          <div className="font-medium">{formatTime(timeSlot.time)}</div>
                          <div className="text-sm text-gray-500">{timeSlot.label}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Custom Times */}
                  <div>
                    <label className="block text-sm font-medium mb-2">Other Times</label>
                    <div className="grid grid-cols-3 gap-2">
                      {customTimes.map((time) => (
                        <Button
                          key={time}
                          variant={selectedTime === time ? "default" : "outline"}
                          size="sm"
                          onClick={() => setSelectedTime(time)}
                          className="text-sm"
                        >
                          {formatTime(time)}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </ScrollArea>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 pt-4 border-t flex-shrink-0">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleSchedule}
            disabled={!selectedDate || !selectedTime}
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
