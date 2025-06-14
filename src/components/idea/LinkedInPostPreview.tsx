
import React, { useState, useRef, useEffect } from 'react';
import { MoreHorizontal, Heart, MessageCircle, Share, Send } from 'lucide-react';

interface LinkedInPostPreviewProps {
  content: string;
  authorName?: string;
  authorTitle?: string;
  onTruncationChange?: (isTruncated: boolean, truncatedLength: number) => void;
}

const LinkedInPostPreview: React.FC<LinkedInPostPreviewProps> = ({
  content,
  authorName = "Your Name",
  authorTitle = "Professional Title",
  onTruncationChange
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isTruncated, setIsTruncated] = useState(false);
  const [truncatedContent, setTruncatedContent] = useState('');
  const contentRef = useRef<HTMLDivElement>(null);

  // Function to strip HTML and get plain text
  const getPlainText = (html: string) => {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    return tempDiv.textContent || tempDiv.innerText || '';
  };

  // Function to check if content should be truncated
  const checkTruncation = (htmlContent: string) => {
    const plainText = getPlainText(htmlContent);
    const lines = plainText.split('\n');
    
    // LinkedIn shows ~200 characters OR 3 lines, whichever comes first
    const shouldTruncateByLength = plainText.length > 200;
    const shouldTruncateByLines = lines.length > 3;
    
    if (shouldTruncateByLength || shouldTruncateByLines) {
      // Truncate by characters first, then check lines
      let truncated = plainText.substring(0, 200);
      const truncatedLines = truncated.split('\n');
      
      if (truncatedLines.length > 3) {
        truncated = truncatedLines.slice(0, 3).join('\n');
      }
      
      // Find the last complete word
      const lastSpaceIndex = truncated.lastIndexOf(' ');
      if (lastSpaceIndex > 150) {
        truncated = truncated.substring(0, lastSpaceIndex);
      }
      
      setTruncatedContent(truncated);
      setIsTruncated(true);
      onTruncationChange?.(true, truncated.length);
    } else {
      setTruncatedContent(plainText);
      setIsTruncated(false);
      onTruncationChange?.(false, plainText.length);
    }
  };

  useEffect(() => {
    checkTruncation(content);
  }, [content]);

  const displayContent = isExpanded ? getPlainText(content) : truncatedContent;

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm max-w-[552px] mx-auto">
      {/* Header */}
      <div className="p-3 flex items-start justify-between">
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
            {authorName.split(' ').map(n => n[0]).join('').substring(0, 2)}
          </div>
          <div>
            <h3 className="font-semibold text-sm text-gray-900">{authorName}</h3>
            <p className="text-xs text-gray-600">{authorTitle}</p>
            <p className="text-xs text-gray-500">2h • 🌐</p>
          </div>
        </div>
        <button className="p-1 hover:bg-gray-100 rounded">
          <MoreHorizontal className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      {/* Content */}
      <div className="px-3 pb-3">
        <div 
          ref={contentRef}
          className="text-sm text-gray-900 leading-relaxed whitespace-pre-wrap"
          style={{ wordBreak: 'break-word' }}
        >
          {displayContent}
          {isTruncated && !isExpanded && (
            <>
              <span>...</span>
              <button 
                onClick={() => setIsExpanded(true)}
                className="text-gray-600 font-medium ml-1 hover:underline"
              >
                see more
              </button>
            </>
          )}
          {isExpanded && isTruncated && (
            <button 
              onClick={() => setIsExpanded(false)}
              className="text-gray-600 font-medium ml-1 hover:underline block mt-2"
            >
              see less
            </button>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="border-t border-gray-200">
        <div className="flex items-center justify-between px-3 py-2">
          <div className="flex items-center gap-4">
            <button className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors">
              <Heart className="w-5 h-5" />
              <span className="text-sm">Like</span>
            </button>
            <button className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors">
              <MessageCircle className="w-5 h-5" />
              <span className="text-sm">Comment</span>
            </button>
            <button className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors">
              <Share className="w-5 h-5" />
              <span className="text-sm">Repost</span>
            </button>
            <button className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors">
              <Send className="w-5 h-5" />
              <span className="text-sm">Send</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LinkedInPostPreview;
