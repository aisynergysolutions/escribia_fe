import React, { useState, useRef, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import FloatingToolbar from './FloatingToolbar';
import AIEditToolbar from './AIEditToolbar';
import PostPreviewModal from './PostPreviewModal';
import SchedulePostModal from './SchedulePostModal';
import PostNowModal from './PostNowModal';
import EditorToolbar from './EditorToolbar';
import EditorContainer from './EditorContainer';
import EditingInstructions from './EditingInstructions';
import CommentPopover from './CommentPopover';
import VersionHistoryModal from './VersionHistoryModal';
import PollPreview from './PollPreview';
import CreatePollModal from './CreatePollModal';
import { CommentThread } from './CommentsPanel';
import { PollData } from './CreatePollModal';
import { useUndoRedo } from '@/hooks/useUndoRedo';
import MediaPreview from './MediaPreview';
import MediaUploadModal, { MediaFile } from './MediaUploadModal';

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
  onToggleCommentsPanel: () => void;
  comments: CommentThread[];
  setComments: React.Dispatch<React.SetStateAction<CommentThread[]>>;
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
  onRestoreVersion,
  onToggleCommentsPanel,
  comments,
  setComments
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
  const [viewMode, setViewMode] = useState<'mobile' | 'desktop'>('desktop');
  const [showCommentsPanel, setShowCommentsPanel] = useState(false);
  const [showVersionHistoryModal, setShowVersionHistoryModal] = useState(false);
  const [pollData, setPollData] = useState<PollData | null>(null);
  const [hasMedia, setHasMedia] = useState(false);
  const [editingPoll, setEditingPoll] = useState<PollData | null>(null);
  const [showCreatePollModal, setShowCreatePollModal] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const lastSelection = useRef<Range | null>(null);

  // NEW state for comment popover
  const [commentPopover, setCommentPopover] = useState({ visible: false, top: 0, left: 0 });
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [editingMedia, setEditingMedia] = useState<MediaFile[] | null>(null);
  const [showMediaUploadModal, setShowMediaUploadModal] = useState(false);

  // Initialize undo/redo functionality
  const {
    versions,
    currentContent,
    canUndo,
    canRedo,
    undo,
    redo,
    restoreVersion,
    handleContentChange: handleUndoRedoContentChange
  } = useUndoRedo({
    initialContent: generatedPost,
    onContentChange: onGeneratedPostChange,
    pauseDelay: 1000 // Reduced from 3000 to 1000ms for more frequent undo/redo points
  });

  const calculateContentMetrics = (content: string) => {
    const textContent = content.replace(/<[^>]*>/g, ''); // Strip HTML for character count
    const charCount = textContent.length;
    
    // Calculate precise line positioning based on view mode
    const lineHeight = 21; // 14px * 1.5
    const paddingTop = 24; // Container's padding-top where text actually starts
    
    // Use different widths based on view mode
    const containerWidth = viewMode === 'mobile' ? 272 : 504; // Effective content width (excluding padding)
    
    // Create a temporary element to measure line count
    const tempDiv = document.createElement('div');
    tempDiv.style.cssText = `
      position: absolute;
      visibility: hidden;
      width: ${containerWidth}px;
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
    
    // Position the line exactly after the 3rd line of text
    // Account for padding-top and add exactly 3 line heights
    const threeLineHeight = lineHeight * 3;
    setCutoffLineTop(paddingTop + threeLineHeight);
    
    return { charCount, lineCount: lines };
  };

  const handleTextSelection = () => {
    const selection = window.getSelection();
    if (selection && selection.toString().length > 0 && editorRef.current?.contains(selection.anchorNode)) {
      const selectedText = selection.toString();
      setSelectedText(selectedText);
      const range = selection.getRangeAt(0);
      lastSelection.current = range.cloneRange();
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

  const handleCommentRequest = () => {
    if (lastSelection.current) {
      const rect = lastSelection.current.getBoundingClientRect();
      setCommentPopover({
        visible: true,
        top: rect.bottom + window.scrollY + 8,
        left: rect.left + rect.width / 2,
      });
      setToolbarVisible(false);
    }
  };

  const handleSaveComment = (commentText: string) => {
    if (!lastSelection.current || !editorRef.current) return;
    
    const selection = window.getSelection();
    if (!selection) return;

    selection.removeAllRanges();
    selection.addRange(lastSelection.current);

    const commentId = `comment-${Date.now()}`;
    const mark = document.createElement('mark');
    mark.dataset.commentId = commentId;
    
    try {
      lastSelection.current.surroundContents(mark);
    } catch(e) {
      console.error("Could not wrap selection", e);
      toast({ title: "Error", description: "Could not add comment to a selection that spans multiple paragraphs.", variant: "destructive" });
      setCommentPopover({ visible: false, top: 0, left: 0 });
      return;
    }
    
    const newThread: CommentThread = {
      id: commentId,
      selectionText: lastSelection.current.toString(),
      replies: [{ id: `reply-${Date.now()}`, author: 'You', text: commentText, createdAt: new Date() }],
      resolved: false,
    };
    setComments([...comments, newThread]);

    handleUndoRedoContentChange(editorRef.current.innerHTML);
    setCommentPopover({ visible: false, top: 0, left: 0 });
    lastSelection.current = null;
    selection.removeAllRanges();
    toast({ title: "Comment added." });
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
      handleUndoRedoContentChange(newContent);
      checkForChanges(newContent);
    }
  };

  const handleInput = () => {
    if (editorRef.current) {
      const newContent = editorRef.current.innerHTML;
      handleUndoRedoContentChange(newContent);
      checkForChanges(newContent);
      
      // Update metrics
      const metrics = calculateContentMetrics(newContent);
      setCharCount(metrics.charCount);
      setLineCount(metrics.lineCount);
      setShowTruncation(metrics.charCount > 200 || metrics.lineCount > 3);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    // Handle Ctrl+Z and Ctrl+Y
    if (event.ctrlKey || event.metaKey) {
      if (event.key === 'z' && !event.shiftKey) {
        event.preventDefault();
        undo();
        return;
      }
      if (event.key === 'y' || (event.key === 'z' && event.shiftKey)) {
        event.preventDefault();
        redo();
        return;
      }
      if (event.key === 'c') {
        event.preventDefault();
        handleCopyWithFormatting();
        return;
      }
      if (event.key === 's') {
        event.preventDefault();
        handleSave();
        return;
      }
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
      handleUndoRedoContentChange(newContent);
      checkForChanges(newContent);
    }
  };

  const checkForChanges = (currentContent: string) => {
    const hasChanges = currentContent !== originalPost;
    onUnsavedChangesChange(hasChanges);
  };

  const handleSave = () => {
    onSave();
    setOriginalPost(currentContent);
    onUnsavedChangesChange(false);
    toast({
      title: "Saved",
      description: "Your changes have been saved successfully."
    });
  };

  const handlePreview = () => {
    setShowPreviewModal(true);
  };

  const handleShowComments = () => {
    setShowCommentsPanel(prev => !prev);
    onToggleCommentsPanel();
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

  const handleViewModeToggle = () => {
    setViewMode(prev => prev === 'desktop' ? 'mobile' : 'desktop');
  };

  const handleRestoreVersion = (versionId: string) => {
    restoreVersion(versionId);
    toast({
      title: "Version Restored",
      description: "Version has been restored successfully."
    });
  };

  const handleAddPoll = (newPollData: PollData) => {
    setPollData(newPollData);
    setHasMedia(false); // Clear media when adding poll
    setEditingPoll(null); // Clear editing state
    toast({
      title: "Poll Added",
      description: "Poll has been added to your post."
    });
  };

  const handleEditPoll = () => {
    if (pollData) {
      setEditingPoll(pollData);
      setShowCreatePollModal(true);
    }
  };

  const handleRemovePoll = () => {
    setPollData(null);
    setEditingPoll(null);
    toast({
      title: "Poll Removed",
      description: "Poll has been removed from your post."
    });
  };

  const handleUploadMedia = (newMediaFiles: MediaFile[]) => {
    setMediaFiles(newMediaFiles);
    setPollData(null); // Clear poll when adding media
    setEditingMedia(null); // Clear editing state
    toast({
      title: "Media Added",
      description: `${newMediaFiles.length} image${newMediaFiles.length > 1 ? 's' : ''} added to your post.`
    });
  };

  const handleEditMedia = () => {
    if (mediaFiles.length > 0) {
      setEditingMedia(mediaFiles);
      setShowMediaUploadModal(true);
    }
  };

  const handleRemoveMedia = () => {
    // Cleanup URLs
    mediaFiles.forEach(file => {
      URL.revokeObjectURL(file.url);
    });
    setMediaFiles([]);
    setEditingMedia(null);
    toast({
      title: "Media Removed",
      description: "Media has been removed from your post."
    });
  };

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== currentContent) {
      editorRef.current.innerHTML = currentContent;
      // Update metrics when content changes
      const metrics = calculateContentMetrics(currentContent);
      setCharCount(metrics.charCount);
      setLineCount(metrics.lineCount);
      setShowTruncation(metrics.charCount > 200 || metrics.lineCount > 3);
    }
  }, [currentContent, viewMode]);

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

  useEffect(() => {
    setHasMedia(mediaFiles.length > 0);
  }, [mediaFiles]);

  return (
    <div className="space-y-6">
      <FloatingToolbar position={toolbarPosition} onFormat={handleFormat} onAIEdit={handleAIEdit} visible={toolbarVisible} onComment={handleCommentRequest} />
      
      <AIEditToolbar position={toolbarPosition} visible={aiEditToolbarVisible} selectedText={selectedText} onClose={handleAIEditClose} onApplyEdit={handleAIEditApply} />
      
      <CommentPopover
        visible={commentPopover.visible}
        position={commentPopover}
        onSave={handleSaveComment}
        onCancel={() => {
          setCommentPopover({ visible: false, top: 0, left: 0 });
          lastSelection.current = null;
        }}
      />
      
      <PostPreviewModal 
        open={showPreviewModal} 
        onOpenChange={setShowPreviewModal} 
        postContent={currentContent}
        pollData={pollData}
        mediaFiles={mediaFiles}
      />
      
      <SchedulePostModal 
        open={showScheduleModal} 
        onOpenChange={setShowScheduleModal} 
        postContent={currentContent}
        onSchedule={handleSchedule}
      />
      
      <PostNowModal 
        open={showPostNowModal} 
        onOpenChange={setShowPostNowModal} 
        postContent={currentContent}
        onPost={handlePostNow}
      />

      <VersionHistoryModal
        open={showVersionHistoryModal}
        onOpenChange={setShowVersionHistoryModal}
        versions={versions}
        onRestore={handleRestoreVersion}
      />
      
      <CreatePollModal
        open={showCreatePollModal}
        onOpenChange={(open) => {
          setShowCreatePollModal(open);
          if (!open) {
            setEditingPoll(null);
          }
        }}
        onCreatePoll={handleAddPoll}
        editingPoll={editingPoll}
      />
      
      <MediaUploadModal
        open={showMediaUploadModal}
        onOpenChange={(open) => {
          setShowMediaUploadModal(open);
          if (!open) {
            setEditingMedia(null);
          }
        }}
        onUploadMedia={handleUploadMedia}
        editingMedia={editingMedia || undefined}
      />
      
      <div className="bg-white rounded-lg border">
        <EditorToolbar
          onFormat={handleFormat}
          onInsertEmoji={insertEmoji}
          onPreview={handlePreview}
          onShowComments={handleShowComments}
          onCopy={handleCopyWithFormatting}
          onSchedule={() => setShowScheduleModal(true)}
          onPostNow={() => setShowPostNowModal(true)}
          onUndo={undo}
          onRedo={redo}
          onShowVersionHistory={() => setShowVersionHistoryModal(true)}
          canUndo={canUndo}
          canRedo={canRedo}
          viewMode={viewMode}
          onViewModeToggle={handleViewModeToggle}
          showCommentsPanel={showCommentsPanel}
          postContent={currentContent}
          onAddPoll={handleAddPoll}
          hasPoll={!!pollData}
          hasMedia={hasMedia}
          onAddMedia={() => setShowMediaUploadModal(true)}
        />
        
        <div className="p-4 bg-gray-50">
          <EditorContainer
            editorRef={editorRef}
            generatedPost={currentContent}
            onInput={handleInput}
            onMouseUp={handleTextSelection}
            onKeyUp={handleTextSelection}
            onKeyDown={handleKeyDown}
            charCount={charCount}
            lineCount={lineCount}
            showTruncation={showTruncation}
            cutoffLineTop={cutoffLineTop}
            viewMode={viewMode}
          />
          
          {mediaFiles.length > 0 && (
            <MediaPreview 
              mediaFiles={mediaFiles}
              onRemove={handleRemoveMedia}
              onEdit={handleEditMedia}
              viewMode={viewMode}
            />
          )}
          
          {pollData && (
            <PollPreview 
              pollData={pollData} 
              onRemove={handleRemovePoll} 
              onEdit={handleEditPoll}
              viewMode={viewMode}
            />
          )}
        </div>

        <EditingInstructions
          showChatBox={showChatBox}
          onToggleChatBox={() => setShowChatBox(!showChatBox)}
          editingInstructions={editingInstructions}
          onEditingInstructionsChange={onEditingInstructionsChange}
          onRegeneratePost={handleRegeneratePost}
          onRegenerateWithInstructions={onRegenerateWithInstructions}
        />
      </div>
      
      <style>
        {`
          mark[data-comment-id] {
            background-color: rgba(186, 230, 253, 0.7);
            cursor: pointer;
            transition: background-color 0.2s;
          }
          mark[data-comment-id]:hover {
            background-color: rgba(147, 216, 253, 0.9);
          }
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
