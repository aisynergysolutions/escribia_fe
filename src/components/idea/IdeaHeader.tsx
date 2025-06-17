
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ChevronDown, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import EditableTitle from '../EditableTitle';
import CustomInputModal from '../CustomInputModal';

interface IdeaHeaderProps {
  clientId: string;
  title: string;
  onTitleChange: (title: string) => void;
  isNewPost: boolean;
  hasUnsavedChanges: boolean;
  onSave: () => void;
  status: string;
  onStatusChange: (status: string) => void;
  onAddCustomStatus: (status: string) => void;
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

const IdeaHeader: React.FC<IdeaHeaderProps> = ({
  clientId,
  title,
  onTitleChange,
  isNewPost,
  hasUnsavedChanges,
  onSave,
  status,
  onStatusChange,
  onAddCustomStatus
}) => {
  const navigate = useNavigate();

  const handleBackClick = () => {
    // Check if there's previous history to go back to
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      // Fallback to client overview if no history (e.g., direct URL access)
      navigate(`/clients/${clientId}`);
    }
  };

  const StatusDropdown = () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div className="flex items-center gap-1 cursor-pointer hover:bg-gray-50/50 p-1 rounded transition-colors">
          <Badge className={`${getStatusColor(status)} cursor-pointer flex items-center gap-1`}>
            {status}
            <ChevronDown className="h-3 w-3" />
          </Badge>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 bg-white border shadow-lg rounded-lg p-1" align="start">
        {predefinedStatuses.map(s => (
          <DropdownMenuItem key={s} onClick={() => onStatusChange(s)} className="p-2 rounded-md">
            <Badge className={`${getStatusColor(s)} cursor-pointer`}>
              {s}
            </Badge>
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator className="my-1" />
        <CustomInputModal 
          title="Add Custom Status" 
          placeholder="Enter custom status..." 
          onSave={onAddCustomStatus}
        >
          <DropdownMenuItem onSelect={e => e.preventDefault()} className="p-2 rounded-md">
            <div className="flex items-center gap-2 text-gray-600 hover:text-gray-800">
              <Plus className="h-3 w-3" />
              <span className="text-sm">Add custom status...</span>
            </div>
          </DropdownMenuItem>
        </CustomInputModal>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-3">
        <Button variant="outline" size="icon" className="rounded-full" onClick={handleBackClick}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        {isNewPost ? (
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={title}
              onChange={e => onTitleChange(e.target.value)}
              placeholder="Enter idea title..."
              className="text-2xl font-bold bg-transparent border-b-2 border-gray-300 focus:border-indigo-500 outline-none"
              autoFocus
            />
            <StatusDropdown />
            {hasUnsavedChanges && (
              <Button onClick={onSave} className="bg-indigo-600 hover:bg-indigo-700" size="sm">
                Save
              </Button>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <EditableTitle title={title} onSave={onTitleChange} className="text-2xl font-bold" />
            <StatusDropdown />
          </div>
        )}
      </div>
    </div>
  );
};

export default IdeaHeader;
