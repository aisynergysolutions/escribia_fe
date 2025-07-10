import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams, Link } from 'react-router-dom';
import IdeaHeader from '../components/idea/IdeaHeader';
// import PostEditor from '../components/idea/PostEditor';
import IdeaForm from '../components/idea/IdeaForm';
import CommentsPanel, { CommentThread } from '../components/idea/CommentsPanel';
import SubClientDisplayCard from '../components/idea/SubClientDisplayCard';
import OptionsCard from '@/components/idea/OptionsCard';
import HooksSection from '@/components/idea/HooksSection';
import { usePostDetails } from '@/context/PostDetailsContext';
import PostEditor from '@/components/idea/PostEditor';

const PostDetails = () => {
  const { clientId, postId } = useParams<{ clientId: string; postId: string }>();

  // Use the context
  const { post, loading, error, fetchPost } = usePostDetails();

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

  // Get hooks from context or use mock data
  const hooks = post?.generatedHooks || [];

  // Get version history from context - sort by version to ensure correct order
  const versionHistory = post?.drafts
    ?.sort((a, b) => a.version - b.version) // Sort by version number ascending
    ?.map(draft => ({
      id: `v${draft.version}`,
      version: draft.version,
      text: draft.text,
      createdAt: new Date(draft.createdAt),
      generatedByAI: draft.generatedByAI,
      notes: draft.notes
    })) || [];
    console.log('Version History:', versionHistory);

  // Get the latest draft text for the PostEditor
  const getLatestDraftText = () => {
    if (!post?.drafts || post.drafts.length === 0) {
      return '';
    }

    // Find the draft with the highest version number
    const latestDraft = post.drafts.reduce((latest, current) =>
      current.version > latest.version ? current : latest
    );

    return latestDraft.text;
  };

  const latestDraftText = getLatestDraftText();

  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading post details...</div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-500">Error loading post: {error}</div>
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

  const handleSendToAI = () => {
    console.log('Send to AI clicked');
  };

  const handleAddCustomObjective = (customObjective: string) => {
    setObjective(customObjective);
  };

  const handleAddCustomStatus = (customStatus: string) => {
    setStatus(customStatus);
  };

  const handleHookSelect = (index: number) => {
    setSelectedHookIndex(index);
  };

  const handleRegenerateHooks = () => {
    console.log('Regenerating hooks...');
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
  }

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
            postData={{
              // generatedPost: latestDraftText, // Use the latest draft text
              generatedPost: post?.drafts?.[post.drafts.length - 1]?.text || '',
              editingInstructions: '',
              hasUnsavedChanges: false
            }}
            postHandlers={{
              onGeneratedPostChange: undefined,
              onEditingInstructionsChange: undefined,
              onCopyText: undefined,
              onRegenerateWithInstructions: undefined,
              onSave: undefined,
              onUnsavedChangesChange: () => { }
            }}
            versionHistory={versionHistory} // Use the sorted version history
            onRestoreVersion={undefined}
            onToggleCommentsPanel={() => setShowCommentsPanel(p => !p)}
            comments={comments}
            setComments={setComments}
            onPollStateChange={handlePollStateChange}
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
                  profileImage: undefined
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
              />

              <HooksSection
                hooks={hooks}
                selectedHookIndex={selectedHookIndex}
                onHookSelect={handleHookSelect}
                onRegenerateHooks={handleRegenerateHooks}
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
    </div>
  );
};

export default PostDetails;
