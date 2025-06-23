import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams, Link } from 'react-router-dom';
import { mockIdeas, mockClients } from '../types';
import IdeaHeader from '../components/idea/IdeaHeader';
import PostEditor from '../components/idea/PostEditor';
import IdeaForm from '../components/idea/IdeaForm';
import UnsavedChangesDialog from '../components/idea/UnsavedChangesDialog';
import { useIdeaForm } from '../hooks/useIdeaForm';
import { usePostEditor } from '../hooks/usePostEditor';
import CommentsPanel, { CommentThread } from '../components/idea/CommentsPanel';
import SubClientDisplayCard from '../components/idea/SubClientDisplayCard';

const IdeaDetails = () => {
  const { clientId, ideaId } = useParams<{ clientId: string; ideaId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const isNewPost = searchParams.get('new') === 'true';
  
  const [selectedHookIndex, setSelectedHookIndex] = useState(-1);
  const [useAsTrainingData, setUseAsTrainingData] = useState(false);
  const [isIdeaExpanded, setIsIdeaExpanded] = useState(false);
  const [showUnsavedDialog, setShowUnsavedDialog] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<string | null>(null);
  const [showCommentsPanel, setShowCommentsPanel] = useState(false);
  const [comments, setComments] = useState<CommentThread[]>([]);
  const [hasPoll, setHasPoll] = useState(false); // Track if there's an active poll

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

  // Find the idea and client
  const idea = !isNewPost ? mockIdeas.find(i => i.id === ideaId) : null;
  const client = mockClients.find(c => c.id === clientId);

  // Mock sub-client data - hardcoded as requested
  const mockSubClient = {
    name: "Sarah Johnson",
    role: "CEO",
    profileImage: undefined // Will use fallback with icon
  };

  // Custom hooks - pass the extracted initial idea data
  const ideaForm = useIdeaForm({
    idea: idea,
    isNewPost,
    initialIdeaFromUrl: initialIdeaText,
    objectiveFromUrl: urlObjective,
    templateFromUrl: urlTemplate
  });

  const postEditor = usePostEditor({ initialText: idea?.currentDraftText });

  // Mock version history data
  const [versionHistory] = useState([{
    id: 'v1',
    version: 1,
    text: 'Initial AI-generated content about the future of AI in marketing. This content explores how artificial intelligence is transforming the marketing landscape and what businesses need to know.',
    createdAt: new Date('2023-12-15T10:30:00'),
    generatedByAI: true,
    notes: 'First generation from initial prompt'
  }, {
    id: 'v2',
    version: 2,
    text: 'Revised content with more focus on practical applications and case studies. This version includes real-world examples of companies successfully implementing AI in their marketing strategies.',
    createdAt: new Date('2023-12-15T11:15:00'),
    generatedByAI: true,
    notes: 'Regenerated with editing instructions to add more examples'
  }, {
    id: 'v3',
    version: 3,
    text: 'Latest version with improved structure and actionable insights. This comprehensive guide provides step-by-step recommendations for businesses looking to leverage AI in their marketing efforts.',
    createdAt: new Date('2023-12-15T14:20:00'),
    generatedByAI: true,
    notes: 'Latest version with improved structure'
  }]);

  // Sample hooks to demonstrate functionality
  const sampleHooks = [
    {
      text: "Cloud migration security gaps putting your data at risk.\nHow to bridge them effectively.",
      angle: "Security Risk",
    },
    {
      text: "Is your cloud transition secure? Common pitfalls to avoid.",
      angle: "Fear-based",
    },
  ];

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

  if (!client) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold">Client not found</h2>
        <Link to="/clients" className="text-indigo-600 hover:underline mt-4 inline-block">
          Return to clients list
        </Link>
      </div>
    );
  }

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

  return (
    <div className="space-y-6">
      <UnsavedChangesDialog
        open={showUnsavedDialog}
        onOpenChange={setShowUnsavedDialog}
        onSave={handleUnsavedDialogSave}
        onDiscard={handleUnsavedDialogDiscard}
      />

      <IdeaHeader
        clientId={clientId!}
        title={ideaForm.formData.title}
        onTitleChange={ideaForm.setters.setTitle}
        isNewPost={isNewPost}
        hasUnsavedChanges={ideaForm.hasUnsavedChanges}
        onSave={ideaForm.handleSave}
        status={ideaForm.formData.status}
        onStatusChange={ideaForm.setters.setStatus}
        onAddCustomStatus={handleAddCustomStatus}
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
                  initialIdea: ideaForm.formData.initialIdea,
                  objective: ideaForm.formData.objective,
                  template: ideaForm.formData.template,
                  internalNotes: ideaForm.formData.internalNotes
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
    </div>
  );
};

export default IdeaDetails;
