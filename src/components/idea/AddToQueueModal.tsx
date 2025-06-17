import React, { useState } from 'react';
import { Calendar, Clock, Send } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ChevronDown } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

interface AddToQueueModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  postContent: string;
  onAddToQueue: (selectedTime: string, status: string) => void;
  onOpenScheduleModal: () => void;
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

const AddToQueueModal: React.FC<AddToQueueModalProps> = ({
  open,
  onOpenChange,
  postContent,
  onAddToQueue,
  onOpenScheduleModal
}) => {
  const [selectedTime, setSelectedTime] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('Scheduled');

  // Mock suggested times based on user's onboarding preferences
  const suggestedMainTime = "Tuesday 26, at 9:00 AM";
  const otherSuggestedTimes = [
    "Tuesday 26, at 1:00 PM",
    "Tuesday 26, at 5:00 PM",
    "Wednesday 27, at 9:00 AM",
    "Wednesday 27, at 1:00 PM"
  ];

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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Send className="h-5 w-5" />
            Add to Queue
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Suggested Posting Time */}
          <div>
            {/* Main Suggested Time */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Recommended time (based on your preferences)
              </label>
              <button
                onClick={() => setSelectedTime(suggestedMainTime)}
                className={`w-full p-4 text-left rounded-lg border-2 transition-colors ${
                  selectedTime === suggestedMainTime
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full">
                    <Clock className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{suggestedMainTime}</div>
                    <div className="text-sm text-gray-500">Optimal engagement time</div>
                  </div>
                </div>
              </button>
            </div>

            {/* Other Suggested Times */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Other suggested times
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {otherSuggestedTimes.map((time) => (
                  <button
                    key={time}
                    onClick={() => setSelectedTime(time)}
                    className={`p-3 text-left rounded-lg border transition-colors ${
                      selectedTime === time
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-gray-300 bg-white text-gray-700'
                    }`}
                  >
                    <div className="font-medium text-sm">{time}</div>
                  </button>
                ))}
              </div>
            </div>

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

          {/* Status Selection - Inline with title */}
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

        {/* Footer */}
        <div className="flex justify-end gap-3 pt-4 border-t">
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
