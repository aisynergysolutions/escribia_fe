import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Clock, Eye, Smartphone, Monitor, User, Building2 } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

interface Version {
  id: string;
  content: string;
  createdAt: Date;
  title: string;
}

interface VersionHistoryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  versions: Version[];
  onRestore: (versionId: string) => void;
  profileData?: {
    id: string;
    role: string;
    imageUrl?: string;
    profileName?: string;
  };
}

const VersionHistoryModal: React.FC<VersionHistoryModalProps> = ({
  open,
  onOpenChange,
  versions,
  onRestore,
  profileData
}) => {
  const [viewingVersion, setViewingVersion] = useState<Version | null>(null);
  const [deviceType, setDeviceType] = useState<'mobile' | 'desktop'>('desktop');
  const [isExpanded, setIsExpanded] = useState(true); // Default to expanded
  const [shouldShowMore, setShouldShowMore] = useState(false);
  const [truncatedContent, setTruncatedContent] = useState('');
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Add a small delay to ensure the DOM has rendered
    const timeoutId = setTimeout(() => {
      if (contentRef.current && viewingVersion) {
        // Strip HTML tags for text measurement
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = formatContent(viewingVersion.content);
        const plainText = tempDiv.textContent || tempDiv.innerText || '';

        // Create a temporary element to measure text
        const measuringDiv = document.createElement('div');
        measuringDiv.style.visibility = 'hidden';
        measuringDiv.style.position = 'absolute';
        measuringDiv.style.width = contentRef.current.offsetWidth + 'px';
        measuringDiv.style.fontSize = '14px';
        measuringDiv.style.lineHeight = '1.5';
        measuringDiv.style.fontFamily = window.getComputedStyle(contentRef.current).fontFamily;
        measuringDiv.style.whiteSpace = 'pre-wrap';
        document.body.appendChild(measuringDiv);

        // Calculate how much text fits in 3 lines
        const lineHeight = 21; // 14px * 1.5 line-height
        const maxHeight = lineHeight * 3;

        let truncateAt = plainText.length;
        let testText = plainText;

        while (testText.length > 0) {
          measuringDiv.textContent = testText + '...See more';
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
  }, [viewingVersion, deviceType]); // Added viewingVersion as dependency

  // Reset to expanded when modal opens
  useEffect(() => {
    if (viewingVersion) {
      setIsExpanded(true);
    }
  }, [viewingVersion]);

  const handleSeeMore = () => {
    setIsExpanded(true);
  };

  const handleSeeLess = () => {
    setIsExpanded(false);
  };

  const handleRestore = (versionId: string) => {
    onRestore(versionId);
    onOpenChange(false);
  };

  const handleViewFull = (version: Version) => {
    setViewingVersion(version);
  };

  const formatContent = (content: string) => {
    // Convert HTML line breaks to actual line breaks and handle text formatting
    return content
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/p><p>/gi, '\n\n')
      .replace(/<p>/gi, '')
      .replace(/<\/p>/gi, '')
      .replace(/<[^>]*>/g, '') // Remove any remaining HTML tags
      .trim();
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Version History
            </DialogTitle>
            <p className="text-sm text-gray-600 mt-2">
              Versions are automatically saved when you pause editing for a moment
            </p>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            {versions.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No versions available
              </div>
            ) : (
              [...versions].reverse().map((version, index) => (
                <Card key={version.id} className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        Version {versions.length - index}
                      </Badge>
                      <span className="text-sm text-gray-600">
                        {version.title}
                      </span>
                      {index === 0 && (
                        <Badge className="bg-green-100 text-green-800 text-xs">
                          Latest
                        </Badge>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleViewFull(version)}
                        className="flex items-center gap-1"
                      >
                        <Eye className="h-3 w-3" />
                        View Full
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleRestore(version.id)}
                        className="bg-indigo-600 hover:bg-indigo-700"
                      >
                        Restore
                      </Button>
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-md p-3 max-h-32 overflow-y-auto">
                    <pre className="text-sm whitespace-pre-wrap font-sans text-gray-800">
                      {formatContent(version.content) || 'Empty content'}
                    </pre>
                  </div>
                </Card>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Full Version View Modal */}
      <Dialog open={!!viewingVersion} onOpenChange={() => setViewingVersion(null)}>
        <DialogContent className="max-w-6xl h-[90vh] flex flex-col bg-white">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle className="text-xl font-semibold text-gray-900">
              Version Preview - {viewingVersion?.title || 'Version Details'}
            </DialogTitle>
            {/* <div className="flex items-center gap-2 mt-2">
              <Badge variant="outline" className="text-xs">
                {viewingVersion?.createdAt ? new Date(viewingVersion.createdAt).toLocaleString() : 'Unknown date'}
              </Badge>
            </div> */}
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
          </div>

          {/* Preview Area - Scrollable container */}
          <div className="flex-1 min-h-0 overflow-auto">
            <div className="flex items-start justify-center p-6 min-h-full">
              <div
                className={`
                  ${deviceType === 'mobile' ? 'w-[380px]' : 'w-[555px]'} 
                  bg-white 
                  rounded-lg shadow-lg border
                `}
              >
                {/* LinkedIn Header */}
                <div className="p-4 border-b border-gray-200">
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
                      <div className="font-semibold text-gray-900">
                        {profileData?.profileName || 'Your Profile'}
                      </div>
                      <div className="text-sm text-gray-500">
                        {viewingVersion?.createdAt ? new Date(viewingVersion.createdAt).toLocaleDateString() : 'Unknown date'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Post Content */}
                <div className="p-4">
                  <div className="relative">
                    <div
                      ref={contentRef}
                      className="text-sm leading-relaxed mb-4 whitespace-pre-wrap text-gray-900"
                    >
                      {isExpanded ? (
                        <div>
                          <span>{formatContent(viewingVersion?.content || '')}</span>
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
                                ...See more
                              </button>
                            </span>
                          ) : (
                            <span>{formatContent(viewingVersion?.content || '')}</span>
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
                </div>

                {/* LinkedIn Engagement Bar */}
                <div className="p-4 border-t border-gray-200">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-gray-500">
                      <div className="flex -space-x-1">
                        <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center text-xs text-white">👍</div>
                        <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-xs text-white">❤️</div>
                      </div>
                      <span>Max Müller and 36 other people</span>
                    </div>
                    <div className="text-gray-500">
                      88 Comments
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex justify-between pt-3 mt-3 border-t border-gray-200">
                    {['Like', 'Comment', 'Share', 'Send'].map((action) => (
                      <button
                        key={action}
                        className="flex items-center gap-2 px-4 py-2 rounded hover:bg-gray-100 text-gray-600 hover:bg-gray-50"
                      >
                        <span className="text-sm">{action}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-2 p-4 border-t flex-shrink-0">
            <Button
              variant="outline"
              onClick={() => setViewingVersion(null)}
            >
              Close
            </Button>
            {viewingVersion && (
              <Button
                onClick={() => {
                  handleRestore(viewingVersion.id);
                  setViewingVersion(null);
                }}
                className="bg-indigo-600 hover:bg-indigo-700"
              >
                Restore This Version
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default VersionHistoryModal;
