
import React from 'react';
import { format } from 'date-fns';
import { MoreVertical } from 'lucide-react';
import { Button } from './button';
import { Badge } from './badge';
import { Avatar, AvatarFallback, AvatarImage } from './avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from './dropdown-menu';
import { Tooltip, TooltipContent, TooltipTrigger } from './tooltip';

interface QueueSlot {
  id: string;
  datetime: Date;
  title: string;
  preview: string;
  status: string;
  clientId: string;
  clientName: string;
  clientAvatar?: string;
  authorName?: string;
  authorAvatar?: string;
  message?: string; // Add message field for error posts
}

interface PostSlotCardProps {
  slot: QueueSlot;
  isDragging: boolean;
  onPostClick: (postId: string) => void;
  onEditSlot: (slotId: string) => void;
  onRemoveFromQueue: (slotId: string) => void;
  onMoveToTop: (slotId: string) => void;
  onDragStart: (e: React.DragEvent, slotId: string) => void;
  onDragOver: (e: React.DragEvent, slotId: string) => void;
  onDragEnd: () => void;
  onDrop: (e: React.DragEvent, slot: QueueSlot) => void;
  onViewErrorDetails?: (postId: string) => void; // Optional prop for error details
}

const PostSlotCard: React.FC<PostSlotCardProps> = ({
  slot,
  isDragging,
  onPostClick,
  onEditSlot,
  onRemoveFromQueue,
  onMoveToTop,
  onDragStart,
  onDragOver,
  onDragEnd,
  onDrop,
  onViewErrorDetails
}) => {
  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, slot.id)}
      onDragOver={(e) => onDragOver(e, slot.id)}
      onDragEnd={onDragEnd}
      onDrop={(e) => onDrop(e, slot)}
      className={`flex items-center gap-6 py-3 pr-2 border border-gray-100 rounded-lg hover:bg-gray-50 cursor-move  transition-colors ${isDragging ? 'opacity-50' : ''
        }`}
    >
      <div className="flex flex-col items-center gap-2 min-w-[80px]">
        {/* <Avatar className="h-8 w-8">
          <AvatarImage src={slot.authorAvatar} alt={slot.authorName} />
          <AvatarFallback className="bg-indigo-100 text-indigo-700 font-semibold text-xs">
            {slot.authorName?.split(' ').map(n => n[0]).join('').slice(0, 2) || 'SJ'}
          </AvatarFallback>
        </Avatar> */}
        {/* <div className="text-xs text-gray-500 text-center">
          {slot.authorName || 'No Profile'}
        </div> */}
        <div className="text-sm font-medium text-gray-500">
          {format(slot.datetime, 'HH:mm')}
        </div>
      </div>

      <div className="flex-1 min-w-0">
        <h4
          className="text-base font-semibold text-gray-900 truncate cursor-pointer hover:underline transition-all"
          onClick={() => onPostClick(slot.id)}
        >
          {slot.title}
        </h4>
        <p className="text-sm text-gray-600 truncate">
          Post for {slot.authorName || 'No Profile'}
        </p>
      </div>

      <Badge
        variant={slot.status === 'Posted' ? 'default' : slot.status === 'Error' ? 'destructive' : 'secondary'}
        className={`flex-shrink-0 ${slot.status === 'Posted'
          ? 'bg-green-100 text-green-800 hover:bg-green-200'
          : slot.status === 'Error'
            ? 'bg-red-100 text-red-800 hover:bg-red-200'
            : ''
          }`}
      >
        {slot.status}
      </Badge>

      <div className="flex-shrink-0">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-gray-400 hover:text-gray-600"
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {slot.status === 'Posted' ? (
              <DropdownMenuItem onClick={() => onPostClick(slot.id)}>
                View post details
              </DropdownMenuItem>
            ) : slot.status === 'Error' ? (
              <>
                <DropdownMenuItem onClick={() => onViewErrorDetails ? onViewErrorDetails(slot.id) : onPostClick(slot.id)}>
                  View error details
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onEditSlot(slot.id)}>
                  Reschedule post
                </DropdownMenuItem>
              </>
            ) : (
              <>
                <DropdownMenuItem onClick={() => onEditSlot(slot.id)}>
                  Edit slot
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onRemoveFromQueue(slot.id)}>
                  Remove from queue
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

export default PostSlotCard;
