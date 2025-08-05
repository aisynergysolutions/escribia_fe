import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useSearchParams, Link } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import IdeaHeader from '../components/idea/IdeaHeader';
import PostEditor, { PostEditorRef } from '../components/idea/PostEditor';
import IdeaForm from '../components/idea/IdeaForm';
import CommentsPanel, { CommentThread } from '../components/idea/CommentsPanel';
import SubClientDisplayCard from '../components/idea/SubClientDisplayCard';
import OptionsCard from '@/components/idea/OptionsCard';
import HooksSection from '@/components/idea/HooksSection';
import { usePostEditor } from '../hooks/usePostEditor';
import { usePostDetails } from '@/context/PostDetailsContext';
import { usePosts } from '@/context/PostsContext';
import { useAuth } from '@/context/AuthContext';
import PostDetailsSkeleton from '../skeletons/PostDetailsSkeleton';

const PostDetails = () => {
  const { clientId, postId } = useParams<{ clientId: string; postId: string }>();
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  // Get the agency ID from the current user
  const agencyId = currentUser?.uid;

  // Use the context - add the new functions
  const {
    post,
    loading,
    error,
    fetchPost,
    saveNewDraft,
    generatePostHooks,
    applyHook,
    editPostWithInstructions,
    updateInitialIdea,
    regeneratePostFromIdea
  } = usePostDetails();

  // Add PostsContext for delete functionality
  const { deletePost } = usePosts();

  // Basic form state
  const [title, setTitle] = useState('');
  const [initialIdea, setInitialIdea] = useState('');
  const [objective, setObjective] = useState('');
  const [template, setTemplate] = useState('none');
  const [status, setStatus] = useState('Idea');
  const [formInternalNotes, setFormInternalNotes] = useState('');

  // UI State
  const [selectedHookIndex, setSelectedHookIndex] = useState(-1);
  const [useAsTrainingData, setUseAsTrainingData] = useState(false);
  const [isIdeaExpanded, setIsIdeaExpanded] = useState(false);
  const [showCommentsPanel, setShowCommentsPanel] = useState(false);
  const [comments, setComments] = useState<CommentThread[]>([]);
  const [hasPoll, setHasPoll] = useState(false);
  const [internalNotes, setInternalNotes] = useState('');
  const [isRegeneratingPost, setIsRegeneratingPost] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Ref to access PostEditor methods
  const postEditorRef = useRef<PostEditorRef>(null);

  // Fetch post data when component mounts
  useEffect(() => {
    if (clientId && postId) {
      fetchPost(clientId, postId);
    }
  }, [clientId, postId, fetchPost]);

  // Update form state when post data is loaded
  useEffect(() => {
    if (post) {
      setTitle(post.title || '');
      setInitialIdea(post.initialIdea.initialIdeaPrompt || '');
      setObjective(post.initialIdea.objective || '');
      setTemplate(post.initialIdea.templateUsedId || 'none');
      setStatus(post.status || 'Idea');
      setFormInternalNotes(post.internalNotes || '');
      setUseAsTrainingData(post.trainAI || false);
      setInternalNotes(post.internalNotes || '');
    }
  }, [post]);

  const handleSavePost = async (newText: string) => {
    if (!agencyId) {
      console.error('No agency ID available for saving post');
      return;
    }

    if (clientId && postId) {
      await saveNewDraft(agencyId, clientId, postId, newText, 'Manual save', false);
    }
  };

  const handleSaveAIPost = async (newText: string) => {
    if (!agencyId) {
      console.error('No agency ID available for saving AI post');
      return;
    }

    if (clientId && postId) {
      await saveNewDraft(agencyId, clientId, postId, newText, 'AI-generated content', true);
    }
  };

  const handleEditWithInstructions = async (instructions: string) => {
    if (!agencyId) {
      console.error('No agency ID available for editing with instructions');
      return;
    }

    if (clientId && postId && post?.profile.profileId && instructions.trim()) {
      const currentPostContent = post?.drafts?.[post.drafts.length - 1]?.text || '';

      const editedContent = await editPostWithInstructions(
        clientId,
        postId,
        post.profile.profileId,
        currentPostContent,
        instructions
      );

      if (editedContent) {
        // Save the edited content as a new draft first
        await handleSaveAIPost(editedContent);

        // Update the editor content silently without triggering auto-save
        postEditorRef.current?.updateContent(editedContent);
      }
    }
  };

  const postEditor = usePostEditor({
    initialText: post?.drafts?.length
      ? post.drafts[post.drafts.length - 1].text // Use last draft's text
      : '',
    onSave: handleSavePost,
    onSaveAI: handleSaveAIPost,
    onEditWithInstructions: handleEditWithInstructions
  });

  // Get hooks from context or use mock data
  const hooks = post?.generatedHooks || [];

  // Get version history from context - sort by version to ensure correct order
  const versionHistory = post?.drafts
    ?.sort((a, b) => a.version - b.version) // Sort by version number ascending
    ?.map(draft => ({
      id: `v${draft.version}`,
      version: draft.version,
      text: draft.text,
      createdAt: draft.createdAt.toDate(), // Convert Firestore Timestamp to Date
      generatedByAI: draft.generatedByAI,
      notes: draft.notes
    })) || [];

  // Show authentication error if no agency ID
  if (!agencyId) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <div className="flex items-center justify-center gap-2 text-red-600 mb-2">
            <AlertCircle className="h-5 w-5" />
            <h3 className="font-semibold">Authentication Required</h3>
          </div>
          <p className="text-red-600 text-sm">
            No agency ID available. Please ensure you are signed in to view post details.
          </p>
        </div>
      </div>
    );
  }

  // Show loading state
  if (loading) {
    return <PostDetailsSkeleton />;
  }

  // Show error state
  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <div className="flex items-center justify-center gap-2 text-red-600 mb-2">
            <AlertCircle className="h-5 w-5" />
            <h3 className="font-semibold">Post Not Found</h3>
          </div>
          <p className="text-red-600 text-sm">
            The post could not be retrieved. It may have been deleted or is no longer available.
          </p>
          <div className="mt-4 flex flex-row gap-2 justify-center items-center">
            {clientId && (
              <>
                <Link to={`/clients/${clientId}/posts`}>
                  <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">
                    Go back to posts list
                  </button>
                </Link>
                <Link to={`/clients/${clientId}/calendar`}>
                  <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">
                    Go to calendar
                  </button>
                </Link>
              </>
            )}
            {!clientId && (
              <Link to="/clients">
                <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">
                  Go back to clients
                </button>
              </Link>
            )}
          </div>
        </div>
      </div>
    );
  }

  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle);
  };

  const handleInitialIdeaChange = (newInitialIdea: string) => {
    setInitialIdea(newInitialIdea);
  };

  const handleFormSave = () => {
    console.log('Saving idea:', {
      title,
      initialIdea,
      objective,
      status
    });
  };

  const handleSendToAI = async () => {
    if (!agencyId) {
      console.error('No agency ID available for regenerating post');
      return;
    }

    if (!clientId || !postId || !post?.profile.profileId) {
      console.error('Missing required data for regeneration');
      return;
    }

    try {
      setIsRegeneratingPost(true);

      // Step 1: Update the initial idea and objective in Firestore
      console.log('Updating initial idea and objective...');
      await updateInitialIdea(agencyId, clientId, postId, initialIdea, objective);

      // Step 2: Regenerate the post content using the Railway API
      console.log('Regenerating post content...');
      const newPostContent = await regeneratePostFromIdea(
        agencyId,
        clientId,
        postId,
        post.profile.profileId,
        initialIdea,
        objective
      );

      if (newPostContent) {
        // Step 3: Save the new content as a draft
        await handleSaveAIPost(newPostContent);

        // Step 4: Update the editor content
        postEditorRef.current?.updateContent(newPostContent);

        console.log('Post regenerated successfully');
      } else {
        console.error('Failed to regenerate post content');
      }
    } catch (error) {
      console.error('Error during post regeneration:', error);
    } finally {
      setIsRegeneratingPost(false);
    }
  };

  const handleAddCustomObjective = (customObjective: string) => {
    setObjective(customObjective);
  };

  const handleAddCustomStatus = (customStatus: string) => {
    setStatus(customStatus);
  };

  const handleHookSelect = async (index: number) => {
    if (!agencyId) {
      console.error('No agency ID available for applying hook');
      return;
    }

    if (clientId && postId && post?.profile.profileId) {
      const selectedHook = hooks[index];
      const currentPostContent = post?.drafts?.[post.drafts.length - 1]?.text || '';

      const newPostContent = await applyHook(
        clientId,
        postId,
        post.profile.profileId,
        currentPostContent,
        selectedHook.text
      );

      if (newPostContent) {
        // Save the new content as a draft first
        await handleSaveAIPost(newPostContent);

        // Update the editor content silently without triggering auto-save
        postEditorRef.current?.updateContent(newPostContent);

        // Update the selected hook index
        setSelectedHookIndex(index);
      }
    }
  };

  const handleRestoreVersion = async (versionId: string) => {
    if (!agencyId) {
      console.error('No agency ID available for restoring version');
      return;
    }

    if (clientId && postId) {
      // Find the version by ID
      const version = versionHistory.find(v => v.id === versionId);
      if (version) {
        // Save the restored content as a new draft first
        await handleSavePost(version.text);

        // Update the editor content silently without triggering auto-save
        postEditorRef.current?.updateContent(version.text);
      }
    }
  };

  const handleRegenerateHooks = async () => {
    if (!agencyId) {
      console.error('No agency ID available for regenerating hooks');
      return;
    }

    if (clientId && postId && post?.profile.profileId) {
      await generatePostHooks(clientId, postId, post.profile.profileId);
    }
  };

  const handleGenerateInitialHooks = async () => {
    if (!agencyId) {
      console.error('No agency ID available for generating initial hooks');
      return;
    }

    if (clientId && postId && post?.profile.profileId) {
      await generatePostHooks(clientId, postId, post.profile.profileId);
    }
  };

  const handleAddReply = (threadId: string, replyText: string) => {
    setComments(prev => prev.map(thread => {
      if (thread.id === threadId) {
        return {
          ...thread,
          replies: [...thread.replies, { id: `reply-${Date.now()}`, author: 'You', text: replyText, createdAt: new Date() }]
        };
      }
      return thread;
    }));
  };

  const handleResolve = (threadId: string) => {
    setComments(prev => prev.map(thread =>
      thread.id === threadId ? { ...thread, resolved: true } : thread
    ));
  };

  const handlePollStateChange = (pollActive: boolean) => {
    setHasPoll(pollActive);
  };

  const handleAddToQueue = () => {
    console.log('Adding post to queue...');
  };

  const handleDeletePost = async () => {
    if (!agencyId) {
      console.error('No agency ID available for deleting post');
      return;
    }

    if (!clientId || !postId) return;

    // Show confirmation dialog
    const confirmed = window.confirm('Are you sure you want to delete this post? This action cannot be undone.');

    if (!confirmed) return;

    try {
      setIsDeleting(true);

      // Delete the post using the context function
      await deletePost(agencyId, clientId, postId);

      // Navigate back to posts list
      navigate(`/clients/${clientId}/posts`);
    } catch (error) {
      console.error('Error deleting post:', error);
      alert('Failed to delete post. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-4">
      <IdeaHeader
        clientId={clientId!}
        title={title}
        onTitleChange={handleTitleChange}
        onSave={handleFormSave}
        status={status}
        onStatusChange={setStatus}
        onAddCustomStatus={handleAddCustomStatus}
        onAddToQueue={handleAddToQueue}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <PostEditor
            ref={postEditorRef}
            postData={{
              generatedPost: post?.drafts?.[post.drafts.length - 1]?.text || '',
              editingInstructions: postEditor.editingInstructions,
              hasUnsavedChanges: postEditor.hasUnsavedChanges
            }}
            postHandlers={{
              onGeneratedPostChange: postEditor.handlePostChange,
              onEditingInstructionsChange: postEditor.setEditingInstructions,
              onCopyText: postEditor.handleCopyText,
              onRegenerateWithInstructions: postEditor.handleRegenerateWithInstructions,
              onSave: postEditor.handleSave,
              onUnsavedChangesChange: () => { }
            }}
            versionHistory={versionHistory}
            onRestoreVersion={handleRestoreVersion}
            onToggleCommentsPanel={() => setShowCommentsPanel(p => !p)}
            comments={comments}
            setComments={setComments}
            onPollStateChange={handlePollStateChange}
            isRegeneratingWithInstructions={postEditor.isSaving}
            clientId={clientId}
            postId={postId}
            subClientId={post?.profile.profileId}
            onSaveAI={handleSaveAIPost}
            postStatus={post?.status}
            scheduledPostAt={post?.scheduledPostAt}
            postedAt={post?.postedAt}
            linkedinPostUrl={post?.linkedinPostUrl}
          />
        </div>

        <div className="space-y-6">
          {showCommentsPanel ? (
            <CommentsPanel comments={comments} onAddReply={handleAddReply} onResolve={handleResolve} />
          ) : (
            <>
              <SubClientDisplayCard
                subClient={{
                  name: post?.profile.profileName || 'No Profile',
                  role: post?.profile.profileRole || '',
                  profileImage: post?.profile.imageUrl || undefined
                }}
              />
              <IdeaForm
                formData={{
                  initialIdea,
                  objective,
                  template,
                  internalNotes: formInternalNotes
                }}
                setters={{
                  setInitialIdea: handleInitialIdeaChange,
                  setObjective,
                  setTemplate,
                  setInternalNotes: setFormInternalNotes
                }}
                options={{
                  useAsTrainingData,
                  onUseAsTrainingDataChange: setUseAsTrainingData
                }}
                isExpanded={isIdeaExpanded}
                onExpandChange={setIsIdeaExpanded}
                onSendToAI={handleSendToAI}
                onAddCustomObjective={handleAddCustomObjective}
                isRegeneratingPost={isRegeneratingPost}
              />

              <HooksSection
                hooks={hooks}
                selectedHookIndex={selectedHookIndex}
                onHookSelect={handleHookSelect}
                onRegenerateHooks={handleRegenerateHooks}
                onGenerateInitialHooks={handleGenerateInitialHooks}
                isInitialLoad={!loading && !!post}
              />

              <OptionsCard
                useAsTrainingData={useAsTrainingData}
                onUseAsTrainingDataChange={setUseAsTrainingData}
                internalNotes={internalNotes}
                onInternalNotesChange={setInternalNotes}
              />
            </>
          )}
        </div>
      </div>

      {/* Delete Post Button */}
      <div className="flex justify-center pt-8 border-t border-gray-200">
        <button
          onClick={handleDeletePost}
          disabled={isDeleting}
          className="px-6 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white rounded-lg transition-colors duration-200 flex items-center gap-2"
        >
          {isDeleting ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Deleting...
            </>
          ) : (
            'Delete Post'
          )}
        </button>
      </div>
    </div>
  );
};

export default PostDetails;
