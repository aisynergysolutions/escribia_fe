import React, { useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Edit3, Mic, Youtube, X, Sparkles, RefreshCw, Play, Pause, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { mockTemplates, mockClients } from '@/types';
import { useToast } from '@/hooks/use-toast';

interface CreatePostModalProps {
  children: React.ReactNode;
}

const CreatePostModal: React.FC<CreatePostModalProps> = ({
  children
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<string>('text');
  const [ideaText, setIdeaText] = useState('');
  const [selectedObjective, setSelectedObjective] = useState<string>('');
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [selectedSubClient, setSelectedSubClient] = useState<string>('');
  const [voiceNotes, setVoiceNotes] = useState('');
  const [recordingLanguage, setRecordingLanguage] = useState('English');
  const [urlInput, setUrlInput] = useState('');
  const [urlRemarks, setUrlRemarks] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [hasRecording, setHasRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [postSuggestions, setPostSuggestions] = useState(['The €0 AI Toolkit No SME Knows About: Revealing 5 underground open-source tools that can replace €5,000 worth of enterprise software, without compromising on quality or performance.', 'Why 90% of Digital Transformations Fail (And The 3-Step Framework That Actually Works): Real data from 500+ enterprise projects reveals the hidden pitfalls.', 'The LinkedIn Algorithm Just Changed: Here\'s exactly what content performs best in 2024, backed by analysis of 10,000+ posts from top performers.', 'From Startup to Scale-Up: The 7 critical technology decisions that will make or break your growth phase (learned from 50+ companies we\'ve consulted).']);
  const [hoveredSuggestion, setHoveredSuggestion] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const navigate = useNavigate();
  const { clientId } = useParams<{ clientId: string; }>();
  const { toast } = useToast();
  const objectives = ['Thought Leadership', 'Product Launch', 'Event Promotion', 'Brand Awareness', 'Lead Generation', 'Customer Education', 'Community Building'];

  // Get current client and sub-clients
  const currentClient = mockClients.find(client => client.id === clientId);
  const subClients = currentClient?.subClients || [];

  const handleCreateFromText = () => {
    if (ideaText.trim() && clientId && selectedSubClient) {
      const tempIdeaId = `temp-${Date.now()}`;
      const textData = {
        idea: ideaText.trim(),
        objective: selectedObjective,
        template: selectedTemplate,
        subClientId: selectedSubClient
      };
      navigate(`/clients/${clientId}/ideas/${tempIdeaId}?new=true&method=text&data=${encodeURIComponent(JSON.stringify(textData))}`);
      setIsOpen(false);
      resetForm();
    }
  };

  const handleCreateFromVoice = () => {
    if (clientId && hasRecording && selectedSubClient) {
      const tempIdeaId = `temp-${Date.now()}`;
      const voiceData = {
        language: recordingLanguage,
        notes: voiceNotes,
        objective: selectedObjective,
        template: selectedTemplate,
        subClientId: selectedSubClient,
        hasRecording: true
      };
      navigate(`/clients/${clientId}/ideas/${tempIdeaId}?new=true&method=voice&data=${encodeURIComponent(JSON.stringify(voiceData))}`);
      setIsOpen(false);
      resetForm();
    }
  };

  const handleCreateFromUrl = () => {
    if (urlInput.trim() && clientId && selectedSubClient) {
      const tempIdeaId = `temp-${Date.now()}`;
      const urlData = {
        url: urlInput,
        remarks: urlRemarks,
        objective: selectedObjective,
        template: selectedTemplate,
        subClientId: selectedSubClient
      };
      navigate(`/clients/${clientId}/ideas/${tempIdeaId}?new=true&method=url&data=${encodeURIComponent(JSON.stringify(urlData))}`);
      setIsOpen(false);
      resetForm();
    }
  };

  const handleCreateFromSuggestion = (suggestion: string) => {
    if (clientId && selectedSubClient) {
      const tempIdeaId = `temp-${Date.now()}`;
      const suggestionData = {
        initialIdea: suggestion,
        objective: selectedObjective,
        template: selectedTemplate,
        subClientId: selectedSubClient
      };
      navigate(`/clients/${clientId}/ideas/${tempIdeaId}?new=true&method=suggestion&data=${encodeURIComponent(JSON.stringify(suggestionData))}`);
      setIsOpen(false);
      resetForm();
    }
  };

  const refreshSuggestions = async () => {
    setIsRefreshing(true);
    const allSuggestions = ['The €0 AI Toolkit No SME Knows About: Revealing 5 underground open-source tools that can replace €5,000 worth of enterprise software, without compromising on quality or performance.', 'Why 90% of Digital Transformations Fail (And The 3-Step Framework That Actually Works): Real data from 500+ enterprise projects reveals the hidden pitfalls.', 'The LinkedIn Algorithm Just Changed: Here\'s exactly what content performs best in 2024, backed by analysis of 10,000+ posts from top performers.', 'From Startup to Scale-Up: The 7 critical technology decisions that will make or break your growth phase (learned from 50+ companies we\'ve consulted).', 'The Remote Work Revolution: 5 productivity tools that increased our team\'s output by 40% while reducing meeting time by half.', 'Cloud Migration Mistakes That Cost Companies Millions: What we learned from 100+ failed migrations and how to avoid them.', 'The Future of Cybersecurity: Why traditional firewalls are becoming obsolete and what\'s replacing them.', 'Building SaaS Products That Scale: Technical decisions we made at day 1 that saved us from rewriting everything at 1M users.'];
    
    // Simulate loading time
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const shuffled = allSuggestions.sort(() => 0.5 - Math.random());
    setPostSuggestions(shuffled.slice(0, 4));
    setIsRefreshing(false);
  };

  const resetForm = () => {
    setIdeaText('');
    setSelectedObjective('');
    setSelectedTemplate('');
    setSelectedSubClient('');
    setVoiceNotes('');
    setUrlInput('');
    setUrlRemarks('');
    setRecordingLanguage('English');
    setIsRecording(false);
    setRecordingTime(0);
    setHasRecording(false);
    setAudioBlob(null);
    setIsPlaying(false);
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
    }
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
  };

  const startVoiceRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = event => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        console.log('Recording saved:', audioBlob);
        setAudioBlob(audioBlob);
        setHasRecording(true);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setRecordingTime(0);

      recordingTimerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

      toast({
        title: "Recording started",
        description: "Speak clearly into your microphone"
      });
    } catch (error) {
      console.error('Error accessing microphone:', error);
      toast({
        title: "Microphone access denied",
        description: "Please allow microphone access to record audio",
        variant: "destructive"
      });
    }
  };

  const stopVoiceRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
      toast({
        title: "Recording stopped",
        description: `Recorded ${recordingTime} seconds of audio`
      });
    }
  };

  const playRecording = () => {
    if (audioBlob && !isPlaying) {
      const audioUrl = URL.createObjectURL(audioBlob);
      audioRef.current = new Audio(audioUrl);
      audioRef.current.onended = () => {
        setIsPlaying(false);
        URL.revokeObjectURL(audioUrl);
      };
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const stopPlayback = () => {
    if (audioRef.current && isPlaying) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
    }
  };

  const formatRecordingTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
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
      color: 'bg-[#4F46E5] text-white'
    }
  ];

  const handleMethodSelect = (methodId: string) => {
    setSelectedMethod(methodId);
  };

  const renderObjectiveAndTemplate = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-fade-in">
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          Objective (optional)
        </label>
        <Select value={selectedObjective} onValueChange={setSelectedObjective}>
          <SelectTrigger className="transition-all hover:border-[#4F46E5]/50 focus:border-[#4F46E5]">
            <SelectValue placeholder="Select an objective" />
          </SelectTrigger>
          <SelectContent>
            {objectives.map(objective => (
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
          <SelectTrigger className="transition-all hover:border-[#4F46E5]/50 focus:border-[#4F46E5]">
            <SelectValue placeholder="Select a template" />
          </SelectTrigger>
          <SelectContent>
            {mockTemplates.map(template => (
              <SelectItem key={template.id} value={template.id}>
                {template.templateName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );

  const truncateText = (text: string, maxLength: number = 350) => {
    // Only truncate if it's extremely long; CSS line clamp does the rest
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
  };

  const renderRightPanel = () => {
    switch (selectedMethod) {
      case 'text':
        return (
          <div className="space-y-6 animate-fade-in">
            {renderObjectiveAndTemplate()}

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Insert any text to turn into a post <span className="text-destructive">*</span>
              </label>
              <Textarea 
                value={ideaText} 
                onChange={e => setIdeaText(e.target.value)} 
                placeholder="Enter your idea here..." 
                className="min-h-[200px] resize-none transition-all hover:border-[#4F46E5]/50 focus:border-[#4F46E5]" 
              />
            </div>

            <Button 
              onClick={handleCreateFromText} 
              disabled={!ideaText.trim() || !selectedSubClient} 
              className="w-full py-3 bg-[#4F46E5] hover:bg-[#4338CA] transition-all transform hover:scale-[1.02] disabled:transform-none"
            >
              Generate post from text
            </Button>
          </div>
        );

      case 'voice':
        return (
          <div className="space-y-6 animate-fade-in">
            {renderObjectiveAndTemplate()}

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Recording Language
              </label>
              <Select value={recordingLanguage} onValueChange={setRecordingLanguage}>
                <SelectTrigger className="transition-all hover:border-[#4F46E5]/50 focus:border-[#4F46E5]">
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
                onChange={e => setVoiceNotes(e.target.value)} 
                placeholder="Why you want to speak on this topic?&#10;What you want to convey to your audience?" 
                className="min-h-[120px] resize-none transition-all hover:border-[#4F46E5]/50 focus:border-[#4F46E5]" 
              />
            </div>

            {isRecording && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center animate-fade-in">
                <div className="flex items-center justify-center gap-2 text-red-600 font-medium">
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                  Recording: {formatRecordingTime(recordingTime)}
                </div>
              </div>
            )}

            {hasRecording && !isRecording && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 animate-fade-in">
                <div className="flex items-center justify-between">
                  <div className="text-green-700 font-medium">
                    ✓ Recording completed ({formatRecordingTime(recordingTime)})
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={isPlaying ? stopPlayback : playRecording} 
                    className="flex items-center gap-2 hover:border-[#4F46E5] hover:text-[#4F46E5] transition-all"
                  >
                    {isPlaying ? (
                      <>
                        <Pause className="w-4 h-4" />
                        Stop
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4" />
                        Play
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}

            <Button 
              onClick={isRecording ? stopVoiceRecording : startVoiceRecording} 
              className={`w-full py-3 transition-all transform hover:scale-[1.02] ${
                isRecording 
                  ? 'bg-red-600 hover:bg-red-700' 
                  : 'bg-[#4F46E5] hover:bg-[#4338CA]'
              }`}
            >
              {isRecording ? (
                <>
                  <div className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse" />
                  Stop voice recording
                </>
              ) : (
                <>
                  <Mic className="w-4 h-4 mr-2" />
                  {hasRecording ? 'Record again' : 'Start voice recording'}
                </>
              )}
            </Button>

            {hasRecording && (
              <Button 
                onClick={handleCreateFromVoice} 
                disabled={!selectedSubClient}
                className="w-full py-3 bg-[#4F46E5] hover:bg-[#4338CA] transition-all transform hover:scale-[1.02] disabled:transform-none"
              >
                Generate post from voice
              </Button>
            )}
          </div>
        );

      case 'url':
        return (
          <div className="space-y-6 animate-fade-in">
            {renderObjectiveAndTemplate()}

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                YouTube or Article URL <span className="text-destructive">*</span>
              </label>
              <Input 
                value={urlInput} 
                onChange={e => setUrlInput(e.target.value)} 
                placeholder="https://www.youtube.com/watch?v=... or https://example.com/article" 
                className="transition-all hover:border-[#4F46E5]/50 focus:border-[#4F46E5]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Additional remarks (optional)
              </label>
              <Textarea 
                value={urlRemarks} 
                onChange={e => setUrlRemarks(e.target.value)} 
                placeholder="Any specific aspects you want to focus on or additional context..." 
                className="min-h-[100px] resize-none transition-all hover:border-[#4F46E5]/50 focus:border-[#4F46E5]" 
              />
            </div>

            <Button 
              onClick={handleCreateFromUrl} 
              disabled={!urlInput.trim() || !selectedSubClient} 
              className="w-full py-3 bg-[#4F46E5] hover:bg-[#4338CA] transition-all transform hover:scale-[1.02] disabled:transform-none"
            >
              Generate posts from URL
            </Button>
          </div>
        );

      case 'suggestions':
        return (
          <div className="h-full flex flex-col animate-fade-in">
            <div className="relative h-full">
              {/* Floating Refresh Button */}
              <button 
                onClick={refreshSuggestions}
                disabled={isRefreshing}
                className="absolute top-0 right-0 z-10 p-2 rounded-full bg-white border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed group"
                aria-label="Refresh suggestions"
              >
                <RefreshCw className={`h-4 w-4 text-gray-600 transition-transform duration-500 ${isRefreshing ? 'animate-spin' : 'group-hover:rotate-180'}`} />
              </button>

              {/* 2x2 Grid Container */}
              <div className="grid grid-cols-2 gap-3 h-full pr-12">
                {isRefreshing ? (
                  Array.from({ length: 4 }).map((_, index) => (
                    <div 
                      key={`skeleton-${index}`}
                      className="relative p-4 rounded-xl border border-gray-200 bg-gradient-to-br from-gray-50 to-gray-100 animate-pulse h-[170px]"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <div className="space-y-2">
                        <div className="h-3 bg-gray-300 rounded animate-pulse"></div>
                        <div className="h-3 bg-gray-300 rounded w-4/5 animate-pulse"></div>
                        <div className="h-3 bg-gray-300 rounded w-3/5 animate-pulse"></div>
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
                    </div>
                  ))
                ) : (
                  postSuggestions.map((suggestion, index) => (
                    <div 
                      key={index} 
                      className={`relative p-5 rounded-xl border border-gray-200 cursor-pointer transition-all duration-300 transform hover:scale-[1.025] hover:shadow-lg bg-gradient-to-br from-white to-gray-50/80 hover:from-[#4F46E5]/5 hover:to-[#4F46E5]/10 hover:border-[#4F46E5]/30 group flex items-start min-h-[140px] ${!selectedSubClient ? 'opacity-50 cursor-not-allowed' : ''}`}
                      style={{ 
                        animationDelay: `${index * 100}ms`,
                        height: '170px'
                      }}
                      onMouseEnter={() => selectedSubClient && setHoveredSuggestion(suggestion)}
                      onMouseLeave={() => setHoveredSuggestion(null)}
                      onClick={() => selectedSubClient && handleCreateFromSuggestion(suggestion)}
                      role="button"
                      tabIndex={selectedSubClient ? 0 : -1}
                      onKeyDown={(e) => {
                        if (selectedSubClient && (e.key === 'Enter' || e.key === ' ')) {
                          e.preventDefault();
                          handleCreateFromSuggestion(suggestion);
                        }
                      }}
                      aria-label={`Select post idea: ${truncateText(suggestion, 60)}`}
                    >
                      <div className="relative z-10 w-full">
                        <p className="text-sm text-foreground leading-relaxed font-medium line-clamp-6 break-words">
                          {suggestion}
                        </p>
                      </div>
                      <div className={`absolute inset-0 bg-gradient-to-br from-[#4F46E5]/0 to-[#4F46E5]/0 rounded-xl transition-all duration-300 ${
                        hoveredSuggestion === suggestion ? 'from-[#4F46E5]/5 to-[#4F46E5]/10' : ''
                      }`} />
                      <div className={`absolute top-2 right-2 w-2 h-2 rounded-full bg-[#4F46E5] opacity-0 transition-opacity duration-200 ${
                        hoveredSuggestion === suggestion ? 'opacity-100' : ''
                      }`} />
                    </div>
                  ))
                )}
              </div>
              
              {!selectedSubClient && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/80 rounded-lg">
                  <p className="text-sm text-muted-foreground">Please select who this post is for first</p>
                </div>
              )}
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
      <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Create New Post</DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-2 pb-6">
          {/* Left side - Creation methods and sub-client selection */}
          <div className="space-y-6">
            {/* Creation Methods */}
            <div className="space-y-3">
              {createMethods.map(method => (
                <button 
                  key={method.id} 
                  onClick={() => handleMethodSelect(method.id)} 
                  className={`w-full p-4 rounded-lg text-left transition-all duration-200 transform hover:scale-[1.02] border ${
                    selectedMethod === method.id 
                      ? 'border-[#4F46E5] bg-[#4F46E5]/5 shadow-lg' 
                      : 'border-border bg-card hover:border-[#4F46E5]/50 hover:bg-[#4F46E5]/5'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-lg transition-all ${method.color}`}>
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

            {/* Sub-client Selection - Now prominently placed */}
            <div className="p-4 border border-amber-200 bg-amber-50 rounded-lg">
              <label className="block text-sm font-semibold text-amber-800 mb-3">
                Who is this post for? <span className="text-red-600">*</span>
              </label>
              <Select value={selectedSubClient} onValueChange={setSelectedSubClient}>
                <SelectTrigger className="transition-all hover:border-amber-400 focus:border-amber-500 bg-white">
                  <SelectValue placeholder="Select who this post is for" />
                </SelectTrigger>
                <SelectContent>
                  {subClients.map(subClient => (
                    <SelectItem key={subClient.id} value={subClient.id}>
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        <span>{subClient.name}</span>
                        <span className="text-xs text-muted-foreground">({subClient.role})</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {!selectedSubClient && (
                <p className="text-xs text-amber-700 mt-2">
                  Please select who this post will be created for before proceeding.
                </p>
              )}
            </div>
          </div>

          {/* Right side - Dynamic content based on selected method (2/3) */}
          <div className="lg:col-span-2">
            {renderRightPanel()}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreatePostModal;
