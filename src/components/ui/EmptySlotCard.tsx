
import React from 'react';
import { Plus, Users, User } from 'lucide-react';
import { Card } from './card';
import { Button } from './button';
import { TimeslotProfile } from '@/context/EventsContext';

interface EmptySlotCardProps {
  time: string;
  date: Date;
  assignedProfiles: TimeslotProfile[];
  isGeneric: boolean;
  onSchedulePost: (date: Date, time: string) => void;
  onDrop?: (e: React.DragEvent) => void;
  onDragOver?: (e: React.DragEvent) => void;
  isDragOver?: boolean;
}

const EmptySlotCard: React.FC<EmptySlotCardProps> = ({
  time,
  date,
  assignedProfiles,
  isGeneric,
  onSchedulePost,
  onDrop,
  onDragOver,
  isDragOver = false
}) => {
  const handleClick = () => {
    onSchedulePost(date, time);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    onDragOver?.(e);
  };

  return (
    <Card
      className={`border-2 border-dashed transition-all cursor-pointer ${isDragOver
        ? 'border-blue-500 bg-blue-50/50'
        : 'border-gray-300 bg-gray-50/50 hover:bg-gray-100/50'
        }`}
      onDrop={onDrop}
      onDragOver={handleDragOver}
    >
      <div className="flex items-center gap-4 px-6 py-4 " onClick={handleClick}>
        <div className="text-sm font-medium text-gray-400 min-w-[80px]">
          {time}
        </div>

        <div className="flex-1">
          <div className="text-sm text-gray-500 flex items-center justify-between">
            <div className="flex items-center">
              <Plus className="h-4 w-4 mr-2" />
              Schedule for {time}
            </div>

            {/* Profile Assignment Info */}
            <div className="flex items-center gap-2">
              {isGeneric ? (
                <div className="flex items-center gap-1 text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
                  <Users className="h-3 w-3" />
                  All Profiles
                </div>
              ) : (
                <div className="flex items-center gap-4">
                  <div className="flex -space-x-1">
                    {assignedProfiles.slice(0, 3).map((profile, index) => (
                      <img
                        key={profile.profileId}
                        src={profile.profilePicture}
                        alt={profile.profileName}
                        className="w-6 h-6 rounded-full border-0 border-white object-cover"
                        title={profile.profileName}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/placeholder.svg';
                        }}
                      />
                    ))}
                    {assignedProfiles.length > 3 && (
                      <div className="w-6 h-6 rounded-full border-0 border-white bg-gray-100 flex items-center justify-center">
                        <span className="text-xs text-gray-600">+{assignedProfiles.length - 3}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-1 rounded">
                    <User className="h-3 w-3" />
                    {assignedProfiles.length} Profile{assignedProfiles.length !== 1 ? 's' : ''}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Profile Names for Non-Generic Slots
          {!isGeneric && assignedProfiles.length > 0 && (
            <div className="text-xs text-gray-400 mt-1">
              {assignedProfiles.map(p => p.profileName).join(', ')}
            </div>
          )} */}
        </div>
      </div>
    </Card>
  );
};

export default EmptySlotCard;
