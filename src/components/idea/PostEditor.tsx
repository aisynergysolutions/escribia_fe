
import React from 'react';
import GeneratedPostEditor from './GeneratedPostEditor';
import { CommentThread } from './CommentsPanel';

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
}

const PostEditor: React.FC<PostEditorProps> = ({
  postData,
  postHandlers,
  versionHistory,
  onRestoreVersion,
  onToggleCommentsPanel,
  comments,
  setComments,
}) => {
  return (
    <GeneratedPostEditor
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
    />
  );
};

export default PostEditor;
