import React, { useImperativeHandle, forwardRef } from 'react';
import GeneratedPostEditor from './GeneratedPostEditor';
import { CommentThread } from './CommentsPanel';

export interface PostEditorRef {
  updateContent: (content: string) => void;
}

interface PostEditorProps {
  postData: {
    generatedPost: string;
    editingInstructions: string;
    hasUnsavedChanges: boolean;
  };
  postHandlers: {
    onGeneratedPostChange: (text: string) => void;
    onEditingInstructionsChange: (text: string) => void;
    onCopyText: () => void;
    onRegenerateWithInstructions: () => void;
    onSave: () => void;
    onUnsavedChangesChange: (hasChanges: boolean) => void;
  };
  versionHistory: any[];
  onRestoreVersion: (text: string) => void;
  // New Props
  onToggleCommentsPanel: () => void;
  comments: CommentThread[];
  setComments: React.Dispatch<React.SetStateAction<CommentThread[]>>;
  onPollStateChange?: (hasPoll: boolean) => void;
  isRegeneratingWithInstructions?: boolean;
}

const PostEditor = forwardRef<PostEditorRef, PostEditorProps>(({
  postData,
  postHandlers,
  versionHistory,
  onRestoreVersion,
  onToggleCommentsPanel,
  comments,
  setComments,
  onPollStateChange,
  isRegeneratingWithInstructions = false,
}, ref) => {
  const generatedPostEditorRef = React.useRef<any>(null);

  useImperativeHandle(ref, () => ({
    updateContent: (content: string) => {
      if (generatedPostEditorRef.current) {
        generatedPostEditorRef.current.updateContent(content);
      }
    }
  }));

  return (
    <GeneratedPostEditor
      ref={generatedPostEditorRef}
      generatedPost={postData.generatedPost}
      onGeneratedPostChange={postHandlers.onGeneratedPostChange}
      editingInstructions={postData.editingInstructions}
      onEditingInstructionsChange={postHandlers.onEditingInstructionsChange}
      onCopyText={postHandlers.onCopyText}
      onRegenerateWithInstructions={postHandlers.onRegenerateWithInstructions}
      onSave={postHandlers.onSave}
      hasUnsavedChanges={postData.hasUnsavedChanges}
      onUnsavedChangesChange={postHandlers.onUnsavedChangesChange}
      versionHistory={versionHistory}
      onRestoreVersion={onRestoreVersion}
      onToggleCommentsPanel={onToggleCommentsPanel}
      comments={comments}
      setComments={setComments}
      onPollStateChange={onPollStateChange}
      isRegeneratingWithInstructions={isRegeneratingWithInstructions}
    />
  );
});

export default PostEditor;