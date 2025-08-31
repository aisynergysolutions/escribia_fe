import React, { useState } from 'react';
import { Smile, Copy, Eye, Calendar, Send, Undo, Redo, MessageSquare, ChevronDown, Monitor, Smartphone, History, Image, BarChart3, Link, X, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useIsMobile } from '@/hooks/use-mobile';
import { useAuth } from '@/context/AuthContext';
import { usePostDetails } from '@/context/PostDetailsContext';
import { useToast } from '@/hooks/use-toast';
import { getProfileName, getProfileRole, getProfileImageUrl } from '@/types/post';
import { format } from 'date-fns';
import AddToQueueModal from './AddToQueueModal';
import SchedulePostModal from './SchedulePostModal';
import PostNowModal from './PostNowModal';
import CreatePollModal from './CreatePollModal';
import CancelScheduleModal from './CancelScheduleModal';
import ManualPostModal from './ManualPostModal';
import { Poll } from '@/context/PostDetailsContext';
import { MediaFile } from './MediaUploadModal';
import { Timestamp } from 'firebase/firestore';

interface EditorToolbarProps {
  onFormat: (format: string) => void;
  onInsertEmoji: (emoji: string) => void;
  onPreview: () => void;
  onShowComments: () => void;
  onCopy: () => void;
  onSchedule: () => void;
  onPostNow: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onShowVersionHistory: () => void;
  canUndo: boolean;
  canRedo: boolean;
  viewMode: 'mobile' | 'desktop';
  onViewModeToggle: () => void;
  showCommentsPanel?: boolean;
  activeFormats?: string[];
  postContent?: string;
  onAddPoll?: (pollData: Poll) => void;
  hasPoll?: boolean;
  hasMedia?: boolean;
  onAddMedia?: () => void;
  // New props for scheduling
  postStatus?: string;
  scheduledPostAt?: import('firebase/firestore').Timestamp;
  postedAt?: import('firebase/firestore').Timestamp;
  linkedinPostUrl?: string;
  // Add clientId for queue logic
  clientId?: string;
  postId?: string;
  subClientId?: string;
  // Add media and poll data for previews
  mediaFiles?: MediaFile[];
  pollData?: Poll | null;
}

