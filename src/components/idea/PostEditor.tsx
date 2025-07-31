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
  // Add these for partial editing
  clientId?: string;
  postId?: string;
  subClientId?: string;
  // Add prop for AI saves
  onSaveAI?: (text: string) => Promise<void>;
  // Add scheduling props
  postStatus?: string;
  scheduledPostAt?: import('firebase/firestore').Timestamp;
  postedAt?: import('firebase/firestore').Timestamp;
  linkedinPostUrl?: string; // New prop for LinkedIn post URL
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
  clientId,
  postId,
  subClientId,
  onSaveAI,
  postStatus,
  scheduledPostAt,
  postedAt,
  linkedinPostUrl
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
      clientId={clientId}
      postId={postId}
      subClientId={subClientId}
      onSaveAI={onSaveAI}
      postStatus={postStatus}
      scheduledPostAt={scheduledPostAt}
      postedAt={postedAt}
      linkedinPostUrl={linkedinPostUrl}
    />
  );
});

export default PostEditor;