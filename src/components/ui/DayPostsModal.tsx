
import React from 'react';
import { format } from 'date-fns';
import { Clock, ExternalLink, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './dialog';
import { Button } from './button';
import { mockClients } from '../../types';

interface DayPostsModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: Date | null;
  posts: any[];
  onPostClick: (post: any) => void;
  showAllClients?: boolean;
}

const DayPostsModal: React.FC<DayPostsModalProps> = ({
  isOpen,
  onClose,
  selectedDate,
  posts,
  onPostClick,
  showAllClients = false
}) => {
  const getClientName = (clientId: string) => {
    const client = mockClients.find(c => c.id === clientId);
    return client?.clientName || 'Unknown Client';
  };

  const sortedPosts = posts.sort((a, b) => {
    const timeA = new Date(a.scheduledPostAt!.seconds * 1000).getTime();
    const timeB = new Date(b.scheduledPostAt!.seconds * 1000).getTime();
    return timeA - timeB;
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>
              Posts for {selectedDate && format(selectedDate, 'MMMM d, yyyy')}
            </span>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {sortedPosts.map((post, index) => (
            <div
              key={post.id}
              className="flex items-start gap-3 p-3 border rounded-lg hover:bg-accent cursor-pointer transition-colors group"
              onClick={() => {
                onPostClick(post);
                onClose();
              }}
            >
              <div className="flex flex-col items-center">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                {index < sortedPosts.length - 1 && (
                  <div className="w-0.5 h-8 bg-gray-200 mt-1"></div>
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Clock className="h-4 w-4 text-blue-600" />
                  <span className="font-medium text-sm">
                    {format(new Date(post.scheduledPostAt!.seconds * 1000), 'HH:mm')}
                  </span>
                  <ExternalLink className="h-4 w-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                
                <h4 className="font-semibold text-sm mb-1 truncate">
                  {post.title}
                </h4>
                
                {showAllClients && (
                  <p className="text-xs text-muted-foreground">
                    {getClientName(post.clientId)}
                  </p>
                )}
                
                {post.description && (
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                    {post.description}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
        
        {sortedPosts.length === 0 && (
          <div className="text-center text-muted-foreground py-8">
            No posts scheduled for this day
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default DayPostsModal;
