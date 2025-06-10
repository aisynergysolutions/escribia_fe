import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Edit3, Mic, Plus, Upload, Youtube, Users, X } from 'lucide-react';
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

interface CreatePostModalProps {
  children: React.ReactNode;
}

const CreatePostModal: React.FC<CreatePostModalProps> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<string>('text');
  const [ideaText, setIdeaText] = useState('');
  const [voiceNotes, setVoiceNotes] = useState('');
  const [recordingLanguage, setRecordingLanguage] = useState('English');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [uploadRemarks, setUploadRemarks] = useState('');
  const [interviewRemarks, setInterviewRemarks] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  
  const navigate = useNavigate();
  const { clientId } = useParams<{ clientId: string }>();

  const handleCreateFromText = () => {
    if (ideaText.trim() && clientId) {
      const tempIdeaId = `temp-${Date.now()}`;
      navigate(`/clients/${clientId}/ideas/${tempIdeaId}?new=true&idea=${encodeURIComponent(ideaText.trim())}`);
      setIsOpen(false);
      setIdeaText('');
    }
  };

  const handleCreateFromVoice = () => {
    if (clientId) {
      const tempIdeaId = `temp-${Date.now()}`;
      const voiceData = {
        language: recordingLanguage,
        notes: voiceNotes,
        // In a real implementation, you'd include the recorded audio data here
      };
      navigate(`/clients/${clientId}/ideas/${tempIdeaId}?new=true&method=voice&data=${encodeURIComponent(JSON.stringify(voiceData))}`);
      setIsOpen(false);
      resetForm();
    }
  };

  const handleCreateBlank = () => {
    if (clientId) {
      const tempIdeaId = `temp-${Date.now()}`;
      navigate(`/clients/${clientId}/ideas/${tempIdeaId}?new=true&method=blank`);
      setIsOpen(false);
    }
  };

  const handleUploadFile = () => {
    if (uploadedFiles.length > 0 && clientId) {
      const tempIdeaId = `temp-${Date.now()}`;
      const uploadData = {
        files: uploadedFiles.map(file => ({ name: file.name, size: file.size, type: file.type })),
        remarks: uploadRemarks
      };
      navigate(`/clients/${clientId}/ideas/${tempIdeaId}?new=true&method=upload&data=${encodeURIComponent(JSON.stringify(uploadData))}`);
      setIsOpen(false);
      resetForm();
    }
  };

  const handleYoutubeSubmit = () => {
    if (youtubeUrl.trim() && clientId) {
      const tempIdeaId = `temp-${Date.now()}`;
      const youtubeData = {
        url: youtubeUrl,
        remarks: uploadRemarks
      };
      navigate(`/clients/${clientId}/ideas/${tempIdeaId}?new=true&method=youtube&data=${encodeURIComponent(JSON.stringify(youtubeData))}`);
      setIsOpen(false);
      resetForm();
    }
  };

  const handleContentInterview = () => {
    if (clientId) {
      const tempIdeaId = `temp-${Date.now()}`;
      const interviewData = {
        remarks: interviewRemarks
      };
      navigate(`/clients/${clientId}/ideas/${tempIdeaId}?new=true&method=interview&data=${encodeURIComponent(JSON.stringify(interviewData))}`);
      setIsOpen(false);
      resetForm();
    }
  };

  const resetForm = () => {
    setIdeaText('');
    setVoiceNotes('');
    setYoutubeUrl('');
    setUploadRemarks('');
    setInterviewRemarks('');
    setUploadedFiles([]);
    setRecordingLanguage('English');
    setIsRecording(false);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      setUploadedFiles(prev => [...prev, ...Array.from(files)]);
    }
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const startVoiceRecording = () => {
    setIsRecording(true);
    // In a real implementation, you would start actual voice recording here
    console.log('Starting voice recording...');
  };

  const stopVoiceRecording = () => {
    setIsRecording(false);
    // In a real implementation, you would stop recording and process the audio
    console.log('Stopping voice recording...');
  };

  const createMethods = [
    {
      id: 'text',
      title: 'Generate from text',
      description: 'Turn any text into a post',
      icon: Edit3,
      color: 'bg-indigo-100 text-indigo-600'
    },
    {
      id: 'voice',
      title: 'Generate from voice',
      description: 'Record voice memo',
      icon: Mic,
      color: 'bg-purple-100 text-purple-600'
    },
    {
      id: 'blank',
      title: 'Blank',
      description: 'Start a post from scratch',
      icon: Plus,
      color: 'bg-gray-100 text-gray-600'
    },
    {
      id: 'upload',
      title: 'Upload file to content',
      description: 'Upload audio, video, or text',
      icon: Upload,
      color: 'bg-orange-100 text-orange-600'
    },
    {
      id: 'youtube',
      title: 'YouTube to content',
      description: 'Turn YouTube videos into content',
      icon: Youtube,
      color: 'bg-red-100 text-red-600'
    },
    {
      id: 'interview',
      title: 'Content interview',
      description: 'Turn conversations into content',
      icon: Users,
      color: 'bg-green-100 text-green-600'
    }
  ];

  const handleMethodSelect = (methodId: string) => {
    setSelectedMethod(methodId);
  };

  const renderRightPanel = () => {
    switch (selectedMethod) {
      case 'text':
        return (
          <div className="space-y-4">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Edit3 className="h-5 w-5 text-indigo-500" />
                <h3 className="text-lg font-medium text-foreground">Generate from text</h3>
              </div>
              <p className="text-muted-foreground mb-4">
                Write down your unstructured thoughts and Scripe will turn them into a post.
              </p>
            </div>

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

            <div className="text-center text-sm text-muted-foreground">
              Using Standard AI model. <span className="text-primary cursor-pointer hover:underline">Upgrade now</span> for higher quality posts.
            </div>
          </div>
        );

      case 'voice':
        return (
          <div className="space-y-4">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Mic className="h-5 w-5 text-purple-500" />
                <h3 className="text-lg font-medium text-foreground">Generate from voice</h3>
              </div>
              <p className="text-muted-foreground mb-4">
                Record your thoughts about any topic and Scripe will turn them into a post.
              </p>
            </div>

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
              className={`w-full py-3 ${isRecording ? 'bg-destructive hover:bg-destructive/90' : 'bg-purple-600 hover:bg-purple-700'}`}
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

            {!isRecording && (
              <div className="text-center text-sm text-muted-foreground">
                Using Standard AI model. <span className="text-primary cursor-pointer hover:underline">Upgrade now</span> for higher quality posts.
              </div>
            )}
          </div>
        );

      case 'blank':
        return (
          <div className="space-y-4">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Plus className="h-5 w-5 text-muted-foreground" />
                <h3 className="text-lg font-medium text-foreground">Blank</h3>
              </div>
              <p className="text-muted-foreground mb-4">
                Opens the editor without generating any content. Recommended if you already have a finished post draft that you want to finetune.
              </p>
            </div>

            <Button
              onClick={handleCreateBlank}
              variant="secondary"
              className="w-full py-3"
            >
              Create blank post
            </Button>
          </div>
        );

      case 'upload':
        return (
          <div className="space-y-4">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Upload className="h-5 w-5 text-orange-500" />
                <h3 className="text-lg font-medium text-foreground">Upload file to content</h3>
              </div>
              <p className="text-muted-foreground mb-4">
                Upload audio, video, or text files and turn them into posts.
              </p>
            </div>

            <div className="border-2 border-dashed border-border rounded-lg p-6 text-center bg-muted/20">
              <Upload className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
              <p className="text-foreground mb-2">Drag and drop files here or click to upload</p>
              <p className="text-sm text-muted-foreground mb-4">Audio, video, PDF, or text files</p>
              <input
                type="file"
                multiple
                onChange={handleFileUpload}
                className="hidden"
                id="file-upload"
                accept="audio/*,video/*,.pdf,.txt,.doc,.docx"
              />
              <Button
                variant="outline"
                onClick={() => document.getElementById('file-upload')?.click()}
              >
                Select Files
              </Button>
            </div>

            {uploadedFiles.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-foreground">Uploaded Files:</h4>
                {uploadedFiles.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                    <span className="text-sm text-foreground truncate">{file.name}</span>
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

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Additional remarks (optional)
              </label>
              <Textarea
                value={uploadRemarks}
                onChange={(e) => setUploadRemarks(e.target.value)}
                placeholder="Any additional context or instructions..."
                className="min-h-[100px] resize-none"
              />
            </div>

            <Button
              onClick={handleUploadFile}
              disabled={uploadedFiles.length === 0}
              className="w-full bg-orange-600 hover:bg-orange-700 py-3"
            >
              Generate posts from files
            </Button>

            <div className="text-center text-sm text-muted-foreground">
              Using Standard AI model. <span className="text-primary cursor-pointer hover:underline">Upgrade now</span> for higher quality posts.
            </div>
          </div>
        );

      case 'youtube':
        return (
          <div className="space-y-4">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Youtube className="h-5 w-5 text-red-500" />
                <h3 className="text-lg font-medium text-foreground">YouTube to content</h3>
              </div>
              <p className="text-muted-foreground mb-4">
                Turn YouTube videos into engaging posts by providing the video URL.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                YouTube URL <span className="text-destructive">*</span>
              </label>
              <Input
                value={youtubeUrl}
                onChange={(e) => setYoutubeUrl(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Additional remarks (optional)
              </label>
              <Textarea
                value={uploadRemarks}
                onChange={(e) => setUploadRemarks(e.target.value)}
                placeholder="Any specific aspects you want to focus on or additional context..."
                className="min-h-[100px] resize-none"
              />
            </div>

            <Button
              onClick={handleYoutubeSubmit}
              disabled={!youtubeUrl.trim()}
              className="w-full bg-red-600 hover:bg-red-700 py-3"
            >
              Generate posts from YouTube
            </Button>

            <div className="text-center text-sm text-muted-foreground">
              Using Standard AI model. <span className="text-primary cursor-pointer hover:underline">Upgrade now</span> for higher quality posts.
            </div>
          </div>
        );

      case 'interview':
        return (
          <div className="space-y-4">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Users className="h-5 w-5 text-green-500" />
                <h3 className="text-lg font-medium text-foreground">Content interview</h3>
              </div>
              <p className="text-muted-foreground mb-4">
                Turn conversations and interviews into engaging content posts.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Interview context and remarks (optional)
              </label>
              <Textarea
                value={interviewRemarks}
                onChange={(e) => setInterviewRemarks(e.target.value)}
                placeholder="Describe the interview topic, key participants, or any specific angles you want to focus on..."
                className="min-h-[150px] resize-none"
              />
            </div>

            <Button
              onClick={handleContentInterview}
              className="w-full bg-green-600 hover:bg-green-700 py-3"
            >
              Start content interview
            </Button>

            <div className="text-center text-sm text-muted-foreground">
              Using Standard AI model. <span className="text-primary cursor-pointer hover:underline">Upgrade now</span> for higher quality posts.
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
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Choose how you want to create posts
          </DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          {/* Left side - Creation methods */}
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-3">Create one post</h3>
              <div className="space-y-2">
                {createMethods.slice(0, 3).map((method) => (
                  <button
                    key={method.id}
                    onClick={() => handleMethodSelect(method.id)}
                    className={`w-full p-3 rounded-lg text-left transition-all hover:bg-accent border ${
                      selectedMethod === method.id 
                        ? 'border-primary bg-accent' 
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
            </div>

            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-3">Create many posts from input</h3>
              <div className="space-y-2">
                {createMethods.slice(3).map((method) => (
                  <button
                    key={method.id}
                    onClick={() => handleMethodSelect(method.id)}
                    className={`w-full p-3 rounded-lg text-left transition-all hover:bg-accent border ${
                      selectedMethod === method.id 
                        ? 'border-primary bg-accent' 
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
            </div>
          </div>

          {/* Right side - Dynamic content based on selected method */}
          <div className="space-y-4">
            {renderRightPanel()}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreatePostModal;
