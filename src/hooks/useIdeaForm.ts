
import { useState, useEffect, useCallback } from 'react';
import { Idea } from '../types';

interface UseIdeaFormProps {
  idea?: Idea;
  isNewPost: boolean;
}

export const useIdeaForm = ({ idea, isNewPost }: UseIdeaFormProps) => {
  const [title, setTitle] = useState('');
  const [initialIdea, setInitialIdea] = useState('');
  const [objective, setObjective] = useState('');
  const [template, setTemplate] = useState('none');
  const [status, setStatus] = useState('Idea');
  const [internalNotes, setInternalNotes] = useState('');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  useEffect(() => {
    if (idea && !isNewPost) {
      setTitle(idea.title);
      setInitialIdea(idea.initialIdeaPrompt);
      setObjective(idea.objective);
      setStatus(idea.status);
      setInternalNotes(idea.internalNotes || '');
      if (idea.templateUsedId) {
        setTemplate(idea.templateUsedId);
      } else {
        setTemplate('none');
      }
    } else if (isNewPost) {
      setTitle('');
      setInitialIdea('');
      setObjective('');
      setStatus('Idea');
      setInternalNotes('');
      setTemplate('none');
    }
  }, [idea, isNewPost]);

  const handleTitleChange = useCallback((newTitle: string) => {
    setTitle(newTitle);
    if (isNewPost) {
      setHasUnsavedChanges(true);
    }
  }, [isNewPost]);

  const handleSave = useCallback(() => {
    console.log('Saving idea:', {
      title,
      initialIdea,
      objective,
      status
    });
    setHasUnsavedChanges(false);
  }, [title, initialIdea, objective, status]);

  return {
    formData: {
      title,
      initialIdea,
      objective,
      template,
      status,
      internalNotes
    },
    setters: {
      setTitle: handleTitleChange,
      setInitialIdea,
      setObjective,
      setTemplate,
      setStatus,
      setInternalNotes
    },
    hasUnsavedChanges,
    handleSave
  };
};
