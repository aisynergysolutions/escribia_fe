
import React, { useState, useRef, useEffect } from 'react';
import { Send } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

interface PostNowModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  postContent: string;
  onPost: () => void;
}

const PostNowModal: React.FC<PostNowModalProps> = ({
  open,
  onOpenChange,
  postContent,
  onPost
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [shouldShowMore, setShouldShowMore] = useState(false);
  const [truncatedContent, setTruncatedContent] = useState('');
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (contentRef.current && open) {
      // Strip HTML tags for text measurement
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = postContent;
      const plainText = tempDiv.textContent || tempDiv.innerText || '';
      
      // Create a temporary element to measure text
      const measuringDiv = document.createElement('div');
      measuringDiv.style.visibility = 'hidden';
      measuringDiv.style.position = 'absolute';
      measuringDiv.style.width = contentRef.current.offsetWidth + 'px';
      measuringDiv.style.fontSize = '14px';
      measuringDiv.style.lineHeight = '1.5';
      measuringDiv.style.fontFamily = window.getComputedStyle(contentRef.current).fontFamily;
      document.body.appendChild(measuringDiv);
      
      // Calculate how much text fits in 3 lines
      const lineHeight = 21; // 14px * 1.5 line-height
      const maxHeight = lineHeight * 3;
      
      let truncateAt = plainText.length;
      let testText = plainText;
      
      while (testText.length > 0) {
        measuringDiv.textContent = testText + '...more';
        if (measuringDiv.offsetHeight <= maxHeight) {
          truncateAt = testText.length;
          break;
        }
        testText = testText.substring(0, testText.length - 10);
      }
      
      document.body.removeChild(measuringDiv);
      
      if (truncateAt < plainText.length) {
        setShouldShowMore(true);
        setTruncatedContent(plainText.substring(0, truncateAt));
      } else {
        setShouldShowMore(false);
        setTruncatedContent(plainText);
      }
    }
  }, [postContent, open]);

  const handlePost = () => {
    onPost();
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
        
        <div className="flex-1 min-h-0 flex flex-col">
          <h3 className="text-lg font-semibold mb-4 flex-shrink-0">Post Preview</h3>
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
                      >
                        {isExpanded ? (
                          <div>
                            <span dangerouslySetInnerHTML={{ __html: postContent }} />
                            {shouldShowMore && (
                              <span>
                                {' '}
                                <button
                                  onClick={handleSeeLess}
                                  className="font-medium text-blue-600 hover:text-blue-700"
                                >
                                  See less
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
                                  className="font-medium text-blue-600 hover:text-blue-700"
                                >
                                  ...more
                                </button>
                              </span>
                            ) : (
                              <span dangerouslySetInnerHTML={{ __html: postContent }} />
                            )}
                          </div>
                        )}
                      </div>
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
