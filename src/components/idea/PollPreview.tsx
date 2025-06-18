
import React from 'react';
import { PollData } from './CreatePollModal';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface PollPreviewProps {
  pollData: PollData;
  onRemove: () => void;
}

const PollPreview: React.FC<PollPreviewProps> = ({ pollData, onRemove }) => {
  return (
    <div className="border rounded-lg p-4 bg-gray-50 relative mb-4">
      <Button
        variant="ghost"
        size="sm"
        onClick={onRemove}
        className="absolute top-2 right-2 h-6 w-6 p-0 hover:bg-gray-200"
      >
        <X className="h-4 w-4" />
      </Button>
      
      <div className="space-y-4">
        <div className="font-medium text-gray-900 pr-8">
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
        
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>0 votes</span>
          <span>•</span>
          <span>1w left</span>
          <span>•</span>
          <span className="text-blue-600 cursor-pointer">View results</span>
        </div>
      </div>
    </div>
  );
};

export default PollPreview;
