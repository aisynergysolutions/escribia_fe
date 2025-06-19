
import React from 'react';
import ViewToggle from './ViewToggle';

interface QueueHeaderProps {
  hideEmptySlots: boolean;
  onToggle: (hide: boolean) => void;
}

const QueueHeader: React.FC<QueueHeaderProps> = ({ hideEmptySlots, onToggle }) => {
  return (
    <div className="flex justify-between items-center pb-6 border-b border-gray-200 mb-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Scheduled Posts</h2>
      </div>
      <div>
        <ViewToggle hideEmptySlots={hideEmptySlots} onToggle={onToggle} />
      </div>
    </div>
  );
};

export default QueueHeader;
