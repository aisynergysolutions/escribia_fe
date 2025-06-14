import { useState, useEffect, useCallback } from 'react';
import { Idea } from '../types';

interface UseIdeaFormProps {
  idea?: Idea;
  isNewPost: boolean;
  initialIdeaFromUrl?: string;
  objectiveFromUrl?: string;
  templateFromUrl?: string;
}

export const useIdeaForm = ({ 
  idea, 
  isNewPost, 
  initialIdeaFromUrl = '', 
  objectiveFromUrl = '', 
  templateFromUrl = '' 
}: UseIdeaFormProps) => {
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
      if (initialIdeaFromUrl || objectiveFromUrl || templateFromUrl) {
        setTitle('');
        setInitialIdea(initialIdeaFromUrl);
        setObjective(objectiveFromUrl);
        setTemplate(templateFromUrl || 'none');
        setStatus('Idea');
        setInternalNotes('');
      } else {
        setTitle('');
        setInitialIdea('');
        setObjective('');
        setStatus('Idea');
        setInternalNotes('');
        setTemplate('none');
      }
    }
  }, [idea, isNewPost, initialIdeaFromUrl, objectiveFromUrl, templateFromUrl]);

  const handleTitleChange = useCallback((newTitle: string) => {
    setTitle(newTitle);
    if (isNewPost) {
      setHasUnsavedChanges(true);
    }
  }, [isNewPost]);

  const handleInitialIdeaChange = useCallback((newInitialIdea: string) => {
    setInitialIdea(newInitialIdea);
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
      setInitialIdea: handleInitialIdeaChange,
      setObjective,
      setTemplate,
      setStatus,
      setInternalNotes
    },
    hasUnsavedChanges,
    handleSave
  };
};
