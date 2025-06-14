import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams, Link } from 'react-router-dom';
import { mockIdeas, mockClients } from '../types';
import IdeaHeader from '../components/idea/IdeaHeader';
import PostEditor from '../components/idea/PostEditor';
import IdeaForm from '../components/idea/IdeaForm';
import UnsavedChangesDialog from '../components/idea/UnsavedChangesDialog';
import CustomBreadcrumb from '../components/navigation/Breadcrumb';
import { useIdeaForm } from '../hooks/useIdeaForm';
import { usePostEditor } from '../hooks/usePostEditor';
import { useScheduling } from '../hooks/useScheduling';

const IdeaDetails = () => {
  const { clientId, ideaId } = useParams<{ clientId: string; ideaId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const isNewPost = searchParams.get('new') === 'true';
  
  const [activeTab, setActiveTab] = useState('generatedPost');
  const [selectedHookIndex, setSelectedHookIndex] = useState(0);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [useAsTrainingData, setUseAsTrainingData] = useState(false);
  const [isIdeaExpanded, setIsIdeaExpanded] = useState(false);
  const [showUnsavedDialog, setShowUnsavedDialog] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<string | null>(null);

  // Find the idea and client
  const idea = !isNewPost ? mockIdeas.find(i => i.id === ideaId) : null;
  const client = mockClients.find(c => c.id === clientId);

  // Custom hooks
  const ideaForm = useIdeaForm({ idea, isNewPost });
  const postEditor = usePostEditor({ initialText: idea?.currentDraftText });
  const scheduling = useScheduling({ idea });

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

  // Breadcrumb items
  const breadcrumbItems = [
    { label: 'Clients', href: '/clients' },
    { label: client.clientName, href: `/clients/${clientId}` },
    { label: isNewPost ? 'New Idea' : idea?.title || 'Idea' }
  ];

  // Event handlers
  const handleSendToAI = () => {
    postEditor.handlePostChange("In today's rapidly evolving business landscape, staying ahead of industry trends is more critical than ever...");
    setActiveTab('generatedPost');
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

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      setUploadedFiles(prev => [...prev, ...Array.from(files)]);
    }
  };

  const handleFileDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const files = event.dataTransfer.files;
    if (files) {
      setUploadedFiles(prev => [...prev, ...Array.from(files)]);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
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

  return (
    <div className="space-y-6">
      <CustomBreadcrumb items={breadcrumbItems} />

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
            activeTab={activeTab}
            onTabChange={setActiveTab}
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
            hooks={idea?.generatedHooks}
            selectedHookIndex={selectedHookIndex}
            onHookSelect={handleHookSelect}
            onRegenerateHooks={handleRegenerateHooks}
            versionHistory={versionHistory}
            onRestoreVersion={postEditor.handlePostChange}
          />
        </div>
        
        <div className="space-y-6">
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
            scheduling={scheduling}
            assets={{
              uploadedFiles,
              onFileUpload: handleFileUpload,
              onFileDrop: handleFileDrop,
              onDragOver: handleDragOver,
              onRemoveFile: removeFile
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
        </div>
      </div>
    </div>
  );
};

export default IdeaDetails;
