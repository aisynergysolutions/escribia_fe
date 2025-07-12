import { useState, useEffect, useCallback, useRef } from 'react';

interface UsePostEditorProps {
  initialText?: string;
  onSave?: (text: string) => Promise<void>;
  onSaveAI?: (text: string) => Promise<void>;
  autoSaveDelay?: number; // in milliseconds
  onEditWithInstructions?: (instructions: string) => Promise<void>; // New prop
}

export const usePostEditor = ({ 
  initialText = '', 
  onSave, 
  onSaveAI, 
  autoSaveDelay = 3000,
  onEditWithInstructions,
  resetKey // Add this parameter
}: UsePostEditorProps & { resetKey?: string }) => {
  const [generatedPost, setGeneratedPost] = useState('');
  const [editingInstructions, setEditingInstructions] = useState('');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [autoSaveDisabled, setAutoSaveDisabled] = useState(false); // New flag
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setGeneratedPost(initialText);
  }, [initialText]);

  // Auto-save effect
  useEffect(() => {
    if (hasUnsavedChanges && onSave && generatedPost.trim() && autoSaveDelay > 0 && !autoSaveDisabled) {
      // Clear previous timer
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }

      // Set new timer for auto-save
      autoSaveTimerRef.current = setTimeout(async () => {
        try {
          setIsSaving(true);
          await onSave(generatedPost);
          setHasUnsavedChanges(false);
          console.log('Auto-saved post');
        } catch (error) {
          console.error('Error auto-saving post:', error);
        } finally {
          setIsSaving(false);
        }
      }, autoSaveDelay);
    }

    // Cleanup timer on unmount
    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, [hasUnsavedChanges, generatedPost, onSave, autoSaveDelay, autoSaveDisabled]);

  const handlePostChange = useCallback((newText: string) => {
    setGeneratedPost(newText);
    setHasUnsavedChanges(true);
  }, []);

  // Add a method for programmatic updates that don't trigger unsaved changes flag
  const handlePostChangeWithoutUnsaved = useCallback((newText: string) => {
    setGeneratedPost(newText);
    // Don't set hasUnsavedChanges to true for programmatic updates
  }, []);

  // Add a method to temporarily disable auto-save during programmatic updates
  const handlePostChangeWithoutAutoSave = useCallback((newText: string) => {
    setAutoSaveDisabled(true);
    setGeneratedPost(newText);
    
    // Re-enable auto-save after a short delay
    setTimeout(() => {
      setAutoSaveDisabled(false);
    }, 100);
  }, []);

  const handleSave = useCallback(async () => {
    if (!onSave) {
      console.log('No save function provided, only logging:', generatedPost);
      setHasUnsavedChanges(false);
      return;
    }

    // Clear auto-save timer since we're manually saving
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
      autoSaveTimerRef.current = null;
    }

    try {
      setIsSaving(true);
      await onSave(generatedPost);
      setHasUnsavedChanges(false);
      console.log('Post saved manually');
    } catch (error) {
      console.error('Error saving post:', error);
    } finally {
      setIsSaving(false);
    }
  }, [generatedPost, onSave]);

  const handleCopyText = useCallback(() => {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = generatedPost;
    navigator.clipboard.writeText(tempDiv.textContent || tempDiv.innerText || '');
  }, [generatedPost]);

  const handleRegenerateWithInstructions = useCallback(async () => {
    if (!editingInstructions.trim()) {
      console.log('No editing instructions provided');
      return;
    }

    if (onEditWithInstructions) {
      try {
        setIsSaving(true);
        await onEditWithInstructions(editingInstructions);
        // Clear instructions after successful edit
        setEditingInstructions('');
        console.log('Post edited with instructions successfully');
      } catch (error) {
        console.error('Error editing post with instructions:', error);
      } finally {
        setIsSaving(false);
      }
    } else {
      // Fallback for old behavior if no function provided
      const newContent = "Based on your instructions, here's an updated version that focuses more on practical implementation...";
      setGeneratedPost(newContent);
      setHasUnsavedChanges(true);
      
      // Automatically save AI-generated content as a new draft
      const saveFunction = onSaveAI || onSave; // Use AI save function if available, otherwise fallback to regular save
      if (saveFunction) {
        try {
          setIsSaving(true);
          await saveFunction(newContent);
          setHasUnsavedChanges(false);
          console.log('AI-generated content saved successfully');
        } catch (error) {
          console.error('Error saving AI-generated content:', error);
        } finally {
          setIsSaving(false);
        }
      }
    }
  }, [editingInstructions, onEditWithInstructions, onSave, onSaveAI]);

  // Add this useEffect to reset when resetKey changes
  useEffect(() => {
    setGeneratedPost('');
    setEditingInstructions('');
    setHasUnsavedChanges(false);
  }, [resetKey]);

  return {
    generatedPost,
    editingInstructions,
    hasUnsavedChanges,
    isSaving,
    setEditingInstructions,
    handlePostChange,
    handlePostChangeWithoutUnsaved,
    handlePostChangeWithoutAutoSave,
    handleSave,
    handleCopyText,
    handleRegenerateWithInstructions
  };
};
