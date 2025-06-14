
import React from 'react';
import { Bold, Italic, Underline, Smile, Save, Copy, Eye, Calendar, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useIsMobile } from '@/hooks/use-mobile';
import VersionHistory from '../VersionHistory';

interface EditorToolbarProps {
  onFormat: (format: string) => void;
  onInsertEmoji: (emoji: string) => void;
  onPreview: () => void;
  onSave: () => void;
  onCopy: () => void;
  onSchedule: () => void;
  onPostNow: () => void;
  hasUnsavedChanges: boolean;
  versionHistory: Array<{
    id: string;
    version: number;
    text: string;
    createdAt: Date;
    generatedByAI: boolean;
    notes: string;
  }>;
  onRestoreVersion: (text: string) => void;
}

const EditorToolbar: React.FC<EditorToolbarProps> = ({
  onFormat,
  onInsertEmoji,
  onPreview,
  onSave,
  onCopy,
  onSchedule,
  onPostNow,
  hasUnsavedChanges,
  versionHistory,
  onRestoreVersion
}) => {
  const isMobile = useIsMobile();
  const emojis = ['😀', '😊', '😍', '🤔', '👍', '👎', '❤️', '🔥', '💡', '🎉', '🚀', '💯', '✨', '🌟', '📈', '💼', '🎯', '💪', '🙌', '👏'];

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
      </div>
      
      <TooltipProvider>
        <div className="flex gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <div>
                <VersionHistory versions={versionHistory} onRestore={onRestoreVersion} />
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Version History</p>
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
          
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="sm" onClick={onSave} disabled={!hasUnsavedChanges} className={`h-8 w-8 p-0 ${hasUnsavedChanges ? 'bg-blue-50 border-blue-300' : ''}`}>
                <Save className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Save</p>
            </TooltipContent>
          </Tooltip>
          
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
          
          {/* Fused Schedule and Post Buttons */}
          <div className="flex rounded-md overflow-hidden border border-gray-300">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={onSchedule} 
                  className={`h-8 border-0 border-r border-gray-300 rounded-none bg-white hover:bg-gray-50 flex items-center ${isMobile ? 'w-8 px-0' : 'px-3 gap-1.5'}`}
                >
                  <Calendar className="h-4 w-4" />
                  {!isMobile && <span className="text-xs">Schedule</span>}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Schedule Post</p>
              </TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  size="sm" 
                  onClick={onPostNow} 
                  className={`h-8 bg-indigo-600 hover:bg-indigo-700 text-white rounded-none flex items-center ${isMobile ? 'w-8 px-0' : 'px-3 gap-1.5'}`}
                >
                  <Send className="h-4 w-4" />
                  {!isMobile && <span className="text-xs">Post Now</span>}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Post Now</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
      </TooltipProvider>
    </div>
  );
};

export default EditorToolbar;
