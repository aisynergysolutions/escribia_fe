import React, { useState, useRef, useEffect } from 'react';
import { Copy, Bold, Italic, Underline, Smile, Save, Calendar, Send, Eye, MessageSquare, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import VersionHistory from '../VersionHistory';
import FloatingToolbar from './FloatingToolbar';
import AIEditToolbar from './AIEditToolbar';
import PostPreviewModal from './PostPreviewModal';
import SchedulePostModal from './SchedulePostModal';
import PostNowModal from './PostNowModal';

interface GeneratedPostEditorProps {
  generatedPost: string;
  onGeneratedPostChange: (value: string) => void;
  editingInstructions: string;
  onEditingInstructionsChange: (value: string) => void;
  onCopyText: () => void;
  onRegenerateWithInstructions: () => void;
  onSave: () => void;
  hasUnsavedChanges: boolean;
  onUnsavedChangesChange: (hasChanges: boolean) => void;
  versionHistory: Array<{
    id: string;
    version: number;
    text: string;
    createdAt: Date;
    generatedByAI: boolean;
    notes: string;
  }>;
  onRestoreVersion: (text: string) => void;
}

const GeneratedPostEditor: React.FC<GeneratedPostEditorProps> = ({
  generatedPost,
  onGeneratedPostChange,
  editingInstructions,
  onEditingInstructionsChange,
  onCopyText,
  onRegenerateWithInstructions,
  onSave,
  hasUnsavedChanges,
  onUnsavedChangesChange,
  versionHistory,
  onRestoreVersion
}) => {
  const [toolbarPosition, setToolbarPosition] = useState({
    top: 0,
    left: 0
  });
  const [toolbarVisible, setToolbarVisible] = useState(false);
  const [aiEditToolbarVisible, setAiEditToolbarVisible] = useState(false);
  const [originalPost, setOriginalPost] = useState(generatedPost);
  const [selectedText, setSelectedText] = useState('');
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showChatBox, setShowChatBox] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showPostNowModal, setShowPostNowModal] = useState(false);
  const [charCount, setCharCount] = useState(0);
  const [lineCount, setLineCount] = useState(1);
  const [showTruncation, setShowTruncation] = useState(false);
  const [cutoffLineTop, setCutoffLineTop] = useState(0);
  const editorRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const emojis = ['😀', '😊', '😍', '🤔', '👍', '👎', '❤️', '🔥', '💡', '🎉', '🚀', '💯', '✨', '🌟', '📈', '💼', '🎯', '💪', '🙌', '👏'];

  // Updated utility function to calculate content metrics with precise cutoff positioning
  const calculateContentMetrics = (content: string) => {
    const textContent = content.replace(/<[^>]*>/g, ''); // Strip HTML for character count
    const charCount = textContent.length;
    
    // Calculate precise line positioning
    const lineHeight = 21; // 14px * 1.5
    const fontSize = 14;
    const threeLineHeight = lineHeight * 3;
    
    // Create a temporary element to measure line count
    const tempDiv = document.createElement('div');
    tempDiv.style.cssText = `
      position: absolute;
      visibility: hidden;
      width: 552px;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen-Sans, Ubuntu, Cantarell, "Helvetica Neue", sans-serif;
      font-size: 14px;
      line-height: 1.5;
      padding: 0;
      margin: 0;
      white-space: pre-wrap;
      word-wrap: break-word;
    `;
    tempDiv.innerHTML = content || 'A';
    document.body.appendChild(tempDiv);
    
    const height = tempDiv.offsetHeight;
    const lines = Math.max(1, Math.ceil(height / lineHeight));
    
    document.body.removeChild(tempDiv);
    
    // Position line below the 3rd line with proper spacing
    const paddingTop = 24; // Container's padding-top
    const separationGap = 8; // Space between 3rd line and the divider
    setCutoffLineTop(paddingTop + threeLineHeight + separationGap);
    
    return { charCount, lineCount: lines };
  };

  const handleTextSelection = () => {
    const selection = window.getSelection();
    if (selection && selection.toString().length > 0) {
      const selectedText = selection.toString();
      setSelectedText(selectedText);
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      setToolbarPosition({
        top: rect.top + window.scrollY,
        left: rect.left + rect.width / 2
      });
      setToolbarVisible(true);
      setAiEditToolbarVisible(false);
    } else {
      setToolbarVisible(false);
      setAiEditToolbarVisible(false);
      setSelectedText('');
    }
  };
  const handleAIEdit = () => {
    if (selectedText) {
      setToolbarVisible(false);
      setTimeout(() => {
        setAiEditToolbarVisible(true);
      }, 50);
    }
  };
  const handleAIEditApply = (instruction: string) => {
    if (selectedText) {
      toast({
        title: "AI Edit Applied",
        description: `Instruction: "${instruction}" applied to selected text.`
      });
      setAiEditToolbarVisible(false);
    }
  };
  const handleAIEditClose = () => {
    setAiEditToolbarVisible(false);
    if (selectedText) {
      setToolbarVisible(true);
    }
  };
  const handleFormat = (format: string) => {
    const selection = window.getSelection();
    if (!selection || !editorRef.current) return;
    if (format === 'insertUnorderedList') {
      const range = selection.rangeCount > 0 ? selection.getRangeAt(0) : null;
      let listElement = null;
      if (range) {
        let node = range.startContainer;
        while (node && node !== editorRef.current) {
          if (node.nodeType === Node.ELEMENT_NODE && (node as Element).tagName === 'UL') {
            listElement = node as Element;
            break;
          }
          node = node.parentNode;
        }
      }
      if (listElement) {
        document.execCommand('insertUnorderedList', false);
      } else {
        document.execCommand('insertUnorderedList', false);
      }
    } else {
      document.execCommand(format, false);
    }
    if (editorRef.current) {
      const newContent = editorRef.current.innerHTML;
      onGeneratedPostChange(newContent);
      checkForChanges(newContent);
    }
  };
  const handleInput = () => {
    if (editorRef.current) {
      const newContent = editorRef.current.innerHTML;
      onGeneratedPostChange(newContent);
      checkForChanges(newContent);
      
      // Update metrics
      const metrics = calculateContentMetrics(newContent);
      setCharCount(metrics.charCount);
      setLineCount(metrics.lineCount);
      setShowTruncation(metrics.charCount > 200 || metrics.lineCount > 3);
    }
  };
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.ctrlKey && event.key === 'c') {
      event.preventDefault();
      handleCopyWithFormatting();
    }
    if (event.ctrlKey && event.key === 's') {
      event.preventDefault();
      handleSave();
    }
  };
  const handleCopyWithFormatting = async () => {
    if (editorRef.current) {
      try {
        const selection = window.getSelection();
        let htmlContent = '';
        let textContent = '';
        if (selection && selection.toString().length > 0) {
          const range = selection.getRangeAt(0);
          const fragment = range.cloneContents();
          const tempDiv = document.createElement('div');
          tempDiv.appendChild(fragment);
          htmlContent = tempDiv.innerHTML;
          textContent = selection.toString();
        } else {
          htmlContent = editorRef.current.innerHTML;
          textContent = editorRef.current.innerText || editorRef.current.textContent || '';
        }
        if (navigator.clipboard && window.ClipboardItem) {
          const clipboardItem = new ClipboardItem({
            'text/html': new Blob([htmlContent], {
              type: 'text/html'
            }),
            'text/plain': new Blob([textContent], {
              type: 'text/plain'
            })
          });
          await navigator.clipboard.write([clipboardItem]);
        } else {
          await navigator.clipboard.writeText(textContent);
        }
      } catch (err) {
        console.error('Failed to copy with formatting, falling back to plain text:', err);
        const selection = window.getSelection();
        const textContent = selection && selection.toString().length > 0 ? selection.toString() : editorRef.current.innerText || editorRef.current.textContent || '';
        await navigator.clipboard.writeText(textContent);
      }
    }
  };
  const insertEmoji = (emoji: string) => {
    if (editorRef.current) {
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        range.deleteContents();
        const textNode = document.createTextNode(emoji);
        range.insertNode(textNode);
        range.setStartAfter(textNode);
        range.setEndAfter(textNode);
        selection.removeAllRanges();
        selection.addRange(range);
      } else {
        editorRef.current.appendChild(document.createTextNode(emoji));
      }
      const newContent = editorRef.current.innerHTML;
      onGeneratedPostChange(newContent);
      checkForChanges(newContent);
    }
  };
  const checkForChanges = (currentContent: string) => {
    const hasChanges = currentContent !== originalPost;
    onUnsavedChangesChange(hasChanges);
  };
  const handleSave = () => {
    onSave();
    setOriginalPost(generatedPost);
    onUnsavedChangesChange(false);
    toast({
      title: "Saved",
      description: "Your changes have been saved successfully."
    });
  };
  const handlePost = () => {
    toast({
      title: "Post Published",
      description: "Your post has been successfully published to LinkedIn."
    });
  };
  const handlePreview = () => {
    setShowPreviewModal(true);
  };
  const handleRegeneratePost = () => {
    toast({
      title: "Regenerating Post",
      description: "AI is generating a new version of your post..."
    });
    onRegenerateWithInstructions();
  };
  const handleSchedule = (date: Date, time: string) => {
    toast({
      title: "Post Scheduled",
      description: `Your post has been scheduled for ${date.toLocaleDateString()} at ${time}.`
    });
  };

  const handlePostNow = () => {
    toast({
      title: "Post Published",
      description: "Your post has been successfully published to LinkedIn."
    });
  };

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== generatedPost) {
      editorRef.current.innerHTML = generatedPost;
      // Update metrics when content changes
      const metrics = calculateContentMetrics(generatedPost);
      setCharCount(metrics.charCount);
      setLineCount(metrics.lineCount);
      setShowTruncation(metrics.charCount > 200 || metrics.lineCount > 3);
    }
  }, [generatedPost]);
  useEffect(() => {
    setOriginalPost(generatedPost);
  }, []);
  useEffect(() => {
    const handleClickOutside = () => {
      const selection = window.getSelection();
      if (!selection || selection.toString().length === 0) {
        setToolbarVisible(false);
        setAiEditToolbarVisible(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);
  return (
    <div className="space-y-6">
      <FloatingToolbar position={toolbarPosition} onFormat={handleFormat} onAIEdit={handleAIEdit} visible={toolbarVisible} />
      
      <AIEditToolbar position={toolbarPosition} visible={aiEditToolbarVisible} selectedText={selectedText} onClose={handleAIEditClose} onApplyEdit={handleAIEditApply} />
      
      <PostPreviewModal open={showPreviewModal} onOpenChange={setShowPreviewModal} postContent={generatedPost} />
      
      <SchedulePostModal 
        open={showScheduleModal} 
        onOpenChange={setShowScheduleModal} 
        postContent={generatedPost}
        onSchedule={handleSchedule}
      />
      
      <PostNowModal 
        open={showPostNowModal} 
        onOpenChange={setShowPostNowModal} 
        postContent={generatedPost}
        onPost={handlePostNow}
      />
      
      <div className="bg-white rounded-lg border">
        <div className="flex justify-between items-center p-4 border-b">
          {/* Text Editor Toolbar */}
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" onClick={() => handleFormat('bold')} className="h-8 w-8 p-0">
              <Bold className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => handleFormat('italic')} className="h-8 w-8 p-0">
              <Italic className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => handleFormat('underline')} className="h-8 w-8 p-0">
              <Underline className="h-4 w-4" />
            </Button>
            <div className="w-px h-6 bg-gray-300 mx-1" />
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <Smile className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-64 p-2">
                <div className="grid grid-cols-5 gap-1">
                  {emojis.map((emoji, index) => (
                    <button key={index} onClick={() => insertEmoji(emoji)} className="p-2 hover:bg-gray-100 rounded text-lg">
                      {emoji}
                    </button>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          </div>
          
          <TooltipProvider>
            <div className="flex gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <div>
                    <VersionHistory versions={versionHistory} onRestore={onRestoreVersion} />
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Version History</p>
                </TooltipContent>
              </Tooltip>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="sm" onClick={handlePreview} className="h-8 w-8 p-0">
                    <Eye className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Preview</p>
                </TooltipContent>
              </Tooltip>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="sm" onClick={handleSave} disabled={!hasUnsavedChanges} className={`h-8 w-8 p-0 ${hasUnsavedChanges ? 'bg-blue-50 border-blue-300' : ''}`}>
                    <Save className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Save</p>
                </TooltipContent>
              </Tooltip>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="sm" onClick={handleCopyWithFormatting} className="h-8 w-8 p-0">
                    <Copy className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Copy</p>
                </TooltipContent>
              </Tooltip>
              
              {/* Fused Schedule and Post Buttons */}
              <div className="flex rounded-md overflow-hidden border border-gray-300">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setShowScheduleModal(true)} 
                      className={`h-8 border-0 border-r border-gray-300 rounded-none bg-white hover:bg-gray-50 flex items-center ${isMobile ? 'w-8 px-0' : 'px-3 gap-1.5'}`}
                    >
                      <Calendar className="h-4 w-4" />
                      {!isMobile && <span className="text-xs">Schedule</span>}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Schedule Post</p>
                  </TooltipContent>
                </Tooltip>
                
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      size="sm" 
                      onClick={() => setShowPostNowModal(true)} 
                      className={`h-8 bg-indigo-600 hover:bg-indigo-700 text-white rounded-none flex items-center ${isMobile ? 'w-8 px-0' : 'px-3 gap-1.5'}`}
                    >
                      <Send className="h-4 w-4" />
                      {!isMobile && <span className="text-xs">Post Now</span>}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Post Now</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>
          </TooltipProvider>
        </div>
        
        {/* LinkedIn-style editor container */}
        <div className="p-4 bg-gray-50">
          <div 
            className="linkedin-safe mx-auto bg-white focus-within:outline focus-within:outline-1 focus-within:outline-indigo-600/25 rounded-lg transition-all duration-200 max-w-full sm:max-w-[552px]"
          >
            <div className="relative" style={{ paddingTop: '24px', paddingLeft: '24px', paddingRight: '24px', paddingBottom: '45px' }}>
              <div 
                ref={editorRef} 
                contentEditable 
                onInput={handleInput} 
                onMouseUp={handleTextSelection} 
                onKeyUp={handleTextSelection} 
                onKeyDown={handleKeyDown} 
                className="min-h-[200px] w-full border-0 focus:outline-none resize-none linkedin-typography" 
                style={{
                  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen-Sans, Ubuntu, Cantarell, "Helvetica Neue", sans-serif',
                  fontSize: '14px',
                  lineHeight: '1.5',
                  color: '#000000',
                  whiteSpace: 'pre-wrap',
                  wordWrap: 'break-word'
                }}
                suppressContentEditableWarning={true} 
              />
              
              {!generatedPost && (
                <div className="text-gray-400 pointer-events-none absolute top-6 left-6">
                  AI generated content will appear here...
                </div>
              )}
              
              {/* Truncation line - only the line, no text */}
              {showTruncation && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div 
                      className="absolute left-6 right-6 border-t border-gray-300 cursor-help"
                      style={{ 
                        top: `${cutoffLineTop}px`,
                        marginTop: '8px',
                        marginBottom: '8px'
                      }}
                    />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>LinkedIn shows only the first 3 lines in feeds. Content below this line may be truncated.</p>
                  </TooltipContent>
                </Tooltip>
              )}
              
              {/* Character and line counter - stays grey */}
              <div className="absolute bottom-2 right-2">
                <span className="text-xs text-gray-500">
                  {charCount} chars • {lineCount} {lineCount === 1 ? 'line' : 'lines'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Chat-like Editing Instructions Section */}
        <div className="border-t bg-gray-50">
          <div className="flex items-center justify-between p-3 border-b border-gray-200">
            <Button variant="ghost" size="sm" onClick={() => setShowChatBox(!showChatBox)} className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800">
              <MessageSquare className="h-4 w-4" />
              {showChatBox ? 'Hide' : 'Show'} editing instructions
            </Button>
            
            <Button variant="ghost" size="sm" onClick={handleRegeneratePost} className="flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50">
              <Sparkles className="h-4 w-4" />
              Regenerate with AI
            </Button>
          </div>
          
          {showChatBox && (
            <div className="p-4 space-y-3">
              <div className="flex gap-3">
                <textarea 
                  value={editingInstructions} 
                  onChange={e => onEditingInstructionsChange(e.target.value)} 
                  className="flex-1 min-h-[80px] border rounded-lg p-3 focus:outline-none focus:ring-2 focus-ring-indigo-500 resize-none bg-white" 
                  placeholder="Provide feedback or instructions for the AI to improve the generated content..." 
                />
              </div>
              <div className="flex justify-end">
                <Button onClick={onRegenerateWithInstructions} size="sm" className="bg-indigo-600 hover:bg-indigo-700" disabled={!editingInstructions.trim()}>
                  Send Instructions
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <style>
        {`
          @media (max-width: 600px) {
            .linkedin-safe {
              max-width: 100% !important;
            }
          }
        `}
      </style>
    </div>
  );
};

export default GeneratedPostEditor;
