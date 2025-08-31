import React, { useState, useRef, useEffect, useImperativeHandle, forwardRef } from 'react';
import { Loader2, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { usePosts } from '@/context/PostsContext';
import { getProfileId, getProfileRole, getProfileImageUrl, getProfileName } from '@/types/post';
import { Button } from '@/components/ui/button';
import { usePostDetails } from '@/context/PostDetailsContext';
import { useAuth } from '@/context/AuthContext';
import FloatingToolbar from './FloatingToolbar';
import AIEditToolbar from './AIEditToolbar';
import AIEditModal from './AIEditModal';
import PostPreviewModal from './PostPreviewModal';
import SchedulePostModal from './SchedulePostModal';
import PostNowModal from './PostNowModal';
import EditorToolbar from './EditorToolbar';
import EditorContainer from './EditorContainer';
import EditingInstructions from './EditingInstructions';
import CommentPopover from './CommentPopover';
import VersionHistoryModal from './VersionHistoryModal';
import PollPreview from './PollPreview';
import CreatePollModal from './CreatePollModal';
import PostEditorDisabledOverlay from './PostEditorDisabledOverlay';
import { CommentThread } from './CommentsPanel';
import { Poll } from '@/context/PostDetailsContext';
import { useUndoRedo } from '@/hooks/useUndoRedo';
import MediaPreview from './MediaPreview';
import MediaUploadModal, { MediaFile } from './MediaUploadModal';
import MediaDropZone from './MediaDropZone';

interface GeneratedPostEditorProps {
  generatedPost: string;
  onGeneratedPostChange: (value: string) => void;
  editingInstructions: string;
  onEditingInstructionsChange: (value: string) => void;
  onCopyText: () => void;
  onRegenerateWithInstructions: () => void;
  onSave: () => void;
  hasUnsavedChanges: boolean;
  onUnsavedChangesChange: (hasChanges: boolean) => void;
  versionHistory: Array<{
    id: string;
    version: number;
    text: string;
    createdAt: Date;
    generatedByAI: boolean;
    notes: string;
  }>;
  onRestoreVersion: (versionId: string) => void;
  onToggleCommentsPanel: () => void;
  comments: CommentThread[];
  setComments: React.Dispatch<React.SetStateAction<CommentThread[]>>;
  onPollStateChange?: (hasPoll: boolean) => void;
  isRegeneratingWithInstructions?: boolean;
  // Add these new props for partial editing
  clientId?: string;
  postId?: string;
  subClientId?: string;
  // Add prop for saving AI-generated content
  onSaveAI?: (text: string) => Promise<void>;
  // Add scheduling props
  postStatus?: string;
  scheduledPostAt?: import('firebase/firestore').Timestamp;
  postedAt?: import('firebase/firestore').Timestamp;
  linkedinPostUrl?: string;
  // Add prop for regenerating from initial idea
  onRegenerateFromIdea?: () => void;
  isRegeneratingPost?: boolean;
}

export interface GeneratedPostEditorRef {
  updateContent: (content: string) => void;
}

const GeneratedPostEditor = forwardRef<GeneratedPostEditorRef, GeneratedPostEditorProps>(({
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
  isRegeneratingWithInstructions = false,
  clientId,
  postId,
  subClientId,
  onSaveAI,
  postStatus,
  scheduledPostAt,
  postedAt,
  linkedinPostUrl,
  onRegenerateFromIdea,
  isRegeneratingPost = false
}, ref) => {
  const [toolbarPosition, setToolbarPosition] = useState({
    top: 0,
    left: 0
  });
  const [toolbarVisible, setToolbarVisible] = useState(false);
  const [aiEditToolbarVisible, setAiEditToolbarVisible] = useState(false);
  const [aiEditModalVisible, setAiEditModalVisible] = useState(false);
  const [aiEditLoading, setAiEditLoading] = useState(false); // Add loading state
  const [originalPost, setOriginalPost] = useState(generatedPost);
  const [selectedText, setSelectedText] = useState('');
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showChatBox, setShowChatBox] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showPostNowModal, setShowPostNowModal] = useState(false);
  const [charCount, setCharCount] = useState(0);
  const [lineCount, setLineCount] = useState(1);
  const [showTruncation, setShowTruncation] = useState(false);
  const [cutoffLineTop, setCutoffLineTop] = useState(0);
  const [viewMode, setViewMode] = useState<'mobile' | 'desktop'>('desktop');
  const [showCommentsPanel, setShowCommentsPanel] = useState(false);
  const [showVersionHistoryModal, setShowVersionHistoryModal] = useState(false);
  const [pollData, setPollData] = useState<Poll | null>(null);
  const [hasMedia, setHasMedia] = useState(false);
  const [editingPoll, setEditingPoll] = useState<Poll | null>(null);
  const [showCreatePollModal, setShowCreatePollModal] = useState(false);
  const [showDisabledOverlay, setShowDisabledOverlay] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { duplicatePost } = usePosts();
  const { editPostPartial, publishPostNow, uploadPostImages, uploadPostVideo, removePostImage, removeAllPostImages, updatePostImages, updatePostVideo, createPostPoll, updatePostPoll, removePostPoll, post } = usePostDetails();
  const { currentUser } = useAuth();
  const lastSelection = useRef<Range | null>(null);

  // Check if post is in Posted status  
  const isPosted = postStatus === 'Posted' && postedAt && postedAt.seconds > 0;

  // NEW state for comment popover
  const [commentPopover, setCommentPopover] = useState({ visible: false, top: 0, left: 0 });
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [editingMedia, setEditingMedia] = useState<MediaFile[] | null>(null);
  const [showMediaUploadModal, setShowMediaUploadModal] = useState(false);

  // Loading states for media operations
  const [isUploadingMedia, setIsUploadingMedia] = useState(false);
  const [isRemovingMedia, setIsRemovingMedia] = useState(false);
  const [isLoadingInitialImages, setIsLoadingInitialImages] = useState(false);

  // Loading states for poll operations
  const [isCreatingPoll, setIsCreatingPoll] = useState(false);
  const [isUpdatingPoll, setIsUpdatingPoll] = useState(false);
  const [isRemovingPoll, setIsRemovingPoll] = useState(false);

  // Initialize undo/redo functionality
  const {
    versions,
    currentContent,
    canUndo,
    canRedo,
    undo,
    redo,
    restoreVersion,
    handleContentChange: handleUndoRedoContentChange,
    updateContentSilently
  } = useUndoRedo({
    initialContent: generatedPost,
    onContentChange: onGeneratedPostChange,
    pauseDelay: 1000 // Reduced from 3000 to 1000ms for more frequent undo/redo points
  });

  // Expose methods to parent component
  useImperativeHandle(ref, () => ({
    updateContent: (content: string) => {
      updateContentSilently(content);
    }
  }));

  const calculateContentMetrics = (content: string) => {
    const textContent = content.replace(/<[^>]*>/g, ''); // Strip HTML for character count
    const charCount = textContent.length;

    // Calculate precise line positioning based on view mode
    const lineHeight = 21; // 14px * 1.5
    const paddingTop = 24; // Container's padding-top where text actually starts

    // Use different widths based on view mode
    const containerWidth = viewMode === 'mobile' ? 380 : 555; // Effective content width (excluding padding)

    // Create a temporary element to measure line count
    const tempDiv = document.createElement('div');
    tempDiv.style.cssText = `
      position: absolute;
      visibility: hidden;
      width: ${containerWidth}px;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen-Sans, Ubuntu, Cantarell, "Helvetica Neue", sans-serif;
      font-size: 14px;
      line-height: 1.5;
      padding: 0;
      margin: 0;
      white-space: pre-wrap;
      word-wrap: break-word;
    `;
    tempDiv.innerHTML = content || 'A';
    document.body.appendChild(tempDiv);

    const height = tempDiv.offsetHeight;
    const lines = Math.max(1, Math.ceil(height / lineHeight));

    document.body.removeChild(tempDiv);

    // Position the line exactly after the 3rd line of text
    // Account for padding-top and add exactly 3 line heights
    const threeLineHeight = lineHeight * 3;
    setCutoffLineTop(paddingTop + threeLineHeight);

    return { charCount, lineCount: lines };
  };

  const handleTextSelection = () => {
    const selection = window.getSelection();
    if (selection && selection.toString().length > 0 && editorRef.current?.contains(selection.anchorNode)) {
      const selectedText = selection.toString();
      setSelectedText(selectedText);
      const range = selection.getRangeAt(0);
      lastSelection.current = range.cloneRange();
      const rect = range.getBoundingClientRect();
      setToolbarPosition({
        top: rect.top + window.scrollY,
        left: rect.left + rect.width / 2
      });
      setToolbarVisible(true);
      setAiEditToolbarVisible(false);
    } else {
      setToolbarVisible(false);
      setAiEditToolbarVisible(false);
      setAiEditModalVisible(false);
      setSelectedText('');
    }
  };

  const handleAIEdit = () => {
    if (selectedText && lastSelection.current) {
      // Open the AI edit modal
      setAiEditModalVisible(true);
      // Hide the floating toolbar while modal is open
      setToolbarVisible(false);
    }
  };

  const handleAIEditApply = (instruction: string) => {
    if (selectedText) {
      toast({
        title: "AI Edit Applied",
        description: `Instruction: "${instruction}" applied to selected text.`
      });
      setAiEditToolbarVisible(false);
    }
  };

  const handleAIEditModalApply = async (action: string, customPrompt?: string) => {
    if (selectedText && clientId && postId) {
      setAiEditLoading(true); // Start loading

      try {
        // Use the passed subClientId (profileId) for the API call
        if (!clientId || !postId || !subClientId) {
          toast({
            title: "Missing Information",
            description: "Required client, post, or profile information is missing.",
            variant: "destructive"
          });
          return;
        }

        const editedContent = await editPostPartial(
          clientId,
          postId,
          subClientId,
          selectedText,
          currentContent,
          action,
          customPrompt
        );

        if (editedContent) {
          // Save the edited content as a new AI-generated draft first
          if (onSaveAI) {
            try {
              await onSaveAI(editedContent);
            } catch (error) {
              console.error('Error saving AI-edited content:', error);
              toast({
                title: "Save Failed",
                description: "Failed to save the edited content. Please try again.",
                variant: "destructive"
              });
              return;
            }
          }

          // Update the editor content silently without triggering auto-save
          updateContentSilently(editedContent);

          toast({
            title: "AI Edit Applied",
            description: `Text has been ${action === 'shorten' ? 'shortened' :
              action === 'lengthen' ? 'lengthened' :
                action === 'rephrase' ? 'rephrased' :
                  action === 'fix_grammar' ? 'corrected' : 'edited'} successfully.`
          });

          // Clear selection and hide modal after successful edit
          const selection = window.getSelection();
          if (selection) {
            selection.removeAllRanges();
          }
          setSelectedText('');
          lastSelection.current = null;
          setAiEditModalVisible(false);
          setToolbarVisible(false);
        } else {
          toast({
            title: "Edit Failed",
            description: "Failed to apply the edit. Please try again.",
            variant: "destructive"
          });
        }
      } catch (error) {
        console.error('Error applying AI edit:', error);
        toast({
          title: "Edit Failed",
          description: "An error occurred while applying the edit.",
          variant: "destructive"
        });
      } finally {
        setAiEditLoading(false); // Stop loading
      }
    } else {
      toast({
        title: "Missing Information",
        description: "Unable to apply edit - missing client or post information.",
        variant: "destructive"
      });
    }
  };

  const handleAIEditModalClose = () => {
    // Prevent closing while loading
    if (aiEditLoading) return;

    setAiEditModalVisible(false);
    // Restore the floating toolbar and selection if text is still selected
    if (selectedText && lastSelection.current) {
      const selection = window.getSelection();
      if (selection) {
        selection.removeAllRanges();
        selection.addRange(lastSelection.current);
      }
      setToolbarVisible(true);
    }
  };

  const handleAIEditClose = () => {
    setAiEditToolbarVisible(false);
    if (selectedText) {
      setToolbarVisible(true);
    }
  };

  const handleCommentRequest = () => {
    if (lastSelection.current) {
      const rect = lastSelection.current.getBoundingClientRect();
      setCommentPopover({
        visible: true,
        top: rect.bottom + window.scrollY + 8,
        left: rect.left + rect.width / 2,
      });
      setToolbarVisible(false);
    }
  };

  const handleSaveComment = (commentText: string) => {
    if (!lastSelection.current || !editorRef.current) return;

    const selection = window.getSelection();
    if (!selection) return;

    selection.removeAllRanges();
    selection.addRange(lastSelection.current);

    const commentId = `comment-${Date.now()}`;
    const mark = document.createElement('mark');
    mark.dataset.commentId = commentId;

    try {
      lastSelection.current.surroundContents(mark);
    } catch (e) {
      console.error("Could not wrap selection", e);
      toast({ title: "Error", description: "Could not add comment to a selection that spans multiple paragraphs.", variant: "destructive" });
      setCommentPopover({ visible: false, top: 0, left: 0 });
      return;
    }

    const newThread: CommentThread = {
      id: commentId,
      selectionText: lastSelection.current.toString(),
      replies: [{ id: `reply-${Date.now()}`, author: 'You', text: commentText, createdAt: new Date() }],
      resolved: false,
    };
    setComments([...comments, newThread]);

    handleUndoRedoContentChange(editorRef.current.innerHTML);
    setCommentPopover({ visible: false, top: 0, left: 0 });
    lastSelection.current = null;
    selection.removeAllRanges();
    toast({ title: "Comment added." });
  };

  const handleFormat = (format: string) => {
    const selection = window.getSelection();
    if (!selection || !editorRef.current) return;
    if (format === 'insertUnorderedList') {
      const range = selection.rangeCount > 0 ? selection.getRangeAt(0) : null;
      let listElement = null;
      if (range) {
        let node = range.startContainer;
        while (node && node !== editorRef.current) {
          if (node.nodeType === Node.ELEMENT_NODE && (node as Element).tagName === 'UL') {
            listElement = node as Element;
            break;
          }
          node = node.parentNode;
        }
      }
      if (listElement) {
        document.execCommand('insertUnorderedList', false);
      } else {
        document.execCommand('insertUnorderedList', false);
      }
    } else {
      document.execCommand(format, false);
    }
    if (editorRef.current) {
      const newContent = editorRef.current.innerHTML;
      handleUndoRedoContentChange(newContent);
      checkForChanges(newContent);
    }
  };

  const handleInput = () => {
    if (editorRef.current) {
      const newContent = editorRef.current.innerHTML;
      handleUndoRedoContentChange(newContent);
      checkForChanges(newContent);

      // Update metrics
      const metrics = calculateContentMetrics(newContent);
      setCharCount(metrics.charCount);
      setLineCount(metrics.lineCount);
      setShowTruncation(metrics.charCount > 200 || metrics.lineCount > 3);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    // Handle Ctrl+Z and Ctrl+Y
    if (event.ctrlKey || event.metaKey) {
      if (event.key === 'z' && !event.shiftKey) {
        event.preventDefault();
        undo();
        return;
      }
      if (event.key === 'y' || (event.key === 'z' && event.shiftKey)) {
        event.preventDefault();
        redo();
        return;
      }
      if (event.key === 'c') {
        event.preventDefault();
        handleCopyWithFormatting();
        return;
      }
      if (event.key === 's') {
        event.preventDefault();
        handleSave();
        return;
      }
    }
  };

  const handleCopyWithFormatting = async () => {
    if (editorRef.current) {
      try {
        const selection = window.getSelection();
        let htmlContent = '';
        let textContent = '';
        if (selection && selection.toString().length > 0) {
          const range = selection.getRangeAt(0);
          const fragment = range.cloneContents();
          const tempDiv = document.createElement('div');
          tempDiv.appendChild(fragment);
          htmlContent = tempDiv.innerHTML;
          textContent = selection.toString();
        } else {
          htmlContent = editorRef.current.innerHTML;
          textContent = editorRef.current.innerText || editorRef.current.textContent || '';
        }
        if (navigator.clipboard && window.ClipboardItem) {
          const clipboardItem = new ClipboardItem({
            'text/html': new Blob([htmlContent], {
              type: 'text/html'
            }),
            'text/plain': new Blob([textContent], {
              type: 'text/plain'
            })
          });
          await navigator.clipboard.write([clipboardItem]);
        } else {
          await navigator.clipboard.writeText(textContent);
        }
      } catch (err) {
        console.error('Failed to copy with formatting, falling back to plain text:', err);
        const selection = window.getSelection();
        const textContent = selection && selection.toString().length > 0 ? selection.toString() : editorRef.current.innerText || editorRef.current.textContent || '';
        await navigator.clipboard.writeText(textContent);
      }
    }
  };

  const insertEmoji = (emoji: string) => {
    if (editorRef.current) {
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        range.deleteContents();
        const textNode = document.createTextNode(emoji);
        range.insertNode(textNode);
        range.setStartAfter(textNode);
        range.setEndAfter(textNode);
        selection.removeAllRanges();
        selection.addRange(range);
      } else {
        editorRef.current.appendChild(document.createTextNode(emoji));
      }
      const newContent = editorRef.current.innerHTML;
      handleUndoRedoContentChange(newContent);
      checkForChanges(newContent);
    }
  };

  const checkForChanges = (currentContent: string) => {
    const hasChanges = currentContent !== originalPost;
    onUnsavedChangesChange(hasChanges);
  };

  const handleSave = () => {
    onSave();
    setOriginalPost(currentContent);
    onUnsavedChangesChange(false);
    toast({
      title: "Saved",
      description: "Your changes have been saved successfully."
    });
  };

  const handlePreview = () => {
    setShowPreviewModal(true);
  };

  const handleShowComments = () => {
    setShowCommentsPanel(prev => !prev);
    onToggleCommentsPanel();
  };

  const handleRegeneratePost = () => {
    if (onRegenerateFromIdea) {
      onRegenerateFromIdea();
    } else {
      toast({
        title: "Regenerating Post",
        description: "We are rolling out this feature Thank you!"
      });
    }
  };

  const handleSchedule = (date: Date, time: string) => {
    toast({
      title: "Post Scheduled",
      description: `Your post has been scheduled for ${date.toLocaleDateString()} at ${time}.`
    });
  };

  const handlePostNow = async (status: string) => {
    console.log('handlePostNow called with:', {
      status,
      currentUser: currentUser?.uid,
      clientId,
      postId,
      subClientId
    });

    if (!currentUser?.uid || !clientId || !postId || !subClientId) {
      toast({
        title: "Error",
        description: `Missing required information to publish the post. User ID: ${currentUser?.uid || 'undefined'}, Client ID: ${clientId || 'undefined'}, Post ID: ${postId || 'undefined'}, Profile ID: ${subClientId || 'undefined'}`,
        variant: "destructive"
      });
      return;
    }

    try {
      const result = await publishPostNow(
        currentUser.uid,
        clientId,
        postId,
        subClientId,
        currentContent
      );

      if (result.success) {
        toast({
          title: "Post Published",
          description: result.linkedinPostId
            ? `Your post has been successfully published to LinkedIn. Post ID: ${result.linkedinPostId}`
            : "Your post has been successfully published to LinkedIn."
        });
      } else {
        toast({
          title: "Publication Failed",
          description: result.error || "An error occurred while publishing your post.",
          variant: "destructive"
        });
        throw new Error(result.error || "Publication failed");
      }
    } catch (error) {
      console.error('Error publishing post:', error);
      // Re-throw so the modal stays open for retry
      throw error;
    }
  };

  const handleViewModeToggle = () => {
    setViewMode(prev => prev === 'desktop' ? 'mobile' : 'desktop');
  };

  const handleRestoreVersion = (versionId: string) => {
    onRestoreVersion(versionId);
    toast({
      title: "Version Restored",
      description: "Version has been restored successfully."
    });
  };

  // Handle mouse events for disabled overlay
  const handleEditorMouseEnter = () => {
    if (isPosted) {
      setShowDisabledOverlay(true);
    }
  };

  const handleEditorMouseLeave = () => {
    setShowDisabledOverlay(false);
  };

  // Handle duplicate post action
  const handleDuplicatePost = async (): Promise<string> => {
    if (!currentUser?.uid || !clientId || !postId) {
      throw new Error('Missing required information to duplicate post');
    }

    try {
      const newPostId = await duplicatePost(currentUser.uid, clientId, postId);
      toast({
        title: "Post Duplicated",
        description: "The post has been successfully duplicated.",
      });
      return newPostId;
    } catch (error) {
      console.error('Error duplicating post:', error);
      toast({
        title: "Duplication Failed",
        description: "Failed to duplicate the post. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  };

  // Handle navigation to duplicated post
  const handleNavigateToPost = (newPostId: string) => {
    if (!clientId) return;
    setShowDisabledOverlay(false);
    navigate(`/clients/${clientId}/posts/${newPostId}`);
  };

  const handleAddPoll = async (newPollData: Poll) => {
    if (!currentUser?.uid || !clientId || !postId) {
      toast({
        title: "Error",
        description: "Missing required information to create poll.",
        variant: "destructive"
      });
      return;
    }

    // Determine if we're creating or updating
    const isEditing = !!editingPoll;
    const loadingSetter = isEditing ? setIsUpdatingPoll : setIsCreatingPoll;

    try {
      loadingSetter(true);

      // If we're editing an existing poll, update it; otherwise create new
      if (isEditing) {
        await updatePostPoll(currentUser.uid, clientId, postId, newPollData);
        // toast({
        //   title: "Poll Updated",
        //   description: "Poll has been updated successfully."
        // });
      } else {
        await createPostPoll(currentUser.uid, clientId, postId, newPollData);
        // toast({
        //   title: "Poll Added",
        //   description: "Poll has been added to your post."
        // });
      }

      setPollData(newPollData);

      // Clear media when adding poll and remove from Firebase if it exists
      if (mediaFiles.length > 0) {
        try {
          await removeAllPostImages(currentUser.uid, clientId, postId);
        } catch (error) {
          console.error('Error removing images when adding poll:', error);
        }
      }
      setMediaFiles([]);
      setHasMedia(false);
      setEditingPoll(null); // Clear editing state
      // Notify parent about poll state change
      if (onPollStateChange) {
        onPollStateChange(true);
      }
    } catch (error) {
      console.error('Error with poll operation:', error);
      toast({
        title: "Error",
        description: `Failed to ${isEditing ? 'update' : 'create'} poll. Please try again.`,
        variant: "destructive"
      });
    } finally {
      loadingSetter(false);
    }
  };

  const handleEditPoll = () => {
    if (pollData) {
      setEditingPoll(pollData);
      setShowCreatePollModal(true);
    }
  };

  const handleRemovePoll = async () => {
    if (!currentUser?.uid || !clientId || !postId) {
      toast({
        title: "Error",
        description: "Missing required information to remove poll.",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsRemovingPoll(true);
      await removePostPoll(currentUser.uid, clientId, postId);
      setPollData(null);
      setEditingPoll(null);
      // Notify parent about poll state change
      if (onPollStateChange) {
        onPollStateChange(false);
      }
      // toast({
      //   title: "Poll Removed",
      //   description: "Poll has been removed from your post."
      // });
    } catch (error) {
      console.error('Error removing poll:', error);
      toast({
        title: "Error",
        description: "Failed to remove poll. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsRemovingPoll(false);
    }
  };

  // NEW: Direct media upload handlers for the dropzone
  const handleDirectFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || !currentUser?.uid || !clientId || !postId) return;

    const firstFile = files[0];
    const isVideo = firstFile.type.startsWith('video/');
    const isImage = firstFile.type.startsWith('image/');

    // Check if user is trying to mix video and images
    if (mediaFiles.length > 0) {
      const hasVideo = mediaFiles.some(f => f.type === 'video');
      const hasImages = mediaFiles.some(f => f.type === 'image');

      if ((hasVideo && isImage) || (hasImages && isVideo)) {
        toast({
          title: "Mixed media not allowed",
          description: "You can upload either 1 video OR up to 14 images, not both.",
          variant: "destructive"
        });
        return;
      }
    }

    try {
      const mediaFilesToProcess: MediaFile[] = [];

      if (isVideo) {
        // Only allow one video
        if (mediaFiles.length > 0) {
          toast({
            title: "Only one video allowed",
            description: "You can upload only one video per post.",
            variant: "destructive"
          });
          return;
        }

        const url = URL.createObjectURL(firstFile);
        const video = document.createElement('video');
        await new Promise((resolve) => {
          video.onloadedmetadata = () => {
            const isVertical = video.videoHeight > video.videoWidth;
            const mediaFile: MediaFile = {
              id: `media-${Date.now()}-${Math.random()}`,
              file: firstFile,
              url,
              isVertical,
              type: 'video',
              duration: video.duration
            };
            mediaFilesToProcess.push(mediaFile);
            resolve(void 0);
          };
          video.src = url;
        });
      } else if (isImage) {
        // Handle multiple images (up to 14 total)
        const newFiles = Array.from(files).slice(0, 14 - mediaFiles.length);

        for (const file of newFiles) {
          if (!file.type.startsWith('image/')) {
            toast({
              title: "Invalid file type",
              description: "Upload either images or videos.",
              variant: "destructive"
            });
            continue;
          }

          const url = URL.createObjectURL(file);
          const img = new Image();
          await new Promise((resolve) => {
            img.onload = () => {
              const isVertical = img.height > img.width;
              const mediaFile: MediaFile = {
                id: `media-${Date.now()}-${Math.random()}`,
                file,
                url,
                isVertical,
                type: 'image'
              };
              mediaFilesToProcess.push(mediaFile);
              resolve(void 0);
            };
            img.src = url;
          });
        }
      } else {
        toast({
          title: "Invalid file type",
          description: "Only image and video files are allowed.",
          variant: "destructive"
        });
        return;
      }

      if (mediaFilesToProcess.length > 0) {
        await handleUploadMedia(mediaFilesToProcess);

        // Clean up blob URLs after successful upload
        mediaFilesToProcess.forEach(mediaFile => {
          URL.revokeObjectURL(mediaFile.url);
        });
      }
    } catch (error) {
      console.error('Error processing direct file upload:', error);
      toast({
        title: "Upload Failed",
        description: "Failed to upload images. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleDirectFileDrop = async (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const files = event.dataTransfer.files;
    if (!files || !currentUser?.uid || !clientId || !postId) return;

    const firstFile = files[0];
    const isVideo = firstFile.type.startsWith('video/');
    const isImage = firstFile.type.startsWith('image/');

    // Check if user is trying to mix video and images
    if (mediaFiles.length > 0) {
      const hasVideo = mediaFiles.some(f => f.type === 'video');
      const hasImages = mediaFiles.some(f => f.type === 'image');

      if ((hasVideo && isImage) || (hasImages && isVideo)) {
        toast({
          title: "Mixed media not allowed",
          description: "You can upload either 1 video OR up to 14 images, not both.",
          variant: "destructive"
        });
        return;
      }
    }

    try {
      const mediaFilesToProcess: MediaFile[] = [];

      if (isVideo) {
        // Only allow one video
        if (mediaFiles.length > 0) {
          toast({
            title: "Only one video allowed",
            description: "You can upload only one video per post.",
            variant: "destructive"
          });
          return;
        }

        const url = URL.createObjectURL(firstFile);
        const video = document.createElement('video');
        await new Promise((resolve) => {
          video.onloadedmetadata = () => {
            const isVertical = video.videoHeight > video.videoWidth;
            const mediaFile: MediaFile = {
              id: `media-${Date.now()}-${Math.random()}`,
              file: firstFile,
              url,
              isVertical,
              type: 'video',
              duration: video.duration
            };
            mediaFilesToProcess.push(mediaFile);
            resolve(void 0);
          };
          video.src = url;
        });
      } else if (isImage) {
        // Handle multiple images (up to 14 total)
        const newFiles = Array.from(files).slice(0, 14 - mediaFiles.length);

        for (const file of newFiles) {
          if (!file.type.startsWith('image/')) {
            toast({
              title: "Invalid file type",
              description: "Upload either images or videos.",
              variant: "destructive"
            });
            continue;
          }

          const url = URL.createObjectURL(file);
          const img = new Image();
          await new Promise((resolve) => {
            img.onload = () => {
              const isVertical = img.height > img.width;
              const mediaFile: MediaFile = {
                id: `media-${Date.now()}-${Math.random()}`,
                file,
                url,
                isVertical,
                type: 'image'
              };
              mediaFilesToProcess.push(mediaFile);
              resolve(void 0);
            };
            img.src = url;
          });
        }
      } else {
        toast({
          title: "Invalid file type",
          description: "Only image and video files are allowed.",
          variant: "destructive"
        });
        return;
      }

      if (mediaFilesToProcess.length > 0) {
        await handleUploadMedia(mediaFilesToProcess);

        // Clean up blob URLs after successful upload
        mediaFilesToProcess.forEach(mediaFile => {
          URL.revokeObjectURL(mediaFile.url);
        });
      }
    } catch (error) {
      console.error('Error processing direct file drop:', error);
      toast({
        title: "Upload Failed",
        description: "Failed to upload images. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleDirectDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const handleUploadMedia = async (newMediaFiles: MediaFile[]) => {
    if (!currentUser?.uid || !clientId || !postId) {
      toast({
        title: "Upload Failed",
        description: "Missing required information for upload.",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsUploadingMedia(true); // Start loading

      const isEditing = editingMedia && editingMedia.length > 0;
      const uploadHasVideo = newMediaFiles.some(f => f.type === 'video');
      const uploadHasImages = newMediaFiles.some(f => f.type === 'image');

      if (uploadHasVideo && uploadHasImages) {
        toast({
          title: "Mixed media not allowed",
          description: "You can upload either 1 video OR up to 14 images, not both.",
          variant: "destructive"
        });
        return;
      }

      if (uploadHasVideo) {
        // Handle video upload (single video)
        const videoFile = newMediaFiles.find(f => f.type === 'video');
        if (!videoFile) return;

        if (videoFile.url.startsWith('blob:')) {
          // Upload new video to Firebase Storage (directly to video field, not images array)
          const uploadedVideoUrl = await uploadPostVideo(currentUser.uid, clientId, postId, videoFile.file);

          // Update local state with Firebase URL
          const updatedVideoFile: MediaFile = {
            ...videoFile,
            url: uploadedVideoUrl
          };
          setMediaFiles([updatedVideoFile]);
        } else {
          // Video already uploaded, just update state
          setMediaFiles([videoFile]);
        }
      } else {
        // Handle image upload (multiple images)
        // Extract File objects from MediaFile objects that have blob URLs (new files)
        const filesToUpload = newMediaFiles.filter(mediaFile =>
          mediaFile.url.startsWith('blob:') && mediaFile.type === 'image'
        ).map(mediaFile => mediaFile.file);

        // Get already uploaded files (Firebase URLs)  
        const existingUrls = newMediaFiles.filter(mediaFile =>
          !mediaFile.url.startsWith('blob:') && mediaFile.type === 'image'
        ).map(mediaFile => mediaFile.url);

        let uploadedUrls: string[] = [];

        // Upload new files if any
        if (filesToUpload.length > 0) {
          uploadedUrls = await uploadPostImages(currentUser.uid, clientId, postId, filesToUpload, false);
        }

        // Combine existing URLs with newly uploaded URLs
        const allUrls = [...existingUrls, ...uploadedUrls];

        // If we're editing, update all images at once
        if (isEditing) {
          await updatePostImages(currentUser.uid, clientId, postId, allUrls);
        }

        // Update local state with MediaFile objects that have Firebase URLs
        const updatedMediaFiles: MediaFile[] = [];
        let uploadIndex = 0;

        newMediaFiles.forEach((mediaFile) => {
          if (mediaFile.url.startsWith('blob:')) {
            // This was a new file that got uploaded
            updatedMediaFiles.push({
              ...mediaFile,
              url: uploadedUrls[uploadIndex]
            });
            uploadIndex++;
          } else {
            // This was already a Firebase URL
            updatedMediaFiles.push(mediaFile);
          }
        });

        setMediaFiles(updatedMediaFiles);
      }

      // Clear poll when adding media and remove from Firebase if it exists
      if (pollData) {
        try {
          await removePostPoll(currentUser.uid, clientId, postId);
        } catch (error) {
          console.error('Error removing poll when adding media:', error);
        }
      }
      setPollData(null);
      setEditingMedia(null); // Clear editing state

      // Notify parent about poll state change when clearing poll
      if (onPollStateChange) {
        onPollStateChange(false);
      }

      const successHasVideo = newMediaFiles.some(f => f.type === 'video');

      toast({
        title: isEditing ? "Media Updated" : "Media Uploaded",
        description: successHasVideo
          ? "Video uploaded successfully."
          : `${newMediaFiles.length} image${newMediaFiles.length > 1 ? 's' : ''} ${isEditing ? 'updated' : 'uploaded'} successfully.`
      });
    } catch (error) {
      console.error('Error uploading media:', error);
      toast({
        title: "Upload Failed",
        description: newMediaFiles.some(f => f.type === 'video') ? "Failed to upload video. Please try again." : "Failed to upload images. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsUploadingMedia(false); // End loading
    }
  };

  const handleEditMedia = () => {
    if (mediaFiles.length > 0) {
      setEditingMedia(mediaFiles);
      setShowMediaUploadModal(true);
    }
  };

  const handleRemoveMedia = async () => {
    if (!currentUser?.uid || !clientId || !postId) {
      toast({
        title: "Remove Failed",
        description: "Missing required information for removal.",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsRemovingMedia(true); // Start loading

      const hasVideo = mediaFiles.some(f => f.type === 'video');
      const hasImages = mediaFiles.some(f => f.type === 'image');

      // Remove video if exists
      if (hasVideo) {
        await updatePostVideo(currentUser.uid, clientId, postId, undefined); // This will delete the video field
      }

      // Remove images if exists
      if (hasImages) {
        await removeAllPostImages(currentUser.uid, clientId, postId);
      }

      // Cleanup local blob URLs (if any)
      mediaFiles.forEach(file => {
        if (file.url.startsWith('blob:')) {
          URL.revokeObjectURL(file.url);
        }
      });

      setMediaFiles([]);
      setEditingMedia(null);

      toast({
        title: "Media Removed",
        description: "All media has been removed from your post."
      });
    } catch (error) {
      console.error('Error removing media:', error);
      toast({
        title: "Remove Failed",
        description: "Failed to remove media. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsRemovingMedia(false); // End loading
    }
  };

  const handleOpenMediaModal = () => {
    // If no media exists, directly open file picker
    if (mediaFiles.length === 0) {
      document.getElementById('direct-file-upload')?.click();
    } else {
      // If media exists, open the modal for editing
      setEditingMedia(mediaFiles);
      setShowMediaUploadModal(true);
    }
  };

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== currentContent) {
      editorRef.current.innerHTML = currentContent;
      // Update metrics when content changes
      const metrics = calculateContentMetrics(currentContent);
      setCharCount(metrics.charCount);
      setLineCount(metrics.lineCount);
      setShowTruncation(metrics.charCount > 200 || metrics.lineCount > 3);
    }
  }, [currentContent, viewMode]);

  useEffect(() => {
    setOriginalPost(generatedPost);
  }, []);

  useEffect(() => {
    const handleClickOutside = () => {
      const selection = window.getSelection();
      if (!selection || selection.toString().length === 0) {
        setToolbarVisible(false);
        setAiEditToolbarVisible(false);
        // Don't close modal on outside click - let the modal handle its own closing
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  useEffect(() => {
    setHasMedia(mediaFiles.length > 0);
  }, [mediaFiles]);

  // Initialize media files from post data
  useEffect(() => {
    const hasPostImages = post?.images && post.images.length > 0;
    const hasPostVideo = post?.video && post.video.length > 0;

    console.log('📊 Media initialization:', {
      hasPostImages,
      hasPostVideo,
      'post?.images': post?.images,
      'post?.video': post?.video,
      'current mediaFiles': mediaFiles.map(f => ({ url: f.url, type: f.type }))
    });

    // Create arrays of current URLs to compare
    const currentVideoUrl = mediaFiles.find(f => f.type === 'video')?.url;
    const currentImageUrls = mediaFiles.filter(f => f.type === 'image').map(f => f.url);

    // Check if media has changed
    const videoChanged = (hasPostVideo && currentVideoUrl !== post.video) || (!hasPostVideo && currentVideoUrl);
    const imagesChanged = hasPostImages && (JSON.stringify(currentImageUrls) !== JSON.stringify(post.images));

    console.log('🔄 Change detection:', { videoChanged, imagesChanged });

    if (videoChanged || imagesChanged || (!hasPostImages && !hasPostVideo && mediaFiles.length > 0)) {
      console.log('🚀 Starting media load...');
      setIsLoadingInitialImages(true);

      const loadPromises: Promise<MediaFile>[] = [];

      // Load video if exists
      if (hasPostVideo) {
        const videoPromise = new Promise<MediaFile>((resolve) => {
          const video = document.createElement('video');
          video.onloadedmetadata = () => {
            const isVertical = video.videoHeight > video.videoWidth;
            resolve({
              id: `loaded-video-${Date.now()}`,
              file: new File([], 'video', { type: 'video/mp4' }), // Placeholder file
              url: post.video!,
              isVertical: isVertical,
              type: 'video',
              duration: video.duration
            });
          };
          video.onerror = () => {
            // If video fails to load, still create a MediaFile object with defaults
            resolve({
              id: `loaded-video-${Date.now()}`,
              file: new File([], 'video', { type: 'video/mp4' }),
              url: post.video!,
              isVertical: false,
              type: 'video'
            });
          };
          video.src = post.video!;
        });
        loadPromises.push(videoPromise);
      }

      // Load images if exists
      if (hasPostImages) {
        const imagePromises = post.images.map((url, index) => {
          return new Promise<MediaFile>((resolve) => {
            const img = new Image();
            img.onload = () => {
              const isVertical = img.height > img.width;
              resolve({
                id: `loaded-image-${index}-${Date.now()}`,
                file: new File([], `image-${index}`, { type: 'image/jpeg' }), // Placeholder file
                url: url,
                isVertical: isVertical,
                type: 'image'
              });
            };
            img.onerror = () => {
              // If image fails to load, still create a MediaFile object with default orientation
              resolve({
                id: `loaded-image-${index}-${Date.now()}`,
                file: new File([], `image-${index}`, { type: 'image/jpeg' }),
                url: url,
                isVertical: false, // Default to horizontal if load fails
                type: 'image'
              });
            };
            img.src = url;
          });
        });
        loadPromises.push(...imagePromises);
      }

      // Wait for all media to load or fail
      if (loadPromises.length > 0) {
        Promise.all(loadPromises).then((loadedMediaFiles) => {
          setMediaFiles(loadedMediaFiles);
          setIsLoadingInitialImages(false);
        });
      } else {
        // No media to load, clear state
        setMediaFiles([]);
        setIsLoadingInitialImages(false);
      }
    }
  }, [post?.images, post?.video, mediaFiles, isLoadingInitialImages]);

  // Initialize poll data from post data
  useEffect(() => {
    if (post?.poll) {
      setPollData(post.poll);
    } else {
      setPollData(null);
    }
  }, [post?.poll]);

  // Get the dynamic width class based on view mode (matching EditorContainer)
  const maxWidthClass = viewMode === 'mobile' ? 'max-w-[320px]' : 'max-w-[552px]';

  return (
    <div className="space-y-6">
      <FloatingToolbar position={toolbarPosition} onFormat={handleFormat} onAIEdit={handleAIEdit} visible={toolbarVisible} onComment={handleCommentRequest} />

      <AIEditToolbar position={toolbarPosition} visible={aiEditToolbarVisible} selectedText={selectedText} onClose={handleAIEditClose} onApplyEdit={handleAIEditApply} />

      <AIEditModal
        open={aiEditModalVisible}
        onOpenChange={handleAIEditModalClose}
        selectedText={selectedText}
        onApplyEdit={handleAIEditModalApply}
        isLoading={aiEditLoading}
      />

      <CommentPopover
        visible={commentPopover.visible}
        position={commentPopover}
        onSave={handleSaveComment}
        onCancel={() => {
          setCommentPopover({ visible: false, top: 0, left: 0 });
          lastSelection.current = null;
        }}
      />

      <PostPreviewModal
        open={showPreviewModal}
        onOpenChange={setShowPreviewModal}
        postContent={currentContent}
        pollData={pollData}
        mediaFiles={mediaFiles}
        profileData={post ? {
          id: getProfileId(post),
          role: getProfileRole(post),
          imageUrl: getProfileImageUrl(post)
        } : undefined}
      />

      <SchedulePostModal
        open={showScheduleModal}
        onOpenChange={setShowScheduleModal}
        postContent={currentContent}
        onSchedule={handleSchedule}
      />

      <PostNowModal
        open={showPostNowModal}
        onOpenChange={setShowPostNowModal}
        postContent={currentContent}
        onPost={handlePostNow}
        clientId={clientId}
        postId={postId}
        subClientId={subClientId}
      />

      <VersionHistoryModal
        open={showVersionHistoryModal}
        onOpenChange={setShowVersionHistoryModal}
        versions={versionHistory.map(v => ({
          id: v.id,
          content: v.text,
          createdAt: v.createdAt,
          title: `Version ${v.version} - ${v.createdAt.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric'
          })} at ${v.createdAt.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
          })}`
        }))}
        onRestore={handleRestoreVersion}
        profileData={post ? {
          id: getProfileId(post),
          role: getProfileRole(post),
          imageUrl: getProfileImageUrl(post),
          profileName: getProfileName(post)
        } : undefined}
      />

      <CreatePollModal
        open={showCreatePollModal}
        onOpenChange={(open) => {
          setShowCreatePollModal(open);
          if (!open) {
            setEditingPoll(null);
          }
        }}
        onCreatePoll={handleAddPoll}
        editingPoll={editingPoll}
      />

      <MediaUploadModal
        open={showMediaUploadModal}
        onOpenChange={(open) => {
          setShowMediaUploadModal(open);
          if (!open) {
            setEditingMedia(null);
          }
        }}
        onUploadMedia={handleUploadMedia}
        editingMedia={editingMedia || undefined}
      />

      <div
        className="bg-white rounded-lg border relative"
        onMouseEnter={handleEditorMouseEnter}
        onMouseLeave={handleEditorMouseLeave}
      >
        <PostEditorDisabledOverlay
          visible={showDisabledOverlay && isPosted}
          onDuplicate={handleDuplicatePost}
          onNavigate={handleNavigateToPost}
        // onClose={() => setShowDisabledOverlay(false)}
        />

        <EditorToolbar
          onFormat={handleFormat}
          onInsertEmoji={insertEmoji}
          onPreview={handlePreview}
          onShowComments={handleShowComments}
          onCopy={handleCopyWithFormatting}
          onSchedule={() => setShowScheduleModal(true)}
          onPostNow={() => setShowPostNowModal(true)}
          onUndo={undo}
          onRedo={redo}
          onShowVersionHistory={() => setShowVersionHistoryModal(true)}
          canUndo={canUndo}
          canRedo={canRedo}
          viewMode={viewMode}
          onViewModeToggle={handleViewModeToggle}
          showCommentsPanel={showCommentsPanel}
          postContent={currentContent}
          onAddPoll={handleAddPoll}
          hasPoll={!!pollData}
          hasMedia={hasMedia}
          onAddMedia={handleOpenMediaModal}
          postStatus={postStatus}
          scheduledPostAt={scheduledPostAt}
          postedAt={postedAt}
          linkedinPostUrl={linkedinPostUrl}
          clientId={clientId}
          postId={postId}
          subClientId={subClientId}
          mediaFiles={mediaFiles}
          pollData={pollData}
        />

        <div className="pb-4 bg-gray-50">
          <EditorContainer
            editorRef={editorRef}
            generatedPost={currentContent}
            onInput={handleInput}
            onMouseUp={handleTextSelection}
            onKeyUp={handleTextSelection}
            onKeyDown={handleKeyDown}
            charCount={charCount}
            lineCount={lineCount}
            showTruncation={showTruncation}
            cutoffLineTop={cutoffLineTop}
            viewMode={viewMode}
          />

          {/* Fixed: Media/Poll area with correct width matching text editor */}
          {mediaFiles.length === 0 && !pollData && (
            <div className={`${maxWidthClass} mx-auto mt-0`}>
              <div
                className="p-6 bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg text-center cursor-pointer transition-colors hover:bg-gray-100 hover:border-gray-400"
                onDrop={handleDirectFileDrop}
                onDragOver={handleDirectDragOver}
                onClick={() => document.getElementById('direct-file-upload')?.click()}
                onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && document.getElementById('direct-file-upload')?.click()}
                tabIndex={0}
                role="button"
                aria-label="Upload media"
              >
                <div className="flex flex-col items-center justify-center">
                  <svg className="h-8 w-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <p className="text-sm text-gray-600">Add images or video to your post</p>
                  <p className="text-xs text-gray-500 mt-1">Upload up to 14 images or 1 video</p>
                </div>
                <input
                  type="file"
                  multiple
                  accept="image/*,video/*"
                  onChange={handleDirectFileUpload}
                  className="hidden"
                  id="direct-file-upload"
                />
              </div>
            </div>
          )}

          {/* Initial image loading indicator when no media is shown yet */}
          {isLoadingInitialImages && mediaFiles.length === 0 && post?.images && post.images.length > 0 && (
            <div className={`${maxWidthClass} mx-auto mt-4`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Loading images...</span>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    disabled
                  >
                    <Loader2 className="h-3 w-3 animate-spin" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    disabled
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              <div className="border rounded-lg bg-gray-50 h-64 relative">
                <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10">
                  <div className="flex flex-col items-center gap-2">
                    <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                    <span className="text-sm text-gray-600">Loading images...</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Upload loading indicator when no media is shown yet */}
          {isUploadingMedia && mediaFiles.length === 0 && (
            <div className={`${maxWidthClass} mx-auto mt-4`}>
              <div className="border rounded-lg bg-gray-50 p-8 text-center">
                <div className="flex flex-col items-center gap-2">
                  <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                  <span className="text-sm text-gray-600">Uploading media...</span>
                </div>
              </div>
            </div>
          )}

          {mediaFiles.length > 0 && (
            <MediaPreview
              mediaFiles={mediaFiles}
              onRemove={handleRemoveMedia}
              onEdit={handleEditMedia}
              viewMode={viewMode}
              isUploading={isUploadingMedia}
              isRemoving={isRemovingMedia}
              isLoadingInitial={isLoadingInitialImages}
            />
          )}

          {pollData && (
            <PollPreview
              pollData={pollData}
              onRemove={handleRemovePoll}
              onEdit={handleEditPoll}
              viewMode={viewMode}
              isUpdating={isUpdatingPoll}
              isRemoving={isRemovingPoll}
            />
          )}
        </div>

        <EditingInstructions
          showChatBox={showChatBox}
          onToggleChatBox={() => setShowChatBox(!showChatBox)}
          editingInstructions={editingInstructions}
          onEditingInstructionsChange={onEditingInstructionsChange}
          onRegeneratePost={handleRegeneratePost}
          onRegenerateWithInstructions={onRegenerateWithInstructions}
          isLoading={isRegeneratingWithInstructions}
          isRegeneratingPost={isRegeneratingPost}
        />
      </div>

      <style>
        {`
          mark[data-comment-id] {
            background-color: rgba(186, 230, 253, 0.7);
            cursor: pointer;
            transition: background-color 0.2s;
          }
          mark[data-comment-id]:hover {
            background-color: rgba(147, 216, 253, 0.9);
          }
          @media (max-width: 600px) {
            .linkedin-safe {
              max-width: 100% !important;
            }
          }
        `}
      </style>
    </div>
  );
});

GeneratedPostEditor.displayName = 'GeneratedPostEditor';

export default GeneratedPostEditor;
