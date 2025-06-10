
import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Edit3, Mic, Plus, Upload, Youtube, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
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
  const navigate = useNavigate();
  const { clientId } = useParams<{ clientId: string }>();

  const handleCreateFromText = () => {
    if (ideaText.trim() && clientId) {
      const tempIdeaId = `temp-${Date.now()}`;
      // Navigate to idea page with the idea text as a URL parameter
      navigate(`/clients/${clientId}/ideas/${tempIdeaId}?new=true&idea=${encodeURIComponent(ideaText.trim())}`);
      setIsOpen(false);
      setIdeaText('');
    }
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
    if (methodId !== 'text') {
      // For other methods, navigate directly to idea page
      if (clientId) {
        const tempIdeaId = `temp-${Date.now()}`;
        navigate(`/clients/${clientId}/ideas/${tempIdeaId}?new=true&method=${methodId}`);
        setIsOpen(false);
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-slate-900 text-white border-slate-700">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-white">
            Choose how you want to create posts
          </DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          {/* Left side - Creation methods */}
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-medium text-slate-300 mb-3">Create one post</h3>
              <div className="space-y-2">
                {createMethods.slice(0, 3).map((method) => (
                  <button
                    key={method.id}
                    onClick={() => handleMethodSelect(method.id)}
                    className={`w-full p-3 rounded-lg text-left transition-all hover:bg-slate-800 border ${
                      selectedMethod === method.id 
                        ? 'border-indigo-500 bg-slate-800' 
                        : 'border-slate-700 bg-slate-800/50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${method.color}`}>
                        <method.icon className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="font-medium text-white">{method.title}</div>
                        <div className="text-sm text-slate-400">{method.description}</div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-slate-300 mb-3">Create many posts from input</h3>
              <div className="space-y-2">
                {createMethods.slice(3).map((method) => (
                  <button
                    key={method.id}
                    onClick={() => handleMethodSelect(method.id)}
                    className="w-full p-3 rounded-lg text-left transition-all hover:bg-slate-800 border border-slate-700 bg-slate-800/50"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${method.color}`}>
                        <method.icon className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="font-medium text-white">{method.title}</div>
                        <div className="text-sm text-slate-400">{method.description}</div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right side - Text input area */}
          {selectedMethod === 'text' && (
            <div className="space-y-4">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Edit3 className="h-5 w-5 text-indigo-400" />
                  <h3 className="text-lg font-medium text-white">Generate from text</h3>
                </div>
                <p className="text-slate-400 mb-4">
                  Write down your unstructured thoughts and Scripe will turn them into a post.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Insert any text to turn into a post <span className="text-red-400">*</span>
                </label>
                <Textarea
                  value={ideaText}
                  onChange={(e) => setIdeaText(e.target.value)}
                  placeholder="Enter your idea here..."
                  className="min-h-[200px] bg-slate-800 border-slate-600 text-white placeholder:text-slate-500 resize-none"
                />
              </div>

              <div className="text-sm text-slate-400">
                <p>No need to prompt, turn content into posts.</p>
                <p>Recommended min length is 100 characters.</p>
              </div>

              <Button
                onClick={handleCreateFromText}
                disabled={!ideaText.trim()}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3"
              >
                Generate post from text
              </Button>

              <div className="text-center text-sm text-slate-400">
                Using Standard AI model. <span className="text-indigo-400 cursor-pointer">Upgrade now</span> for higher quality posts.
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreatePostModal;
