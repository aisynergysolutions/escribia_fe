import React, { useState, useRef, useEffect } from 'react';
import { Send, ChevronDown } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

interface PostNowModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  postContent: string;
  onPost: (status: string) => void;
}

const predefinedStatuses = ['Drafted', 'Needs Visual', 'Waiting for Approval', 'Approved', 'Scheduled', 'Posted'];

const getStatusColor = (status: string) => {
  const normalizedStatus = status.toLowerCase();
  switch (normalizedStatus) {
    case 'posted':
      return 'bg-green-100 text-green-800 hover:bg-green-100 hover:text-green-800';
    case 'scheduled':
      return 'bg-blue-100 text-blue-800 hover:bg-blue-100 hover:text-blue-800';
    case 'waitingforapproval':
    case 'waiting for approval':
      return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100 hover:text-yellow-800';
    case 'approved':
      return 'bg-green-100 text-green-800 hover:bg-green-100 hover:text-green-800';
    case 'drafted':
      return 'bg-purple-100 text-purple-800 hover:bg-purple-100 hover:text-purple-800';
    case 'needsvisual':
    case 'needs visual':
      return 'bg-orange-100 text-orange-800 hover:bg-orange-100 hover:text-orange-800';
    default:
      return 'bg-gray-100 text-gray-800 hover:bg-gray-100 hover:text-gray-800';
  }
};

const PostNowModal: React.FC<PostNowModalProps> = ({
  open,
  onOpenChange,
  postContent,
  onPost
}) => {
  const [selectedStatus, setSelectedStatus] = useState('Posted');
  const [isExpanded, setIsExpanded] = useState(false);
  const [shouldShowMore, setShouldShowMore] = useState(false);
  const [truncatedContent, setTruncatedContent] = useState('');
  const contentRef = useRef<HTMLDivElement>(null);

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

  const handlePost = () => {
    onPost(selectedStatus);
    onOpenChange(false);
  };

  const handleSeeMore = () => {
    setIsExpanded(true);
  };

  const handleSeeLess = () => {
    setIsExpanded(false);
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
                      <div className="w-12 h-12 rounded-full bg-gray-300"></div>
                      <div>
                        <div className="font-semibold text-gray-900">Your Name</div>
                        <div className="text-sm text-gray-500">Publishing now...</div>
                      </div>
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="relative">
                      <div 
                        ref={contentRef}
                        className="text-sm leading-relaxed text-gray-900 mb-4"
                        style={{
                          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                          fontSize: '14px',
                          lineHeight: '1.5'
                        }}
                      >
                        {isExpanded ? (
                          <div>
                            <span dangerouslySetInnerHTML={{ __html: postContent }} />
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
                              <span dangerouslySetInnerHTML={{ __html: postContent }} />
                            )}
                          </div>
                        )}
                      </div>
                      
                      {/* Separator line at 3rd line position when collapsed */}
                      {!isExpanded && shouldShowMore && (
                        <Separator className="mb-4" />
                      )}
                    </div>
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
                </div>
              </div>
            </ScrollArea>
          </div>

          {/* Status Selection */}
          <div className="flex-shrink-0">
            <Separator className="mb-4" />
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold">Update Status</h3>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <div className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded">
                      <Badge className={`${getStatusColor(selectedStatus)}`}>
                        {selectedStatus}
                      </Badge>
                      <ChevronDown className="h-4 w-4 text-gray-400" />
                    </div>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56">
                    {predefinedStatuses.map(status => (
                      <DropdownMenuItem key={status} onClick={() => setSelectedStatus(status)} className="p-2">
                        <Badge className={`${getStatusColor(status)} cursor-pointer`}>
                          {status}
                        </Badge>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <p className="text-sm text-gray-500">
                The status will be automatically updated to "{selectedStatus}" when posted.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 pt-4 border-t flex-shrink-0">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handlePost}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            <Send className="w-4 h-4 mr-2" />
            Post Now
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PostNowModal;
