
import { useState, useEffect, useCallback } from 'react';

interface UsePostEditorProps {
  initialText?: string;
}

export const usePostEditor = ({ initialText = '' }: UsePostEditorProps) => {
  const [generatedPost, setGeneratedPost] = useState('');
  const [editingInstructions, setEditingInstructions] = useState('');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  useEffect(() => {
    setGeneratedPost(initialText);
  }, [initialText]);

  const handlePostChange = useCallback((newText: string) => {
    setGeneratedPost(newText);
    setHasUnsavedChanges(true);
  }, []);

  const handleSave = useCallback(() => {
    console.log('Saving post:', generatedPost);
    setHasUnsavedChanges(false);
  }, [generatedPost]);

  const handleCopyText = useCallback(() => {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = generatedPost;
    navigator.clipboard.writeText(tempDiv.textContent || tempDiv.innerText || '');
  }, [generatedPost]);

  const handleRegenerateWithInstructions = useCallback(() => {
    setGeneratedPost("Based on your instructions, here's an updated version that focuses more on practical implementation...");
  }, []);

  return {
    generatedPost,
    editingInstructions,
    hasUnsavedChanges,
    setEditingInstructions,
    handlePostChange,
    handleSave,
    handleCopyText,
    handleRegenerateWithInstructions
  };
};
