import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import EditorToolbar from './EditorToolbar';
import EditorContainer from './EditorContainer';
import EditingInstructions from './EditingInstructions';
import VersionHistoryModal from './VersionHistoryModal';
import MediaDropZone from './MediaDropZone';
import MediaPreview from './MediaPreview';
import MediaUploadModal, { MediaFile } from './MediaUploadModal';
import { CommentThread } from './CommentsPanel';
import { PollData } from './CreatePollModal';
import PollPreview from './PollPreview';

interface GeneratedPostEditorProps {
  generatedPost: string;
  onGeneratedPostChange: (text: string) => void;
  editingInstructions: string;
  onEditingInstructionsChange: (text: string) => void;
  onCopyText: () => void;
  onRegenerateWithInstructions: () => void;
  onSave: () => void;
  hasUnsavedChanges: boolean;
  onUnsavedChangesChange: (hasChanges: boolean) => void;
  versionHistory: any[];
  onRestoreVersion: (text: string) => void;
  onToggleCommentsPanel: () => void;
  comments: CommentThread[];
  setComments: React.Dispatch<React.SetStateAction<CommentThread[]>>;
  onPollStateChange?: (hasPoll: boolean) => void;
  mediaFiles?: MediaFile[];
  onMediaUpload?: (files: MediaFile[]) => void;
  onMediaRemove?: () => void;
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
  setComments,
  onPollStateChange,
  mediaFiles = [],
  onMediaUpload = () => {},
  onMediaRemove = () => {}
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  
  const [viewMode, setViewMode] = useState<'mobile' | 'desktop'>('desktop');
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  const [showCommentsPanel, setShowCommentsPanel] = useState(false);
  const [showEditingInstructions, setShowEditingInstructions] = useState(false);
  const [charCount, setCharCount] = useState(0);
  const [lineCount, setLineCount] = useState(0);
  const [showTruncation, setShowTruncation] = useState(false);
  const [cutoffLineTop, setCutoffLineTop] = useState(0);
  const [pollData, setPollData] = useState<PollData | null>(null);
  const [showMediaUploadModal, setShowMediaUploadModal] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.innerHTML = generatedPost;
      updateMetrics();
    }
  }, [generatedPost]);

  const updateMetrics = useCallback(() => {
    if (editorRef.current) {
      const text = editorRef.current.textContent || '';
      setCharCount(text.length);
      
      const lines = editorRef.current.querySelectorAll('div, br');
      setLineCount(Math.max(1, lines.length));
      
      const containerHeight = editorRef.current.offsetHeight;
      const lineHeight = 21;
      const maxLines = Math.floor(containerHeight / lineHeight);
      
      if (lines.length > maxLines) {
        setShowTruncation(true);
        setCutoffLineTop(maxLines * lineHeight);
      } else {
        setShowTruncation(false);
      }
    }
  }, []);

  const handleInput = useCallback(() => {
    if (editorRef.current) {
      const newText = editorRef.current.innerHTML;
      onGeneratedPostChange(newText);
      updateMetrics();
    }
  }, [onGeneratedPostChange, updateMetrics]);

  const handleMouseUp = useCallback(() => {
    updateMetrics();
  }, [updateMetrics]);

  const handleKeyUp = useCallback(() => {
    updateMetrics();
  }, [updateMetrics]);

  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      document.execCommand('insertHTML', false, '<br><br>');
    }
  }, []);

  const handleFormat = (format: string) => {
    document.execCommand(format, false);
  };

  const handleInsertEmoji = (emoji: string) => {
    document.execCommand('insertText', false, emoji);
  };

  const handlePreview = () => {
    console.log('Preview clicked');
  };

  const handleShowComments = () => {
    setShowCommentsPanel(!showCommentsPanel);
    onToggleCommentsPanel();
  };

  const handleUndo = () => {
    document.execCommand('undo');
  };

  const handleRedo = () => {
    document.execCommand('redo');
  };

  const handleViewModeToggle = () => {
    setViewMode(viewMode === 'desktop' ? 'mobile' : 'desktop');
  };

  const handleSchedule = () => {
    console.log('Schedule clicked');
  };

  const handlePostNow = () => {
    console.log('Post now clicked');
  };

  const handleShowVersionHistory = () => {
    setShowVersionHistory(true);
  };

  const handleAddPoll = (newPollData: PollData) => {
    setPollData(newPollData);
    if (onPollStateChange) {
      onPollStateChange(true);
    }
  };

  const handleRemovePoll = () => {
    setPollData(null);
    if (onPollStateChange) {
      onPollStateChange(false);
    }
  };

  const handleEditPoll = () => {
    // Open the poll creation modal with existing data for editing
    console.log('Edit poll clicked');
  };

  const handleAddMedia = () => {
    setShowMediaUploadModal(true);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const newFiles = Array.from(files).slice(0, 14 - uploadedFiles.length);
      
      newFiles.forEach(file => {
        if (!file.type.startsWith('image/')) {
          toast({
            title: "Invalid file type",
            description: "Only image files are allowed.",
            variant: "destructive"
          });
          return;
        }

        const url = URL.createObjectURL(file);
        const img = new Image();
        img.onload = () => {
          const isVertical = img.height > img.width;
          const mediaFile: MediaFile = {
            id: `media-${Date.now()}-${Math.random()}`,
            file,
            url,
            isVertical
          };
          
          onMediaUpload([...mediaFiles, mediaFile]);
        };
        img.src = url;
      });
    }
  };

  const handleFileDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const files = event.dataTransfer.files;
    if (files) {
      const newFiles = Array.from(files).slice(0, 14 - uploadedFiles.length);
      
      newFiles.forEach(file => {
        if (!file.type.startsWith('image/')) {
          toast({
            title: "Invalid file type",
            description: "Only image files are allowed.",
            variant: "destructive"
          });
          return;
        }

        const url = URL.createObjectURL(file);
        const img = new Image();
        img.onload = () => {
          const isVertical = img.height > img.width;
          const mediaFile: MediaFile = {
            id: `media-${Date.now()}-${Math.random()}`,
            file,
            url,
            isVertical
          };
          
          onMediaUpload([...mediaFiles, mediaFile]);
        };
        img.src = url;
      });
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleEditMedia = () => {
    setShowMediaUploadModal(true);
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-0">
        <CardTitle className="text-lg font-semibold">Generated Post</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <EditorToolbar
          onFormat={handleFormat}
          onInsertEmoji={handleInsertEmoji}
          onPreview={handlePreview}
          onShowComments={handleShowComments}
          onCopy={onCopyText}
          onSchedule={handleSchedule}
          onPostNow={handlePostNow}
          onUndo={handleUndo}
          onRedo={handleRedo}
          onShowVersionHistory={handleShowVersionHistory}
          canUndo={true}
          canRedo={true}
          viewMode={viewMode}
          onViewModeToggle={handleViewModeToggle}
          showCommentsPanel={showCommentsPanel}
          activeFormats={[]}
          postContent={generatedPost}
          onAddPoll={handleAddPoll}
          hasPoll={!!pollData}
          hasMedia={mediaFiles.length > 0}
          onAddMedia={handleAddMedia}
        />
        
        <EditorContainer
          editorRef={editorRef}
          generatedPost={generatedPost}
          onInput={handleInput}
          onMouseUp={handleMouseUp}
          onKeyUp={handleKeyUp}
          onKeyDown={handleKeyDown}
          charCount={charCount}
          lineCount={lineCount}
          showTruncation={showTruncation}
          cutoffLineTop={cutoffLineTop}
          viewMode={viewMode}
        />

        {/* Media Preview or Drop Zone - positioned inline below the editor */}
        {mediaFiles.length > 0 ? (
          <MediaPreview
            mediaFiles={mediaFiles}
            onRemove={onMediaRemove}
            onEdit={handleEditMedia}
            viewMode={viewMode}
          />
        ) : !pollData && (
          <div className="px-4 pb-4">
            <MediaDropZone
              uploadedFiles={uploadedFiles}
              onFileUpload={handleFileUpload}
              onFileDrop={handleFileDrop}
              onDragOver={handleDragOver}
              onRemoveFile={removeFile}
            />
          </div>
        )}

        {/* Poll Preview */}
        {pollData && (
          <PollPreview
            pollData={pollData}
            onRemove={handleRemovePoll}
            onEdit={handleEditPoll}
            viewMode={viewMode}
          />
        )}

        <Separator />
        
        {/* Editing Instructions */}
        <EditingInstructions
          showChatBox={showEditingInstructions}
          onToggleChatBox={() => setShowEditingInstructions(!showEditingInstructions)}
          editingInstructions={editingInstructions}
          onEditingInstructionsChange={onEditingInstructionsChange}
          onRegeneratePost={onRegenerateWithInstructions}
          onRegenerateWithInstructions={onRegenerateWithInstructions}
        />
      </CardContent>

      {/* Modals */}
      <VersionHistoryModal
        open={showVersionHistory}
        onOpenChange={setShowVersionHistory}
        versions={versionHistory}
        onRestore={onRestoreVersion}
      />

      <MediaUploadModal
        open={showMediaUploadModal}
        onOpenChange={setShowMediaUploadModal}
        onUploadMedia={onMediaUpload}
        editingMedia={mediaFiles}
      />
    </Card>
  );
};

export default GeneratedPostEditor;
