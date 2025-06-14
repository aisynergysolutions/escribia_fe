
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
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
            {hasUnsavedChanges && (
              <Button onClick={onSave} className="bg-indigo-600 hover:bg-indigo-700" size="sm">
                Save
              </Button>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <EditableTitle title={title} onSave={onTitleChange} className="text-2xl font-bold" />
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
          </div>
        )}
      </div>
    </div>
  );
};

export default IdeaHeader;
