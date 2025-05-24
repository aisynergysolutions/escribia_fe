import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Calendar, Clock, Copy, Upload, History, FileText, X, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { mockIdeas, mockClients, mockTemplates } from '../types';
import VersionHistory from '../components/VersionHistory';
import CustomInputModal from '../components/CustomInputModal';
import EditableTitle from '../components/EditableTitle';

const IdeaDetails = () => {
  const { clientId, ideaId } = useParams<{ clientId: string, ideaId: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isNewIdea = searchParams.get('new') === 'true';
  
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
  
  const [isEditingTitle, setIsEditingTitle] = useState(isNewIdea);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  
  // Find the idea in our mock data (only if not creating new)
  const idea = !isNewIdea ? mockIdeas.find(i => i.id === ideaId) : null;
  const client = mockClients.find(c => c.id === clientId);
  
  // Mock version history data
  const [versionHistory] = useState([
    {
      id: 'v1',
      version: 1,
      text: 'Initial AI-generated content about the future of AI in marketing. This content explores how artificial intelligence is transforming the marketing landscape and what businesses need to know.',
      createdAt: new Date('2023-12-15T10:30:00'),
      generatedByAI: true,
      notes: 'First generation from initial prompt'
    },
    {
      id: 'v2',
      version: 2,
      text: 'Revised content with more focus on practical applications and case studies. This version includes real-world examples of companies successfully implementing AI in their marketing strategies.',
      createdAt: new Date('2023-12-15T11:15:00'),
      generatedByAI: true,
      notes: 'Regenerated with editing instructions to add more examples'
    },
    {
      id: 'v3',
      version: 3,
      text: 'Latest version with improved structure and actionable insights. This comprehensive guide provides step-by-step recommendations for businesses looking to leverage AI in their marketing efforts.',
      createdAt: new Date('2023-12-15T14:20:00'),
      generatedByAI: true,
      notes: 'Latest version with improved structure'
    }
  ]);

  useEffect(() => {
    if (idea && !isNewIdea) {
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
    } else if (isNewIdea) {
      // Set defaults for new idea
      setTitle('');
      setInitialIdea('');
      setObjective('');
      setGeneratedPost('');
      setStatus('Idea');
      setInternalNotes('');
      setTemplate('none');
    }
  }, [idea, isNewIdea]);

  const form = useForm({
    defaultValues: {
      postingDate: ''
    }
  });
  
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
    navigate(`/clients/${clientId}/ideas/${ideaId}`, { replace: true });
    setIsEditingTitle(false);
    setHasUnsavedChanges(false);
  };

  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle);
    if (isNewIdea) {
      setHasUnsavedChanges(true);
    }
  };

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
    navigator.clipboard.writeText(generatedPost);
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link to={`/clients/${clientId}`}>
            <Button variant="outline" size="icon" className="rounded-full">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          {isNewIdea ? (
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="Enter idea title..."
                className="text-2xl font-bold bg-transparent border-b-2 border-gray-300 focus:border-indigo-500 outline-none"
                autoFocus
              />
              {hasUnsavedChanges && (
                <Button 
                  onClick={handleSaveNewIdea}
                  className="bg-indigo-600 hover:bg-indigo-700"
                  size="sm"
                >
                  Save
                </Button>
              )}
            </div>
          ) : (
            <EditableTitle 
              title={title}
              onSave={setTitle}
              className="text-2xl font-bold"
            />
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button className="bg-indigo-600 hover:bg-indigo-700">
            Generate with AI
          </Button>
        </div>
      </div>
      
      {/* Show a notice for new ideas */}
      {isNewIdea && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-blue-800">
            <strong>New Idea:</strong> Enter a title above and start building your idea. Don't forget to save!
          </p>
        </div>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left section - 2/3 width */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Idea</h2>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="initialIdea" className="block text-sm font-medium mb-1">Initial Idea</label>
                <Textarea 
                  id="initialIdea" 
                  value={initialIdea} 
                  onChange={(e) => setInitialIdea(e.target.value)}
                  placeholder="Write your initial idea here..."
                  rows={4}
                  className="w-full"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="objective" className="block text-sm font-medium mb-1">Objective</label>
                  <div className="flex items-center gap-2">
                    <Select value={objective} onValueChange={setObjective}>
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder="Select objective" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {predefinedObjectives.map(obj => (
                            <SelectItem key={obj} value={obj}>{obj}</SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm">
                          Add Custom
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <CustomInputModal
                          title="Add Custom Objective"
                          placeholder="Enter custom objective..."
                          onSave={handleAddCustomObjective}
                        >
                          <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                            Add custom objective...
                          </DropdownMenuItem>
                        </CustomInputModal>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
                
                <div>
                  <label htmlFor="template" className="block text-sm font-medium mb-1">Template</label>
                  <Select value={template} onValueChange={handleTemplateChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Not Selected" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value="none">None</SelectItem>
                        {mockTemplates.map(templ => (
                          <SelectItem key={templ.id} value={templ.id}>{templ.templateName}</SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <Button 
                onClick={handleSendToAI}
                className="w-full bg-indigo-600 hover:bg-indigo-700"
              >
                Send to AI
              </Button>
            </div>
          </Card>
          
          <div>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="bg-slate-100">
                <TabsTrigger value="generatedPost">Generated Post</TabsTrigger>
                <TabsTrigger value="hooks">Hooks</TabsTrigger>
              </TabsList>
              
              <TabsContent value="generatedPost" className="space-y-6 pt-4">
                <div className="bg-white rounded-lg border">
                  <div className="flex justify-between items-center p-4 border-b">
                    <h3 className="text-xl font-semibold">Generated Post</h3>
                    <div className="flex gap-2">
                      <VersionHistory 
                        versions={versionHistory}
                        onRestore={handleRestoreVersion}
                      />
                      <Button variant="outline" size="sm" onClick={handleCopyText}>
                        <Copy className="h-4 w-4 mr-2" />
                        Copy
                      </Button>
                    </div>
                  </div>
                  <div className="p-4">
                    <Textarea
                      value={generatedPost}
                      onChange={(e) => setGeneratedPost(e.target.value)}
                      className="min-h-[200px] w-full"
                      placeholder="AI generated content will appear here..."
                    />
                  </div>
                </div>
                
                <div className="bg-white rounded-lg border">
                  <div className="p-4 border-b">
                    <h3 className="text-xl font-semibold">Editing Instructions</h3>
                  </div>
                  <div className="p-4">
                    <Textarea
                      value={editingInstructions}
                      onChange={(e) => setEditingInstructions(e.target.value)}
                      className="min-h-[100px] w-full"
                      placeholder="Provide feedback or instructions for the AI to improve the generated content..."
                    />
                  </div>
                  <div className="p-4 pt-0">
                    <Button 
                      onClick={handleRegenerateWithInstructions}
                      className="w-full bg-indigo-600 hover:bg-indigo-700"
                    >
                      Regenerate with Instructions
                    </Button>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="hooks" className="pt-4">
                <div className="bg-white rounded-lg border p-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">Generated Hooks</h3>
                    <Button 
                      onClick={handleRegenerateHooks}
                      className="bg-indigo-600 hover:bg-indigo-700"
                    >
                      Regenerate Hooks
                    </Button>
                  </div>
                  <div className="space-y-4">
                    {idea?.generatedHooks?.map((hook, index) => (
                      <div 
                        key={index}
                        className={`p-3 rounded-md border cursor-pointer ${
                          selectedHookIndex === index ? 'border-indigo-500 bg-indigo-50' : 'hover:bg-gray-50'
                        }`}
                        onClick={() => handleHookSelect(index)}
                      >
                        <div className="flex justify-between">
                          <p>{hook.text}</p>
                          {selectedHookIndex === index ? (
                            <Badge className="bg-indigo-600">Selected</Badge>
                          ) : (
                            <Button variant="outline" size="sm" onClick={(e) => {
                              e.stopPropagation();
                              handleHookSelect(index);
                            }}>
                              Select
                            </Button>
                          )}
                        </div>
                        <p className="text-sm text-gray-500 mt-1">Angle: {hook.angle}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
        
        {/* Right section - 1/3 width */}
        <div className="space-y-6">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Status</h2>
            <div className="flex items-center gap-2">
              <Badge className={`${getStatusColor(status)}`}>
                {status}
              </Badge>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    Change status
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  {predefinedStatuses.map(s => (
                    <DropdownMenuItem key={s} onClick={() => setStatus(s)}>
                      {s}
                    </DropdownMenuItem>
                  ))}
                  <CustomInputModal
                    title="Add Custom Status"
                    placeholder="Enter custom status..."
                    onSave={handleAddCustomStatus}
                  >
                    <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                      Add custom status...
                    </DropdownMenuItem>
                  </CustomInputModal>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </Card>
          
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Post Schedule</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Posting Date & Time</label>
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <Input
                    type="date"
                    value={postDate}
                    onChange={(e) => setPostDate(e.target.value)}
                  />
                  <Input
                    type="time"
                    value={postTime}
                    onChange={(e) => setPostTime(e.target.value)}
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Timezone</label>
                <Select value={timezone} onValueChange={setTimezone}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="UTC-8">UTC-8 (PST)</SelectItem>
                      <SelectItem value="UTC-5">UTC-5 (EST)</SelectItem>
                      <SelectItem value="UTC+0">UTC+0 (GMT)</SelectItem>
                      <SelectItem value="UTC+1">UTC+1 (CET)</SelectItem>
                      <SelectItem value="UTC+2">UTC+2 (EET)</SelectItem>
                      <SelectItem value="UTC+8">UTC+8 (CST)</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Card>
          
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Assets</h2>
            
            <div 
              className="border-2 border-dashed rounded-lg p-6 text-center"
              onDrop={handleFileDrop}
              onDragOver={handleDragOver}
            >
              <Upload className="h-10 w-10 mx-auto text-gray-400 mb-2" />
              <p className="mb-2">Drag and drop files here or click to upload</p>
              <p className="text-sm text-gray-500 mb-4">Images, PDFs, and other documents</p>
              <input
                type="file"
                multiple
                onChange={handleFileUpload}
                className="hidden"
                id="file-upload"
              />
              <Button variant="outline" size="sm" onClick={() => document.getElementById('file-upload')?.click()}>
                Select Files
              </Button>
            </div>
            
            {uploadedFiles.length > 0 && (
              <div className="mt-4 space-y-2">
                <h4 className="font-medium">Uploaded Files:</h4>
                {uploadedFiles.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span className="text-sm truncate">{file.name}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeFile(index)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </Card>
          
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Options</h2>
            
            <div className="flex items-center space-x-2 mb-4">
              <input
                type="checkbox"
                id="training-data"
                checked={useAsTrainingData}
                onChange={(e) => setUseAsTrainingData(e.target.checked)}
                className="rounded border-gray-300"
              />
              <label htmlFor="training-data">Use as training data</label>
            </div>
            
            <div>
              <label htmlFor="internalNotes" className="block text-sm font-medium mb-1">Internal Notes</label>
              <Textarea
                id="internalNotes"
                value={internalNotes}
                onChange={(e) => setInternalNotes(e.target.value)}
                placeholder="Add internal notes here (not visible to clients)..."
                rows={3}
              />
            </div>
          </Card>
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
