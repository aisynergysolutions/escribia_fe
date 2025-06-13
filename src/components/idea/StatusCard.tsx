
import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChevronDown } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import CustomInputModal from '../CustomInputModal';

interface StatusCardProps {
  status: string;
  onStatusChange: (status: string) => void;
  onAddCustomStatus: (status: string) => void;
}

const predefinedStatuses = ['Idea', 'Drafting', 'AwaitingReview', 'Approved', 'Scheduled', 'Posted', 'NeedsRevision', 'NeedsVisual'];

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Posted':
      return 'bg-green-100 text-green-800';
    case 'Scheduled':
      return 'bg-blue-100 text-blue-800';
    case 'AwaitingReview':
      return 'bg-yellow-100 text-yellow-800';
    case 'NeedsRevision':
      return 'bg-red-100 text-red-800';
    case 'Drafting':
      return 'bg-purple-100 text-purple-800';
    case 'NeedsVisual':
      return 'bg-orange-100 text-orange-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const StatusCard: React.FC<StatusCardProps> = ({
  status,
  onStatusChange,
  onAddCustomStatus
}) => {
  return (
    <Card className="p-6">
      <h2 className="font-semibold mb-4 text-lg">Status</h2>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <div className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded">
            <Badge className={`${getStatusColor(status)}`}>
              {status}
            </Badge>
            <ChevronDown className="h-4 w-4 text-gray-400" />
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56">
          {predefinedStatuses.map(s => (
            <DropdownMenuItem key={s} onClick={() => onStatusChange(s)} className="p-2">
              <Badge className={`${getStatusColor(s)} cursor-pointer`}>
                {s}
              </Badge>
            </DropdownMenuItem>
          ))}
          <CustomInputModal 
            title="Add Custom Status" 
            placeholder="Enter custom status..." 
            onSave={onAddCustomStatus}
          >
            <DropdownMenuItem onSelect={e => e.preventDefault()} className="p-2">
              <Badge className="bg-gray-100 text-gray-800 cursor-pointer">
                Add custom status...
              </Badge>
            </DropdownMenuItem>
          </CustomInputModal>
        </DropdownMenuContent>
      </DropdownMenu>
    </Card>
  );
};

export default StatusCard;