const EditorToolbar: React.FC<EditorToolbarProps> = ({
  onFormat,
  onInsertEmoji,
  onPreview,
  onShowComments,
  onCopy,
  onSchedule,
  onPostNow,
  onUndo,
  onRedo,
  onShowVersionHistory,
  canUndo,
  canRedo,
  viewMode,
  onViewModeToggle,
  showCommentsPanel = false,
  activeFormats = [],
  postContent = '',
  onAddPoll,
  hasPoll = false,
  hasMedia = false,
  onAddMedia,
  postStatus,
  scheduledPostAt,
  postedAt,
  linkedinPostUrl,
  clientId,
  postId,
  subClientId,
  mediaFiles = [],
  pollData
}) => {
  const isMobile = useIsMobile();
  const { currentUser } = useAuth();
  const { publishPostNow, post, cancelPostSchedule, updateManualPostDetails } = usePostDetails();
  const { toast } = useToast();
  const emojis = ['😀', '😊', '😍', '🤔', '👍', '👎', '❤️', '🔥', '💡', '🎉', '🚀', '💯', '✨', '🌟', '📈', '💼', '🎯', '💪', '🙌', '👏'];
  const [showAddToQueueModal, setShowAddToQueueModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showPostNowModal, setShowPostNowModal] = useState(false);
  const [showCreatePollModal, setShowCreatePollModal] = useState(false);
  const [showCancelScheduleModal, setShowCancelScheduleModal] = useState(false);
  const [showManualPostModal, setShowManualPostModal] = useState(false);

  // Check if the post is scheduled or posted
  const isScheduled = postStatus === 'Scheduled' && scheduledPostAt && scheduledPostAt.seconds > 0;
  const isPosted = postStatus === 'Posted' && postedAt && postedAt.seconds > 0;
  const isPostedWithoutDetails = postStatus === 'Posted' && (!postedAt || postedAt.seconds === 0);

  // Format the scheduled date and time
  const formatScheduledDateTime = () => {
    if (!scheduledPostAt) return '';
    const date = new Date(scheduledPostAt.seconds * 1000);
    return format(date, 'MMM d, h:mm a');
  };

  // Format the posted date and time
  const formatPostedDateTime = () => {
    if (!postedAt) return '';
    const date = new Date(postedAt.seconds * 1000);
    return format(date, 'MMM d, h:mm a');
  };

  const handleAddToQueue = () => {
    setShowAddToQueueModal(true);
  };

  const handleAddToQueueConfirm = (selectedTime: string, status: string) => {
    console.log('Adding to queue:', { selectedTime, status });
  };

  const handleOpenScheduleModal = () => {
    setShowScheduleModal(true);
  };

  const handleScheduleConfirm = (date: Date, time: string, status: string) => {
    console.log('Scheduling post:', { date, time, status });
    setShowScheduleModal(false);
  };

  const handlePostNow = () => {
    console.log('EditorToolbar handlePostNow called with props:', { clientId, postId, subClientId });
    setShowPostNowModal(true);
  };

  const handlePostNowConfirm = async (status: string) => {
    if (!currentUser?.uid || !clientId || !postId || !subClientId) {
      toast({
        title: "Error",
        description: `Missing required information to publish the post. User ID: ${currentUser?.uid || 'undefined'}, Client ID: ${clientId || 'undefined'}, Post ID: ${postId || 'undefined'}, Profile ID: ${subClientId || 'undefined'}`,
        variant: "destructive"
      });
      return;
    }

    try {
      const result = await publishPostNow(
        currentUser.uid,
        clientId,
        postId,
        subClientId,
        postContent
      );

      if (result.success) {
        toast({
          title: "Post Published",
          description: result.linkedinPostId ? (
            <span>
              Post successfully published. You can see it{' '}
              <a
                href={`https://www.linkedin.com/feed/update/${result.linkedinPostId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline"
              >
                here
              </a>
              !
            </span>
          ) : (
            "Your post has been successfully published to LinkedIn."
          ),
        });
        setShowPostNowModal(false);
      } else {
        toast({
          title: "Publication Failed",
          description: result.error || "An error occurred while publishing your post.",
          variant: "destructive"
        });
        // Keep the modal open for retry
      }
    } catch (error) {
      console.error('Error publishing post:', error);
      toast({
        title: "Publication Failed",
        description: "An unexpected error occurred while publishing your post.",
        variant: "destructive"
      });
      // Keep the modal open for retry
    }
  };

  const handleCancelSchedule = () => {
    setShowCancelScheduleModal(true);
  };

  const handleCancelScheduleConfirm = async () => {
    if (!currentUser?.uid || !clientId || !postId) {
      toast({
        title: "Error",
        description: "Missing required information to cancel the schedule.",
        variant: "destructive"
      });
      return;
    }

    try {
      await cancelPostSchedule(currentUser.uid, clientId, postId);

      toast({
        title: "Schedule Cancelled",
        description: "The post schedule has been successfully cancelled and the post is now in draft status.",
      });

      setShowCancelScheduleModal(false);
    } catch (error) {
      console.error('Error cancelling schedule:', error);
      toast({
        title: "Cancellation Failed",
        description: "There was an error cancelling the schedule. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleAddMedia = () => {
    if (onAddMedia) {
      onAddMedia();
    }
  };

  const handleAddPoll = () => {
    setShowCreatePollModal(true);
  };

  const handleCreatePoll = (pollData: Poll) => {
    if (onAddPoll) {
      onAddPoll(pollData);
    }
    setShowCreatePollModal(false);
  };

  const handleOpenManualPostModal = () => {
    setShowManualPostModal(true);
  };

  const handleSaveManualPostDetails = async (postedAt: Timestamp, linkedinPostUrl?: string) => {
    if (!currentUser?.uid || !clientId || !postId) {
      toast({
        title: "Error",
        description: "Missing required information to save post details.",
        variant: "destructive"
      });
      return;
    }

    try {
      await updateManualPostDetails(currentUser.uid, clientId, postId, postedAt, linkedinPostUrl);

      toast({
        title: "Post Details Saved",
        description: "The post details have been successfully saved.",
      });

      setShowManualPostModal(false);
    } catch (error) {
      console.error('Error saving manual post details:', error);
      toast({
        title: "Save Failed",
        description: "There was an error saving the post details. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <>
      <div className="flex justify-between items-center p-4 border-b">
        {/* Left-Aligned Editing Zone */}
        <div className="flex items-center gap-1">
          {/* Undo/Redo Controls */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={onUndo}
                disabled={!canUndo || isPosted}
                className="h-8 w-8 p-0"
              >
                <Undo className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{isPosted ? 'Cannot undo - post is published' : 'Undo (Ctrl+Z)'}</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={onRedo}
                disabled={!canRedo || isPosted}
                className="h-8 w-8 p-0"
              >
                <Redo className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{isPosted ? 'Cannot redo - post is published' : 'Redo (Ctrl+Y)'}</p>
            </TooltipContent>
          </Tooltip>

          {/* Separator */}
          <div className="w-px h-6 bg-gray-300 mx-1" />

          {/* Emoji */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    disabled={isPosted}
                  >
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
            </TooltipTrigger>
            <TooltipContent>
              <p>{isPosted ? 'Cannot add emoji - post is published' : 'Add emoji'}</p>
            </TooltipContent>
          </Tooltip>

          {/* Fixed: Add Media Button - disabled when media present */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleAddMedia}
                className="h-8 w-8 p-0"
                disabled={hasPoll || isPosted}
              >
                <Image className={`h-4 w-4 ${hasMedia ? 'text-blue-600' : ''}`} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{isPosted ? 'Cannot add media - post is published' : hasPoll ? 'Remove poll to add media' : hasMedia ? 'Edit media' : 'Add media'}</p>
            </TooltipContent>
          </Tooltip>

          {/* Add Poll Button */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleAddPoll}
                className="h-8 w-8 p-0"
                disabled={hasMedia || isPosted}
              >
                <BarChart3 className={`h-4 w-4 ${hasPoll ? 'text-blue-600' : ''}`} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{isPosted ? 'Cannot add poll - post is published' : hasMedia ? 'Remove media to add poll' : hasPoll ? 'Edit poll' : 'Add poll'}</p>
            </TooltipContent>
          </Tooltip>

          {/* Separator */}
          <div className="w-px h-6 bg-gray-300 mx-1" />

          {/* Version History Control */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={onShowVersionHistory}
                className="h-8 w-8 p-0"
                disabled={isPosted}
              >
                <History className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{isPosted ? 'Cannot access versions - post is published' : 'Version History'}</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="sm" onClick={onCopy} className="h-8 w-8 p-0">
                <Copy className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Copy</p>
            </TooltipContent>
          </Tooltip>
        </div>

        <TooltipProvider>
          {/* Right-Aligned Finalize Zone */}
          <div className="flex gap-2">
            {/* <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={showCommentsPanel ? "default" : "outline"}
                  size="sm"
                  onClick={onShowComments}
                  className={`h-8 w-8 p-0 ${showCommentsPanel
                    ? 'bg-blue-100 text-blue-700 hover:bg-blue-200 border-blue-200'
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border-gray-200'
                    }`}
                >
                  <MessageSquare className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Show Comments</p>
              </TooltipContent>
            </Tooltip> */}

            {/* View Mode Toggle Button */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="sm" onClick={onViewModeToggle} className="h-8 w-8 p-0">
                  {viewMode === 'desktop' ? <Monitor className="h-4 w-4" /> : <Smartphone className="h-4 w-4" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{viewMode === 'desktop' ? 'Switch to Mobile View' : 'Switch to Desktop View'}</p>
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

            {/* Separator */}
            <div className="w-px h-6 bg-gray-300 mx-1" />

            {/* Conditional Rendering: Posted Info, Scheduled Info, Add Post Details, or Add to Queue */}
            {isPosted ? (
              // Show posted info (no modify options for posted content)
              <div className="flex items-center gap-2">
                <div className="flex flex-col items-start">
                  <span className="text-xs text-gray-500">Posted at</span>
                  <span className="text-sm font-medium text-green-700">
                    {formatPostedDateTime()}
                  </span>
                </div>
                {linkedinPostUrl && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(linkedinPostUrl, '_blank')}
                        className="h-8 w-8 p-0 text-gray-500 hover:text-blue-600"
                      >
                        <Link className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>View on LinkedIn</p>
                    </TooltipContent>
                  </Tooltip>
                )}
              </div>
            ) : isPostedWithoutDetails ? (
              // Show "Add post details" button when post is marked as Posted but missing details
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="sm"
                    onClick={handleOpenManualPostModal}
                    className={`h-8 bg-orange-600 hover:bg-orange-700 text-white flex items-center ${isMobile ? 'px-3' : 'px-3 gap-1.5'}`}
                  >
                    <Plus className="h-4 w-4" />
                    {!isMobile && <span className="text-sm font-medium">Add post details</span>}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Add post details</p>
                </TooltipContent>
              </Tooltip>
            ) : isScheduled ? (
              // Show scheduled info with modify options
              <div className="flex items-center gap-2">
                <div className="flex flex-col items-start">
                  <span className="text-xs text-gray-500">Scheduled for</span>
                  <span className="text-sm font-medium text-gray-900">
                    {formatScheduledDateTime()}
                  </span>
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                    >
                      <ChevronDown className="h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-40">
                    <DropdownMenuItem onClick={handleOpenScheduleModal} className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Reschedule
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handlePostNow} className="flex items-center gap-2">
                      <Send className="h-4 w-4" />
                      Post Now
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleCancelSchedule} className="flex items-center gap-2 text-red-600">
                      <X className="h-4 w-4" />
                      Cancel Schedule
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              // Show original Add to Queue with dropdown
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
                    <DropdownMenuItem onClick={handleOpenScheduleModal} className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Schedule
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handlePostNow} className="flex items-center gap-2">
                      <Send className="h-4 w-4" />
                      Post Now
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}
          </div>
        </TooltipProvider>
      </div>

      <AddToQueueModal
        open={showAddToQueueModal}
        onOpenChange={setShowAddToQueueModal}
        postContent={postContent}
        onAddToQueue={handleAddToQueueConfirm}
        onOpenScheduleModal={handleOpenScheduleModal}
        clientId={clientId}
        postId={postId}
        mediaFiles={mediaFiles}
        pollData={pollData}
        profileData={post ? {
          profileId: post.profileId,
          name: getProfileName(post),
          role: getProfileRole(post),
          profileImage: getProfileImageUrl(post)
        } : undefined}
      />

      <SchedulePostModal
        open={showScheduleModal}
        onOpenChange={setShowScheduleModal}
        postContent={postContent}
        onSchedule={handleScheduleConfirm}
        clientId={clientId}
        postId={postId}
        mediaFiles={mediaFiles}
        pollData={pollData}
        profileData={post ? {
          name: getProfileName(post),
          role: getProfileRole(post),
          profileImage: getProfileImageUrl(post)
        } : undefined}
      />

      <PostNowModal
        open={showPostNowModal}
        onOpenChange={setShowPostNowModal}
        postContent={postContent}
        onPost={handlePostNowConfirm}
        clientId={clientId}
        postId={postId}
        subClientId={subClientId}
        mediaFiles={mediaFiles}
        pollData={pollData}
        profileData={post ? {
          name: getProfileName(post),
          role: getProfileRole(post),
          profileImage: getProfileImageUrl(post)
        } : undefined}
      />

      <CreatePollModal
        open={showCreatePollModal}
        onOpenChange={setShowCreatePollModal}
        onCreatePoll={handleCreatePoll}
        editingPoll={hasPoll ? pollData : null}
      />

      <CancelScheduleModal
        open={showCancelScheduleModal}
        onOpenChange={setShowCancelScheduleModal}
        clientId={clientId}
        postId={postId}
        scheduledPostAt={scheduledPostAt}
        onCancelConfirm={handleCancelScheduleConfirm}
      />

      <ManualPostModal
        open={showManualPostModal}
        onOpenChange={setShowManualPostModal}
        onSave={handleSaveManualPostDetails}
        title="Add Post Details"
        description="This post is marked as Posted but missing posting details. Please provide when and where it was posted."
      />
    </>
  );
};

export default EditorToolbar;
