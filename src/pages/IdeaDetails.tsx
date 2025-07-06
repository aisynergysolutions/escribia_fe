import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams, Link } from 'react-router-dom';
// Remove mockIdeas import, keep mockClients for now
import { mockClients } from '../types';
import IdeaHeader from '../components/idea/IdeaHeader';
import PostEditor from '../components/idea/PostEditor';
import IdeaForm from '../components/idea/IdeaForm';
import UnsavedChangesDialog from '../components/idea/UnsavedChangesDialog';
import TimeslotDefinitionModal from '../components/ui/TimeslotDefinitionModal';
import { useIdeaForm } from '../hooks/useIdeaForm';
import { usePostEditor } from '../hooks/usePostEditor';
import CommentsPanel, { CommentThread } from '../components/idea/CommentsPanel';
import SubClientDisplayCard from '../components/idea/SubClientDisplayCard';
import { usePosts } from '@/context/PostsContext'; // <-- Import PostsContext

const IdeaDetails = () => {
  const { clientId, ideaId } = useParams<{ clientId: string; ideaId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const isNewPost = searchParams.get('new') === 'true';

  // NEW: Use PostsContext for post details
  const agencyId = 'agency1'; // TODO: Replace with real agencyId logic as needed
  const { getPostDetails, postDetails, postDetailsLoading, postDetailsError } = usePosts();

  // Fetch post details when ideaId/clientId/agencyId changes and not a new post
  useEffect(() => {
    if (!isNewPost && agencyId && clientId && ideaId) {
      getPostDetails(agencyId, clientId, ideaId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [agencyId, clientId, ideaId, isNewPost]);

  const [selectedHookIndex, setSelectedHookIndex] = useState(-1);
  const [useAsTrainingData, setUseAsTrainingData] = useState(false);
  const [isIdeaExpanded, setIsIdeaExpanded] = useState(false);
  const [showUnsavedDialog, setShowUnsavedDialog] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<string | null>(null);
  const [showCommentsPanel, setShowCommentsPanel] = useState(false);
  const [comments, setComments] = useState<CommentThread[]>([]);
  const [hasPoll, setHasPoll] = useState(false);
  const [showTimeslotModal, setShowTimeslotModal] = useState(false);
  const [predefinedTimeSlots, setPredefinedTimeSlots] = useState<string[]>([]);
  const [activeDays, setActiveDays] = useState<string[]>([]);

  // Extract initial idea data from URL params (for all creation methods)
  let initialIdeaText = '';
  let urlObjective = '';
  let urlTemplate = '';
  
  if (isNewPost) {
    const dataParam = searchParams.get('data');
    if (dataParam) {
      try {
        const decoded = JSON.parse(decodeURIComponent(dataParam));
        // Handle both 'idea' (from text method) and 'initialIdea' (from suggestions)
        initialIdeaText = decoded.initialIdea || decoded.idea || '';
        urlObjective = decoded.objective || '';
        urlTemplate = decoded.template || '';
      } catch (e) {
        initialIdeaText = '';
      }
    }
  }

  // Mock sub-client data - hardcoded as requested
  const mockSubClient = {
    name: "Sarah Johnson",
    role: "CEO",
    profileImage: undefined // Will use fallback with icon
  };

  // Custom hooks - pass the extracted initial idea data
  // For new posts, use URL params; for existing, use postDetails
  const ideaForm = useIdeaForm({
    idea: isNewPost ? undefined : postDetails,
    isNewPost,
    initialIdeaFromUrl: '', // You can extract from URL if needed
    objectiveFromUrl: '',
    templateFromUrl: ''
  });

  const postEditor = usePostEditor({ initialText: postDetails?.currentDraftText });

  // Version history: use postDetails.drafts if available
  const versionHistory = !isNewPost && postDetails?.drafts
    ? postDetails.drafts.map((draft, idx) => ({
        id: `v${draft.version}`,
        version: draft.version,
        text: draft.text,
        createdAt: new Date(draft.createdAt.seconds * 1000),
        generatedByAI: draft.generatedByAI,
        notes: draft.notes
      }))
    : [];

  // Hooks: use postDetails.generatedHooks if available
  const sampleHooks = !isNewPost && postDetails?.generatedHooks
    ? postDetails.generatedHooks
    : [];

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (postEditor.hasUnsavedChanges) {
        event.preventDefault();
        event.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [postEditor.hasUnsavedChanges]);

  useEffect(() => {
    const handleNavigation = (event: PopStateEvent) => {
      if (postEditor.hasUnsavedChanges) {
        event.preventDefault();
        setShowUnsavedDialog(true);
        setPendingNavigation(window.location.pathname);
      }
    };

    window.addEventListener('popstate', handleNavigation);
    return () => window.removeEventListener('popstate', handleNavigation);
  }, [postEditor.hasUnsavedChanges]);

  if (!isNewPost && postDetailsLoading) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold">Loading post details...</h2>
      </div>
    );
  }

  if (!isNewPost && postDetailsError) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold">Failed to load post details</h2>
        <p className="text-red-500">{postDetailsError}</p>
      </div>
    );
  }

  if (!isNewPost && !postDetails) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold">Post not found</h2>
        <Link to={`/clients/${clientId}/posts`} className="text-indigo-600 hover:underline mt-4 inline-block">
          Return to posts list
        </Link>
      </div>
    );
  }

  // Sample hooks to demonstrate functionality
  // const sampleHooks = [
  //   {
  //     text: "Cloud migration security gaps putting your data at risk.\nHow to bridge them effectively.",
  //     angle: "Security Risk",
  //   },
  //   {
  //     text: "Is your cloud transition secure? Common pitfalls to avoid.",
  //     angle: "Fear-based",
  //   },
  // ];

  // Event handlers
  const handleSendToAI = () => {
    postEditor.handlePostChange("In today's rapidly evolving business landscape, staying ahead of industry trends is more critical than ever...");
  };

  const handleAddCustomObjective = (customObjective: string) => {
    ideaForm.setters.setObjective(customObjective);
  };

  const handleAddCustomStatus = (customStatus: string) => {
    ideaForm.setters.setStatus(customStatus);
  };

  const handleHookSelect = (index: number) => {
    setSelectedHookIndex(index);
  };

  const handleRegenerateHooks = () => {
    console.log('Regenerating hooks...');
  };

  const handleUnsavedDialogSave = () => {
    postEditor.handleSave();
    setShowUnsavedDialog(false);
    if (pendingNavigation) {
      navigate(pendingNavigation);
      setPendingNavigation(null);
    }
  };

  const handleUnsavedDialogDiscard = () => {
    setShowUnsavedDialog(false);
    if (pendingNavigation) {
      navigate(pendingNavigation);
      setPendingNavigation(null);
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
    if (!hasTimeslotsConfigured) {
      setShowTimeslotModal(true);
    } else {
      // Proceed with normal add to queue functionality
      console.log('Adding to queue with existing timeslots');
    }
  };

  const handleSaveTimeslots = (timeslots: string[], days: string[]) => {
    setPredefinedTimeSlots(timeslots);
    setActiveDays(days);
  };

  const hasTimeslotsConfigured = predefinedTimeSlots.length >= 2 && activeDays.length >= 2;

  return (
    <div className="space-y-4">
      <UnsavedChangesDialog
        open={showUnsavedDialog}
        onOpenChange={setShowUnsavedDialog}
        onSave={handleUnsavedDialogSave}
        onDiscard={handleUnsavedDialogDiscard}
      />

      <IdeaHeader
        clientId={clientId!}
        title={isNewPost ? ideaForm.formData.title : postDetails?.title || ''}
        onTitleChange={ideaForm.setters.setTitle}
        isNewPost={isNewPost}
        hasUnsavedChanges={ideaForm.hasUnsavedChanges}
        onSave={ideaForm.handleSave}
        status={isNewPost ? ideaForm.formData.status : postDetails?.status || ''}
        onStatusChange={ideaForm.setters.setStatus}
        onAddCustomStatus={handleAddCustomStatus}
        onAddToQueue={handleAddToQueue}
      />
      
      {isNewPost && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-blue-800">
            <strong>New Idea:</strong> Enter a title above and start building your idea. Don't forget to save!
          </p>
        </div>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <PostEditor
            postData={{
              generatedPost: postEditor.generatedPost,
              editingInstructions: postEditor.editingInstructions,
              hasUnsavedChanges: postEditor.hasUnsavedChanges
            }}
            postHandlers={{
              onGeneratedPostChange: postEditor.handlePostChange,
              onEditingInstructionsChange: postEditor.setEditingInstructions,
              onCopyText: postEditor.handleCopyText,
              onRegenerateWithInstructions: postEditor.handleRegenerateWithInstructions,
              onSave: postEditor.handleSave,
              onUnsavedChangesChange: () => {}
            }}
            versionHistory={versionHistory}
            onRestoreVersion={postEditor.handlePostChange}
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
              <SubClientDisplayCard subClient={mockSubClient} />
              <IdeaForm
                formData={{
                  initialIdea: isNewPost ? ideaForm.formData.initialIdea : postDetails?.initialIdeaPrompt || '',
                  objective: isNewPost ? ideaForm.formData.objective : postDetails?.objective || '',
                  template: isNewPost ? ideaForm.formData.template : postDetails?.templateUsedId || '',
                  internalNotes: isNewPost ? ideaForm.formData.internalNotes : postDetails?.internalNotes || ''
                }}
                setters={{
                  setInitialIdea: ideaForm.setters.setInitialIdea,
                  setObjective: ideaForm.setters.setObjective,
                  setTemplate: ideaForm.setters.setTemplate,
                  setInternalNotes: ideaForm.setters.setInternalNotes
                }}
                options={{
                  useAsTrainingData,
                  onUseAsTrainingDataChange: setUseAsTrainingData
                }}
                isExpanded={isIdeaExpanded}
                onExpandChange={setIsIdeaExpanded}
                onSendToAI={handleSendToAI}
                onAddCustomObjective={handleAddCustomObjective}
                hooks={sampleHooks}
                selectedHookIndex={selectedHookIndex}
                onHookSelect={handleHookSelect}
                onRegenerateHooks={handleRegenerateHooks}
              />
            </>
          )}
        </div>
      </div>

      <TimeslotDefinitionModal
        isOpen={showTimeslotModal}
        onClose={() => setShowTimeslotModal(false)}
        onSave={handleSaveTimeslots}
        initialTimeslots={predefinedTimeSlots}
        initialDays={activeDays}
      />
    </div>
  );
};

export default IdeaDetails;
