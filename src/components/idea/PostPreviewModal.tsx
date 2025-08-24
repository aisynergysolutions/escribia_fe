
import React, { useState, useRef, useEffect } from 'react';
import { Eye, Smartphone, Monitor, Sun, Moon, User, Building2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Poll, usePostDetails } from '@/context/PostDetailsContext';
import { MediaFile } from './MediaUploadModal';

interface PostPreviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  postContent: string;
  pollData?: Poll | null;
  mediaFiles?: MediaFile[];
  profileData?: {
    id: string;
    role: string;
    imageUrl?: string;
  };
}

const PostPreviewModal: React.FC<PostPreviewModalProps> = ({
  open,
  onOpenChange,
  postContent,
  pollData,
  mediaFiles = [],
  profileData
}) => {
  const [deviceType, setDeviceType] = useState<'mobile' | 'desktop'>('desktop');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [isExpanded, setIsExpanded] = useState(true); // Default to expanded
  const [shouldShowMore, setShouldShowMore] = useState(false);
  const [truncatedContent, setTruncatedContent] = useState('');
  const contentRef = useRef<HTMLDivElement>(null);
  const { post } = usePostDetails();

  useEffect(() => {
    // Add a small delay to ensure the DOM has rendered
    const timeoutId = setTimeout(() => {
      if (contentRef.current) {
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
        measuringDiv.style.whiteSpace = 'pre-wrap'; // Preserve line breaks
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
    }, 100); // Small delay to ensure DOM is ready

    return () => clearTimeout(timeoutId);
  }, [postContent, deviceType, theme, open]); // Added open dependency

  // Reset to expanded when modal opens
  useEffect(() => {
    if (open) {
      setIsExpanded(true);
    }
  }, [open]);

  const handleSeeMore = () => {
    setIsExpanded(true);
  };

  const handleSeeLess = () => {
    setIsExpanded(false);
  };

  const renderMediaPreview = () => {
    if (!mediaFiles || mediaFiles.length === 0) return null;

    const hasVideo = mediaFiles.some(f => f.type === 'video');
    const videoFile = hasVideo ? mediaFiles.find(f => f.type === 'video') : null;

    return (
      <div className="mb-4">
        <div className="border rounded-lg overflow-hidden bg-gray-50">
          {hasVideo && videoFile ? (
            /* Video Preview */
            <div className="relative">
              <video
                src={videoFile.url}
                className="w-full h-64 object-cover"
                controls
                preload="metadata"
              />
              {/* Video duration badge */}
              {videoFile.duration && (
                <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-1.5 py-0.5 rounded">
                  {Math.floor(videoFile.duration / 60)}:{String(Math.floor(videoFile.duration % 60)).padStart(2, '0')}
                </div>
              )}
            </div>
          ) : (
            /* Image Grid */
            (() => {
              const firstImage = mediaFiles[0];
              const remainingImages = mediaFiles.slice(1, 4);
              const extraCount = Math.max(0, mediaFiles.length - 4);
              const isVerticalLayout = firstImage.isVertical;

              return isVerticalLayout ? (
                /* Vertical Layout: Main image on left, others on right */
                <div className="flex h-64">
                  <div className="flex-1">
                    <img
                      src={firstImage.url}
                      alt="Main image"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  {remainingImages.length > 0 && (
                    <div className="w-32 flex flex-col">
                      {remainingImages.map((image, index) => (
                        <div
                          key={image.id}
                          className={`relative flex-1 ${index < remainingImages.length - 1 ? 'border-b border-white' : ''}`}
                        >
                          <img
                            src={image.url}
                            alt={`Image ${index + 2}`}
                            className="w-full h-full object-cover"
                          />
                          {index === remainingImages.length - 1 && extraCount > 0 && (
                            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                              <span className="text-white font-semibold text-lg">
                                +{extraCount}
                              </span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                /* Horizontal Layout: Main image on top, others below */
                <div className="space-y-0">
                  <div className="h-48">
                    <img
                      src={firstImage.url}
                      alt="Main image"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  {remainingImages.length > 0 && (
                    <div className="flex h-16">
                      {remainingImages.map((image, index) => (
                        <div
                          key={image.id}
                          className={`relative flex-1 ${index < remainingImages.length - 1 ? 'border-r border-white' : ''}`}
                        >
                          <img
                            src={image.url}
                            alt={`Image ${index + 2}`}
                            className="w-full h-full object-cover"
                          />
                          {index === remainingImages.length - 1 && extraCount > 0 && (
                            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                              <span className="text-white font-semibold text-sm">
                                +{extraCount}
                              </span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })()
          )}
        </div>
      </div>
    );
  };

  const renderPollPreview = () => {
    if (!pollData) return null;

    return (
      <div className="mb-4">
        <div className={`border rounded-lg p-4 ${theme === 'dark' ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'}`}>
          <div className="space-y-4">
            <div className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {pollData.question}
            </div>
            <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
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

            <div className={`flex items-center gap-2 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
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
      <DialogContent className={`max-w-6xl h-[90vh] flex flex-col ${theme === 'dark' ? 'bg-gray-900' : 'bg-white'}`}>
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className={`text-xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            LinkedIn Post Preview
          </DialogTitle>
        </DialogHeader>

        {/* Controls - Fixed position */}
        <div className="flex gap-4 items-center justify-center py-4 border-b flex-shrink-0">
          {/* Device Toggle */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            <Button
              variant={deviceType === 'desktop' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setDeviceType('desktop')}
              className="gap-2"
            >
              <Monitor className="h-4 w-4" />
              Desktop
            </Button>
            <Button
              variant={deviceType === 'mobile' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setDeviceType('mobile')}
              className="gap-2"
            >
              <Smartphone className="h-4 w-4" />
              Mobile
            </Button>
          </div>

          {/* Theme Toggle */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            <Button
              variant={theme === 'light' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setTheme('light')}
              className="gap-2"
            >
              <Sun className="h-4 w-4" />
              Light
            </Button>
            <Button
              variant={theme === 'dark' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setTheme('dark')}
              className="gap-2"
            >
              <Moon className="h-4 w-4" />
              Dark
            </Button>
          </div>
        </div>

        {/* Preview Area - Scrollable container */}
        <div className="flex-1 min-h-0 overflow-auto">
          <div className="flex items-start justify-center p-6 min-h-full">
            <div
              className={`
                ${deviceType === 'mobile' ? 'w-[380px]' : 'w-[555px]'} 
                ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} 
                rounded-lg shadow-lg border
              `}
            >
              {/* LinkedIn Header */}
              <div className={`p-4 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                <div className="flex items-center gap-3">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={profileData?.imageUrl} alt="Profile" />
                    <AvatarFallback>
                      {profileData?.role === 'COMPANY' ? (
                        <Building2 className="h-6 w-6" />
                      ) : (
                        <User className="h-6 w-6" />
                      )}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {(post?.profile && typeof post.profile === 'object' && 'profileName' in post.profile)
                        ? post.profile.profileName
                        : 'Your Profile'}
                    </div>
                    <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                      14 days ago
                    </div>
                  </div>
                </div>
              </div>

              {/* Post Content */}
              <div className="p-4">
                <div className="relative">
                  <div
                    ref={contentRef}
                    className={`text-sm leading-relaxed mb-4 whitespace-pre-wrap ${theme === 'dark' ? 'text-gray-200' : 'text-gray-900'}`}
                  >
                    {isExpanded ? (
                      <div>
                        <span dangerouslySetInnerHTML={{ __html: postContent.replace(/\n/g, '<br>') }} />
                        {shouldShowMore && (
                          <span>
                            {' '}
                            <button
                              onClick={handleSeeLess}
                              className={`font-medium ${theme === 'dark' ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'}`}
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
                              className={`font-medium ${theme === 'dark' ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'}`}
                            >
                              ...more
                            </button>
                          </span>
                        ) : (
                          <span dangerouslySetInnerHTML={{ __html: postContent.replace(/\n/g, '<br>') }} />
                        )}
                      </div>
                    )}
                  </div>

                  {/* LinkedIn 3-line breakline indicator - show when expanded AND content is longer than 3 lines */}
                  {isExpanded && shouldShowMore && (
                    <div
                      className="absolute left-0 right-0 border-t-2 border-dashed border-orange-400 opacity-70"
                      style={{
                        top: `${21 * 3}px`, // 3 lines * line-height
                        zIndex: 10
                      }}
                      title="LinkedIn shows only the first 3 lines in feeds"
                    />
                  )}
                </div>

                {/* Media Preview - Always visible */}
                {renderMediaPreview()}

                {/* Poll Preview - Always visible */}
                {renderPollPreview()}
              </div>

              {/* LinkedIn Engagement Bar */}
              <div className={`p-4 border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                <div className="flex items-center justify-between text-sm">
                  <div className={`flex items-center gap-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    <div className="flex -space-x-1">
                      <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center text-xs text-white">👍</div>
                      <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-xs text-white">❤️</div>
                    </div>
                    <span>Max Müller and 251 other people</span>
                  </div>
                  <div className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    47 Comments
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-between pt-3 mt-3 border-t border-gray-200">
                  {['Like', 'Comment', 'Share', 'Send'].map((action) => (
                    <button
                      key={action}
                      className={`flex items-center gap-2 px-4 py-2 rounded hover:bg-gray-100 ${theme === 'dark' ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-50'}`}
                    >
                      <span className="text-sm">{action}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PostPreviewModal;
