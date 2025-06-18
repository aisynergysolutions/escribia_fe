
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Image, BarChart3 } from 'lucide-react';

interface MediaPollSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectMedia: () => void;
  onSelectPoll: () => void;
}

const MediaPollSelector: React.FC<MediaPollSelectorProps> = ({
  open,
  onOpenChange,
  onSelectMedia,
  onSelectPoll
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Add to your post</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-3">
          <Button
            variant="outline"
            onClick={onSelectMedia}
            className="w-full justify-start h-12"
          >
            <Image className="h-5 w-5 mr-3" />
            Add media
          </Button>
          
          <Button
            variant="outline"
            onClick={onSelectPoll}
            className="w-full justify-start h-12"
          >
            <BarChart3 className="h-5 w-5 mr-3" />
            Create a poll
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MediaPollSelector;
