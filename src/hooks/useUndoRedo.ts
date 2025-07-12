
import { useState, useRef, useCallback, useEffect } from 'react';

interface Version {
  id: string;
  content: string;
  createdAt: Date;
  title: string;
}

interface UseUndoRedoProps {
  initialContent: string;
  onContentChange: (content: string) => void;
  pauseDelay?: number; // milliseconds to wait before creating a new version
}

export const useUndoRedo = ({ 
  initialContent, 
  onContentChange, 
  pauseDelay = 1000 // Reduced from 3000 to 1000ms for more frequent undo/redo points
}: UseUndoRedoProps) => {
  const [versions, setVersions] = useState<Version[]>([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [currentContent, setCurrentContent] = useState(initialContent);
  const pauseTimer = useRef<NodeJS.Timeout | null>(null);
  const lastSavedContent = useRef(initialContent);
  const suppressOnChange = useRef(false); // New flag to suppress onChange

  // Initialize with first version
  useEffect(() => {
    if (versions.length === 0 && initialContent) {
      const initialVersion: Version = {
        id: 'initial',
        content: initialContent,
        createdAt: new Date(),
        title: formatVersionTitle(new Date())
      };
      setVersions([initialVersion]);
      setCurrentIndex(0);
      lastSavedContent.current = initialContent;
    }
  }, [initialContent, versions.length]);

  const formatVersionTitle = (date: Date): string => {
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  };

  const createNewVersion = useCallback((content: string) => {
    const newVersion: Version = {
      id: Date.now().toString(),
      content,
      createdAt: new Date(),
      title: formatVersionTitle(new Date())
    };

    setVersions(prev => {
      // Remove any versions after current index (when we're not at the latest)
      const newVersions = prev.slice(0, currentIndex + 1);
      return [...newVersions, newVersion];
    });

    setCurrentIndex(prev => prev + 1);
    lastSavedContent.current = content;
  }, [currentIndex]);

  const handleContentChange = useCallback((content: string) => {
    setCurrentContent(content);
    
    // Only call onContentChange if not suppressed
    if (!suppressOnChange.current) {
      onContentChange(content);
    }

    // Clear existing timer
    if (pauseTimer.current) {
      clearTimeout(pauseTimer.current);
    }

    // Only create new version if content actually changed
    if (content !== lastSavedContent.current) {
      // Set timer to create new version after pause
      pauseTimer.current = setTimeout(() => {
        createNewVersion(content);
      }, pauseDelay);
    }
  }, [createNewVersion, onContentChange, pauseDelay]);

  // Add method to update content without triggering onChange
  const updateContentSilently = useCallback((content: string) => {
    suppressOnChange.current = true;
    setCurrentContent(content);
    
    // Reset the flag after a brief delay
    setTimeout(() => {
      suppressOnChange.current = false;
    }, 10);
  }, []);

  const undo = useCallback(() => {
    if (currentIndex > 0) {
      const newIndex = currentIndex - 1;
      const version = versions[newIndex];
      setCurrentIndex(newIndex);
      setCurrentContent(version.content);
      onContentChange(version.content);
      
      // Clear pause timer when manually navigating
      if (pauseTimer.current) {
        clearTimeout(pauseTimer.current);
      }
    }
  }, [currentIndex, versions, onContentChange]);

  const redo = useCallback(() => {
    if (currentIndex < versions.length - 1) {
      const newIndex = currentIndex + 1;
      const version = versions[newIndex];
      setCurrentIndex(newIndex);
      setCurrentContent(version.content);
      onContentChange(version.content);
      
      // Clear pause timer when manually navigating
      if (pauseTimer.current) {
        clearTimeout(pauseTimer.current);
      }
    }
  }, [currentIndex, versions, onContentChange]);

  const restoreVersion = useCallback((versionId: string) => {
    const versionIndex = versions.findIndex(v => v.id === versionId);
    if (versionIndex !== -1) {
      const version = versions[versionIndex];
      setCurrentIndex(versionIndex);
      setCurrentContent(version.content);
      onContentChange(version.content);
      
      // Clear pause timer when manually navigating
      if (pauseTimer.current) {
        clearTimeout(pauseTimer.current);
      }
    }
  }, [versions, onContentChange]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (pauseTimer.current) {
        clearTimeout(pauseTimer.current);
      }
    };
  }, []);

  const canUndo = currentIndex > 0;
  const canRedo = currentIndex < versions.length - 1;

  return {
    versions,
    currentContent,
    canUndo,
    canRedo,
    undo,
    redo,
    restoreVersion,
    handleContentChange,
    updateContentSilently
  };
};
