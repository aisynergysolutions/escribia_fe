
import React from 'react';
import { Bold, Italic, Underline, Smile, Copy, Eye, Calendar, Send, ChevronLeft, ChevronRight, MessageSquare, ChevronDown, Plus, Monitor, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useIsMobile } from '@/hooks/use-mobile';

interface EditorToolbarProps {
  onFormat: (format: string) => void;
  onInsertEmoji: (emoji: string) => void;
  onPreview: () => void;
  onShowComments: () => void;
  onCopy: () => void;
  onSchedule: () => void;
  onPostNow: () => void;
  versionHistory: Array<{
    id: string;
    version: number;
    text: string;
    createdAt: Date;
    generatedByAI: boolean;
    notes: string;
  }>;
  currentVersionIndex: number;
  onPreviousVersion: () => void;
  onNextVersion: () => void;
  viewMode: 'mobile' | 'desktop';
  onViewModeToggle: () => void;
}

const EditorToolbar: React.FC<EditorToolbarProps> = ({
  onFormat,
  onInsertEmoji,
  onPreview,
  onShowComments,
  onCopy,
  onSchedule,
  onPostNow,
  versionHistory,
  currentVersionIndex,
  onPreviousVersion,
  onNextVersion,
  viewMode,
  onViewModeToggle
}) => {
  const isMobile = useIsMobile();
  const emojis = ['😀', '😊', '😍', '🤔', '👍', '👎', '❤️', '🔥', '💡', '🎉', '🚀', '💯', '✨', '🌟', '📈', '💼', '🎯', '💪', '🙌', '👏'];

  const canGoPrevious = currentVersionIndex > 0;
  const canGoNext = currentVersionIndex < versionHistory.length - 1;

  const handleAddToQueue = () => {
    // Handle adding to queue functionality
    console.log('Add to queue clicked');
  };

  return (
    <div className="flex justify-between items-center p-4 border-b">
      {/* Text Editor Toolbar */}
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="sm" onClick={() => onFormat('bold')} className="h-8 w-8 p-0">
          <Bold className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm" onClick={() => onFormat('italic')} className="h-8 w-8 p-0">
          <Italic className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm" onClick={() => onFormat('underline')} className="h-8 w-8 p-0">
          <Underline className="h-4 w-4" />
        </Button>
        <div className="w-px h-6 bg-gray-300 mx-1" />
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <Smile className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64 p-2">
            <div className="grid grid-cols-5 gap-1">
              {emojis.map((emoji, index) => (
                <button key={index} onClick={() => onInsertEmoji(emoji)} className="p-2 hover:bg-gray-100 rounded text-lg">
                  {emoji}
                </button>
              ))}
            </div>
          </PopoverContent>
        </Popover>
        
        {/* View Mode Toggle Button */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="sm" onClick={onViewModeToggle} className="h-8 w-8 p-0">
              {viewMode === 'desktop' ? <Monitor className="h-4 w-4" /> : <Smartphone className="h-4 w-4" />}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{viewMode === 'desktop' ? 'Switch to Mobile View' : 'Switch to Desktop View'}</p>
          </TooltipContent>
        </Tooltip>
      </div>
      
      <TooltipProvider>
        <div className="flex gap-2">
          {/* Version Navigation */}
          <div className="flex gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={onPreviousVersion}
                  disabled={!canGoPrevious}
                  className="h-8 w-8 p-0"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Previous Version</p>
              </TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={onNextVersion}
                  disabled={!canGoNext}
                  className="h-8 w-8 p-0"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Next Version</p>
              </TooltipContent>
            </Tooltip>
          </div>
          
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="sm" onClick={onCopy} className="h-8 w-8 p-0">
                <Copy className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Copy</p>
            </TooltipContent>
          </Tooltip>
          
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="sm" onClick={onShowComments} className="h-8 w-8 p-0">
                <MessageSquare className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Show Comments</p>
            </TooltipContent>
          </Tooltip>
          
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="sm" onClick={onPreview} className="h-8 w-8 p-0">
                <Eye className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Preview</p>
            </TooltipContent>
          </Tooltip>
          
          {/* Add to Queue with Dropdown - Primary Styled Split Button */}
          <div className="flex">
            <DropdownMenu>
              <div className="flex rounded-md overflow-hidden">
                {/* Main Action Button */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      size="sm" 
                      onClick={handleAddToQueue} 
                      className={`h-8 bg-[#4E46DD] hover:bg-[#453fca] text-primary-foreground rounded-r-none border-r border-[#372fad] flex items-center ${isMobile ? 'px-3' : 'px-3 gap-1.5'}`}
                    >
                      <Send className="h-5 w-5" />
                      {!isMobile && <span className="text-sm font-medium">Add to Queue</span>}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Add to Queue</p>
                  </TooltipContent>
                </Tooltip>
                
                {/* Dropdown Trigger */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        size="sm" 
                        className="h-8 w-8 bg-[#4E46DD] hover:bg-[#453fca] text-primary-foreground rounded-l-none px-0 flex items-center justify-center focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      >
                        <ChevronDown className="h-3 w-3" />
                      </Button>
                    </DropdownMenuTrigger>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>More Options</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              
              <DropdownMenuContent align="end" className="w-32">
                <DropdownMenuItem onClick={onSchedule} className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Schedule
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onPostNow} className="flex items-center gap-2">
                  <Send className="h-4 w-4" />
                  Post Now
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </TooltipProvider>
    </div>
  );
};

export default EditorToolbar;
