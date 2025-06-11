
import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Edit3, Mic, Youtube, X, Sparkles, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { mockTemplates } from '@/types';

interface CreatePostModalProps {
  children: React.ReactNode;
}

const CreatePostModal: React.FC<CreatePostModalProps> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<string>('text');
  const [ideaText, setIdeaText] = useState('');
  const [selectedObjective, setSelectedObjective] = useState<string>('');
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [voiceNotes, setVoiceNotes] = useState('');
  const [recordingLanguage, setRecordingLanguage] = useState('English');
  const [urlInput, setUrlInput] = useState('');
  const [urlRemarks, setUrlRemarks] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [postSuggestions, setPostSuggestions] = useState([
    'The €0 AI Toolkit No SME Knows About: Revealing 5 underground open-source tools that can replace €5,000 worth of enterprise software, without compromising on quality or performance.',
    'Why 90% of Digital Transformations Fail (And The 3-Step Framework That Actually Works): Real data from 500+ enterprise projects reveals the hidden pitfalls.',
    'The LinkedIn Algorithm Just Changed: Here\'s exactly what content performs best in 2024, backed by analysis of 10,000+ posts from top performers.',
    'From Startup to Scale-Up: The 7 critical technology decisions that will make or break your growth phase (learned from 50+ companies we\'ve consulted).'
  ]);
  const [hoveredSuggestion, setHoveredSuggestion] = useState<string | null>(null);
  
  const navigate = useNavigate();
  const { clientId } = useParams<{ clientId: string }>();

  const objectives = [
    'Thought Leadership',
    'Product Launch',
    'Event Promotion',
    'Brand Awareness',
    'Lead Generation',
    'Customer Education',
    'Community Building'
  ];

  const handleCreateFromText = () => {
    if (ideaText.trim() && clientId) {
      const tempIdeaId = `temp-${Date.now()}`;
      const textData = {
        idea: ideaText.trim(),
        objective: selectedObjective,
        template: selectedTemplate
      };
      navigate(`/clients/${clientId}/ideas/${tempIdeaId}?new=true&method=text&data=${encodeURIComponent(JSON.stringify(textData))}`);
      setIsOpen(false);
      resetForm();
    }
  };

  const handleCreateFromVoice = () => {
    if (clientId) {
      const tempIdeaId = `temp-${Date.now()}`;
      const voiceData = {
        language: recordingLanguage,
        notes: voiceNotes,
        objective: selectedObjective,
        template: selectedTemplate
      };
      navigate(`/clients/${clientId}/ideas/${tempIdeaId}?new=true&method=voice&data=${encodeURIComponent(JSON.stringify(voiceData))}`);
      setIsOpen(false);
      resetForm();
    }
  };

  const handleCreateFromUrl = () => {
    if (urlInput.trim() && clientId) {
      const tempIdeaId = `temp-${Date.now()}`;
      const urlData = {
        url: urlInput,
        remarks: urlRemarks,
        objective: selectedObjective,
        template: selectedTemplate
      };
      navigate(`/clients/${clientId}/ideas/${tempIdeaId}?new=true&method=url&data=${encodeURIComponent(JSON.stringify(urlData))}`);
      setIsOpen(false);
      resetForm();
    }
  };

  const handleCreateFromSuggestion = (suggestion: string) => {
    if (clientId) {
      const tempIdeaId = `temp-${Date.now()}`;
      const suggestionData = {
        idea: suggestion,
        objective: selectedObjective,
        template: selectedTemplate
      };
      navigate(`/clients/${clientId}/ideas/${tempIdeaId}?new=true&method=suggestion&data=${encodeURIComponent(JSON.stringify(suggestionData))}`);
      setIsOpen(false);
      resetForm();
    }
  };

  const refreshSuggestions = () => {
    const allSuggestions = [
      'The €0 AI Toolkit No SME Knows About: Revealing 5 underground open-source tools that can replace €5,000 worth of enterprise software, without compromising on quality or performance.',
      'Why 90% of Digital Transformations Fail (And The 3-Step Framework That Actually Works): Real data from 500+ enterprise projects reveals the hidden pitfalls.',
      'The LinkedIn Algorithm Just Changed: Here\'s exactly what content performs best in 2024, backed by analysis of 10,000+ posts from top performers.',
      'From Startup to Scale-Up: The 7 critical technology decisions that will make or break your growth phase (learned from 50+ companies we\'ve consulted).',
      'The Remote Work Revolution: 5 productivity tools that increased our team\'s output by 40% while reducing meeting time by half.',
      'Cloud Migration Mistakes That Cost Companies Millions: What we learned from 100+ failed migrations and how to avoid them.',
      'The Future of Cybersecurity: Why traditional firewalls are becoming obsolete and what\'s replacing them.',
      'Building SaaS Products That Scale: Technical decisions we made at day 1 that saved us from rewriting everything at 1M users.'
    ];
    
    const shuffled = allSuggestions.sort(() => 0.5 - Math.random());
    setPostSuggestions(shuffled.slice(0, 4));
  };

  const resetForm = () => {
    setIdeaText('');
    setSelectedObjective('');
    setSelectedTemplate('');
    setVoiceNotes('');
    setUrlInput('');
    setUrlRemarks('');
    setRecordingLanguage('English');
    setIsRecording(false);
  };

  const startVoiceRecording = () => {
    setIsRecording(true);
    console.log('Starting voice recording...');
  };

  const stopVoiceRecording = () => {
    setIsRecording(false);
    console.log('Stopping voice recording...');
  };

  const createMethods = [
    {
      id: 'text',
      title: 'Generate from text',
      description: 'Turn any text into a post',
      icon: Edit3,
      color: 'bg-muted text-muted-foreground'
    },
    {
      id: 'voice',
      title: 'Generate from voice',
      description: 'Record voice memo',
      icon: Mic,
      color: 'bg-muted text-muted-foreground'
    },
    {
      id: 'url',
      title: 'Generate from URL',
      description: 'Turn YouTube videos or articles into content',
      icon: Youtube,
      color: 'bg-muted text-muted-foreground'
    },
    {
      id: 'suggestions',
      title: 'Post Suggestions',
      description: 'AI-generated post ideas',
      icon: Sparkles,
      color: 'bg-primary text-primary-foreground'
    }
  ];

  const handleMethodSelect = (methodId: string) => {
    setSelectedMethod(methodId);
  };

  const renderObjectiveAndTemplate = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          Objective (optional)
        </label>
        <Select value={selectedObjective} onValueChange={setSelectedObjective}>
          <SelectTrigger>
            <SelectValue placeholder="Select an objective" />
          </SelectTrigger>
          <SelectContent>
            {objectives.map((objective) => (
              <SelectItem key={objective} value={objective}>
                {objective}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          Template (optional)
        </label>
        <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
          <SelectTrigger>
            <SelectValue placeholder="Select a template" />
          </SelectTrigger>
          <SelectContent>
            {mockTemplates.map((template) => (
              <SelectItem key={template.id} value={template.id}>
                {template.templateName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );

  const renderRightPanel = () => {
    switch (selectedMethod) {
      case 'text':
        return (
          <div className="space-y-4">
            {renderObjectiveAndTemplate()}

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Insert any text to turn into a post <span className="text-destructive">*</span>
              </label>
              <Textarea
                value={ideaText}
                onChange={(e) => setIdeaText(e.target.value)}
                placeholder="Enter your idea here..."
                className="min-h-[200px] resize-none"
              />
            </div>

            <div className="text-sm text-muted-foreground">
              <p>No need to prompt, turn content into posts.</p>
              <p>Recommended min length is 100 characters.</p>
            </div>

            <Button
              onClick={handleCreateFromText}
              disabled={!ideaText.trim()}
              className="w-full py-3"
            >
              Generate post from text
            </Button>
          </div>
        );

      case 'voice':
        return (
          <div className="space-y-4">
            {renderObjectiveAndTemplate()}

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Recording Language
              </label>
              <Select value={recordingLanguage} onValueChange={setRecordingLanguage}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="English">English</SelectItem>
                  <SelectItem value="Spanish">Spanish</SelectItem>
                  <SelectItem value="French">French</SelectItem>
                  <SelectItem value="German">German</SelectItem>
                  <SelectItem value="Italian">Italian</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Take notes before recording (optional)
              </label>
              <Textarea
                value={voiceNotes}
                onChange={(e) => setVoiceNotes(e.target.value)}
                placeholder="Why you want to speak on this topic?
What you want to convey to your audience?"
                className="min-h-[120px] resize-none"
              />
            </div>

            <Button
              onClick={isRecording ? stopVoiceRecording : startVoiceRecording}
              className={`w-full py-3 ${isRecording ? 'bg-destructive hover:bg-destructive/90' : ''}`}
            >
              {isRecording ? (
                <>
                  <div className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse" />
                  Stop voice recording
                </>
              ) : (
                <>
                  <Mic className="w-4 h-4 mr-2" />
                  Start voice recording
                </>
              )}
            </Button>
          </div>
        );

      case 'url':
        return (
          <div className="space-y-4">
            {renderObjectiveAndTemplate()}

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                YouTube or Article URL <span className="text-destructive">*</span>
              </label>
              <Input
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=... or https://example.com/article"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Additional remarks (optional)
              </label>
              <Textarea
                value={urlRemarks}
                onChange={(e) => setUrlRemarks(e.target.value)}
                placeholder="Any specific aspects you want to focus on or additional context..."
                className="min-h-[100px] resize-none"
              />
            </div>

            <Button
              onClick={handleCreateFromUrl}
              disabled={!urlInput.trim()}
              className="w-full py-3"
            >
              Generate posts from URL
            </Button>
          </div>
        );

      case 'suggestions':
        return (
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-4">
                <label className="block text-sm font-medium text-foreground">
                  Select a post idea
                </label>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={refreshSuggestions}
                  className="flex items-center gap-1"
                >
                  <RefreshCw className="h-3 w-3" />
                  Refresh
                </Button>
              </div>
              
              <div className="space-y-3">
                {postSuggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-lg border cursor-pointer transition-all hover:border-primary hover:bg-primary/5 ${
                      hoveredSuggestion === suggestion ? 'border-primary bg-primary/5' : 'border-border'
                    }`}
                    onMouseEnter={() => setHoveredSuggestion(suggestion)}
                    onMouseLeave={() => setHoveredSuggestion(null)}
                    onClick={() => handleCreateFromSuggestion(suggestion)}
                  >
                    <p className="text-sm text-foreground leading-relaxed">{suggestion}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="text-sm text-muted-foreground">
              <p>Click on any idea to use it for post generation.</p>
              <p>Ideas are personalized based on your brand profile.</p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent 
        className="max-w-7xl max-h-[90vh] overflow-y-auto"
      >
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          {/* Left side - Creation methods (1/3) */}
          <div className="space-y-2">
            {createMethods.map((method) => (
              <button
                key={method.id}
                onClick={() => handleMethodSelect(method.id)}
                className={`w-full p-3 rounded-lg text-left transition-all hover:bg-accent border ${
                  selectedMethod === method.id 
                    ? 'border-primary bg-primary/5' 
                    : 'border-border bg-card'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${method.color}`}>
                    <method.icon className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="font-medium text-foreground">{method.title}</div>
                    <div className="text-sm text-muted-foreground">{method.description}</div>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Right side - Dynamic content based on selected method (2/3) */}
          <div className="lg:col-span-2 space-y-4">
            {renderRightPanel()}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreatePostModal;
