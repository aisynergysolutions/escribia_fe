import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { CloudUpload, X, Edit2 } from 'lucide-react';
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
import EditorMetrics from './EditorMetrics';

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
        
        {/* Single unified editor container with consistent background */}
        <div className="p-4 bg-gray-50">
          <div 
            className={`linkedin-safe mx-auto bg-white focus-within:outline focus-within:outline-1 focus-within:outline-indigo-600/25 rounded-lg transition-all duration-300 ${
              viewMode === 'mobile' ? 'max-w-[320px]' : 'max-w-[552px]'
            }`}
          >
            {/* Text Editor */}
            <div className="relative" style={{ paddingTop: '24px', paddingLeft: '24px', paddingRight: '24px', paddingBottom: mediaFiles.length > 0 || pollData ? '24px' : '45px' }}>
              <div 
                ref={editorRef} 
                contentEditable 
                onInput={handleInput} 
                onMouseUp={handleMouseUp} 
                onKeyUp={handleKeyUp} 
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
              
              <EditorMetrics 
                charCount={charCount}
                lineCount={lineCount}
                showTruncation={showTruncation}
                cutoffLineTop={cutoffLineTop}
              />
            </div>

            {/* Media Preview or Drop Zone - positioned inline within the same container */}
            {mediaFiles.length > 0 ? (
              <div className="px-6 pb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">
                    {mediaFiles.length} image{mediaFiles.length > 1 ? 's' : ''}
                  </span>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleEditMedia}
                      className="h-6 w-6 p-0"
                    >
                      <Edit2 className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={onMediaRemove}
                      className="h-6 w-6 p-0"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </div>

                {/* Media Grid */}
                <div className="border rounded-lg overflow-hidden bg-gray-50">
                  {/* Determine layout based on first image orientation */}
                  {mediaFiles.length > 0 && (
                    <>
                      {mediaFiles.length > 0 ? (
                        <MediaPreview
                          mediaFiles={mediaFiles}
                          onRemove={onMediaRemove}
                          onEdit={handleEditMedia}
                          viewMode={viewMode}
                        />
                      ) : null}
                    </>
                  )}
                </div>
              </div>
            ) : !pollData && (
              <div 
                className="mx-6 mb-6 p-4 bg-transparent border-2 border-dashed border-gray-300 rounded-md text-center cursor-pointer transition-colors hover:border-gray-400 hover:bg-gray-50/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                onDrop={handleFileDrop}
                onDragOver={handleDragOver}
                onClick={() => document.getElementById('file-upload-inline')?.click()}
                onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && document.getElementById('file-upload-inline')?.click()}
                tabIndex={0}
                role="button"
                aria-label="Upload media"
              >
                <div className="flex flex-col items-center justify-center py-2">
                  <CloudUpload className="h-6 w-6 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">Add media to your post</p>
                </div>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="file-upload-inline"
                />
              </div>
            )}

            {/* Poll Preview */}
            {pollData && (
              <div className="px-6 pb-6">
                <PollPreview
                  pollData={pollData}
                  onRemove={handleRemovePoll}
                  onEdit={handleEditPoll}
                  viewMode={viewMode}
                />
              </div>
            )}
          </div>
        </div>

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
