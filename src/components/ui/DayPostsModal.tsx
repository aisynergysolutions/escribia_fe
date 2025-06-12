
import React, { useState } from 'react';
import { format } from 'date-fns';
import { Clock, ExternalLink, X, Plus } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './dialog';
import { Button } from './button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select';
import { Label } from './label';
import { Input } from './input';
import { mockClients, mockIdeas } from '../../types';
import { useParams } from 'react-router-dom';

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
  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState<string>('');
  const [scheduledTime, setScheduledTime] = useState<string>('09:00');
  const { clientId } = useParams<{ clientId: string }>();

  const getClientName = (clientId: string) => {
    const client = mockClients.find(c => c.id === clientId);
    return client?.clientName || 'Unknown Client';
  };

  const getAvailablePosts = () => {
    let availablePosts = mockIdeas.filter(idea => 
      idea.status === 'Draft' || idea.status === 'In Review'
    );

    // If not showing all clients, filter by current client
    if (!showAllClients && clientId) {
      availablePosts = availablePosts.filter(idea => idea.clientId === clientId);
    }

    return availablePosts;
  };

  const sortedPosts = posts.sort((a, b) => {
    const timeA = new Date(a.scheduledPostAt!.seconds * 1000).getTime();
    const timeB = new Date(b.scheduledPostAt!.seconds * 1000).getTime();
    return timeA - timeB;
  });

  const handleSchedulePost = () => {
    if (!selectedPostId || !scheduledTime) return;
    
    // In a real app, this would make an API call to schedule the post
    console.log('Scheduling post:', {
      postId: selectedPostId,
      date: selectedDate,
      time: scheduledTime
    });
    
    // Reset form and close
    setSelectedPostId('');
    setScheduledTime('09:00');
    setShowScheduleForm(false);
    // Optionally refresh the calendar data here
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>
              {selectedDate && format(selectedDate, 'MMMM d, yyyy')}
            </span>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>
        
        {!showScheduleForm ? (
          <>
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

            <div className="border-t pt-4">
              <Button 
                onClick={() => setShowScheduleForm(true)}
                className="w-full"
                variant="outline"
              >
                <Plus className="h-4 w-4 mr-2" />
                Schedule Post
              </Button>
            </div>
          </>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="post-select">Select Post</Label>
              <Select value={selectedPostId} onValueChange={setSelectedPostId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a post to schedule" />
                </SelectTrigger>
                <SelectContent>
                  {getAvailablePosts().map((post) => (
                    <SelectItem key={post.id} value={post.id}>
                      <div className="flex flex-col">
                        <span className="font-medium">{post.title}</span>
                        {showAllClients && (
                          <span className="text-xs text-muted-foreground">
                            {getClientName(post.clientId)}
                          </span>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="time-input">Schedule Time</Label>
              <Input
                id="time-input"
                type="time"
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => setShowScheduleForm(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSchedulePost}
                disabled={!selectedPostId}
                className="flex-1"
              >
                Schedule Post
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default DayPostsModal;
