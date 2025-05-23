
import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Calendar, Clock, Copy, Upload, History, FileText } from 'lucide-react';
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

const IdeaDetails = () => {
  const { clientId, ideaId } = useParams<{ clientId: string, ideaId: string }>();
  const [activeTab, setActiveTab] = React.useState('generatedPost');
  const [title, setTitle] = useState('');
  const [initialIdea, setInitialIdea] = useState('');
  const [objective, setObjective] = useState('');
  const [template, setTemplate] = useState('');
  const [generatedPost, setGeneratedPost] = useState('');
  const [editingInstructions, setEditingInstructions] = useState('');
  const [status, setStatus] = useState('Drafting');
  const [useAsTrainingData, setUseAsTrainingData] = useState(false);
  const [internalNotes, setInternalNotes] = useState('');
  const [postDate, setPostDate] = useState('');
  const [postTime, setPostTime] = useState('');
  const [timezone, setTimezone] = useState('UTC-5');
  
  // Find the idea in our mock data
  const idea = mockIdeas.find(i => i.id === ideaId);
  const client = mockClients.find(c => c.id === clientId);
  
  React.useEffect(() => {
    if (idea) {
      setTitle(idea.title);
      setInitialIdea(idea.initialIdeaPrompt);
      setObjective(idea.objective);
      setGeneratedPost(idea.currentDraftText);
      setStatus(idea.status);
      setInternalNotes(idea.internalNotes || '');
      if (idea.templateUsedId) {
        setTemplate(idea.templateUsedId);
      }
      if (idea.scheduledPostAt) {
        const date = new Date(idea.scheduledPostAt.seconds * 1000);
        setPostDate(date.toISOString().split('T')[0]);
        setPostTime(`${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`);
      }
    }
  }, [idea]);

  const form = useForm({
    defaultValues: {
      postingDate: ''
    }
  });
  
  if (!idea || !client) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold">Idea not found</h2>
        <Link to={`/clients/${clientId}`} className="text-indigo-600 hover:underline mt-4 inline-block">
          Return to client page
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link to={`/clients/${clientId}`}>
            <Button variant="outline" size="icon" className="rounded-full">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <Input 
            value={title} 
            onChange={(e) => setTitle(e.target.value)} 
            className="text-2xl font-bold border-0 focus-visible:ring-0 px-0 max-w-md"
            placeholder="Enter post title..."
          />
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-2">
            <History className="h-4 w-4" />
            Version History
          </Button>
          <Button className="bg-indigo-600 hover:bg-indigo-700">
            Generate with AI
          </Button>
        </div>
      </div>
      
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
                  <Select value={objective} onValueChange={setObjective}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select objective" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {predefinedObjectives.map(obj => (
                          <SelectItem key={obj} value={obj}>{obj}</SelectItem>
                        ))}
                        <SelectItem value="custom">Add Custom...</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label htmlFor="template" className="block text-sm font-medium mb-1">Template</label>
                  <Select value={template} onValueChange={setTemplate}>
                    <SelectTrigger>
                      <SelectValue placeholder="Not Selected" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
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
                    <Button variant="outline" size="sm" onClick={handleCopyText}>
                      <Copy className="h-4 w-4 mr-2" />
                      Copy
                    </Button>
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
                  <h3 className="text-lg font-semibold mb-4">Generated Hooks</h3>
                  <div className="space-y-4">
                    {idea.generatedHooks?.map((hook, index) => (
                      <div 
                        key={index}
                        className={`p-3 rounded-md border ${
                          hook.selected ? 'border-indigo-500 bg-indigo-50' : ''
                        }`}
                      >
                        <div className="flex justify-between">
                          <p>{hook.text}</p>
                          {hook.selected ? (
                            <Badge className="bg-indigo-600">Selected</Badge>
                          ) : (
                            <Button variant="outline" size="sm">
                              Select
                            </Button>
                          )}
                        </div>
                        <p className="text-sm text-gray-500 mt-1">Angle: {hook.angle}</p>
                      </div>
                    ))}
                    
                    <Button className="bg-indigo-600 hover:bg-indigo-700 w-full">
                      Regenerate Hooks
                    </Button>
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
                  <DropdownMenuItem onClick={() => {
                    const custom = prompt("Enter custom status:");
                    if (custom) setStatus(custom);
                  }}>
                    Add custom status...
                  </DropdownMenuItem>
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
            
            <div className="border-2 border-dashed rounded-lg p-6 text-center">
              <Upload className="h-10 w-10 mx-auto text-gray-400 mb-2" />
              <p className="mb-2">Drag and drop files here or click to upload</p>
              <p className="text-sm text-gray-500 mb-4">Images, PDFs, and other documents</p>
              <Button variant="outline" size="sm">
                Select Files
              </Button>
            </div>
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
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export default IdeaDetails;
