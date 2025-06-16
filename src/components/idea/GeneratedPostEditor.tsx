import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Copy, Save, Sparkles, MessageCircle, RotateCcw, ExternalLink, Calendar, Send } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';
import { TooltipProvider } from '@/components/ui/tooltip';
import EditorMetrics from './EditorMetrics';
import VersionHistory from '../VersionHistory';
import { CommentThread } from './CommentsPanel';
import PostPreviewModal from './PostPreviewModal';
import SchedulePostModal from './SchedulePostModal';
import PostNowModal from './PostNowModal';

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
  versionHistory,
  onRestoreVersion,
  onToggleCommentsPanel,
  comments,
  setComments
}) => {
  const [showEditingInstructions, setShowEditingInstructions] = useState(false);
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showPostNowModal, setShowPostNowModal] = useState(false);
  const [isCommentsActive, setIsCommentsActive] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { toast } = useToast();

  const [charCount, setCharCount] = useState(0);
  const [lineCount, setLineCount] = useState(1);
  const [showTruncation, setShowTruncation] = useState(false);
  const [cutoffLineTop, setCutoffLineTop] = useState(0);

  useEffect(() => {
    if (textareaRef.current) {
      const textarea = textareaRef.current;
      const text = textarea.value;
      setCharCount(text.length);

      // Calculate line count and truncation
      const lineHeight = 24; // Approximate line height in pixels
      const lines = text.split('\n');
      let totalLines = 0;
      
      // Calculate visual lines accounting for text wrapping
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      if (context) {
        context.font = '14px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
        const textareaWidth = textarea.clientWidth - 32; // Account for padding
        
        for (const line of lines) {
          if (line === '') {
            totalLines += 1;
          } else {
            const lineWidth = context.measureText(line).width;
            const wrappedLines = Math.ceil(lineWidth / textareaWidth) || 1;
            totalLines += wrappedLines;
          }
        }
      } else {
        totalLines = lines.length;
      }
      
      setLineCount(totalLines);
      setShowTruncation(totalLines > 3);
      setCutoffLineTop(lineHeight * 3 + 12); // 12px for top padding
    }
  }, [generatedPost]);

  const handleCommentsToggle = () => {
    setIsCommentsActive(!isCommentsActive);
    onToggleCommentsPanel();
  };

  const handleTextSelection = () => {
    if (!textareaRef.current) return;
    
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    
    if (start !== end) {
      const selectedText = textarea.value.substring(start, end);
      if (selectedText.trim()) {
        const newComment: CommentThread = {
          id: `comment-${Date.now()}`,
          selectionText: selectedText,
          replies: [{
            id: `reply-${Date.now()}`,
            author: 'You',
            text: `Comment on: "${selectedText}"`,
            createdAt: new Date()
          }],
          resolved: false
        };
        setComments(prev => [...prev, newComment]);
        toast({ title: "Comment added to selection" });
      }
    }
  };

  const handleCopy = () => {
    onCopyText();
    toast({ title: "Copied to clipboard" });
  };

  const handleSave = () => {
    onSave();
    toast({ title: "Changes saved" });
  };

  const handleSchedulePost = () => {
    setShowScheduleModal(true);
  };

  const handlePostNow = () => {
    setShowPostNowModal(true);
  };

  const handlePreview = () => {
    setShowPreviewModal(true);
  };

  const handleRegenerateWithInstructions = () => {
    onRegenerateWithInstructions();
    setShowEditingInstructions(false);
  };

  return (
    <TooltipProvider>
      <Card className="w-full">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Generated Post</CardTitle>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowVersionHistory(!showVersionHistory)}
              >
                <RotateCcw className="h-4 w-4 mr-1" />
                History
              </Button>
              <Button
                variant={isCommentsActive ? "default" : "outline"}
                size="sm"
                onClick={handleCommentsToggle}
                className={isCommentsActive ? "bg-blue-600 text-white hover:bg-blue-700" : "bg-gray-50 text-gray-600 hover:bg-gray-100"}
              >
                <MessageCircle className="h-4 w-4 mr-1" />
                Comments ({comments.filter(c => !c.resolved).length})
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="relative">
            <Textarea
              ref={textareaRef}
              value={generatedPost}
              onChange={(e) => onGeneratedPostChange(e.target.value)}
              onMouseUp={handleTextSelection}
              onKeyUp={handleTextSelection}
              placeholder="Your generated post will appear here..."
              className="min-h-[200px] resize-none pr-20 pb-8 text-sm leading-relaxed"
              style={{ lineHeight: '1.7' }}
            />
            
            <EditorMetrics
              charCount={charCount}
              lineCount={lineCount}
              showTruncation={showTruncation}
              cutoffLineTop={cutoffLineTop}
            />
          </div>

          {showVersionHistory && (
            <div className="border rounded-lg p-4 bg-gray-50">
              <VersionHistory
                versions={versionHistory}
                onRestore={onRestoreVersion}
              />
            </div>
          )}

          {showEditingInstructions && (
            <div className="space-y-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-blue-900">Editing Instructions</h4>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowEditingInstructions(false)}
                  className="text-blue-700 hover:text-blue-900"
                >
                  Cancel
                </Button>
              </div>
              <Textarea
                value={editingInstructions}
                onChange={(e) => onEditingInstructionsChange(e.target.value)}
                placeholder="Describe how you'd like to modify this post..."
                className="bg-white border-blue-200"
                rows={3}
              />
              <Button
                onClick={handleRegenerateWithInstructions}
                className="w-full bg-blue-600 hover:bg-blue-700"
                disabled={!editingInstructions.trim()}
              >
                <Sparkles className="h-4 w-4 mr-2" />
                Regenerate with Instructions
              </Button>
            </div>
          )}

          <Separator />

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={handleCopy}>
                <Copy className="h-4 w-4 mr-1" />
                Copy
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowEditingInstructions(!showEditingInstructions)}
              >
                <Sparkles className="h-4 w-4 mr-1" />
                Edit with AI
              </Button>
              <Button variant="outline" size="sm" onClick={handlePreview}>
                <ExternalLink className="h-4 w-4 mr-1" />
                Preview
              </Button>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleSave}
                disabled={!hasUnsavedChanges}
              >
                <Save className="h-4 w-4 mr-1" />
                Save
              </Button>
              <Button variant="outline" size="sm" onClick={handleSchedulePost}>
                <Calendar className="h-4 w-4 mr-1" />
                Schedule
              </Button>
              <Button size="sm" onClick={handlePostNow} className="bg-indigo-600 hover:bg-indigo-700">
                <Send className="h-4 w-4 mr-1" />
                Post Now
              </Button>
            </div>
          </div>
        </CardContent>

        <PostPreviewModal
          open={showPreviewModal}
          onOpenChange={setShowPreviewModal}
          postContent={generatedPost}
        />

        <SchedulePostModal
          open={showScheduleModal}
          onOpenChange={setShowScheduleModal}
          postContent={generatedPost}
          onSchedule={() => {
            toast({ title: "Post scheduled successfully" });
            setShowScheduleModal(false);
          }}
        />

        <PostNowModal
          open={showPostNowModal}
          onOpenChange={setShowPostNowModal}
          postContent={generatedPost}
          onPost={() => {
            toast({ title: "Post published successfully" });
            setShowPostNowModal(false);
          }}
        />
      </Card>
    </TooltipProvider>
  );
};

export default GeneratedPostEditor;
