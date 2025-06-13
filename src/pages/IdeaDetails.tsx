import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { mockIdeas, mockClients } from '../types';
import IdeaHeader from '../components/idea/IdeaHeader';
import InitialIdeaSection from '../components/idea/InitialIdeaSection';
import GeneratedPostEditor from '../components/idea/GeneratedPostEditor';
import HooksSection from '../components/idea/HooksSection';
import StatusCard from '../components/idea/StatusCard';
import ScheduleCard from '../components/idea/ScheduleCard';
import AssetsCard from '../components/idea/AssetsCard';
import OptionsCard from '../components/idea/OptionsCard';
import UnsavedChangesDialog from '../components/idea/UnsavedChangesDialog';

const IdeaDetails = () => {
  const { clientId, ideaId } = useParams<{ clientId: string; ideaId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const isNewPost = searchParams.get('new') === 'true';
  
  const [activeTab, setActiveTab] = React.useState('generatedPost');
  const [title, setTitle] = useState('');
  const [initialIdea, setInitialIdea] = useState('');
  const [objective, setObjective] = useState('');
  const [template, setTemplate] = useState('none');
  const [generatedPost, setGeneratedPost] = useState('');
  const [editingInstructions, setEditingInstructions] = useState('');
  const [status, setStatus] = useState('Drafting');
  const [useAsTrainingData, setUseAsTrainingData] = useState(false);
  const [internalNotes, setInternalNotes] = useState('');
  const [postDate, setPostDate] = useState('');
  const [postTime, setPostTime] = useState('');
  const [timezone, setTimezone] = useState('UTC-5');
  const [selectedHookIndex, setSelectedHookIndex] = useState(0);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [hasUnsavedPostChanges, setHasUnsavedPostChanges] = useState(false);
  const [isIdeaExpanded, setIsIdeaExpanded] = useState(false);
  const [showUnsavedDialog, setShowUnsavedDialog] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<string | null>(null);

  // Find the idea in our mock data (only if not creating new)
  const idea = !isNewPost ? mockIdeas.find(i => i.id === ideaId) : null;
  const client = mockClients.find(c => c.id === clientId);

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
    if (idea && !isNewPost) {
      setTitle(idea.title);
      setInitialIdea(idea.initialIdeaPrompt);
      setObjective(idea.objective);
      setGeneratedPost(idea.currentDraftText);
      setStatus(idea.status);
      setInternalNotes(idea.internalNotes || '');
      if (idea.templateUsedId) {
        setTemplate(idea.templateUsedId);
      } else {
        setTemplate('none');
      }
      if (idea.scheduledPostAt) {
        const date = new Date(idea.scheduledPostAt.seconds * 1000);
        setPostDate(date.toISOString().split('T')[0]);
        setPostTime(`${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`);
      }
      // Set selected hook based on the idea data
      const selectedHook = idea.generatedHooks?.findIndex(hook => hook.selected);
      if (selectedHook !== -1) {
        setSelectedHookIndex(selectedHook);
      }
    } else if (isNewPost) {
      // Set defaults for new idea
      setTitle('');
      setInitialIdea('');
      setObjective('');
      setGeneratedPost('');
      setStatus('Idea');
      setInternalNotes('');
      setTemplate('none');
    }
  }, [idea, isNewPost]);
  const handleSaveNewIdea = () => {
    if (!title.trim()) {
      alert('Please enter a title for the idea');
      return;
    }

    // Here you would typically save to your backend
    console.log('Saving new idea:', {
      title,
      clientId,
      initialIdea,
      objective,
      status
    });

    // Navigate to the actual idea page (remove the new flag)
    navigate(`/clients/${clientId}/ideas/${ideaId}`, {
      replace: true
    });
    setHasUnsavedChanges(false);
  };
  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle);
    if (isNewPost) {
      setHasUnsavedChanges(true);
    }
  };
  const handleSavePost = () => {
    // Here you would typically save to your backend
    console.log('Saving post:', {
      generatedPost,
      title,
      clientId,
      ideaId
    });
    
    setHasUnsavedPostChanges(false);
  };

  // Handle browser navigation/close
  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (hasUnsavedPostChanges) {
        event.preventDefault();
        event.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedPostChanges]);

  // Handle React Router navigation
  useEffect(() => {
    const handleNavigation = (event: PopStateEvent) => {
      if (hasUnsavedPostChanges) {
        event.preventDefault();
        setShowUnsavedDialog(true);
        setPendingNavigation(window.location.pathname);
      }
    };

    window.addEventListener('popstate', handleNavigation);
    return () => window.removeEventListener('popstate', handleNavigation);
  }, [hasUnsavedPostChanges]);

  const handleUnsavedDialogSave = () => {
    handleSavePost();
    setShowUnsavedDialog(false);
    if (pendingNavigation) {
      navigate(pendingNavigation);
      setPendingNavigation(null);
    }
  };

  const handleUnsavedDialogDiscard = () => {
    setHasUnsavedPostChanges(false);
    setShowUnsavedDialog(false);
    if (pendingNavigation) {
      navigate(pendingNavigation);
      setPendingNavigation(null);
    }
  };

  if (!client) {
    return <div className="text-center py-12">
        <h2 className="text-2xl font-semibold">Client not found</h2>
        <Link to="/clients" className="text-indigo-600 hover:underline mt-4 inline-block">
          Return to clients list
        </Link>
      </div>;
  }
  const predefinedStatuses = ['Idea', 'Drafting', 'AwaitingReview', 'Approved', 'Scheduled', 'Posted', 'NeedsRevision', 'NeedsVisual'];
  const predefinedObjectives = ['Thought Leadership', 'Lead Generation', 'Brand Awareness', 'Engagement', 'Product Launch', 'Event Promotion'];
  const handleSendToAI = () => {
    // Simulate AI generating content
    setGeneratedPost("In today's rapidly evolving business landscape, staying ahead of industry trends is more critical than ever...");
    // Navigate to the generated post tab
    setActiveTab('generatedPost');
  };
  const handleRegenerateWithInstructions = () => {
    // Simulate AI regenerating content with instructions
    setGeneratedPost("Based on your instructions, here's an updated version that focuses more on practical implementation of AI in manufacturing...");
  };
  const handleCopyText = () => {
    // For contentEditable, we need to get the text content
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = generatedPost;
    navigator.clipboard.writeText(tempDiv.textContent || tempDiv.innerText || '');
    // Could add a toast notification here
  };
  const handleRestoreVersion = (text: string) => {
    setGeneratedPost(text);
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
    // Simulate regenerating hooks
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
  const handleTemplateChange = (value: string) => {
    setTemplate(value);
  };
  const handleFormatText = (format: string) => {
    // Basic text formatting - in a real implementation, you'd use a proper rich text editor
    const textarea = document.querySelector('textarea[data-generated-post]') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = generatedPost.substring(start, end);
    
    let formattedText = '';
    switch (format) {
      case 'bold':
        formattedText = `**${selectedText}**`;
        break;
      case 'italic':
        formattedText = `*${selectedText}*`;
        break;
      case 'underline':
        formattedText = `__${selectedText}__`;
        break;
      default:
        formattedText = selectedText;
    }

    const newText = generatedPost.substring(0, start) + formattedText + generatedPost.substring(end);
    setGeneratedPost(newText);
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
        title={title}
        onTitleChange={handleTitleChange}
        isNewPost={isNewPost}
        hasUnsavedChanges={hasUnsavedChanges}
        onSave={handleSaveNewIdea}
      />
      
      {/* Show a notice for new ideas */}
      {isNewPost && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-blue-800">
            <strong>New Idea:</strong> Enter a title above and start building your idea. Don't forget to save!
          </p>
        </div>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left section - 2/3 width */}
        <div className="lg:col-span-2 space-y-6">
          {/* Enhanced Generated Post Editor */}
          <div>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="bg-slate-100">
                <TabsTrigger value="generatedPost">Generated Post</TabsTrigger>
                <TabsTrigger value="hooks">Hooks</TabsTrigger>
              </TabsList>
              
              <TabsContent value="generatedPost" className="space-y-6 pt-4">
                <GeneratedPostEditor
                  generatedPost={generatedPost}
                  onGeneratedPostChange={setGeneratedPost}
                  editingInstructions={editingInstructions}
                  onEditingInstructionsChange={setEditingInstructions}
                  onCopyText={handleCopyText}
                  onRegenerateWithInstructions={handleRegenerateWithInstructions}
                  onSave={handleSavePost}
                  hasUnsavedChanges={hasUnsavedPostChanges}
                  onUnsavedChangesChange={setHasUnsavedPostChanges}
                  versionHistory={versionHistory}
                  onRestoreVersion={handleRestoreVersion}
                />
              </TabsContent>
              
              <TabsContent value="hooks" className="pt-4">
                <HooksSection
                  hooks={idea?.generatedHooks}
                  selectedHookIndex={selectedHookIndex}
                  onHookSelect={handleHookSelect}
                  onRegenerateHooks={handleRegenerateHooks}
                />
              </TabsContent>
            </Tabs>
          </div>
        </div>
        
        {/* Right section - 1/3 width */}
        <div className="space-y-6">
          <StatusCard
            status={status}
            onStatusChange={setStatus}
            onAddCustomStatus={handleAddCustomStatus}
          />
          
          {/* Initial Idea Section - moved here and initially collapsed */}
          <InitialIdeaSection
            isExpanded={isIdeaExpanded}
            onExpandChange={setIsIdeaExpanded}
            initialIdea={initialIdea}
            onInitialIdeaChange={setInitialIdea}
            objective={objective}
            onObjectiveChange={setObjective}
            template={template}
            onTemplateChange={setTemplate}
            onSendToAI={handleSendToAI}
            onAddCustomObjective={handleAddCustomObjective}
          />
          
          <ScheduleCard
            postDate={postDate}
            postTime={postTime}
            timezone={timezone}
            onPostDateChange={setPostDate}
            onPostTimeChange={setPostTime}
            onTimezoneChange={setTimezone}
          />
          
          <AssetsCard
            uploadedFiles={uploadedFiles}
            onFileUpload={handleFileUpload}
            onFileDrop={handleFileDrop}
            onDragOver={handleDragOver}
            onRemoveFile={removeFile}
          />
          
          <OptionsCard
            useAsTrainingData={useAsTrainingData}
            onUseAsTrainingDataChange={setUseAsTrainingData}
            internalNotes={internalNotes}
            onInternalNotesChange={setInternalNotes}
          />
        </div>
      </div>
    </div>
  );
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Posted':
      return 'bg-green-100 text-green-800';
    case 'Scheduled':
      return 'bg-blue-100 text-blue-800';
    case 'AwaitingReview':
      return 'bg-yellow-100 text-yellow-800';
    case 'NeedsRevision':
      return 'bg-red-100 text-red-800';
    case 'Drafting':
      return 'bg-purple-100 text-purple-800';
    case 'NeedsVisual':
      return 'bg-orange-100 text-orange-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export default IdeaDetails;
