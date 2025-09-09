
import React from 'react';
import { Poll } from '@/context/PostDetailsContext';
import { Button } from '@/components/ui/button';
import { X, Edit, Loader2 } from 'lucide-react';

interface PollPreviewProps {
  pollData: Poll;
  onRemove: () => void;
  onEdit: () => void;
  viewMode: 'mobile' | 'desktop';
  isUpdating?: boolean;
  isRemoving?: boolean;
}

const PollPreview: React.FC<PollPreviewProps> = ({
  pollData,
  onRemove,
  onEdit,
  viewMode,
  isUpdating = false,
  isRemoving = false
}) => {
  const maxWidthClass = viewMode === 'mobile' ? 'max-w-[320px]' : 'max-w-[552px]';
  console.log('Poll data:', pollData);
  return (
    <div className={`mx-auto bg-white border rounded-lg p-4 relative mb-4 ${maxWidthClass}`}>
      {/* Loading overlay */}
      {(isUpdating || isRemoving) && (
        <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10 rounded-lg">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
            <span className="text-sm text-gray-600">
              {isUpdating ? 'Updating poll...' : 'Removing poll...'}
            </span>
          </div>
        </div>
      )}

      <div className="absolute top-2 right-2 flex gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={onEdit}
          className="h-6 w-6 p-0 hover:bg-gray-200"
          disabled={isUpdating || isRemoving}
        >
          {isUpdating ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            <Edit className="h-4 w-4" />
          )}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onRemove}
          className="h-6 w-6 p-0 hover:bg-gray-200"
          disabled={isUpdating || isRemoving}
        >
          {isRemoving ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            <X className="h-4 w-4" />
          )}
        </Button>
      </div>

      <div className="space-y-4">
        <div className="font-medium text-gray-900 pr-16">
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
          <span>{pollData.duration}</span>
          <span>•</span>
          <span className="text-blue-600 cursor-pointer">View results</span>
        </div>
      </div>
    </div>
  );
};

export default PollPreview;
