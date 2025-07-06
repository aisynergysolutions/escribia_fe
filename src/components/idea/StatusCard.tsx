import React from 'react';
import { Badge } from '@/components/ui/badge';
import { ChevronDown } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import CustomInputModal from '../CustomInputModal';

interface StatusCardProps {
  status: string;
  onStatusChange: (status: string) => void;
  onAddCustomStatus: (status: string) => void;
  className?: string; // Allow passing custom className
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

const StatusCard: React.FC<StatusCardProps> = ({
  status,
  onStatusChange,
  onAddCustomStatus,
  className = '',
}) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div className={`flex items-center gap-2 cursor-pointer ${className}`}>
          <Badge className={`${getStatusColor(status)} px-3 py-1 rounded-full font-medium text-xs shadow-none border-none leading-none`}>
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
  );
};

export default StatusCard;
