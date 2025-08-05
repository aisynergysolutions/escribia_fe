import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader2, User, Building2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import MediaPreview from './MediaPreview';
import { MediaFile } from './MediaUploadModal';
import { Poll, usePostDetails } from '@/context/PostDetailsContext';

interface PostNowModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  postContent: string;
  onPost: (status: string) => Promise<void>;
  clientId?: string;
  postId?: string;
  subClientId?: string;
  mediaFiles?: MediaFile[];
  pollData?: Poll | null;
  profileData?: {
    name: string;
    role: string;
    profileImage?: string;
  };
}

const PostNowModal: React.FC<PostNowModalProps> = ({
  open,
  onOpenChange,
  postContent,
  onPost,
  clientId,
  postId,
  subClientId,
  mediaFiles = [],
  pollData,
  profileData
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [shouldShowMore, setShouldShowMore] = useState(false);
  const [truncatedContent, setTruncatedContent] = useState('');
  const [isPublishing, setIsPublishing] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { post } = usePostDetails();

  useEffect(() => {
    if (contentRef.current && open && postContent) {
      // Strip HTML tags for text measurement
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = postContent;
      const plainText = tempDiv.textContent || tempDiv.innerText || '';

      // Create a temporary element to measure text
      const measuringDiv = document.createElement('div');
      measuringDiv.style.visibility = 'hidden';
      measuringDiv.style.position = 'absolute';
      measuringDiv.style.width = '504px'; // LinkedIn post width
      measuringDiv.style.fontSize = '14px';
      measuringDiv.style.lineHeight = '1.5';
      measuringDiv.style.fontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      measuringDiv.style.padding = '0';
      measuringDiv.style.margin = '0';
      measuringDiv.style.whiteSpace = 'pre-wrap'; // Preserve line breaks
      document.body.appendChild(measuringDiv);

      // Calculate how much text fits in exactly 3 lines
      const lineHeight = 21; // 14px * 1.5 line-height
      const maxHeight = lineHeight * 3;

      // Binary search to find the optimal truncation point
      let start = 0;
      let end = plainText.length;
      let bestFit = 0;

      while (start <= end) {
        const mid = Math.floor((start + end) / 2);
        const testText = plainText.substring(0, mid);
        measuringDiv.textContent = testText;

        if (measuringDiv.offsetHeight <= maxHeight) {
          bestFit = mid;
          start = mid + 1;
        } else {
          end = mid - 1;
        }
      }

      document.body.removeChild(measuringDiv);

      // Check if we need truncation
      if (bestFit < plainText.length && bestFit > 0) {
        setShouldShowMore(true);
        // Find the last complete word within the character limit
        let truncateAt = bestFit;
        while (truncateAt > 0 && plainText[truncateAt] !== ' ') {
          truncateAt--;
        }
        // If we went too far back, use the original truncation point
        if (truncateAt < bestFit * 0.8) {
          truncateAt = bestFit;
        }
        setTruncatedContent(plainText.substring(0, truncateAt).trim());
      } else {
        setShouldShowMore(false);
        setTruncatedContent(plainText);
      }
    }
  }, [postContent, open]);

  const handlePost = async () => {
    if (!clientId || !postId || !subClientId) {
      toast({
        title: 'Error',
        description: `Missing required information to publish the post. Client ID: ${clientId || 'undefined'}, Post ID: ${postId || 'undefined'}, Profile ID: ${subClientId || 'undefined'}`,
        variant: 'destructive'
      });
      return;
    }

    try {
      setIsPublishing(true);
      // Status will be automatically set to "Posted" by the Railway API
      await onPost('Posted');
      onOpenChange(false);
    } catch (error) {
      console.error('Error publishing post:', error);
      // The error toast should be handled by the parent component
      // but we'll keep the modal open so the user can try again
    } finally {
      setIsPublishing(false);
    }
  };

  const handleSeeMore = () => {
    setIsExpanded(true);
  };

  const handleSeeLess = () => {
    setIsExpanded(false);
  };

  const renderMediaPreview = () => {
    if (!mediaFiles || mediaFiles.length === 0) return null;

    return (
      <div className="mb-4">
        <MediaPreview
          mediaFiles={mediaFiles}
          onRemove={() => { }} // Disabled in preview mode
          onEdit={() => { }} // Disabled in preview mode
          viewMode="desktop"
          isUploading={false}
          isRemoving={false}
          isLoadingInitial={false}
        />
      </div>
    );
  };

  const renderPollPreview = () => {
    if (!pollData) return null;

    return (
      <div className="mb-4">
        <div className="border rounded-lg p-4 border-gray-200 bg-white">
          <div className="space-y-4">
            <div className="font-medium text-gray-900">
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

            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span>0 votes</span>
              <span>•</span>
              <span>1w left</span>
              <span>•</span>
              <span className="text-blue-600 cursor-pointer">View results</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <Send className="h-5 w-5" />
            Post to LinkedIn
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 min-h-0 flex flex-col space-y-6">
          <h3 className="text-lg font-semibold flex-shrink-0">Post Preview</h3>
          <div className="flex-1 min-h-0">
            <ScrollArea className="h-full">
              <div className="pr-4 pb-4">
                <div className="bg-white rounded-lg border shadow-sm">
                  <div className="p-4 border-b">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={profileData?.profileImage || post?.profile?.imageUrl} />
                        <AvatarFallback className="bg-gray-300">
                          {profileData?.role?.toLowerCase().includes('company') ? (
                            <Building2 className="h-6 w-6 text-gray-600" />
                          ) : (
                            <User className="h-6 w-6 text-gray-600" />
                          )}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-semibold text-gray-900">{profileData?.name || post?.profile?.profileName || 'Your Profile'}</div>
                        <div className="text-sm text-gray-500">Publishing now...</div>
                      </div>
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="relative">
                      <div
                        ref={contentRef}
                        className="text-sm leading-relaxed text-gray-900 mb-4 whitespace-pre-wrap"
                        style={{
                          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                          fontSize: '14px',
                          lineHeight: '1.5'
                        }}
                      >
                        {isExpanded ? (
                          <div>
                            <span dangerouslySetInnerHTML={{ __html: postContent.replace(/\n/g, '<br>') }} />
                            {shouldShowMore && (
                              <span>
                                {' '}
                                <button
                                  onClick={handleSeeLess}
                                  className="font-medium text-blue-600 hover:text-blue-700 cursor-pointer"
                                >
                                  ...see less
                                </button>
                              </span>
                            )}
                          </div>
                        ) : (
                          <div>
                            {shouldShowMore ? (
                              <span>
                                {truncatedContent}
                                <button
                                  onClick={handleSeeMore}
                                  className="font-medium text-blue-600 hover:text-blue-700 cursor-pointer ml-1"
                                >
                                  ...see more
                                </button>
                              </span>
                            ) : (
                              <span dangerouslySetInnerHTML={{ __html: postContent.replace(/\n/g, '<br>') }} />
                            )}
                          </div>
                        )}
                      </div>

                      {/* Separator line at 3rd line position when collapsed */}
                      {!isExpanded && shouldShowMore && (
                        <Separator className="mb-4" />
                      )}
                    </div>

                    {/* Media Preview */}
                    {renderMediaPreview()}

                    {/* Poll Preview */}
                    {renderPollPreview()}
                  </div>

                  {/* Simulated engagement */}
                  <div className="px-4 pb-4">
                    <div className="flex justify-between pt-3 border-t border-gray-200">
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <div className="flex -space-x-1">
                          <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center text-xs text-white">👍</div>
                          <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-xs text-white">❤️</div>
                        </div>
                        <span>Ready to publish</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Confirmation */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
                  <p className="text-blue-800 text-sm">
                    <strong>Ready to publish:</strong> Your post will be immediately published to your LinkedIn profile.
                    Make sure you've reviewed the content above.
                  </p>
                  <p className="text-blue-700 text-xs mt-2">
                    The post status will be automatically updated to "Posted" after successful publication.
                  </p>
                </div>
              </div>
            </ScrollArea>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 pt-4 border-t flex-shrink-0">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isPublishing}
          >
            Cancel
          </Button>
          <Button
            onClick={handlePost}
            disabled={isPublishing}
            className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400"
          >
            {isPublishing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Publishing...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Post Now
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PostNowModal;
