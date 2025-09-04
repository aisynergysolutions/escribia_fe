import React, { useState, useRef, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Profile, useProfiles } from '@/context/ProfilesContext';
import { TemplateCard, useTemplates } from '@/context/TemplatesContext';
import { useNavigate, useParams } from 'react-router-dom';
import { Edit3, Mic, Youtube, X, Sparkles, RefreshCw, User, ChevronDown, Loader2, FileText, Copy, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { usePosts } from '@/context/PostsContext';
import { useAuth } from '@/context/AuthContext';
import { usePostDetails } from '@/context/PostDetailsContext';
import { doc as firestoreDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { url } from 'inspector';

interface CreatePostModalProps {
  children: React.ReactNode;
}

const CreatePostModal: React.FC<CreatePostModalProps> = ({
  children
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [postId, setPostId] = useState<string>('');
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
  // Mock suggestions for when no profile is selected
  const mockSuggestions = [
    'The €0 AI Toolkit No SME Knows About: Revealing 5 underground open-source tools that can replace €5,000 worth of enterprise software, without compromising on quality or performance.',
    'Why 90% of Digital Transformations Fail (And The 3-Step Framework That Actually Works): Real data from 500+ enterprise projects reveals the hidden pitfalls.',
    "The LinkedIn Algorithm Just Changed: Here's exactly what content performs best in 2024, backed by analysis of 10,000+ posts from top performers.",
    "From Startup to Scale-Up: The 7 critical technology decisions that will make or break your growth phase (learned from 50+ companies we've consulted)."
  ];
  const [postSuggestions, setPostSuggestions] = useState<string[]>(mockSuggestions);
  const [hoveredSuggestion, setHoveredSuggestion] = useState<string | null>(null);
  const [selectedSuggestion, setSelectedSuggestion] = useState<string | null>(null);
  const [editingSuggestion, setEditingSuggestion] = useState<string | null>(null);
  const [editedSuggestionText, setEditedSuggestionText] = useState<string>('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [hasFetchedSuggestions, setHasFetchedSuggestions] = useState<string | null>(null);
  const [loadingText, setLoadingText] = useState<string>('Analyzing source');
  const [loadingStage, setLoadingStage] = useState<number>(0);
  // Voice dictation (speech-to-text)
  const [isDictating, setIsDictating] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const recognitionRef = useRef<any>(null);
  const [voiceNotesFocused, setVoiceNotesFocused] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Check if user is on Firefox
  const isFirefox = typeof navigator !== 'undefined' && navigator.userAgent.toLowerCase().includes('firefox');
  const navigate = useNavigate();
  const { clientId } = useParams<{ clientId: string; }>();
  const { toast } = useToast();
  const { fetchProfiles, profiles: clientProfiles, setActiveClientId } = useProfiles();
  const { templates: allTemplates } = useTemplates();
  const { createPost, updatePostInContext, deletePost } = usePosts();
  const { saveNewDraft } = usePostDetails();
  const { currentUser } = useAuth();
  const objectives = ['Thought Leadership', 'Brand Awareness', 'Lead Generation', 'Talent attraction'];

  // Get the current agency ID from the authenticated user
  const agencyId = currentUser?.uid;

  // Handle loading text transitions
  useEffect(() => {
    if (!isLoading) {
      setLoadingStage(0);
      setLoadingText('Analyzing source');
      return;
    }

    const loadingMessages = ['Analyzing source', 'Extracting content', 'Generating post'];

    if (loadingStage < loadingMessages.length - 1) {
      const timer = setTimeout(() => {
        const nextStage = loadingStage + 1;
        setLoadingStage(nextStage);
        setLoadingText(loadingMessages[nextStage]);
      }, 3000); // Change text every 3 seconds

      return () => clearTimeout(timer);
    }
  }, [isLoading, loadingStage]);

  useEffect(() => {
    if (isOpen) {
      // Generate a random UUID when the modal opens
      setPostId(uuidv4());

      // Fetch profiles for the selected client
      if (clientId) {
        setActiveClientId(clientId);
        fetchProfiles(clientId).then(() => {
          setProfiles(clientProfiles);
        });
      }
    }
  }, [isOpen, clientId, fetchProfiles, setActiveClientId, clientProfiles]);

  const handleCreateFromText = async () => {
    if (!agencyId) {
      toast({
        title: 'Error',
        description: 'No agency ID available. Please ensure you are signed in.',
        variant: 'destructive',
      });
      return;
    }

    if (ideaText.trim() && clientId && selectedSubClient) {
      try {
        const selectedProfile = profiles.find(profile => profile.id === selectedSubClient);
        if (!selectedProfile) {
          toast({
            title: 'Error',
            description: 'Selected profile not found',
            variant: 'destructive',
          });
          return;
        }

        // Show loader on the button
        setIsLoading(true);

        // Step 1: Generate a unique post ID
        const postId = uuidv4();

        // Step 2: Create the post in Firestore (without AI-generated content initially)
        const selectedTemplateObj = allTemplates.find(t => t.id === selectedTemplate);
        console.log('[CreatePostModal] Creating post for agency:', agencyId, 'client:', clientId);
        await createPost(agencyId, clientId, {
          profileId: selectedProfile.id,
          profileName: selectedProfile.profileName,
          profileRole: selectedProfile.role || '',
          objective: selectedObjective,
          templateUsedId: selectedTemplate,
          templateUsedName: selectedTemplateObj ? selectedTemplateObj.templateName : '',
          initialIdeaPrompt: ideaText.trim(),
        }, postId);

        // Step 3: Generate AI content and let Railway save it to Firestore
        let result;
        try {
          const response = await fetch('https://web-production-2fc1.up.railway.app/api/v1/posts/generate', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              agency_id: agencyId,
              client_id: clientId,
              subclient_id: selectedProfile.id,
              idea_id: postId,
              save: true,
              create_title: true,
              create_hooks: true,
            }),
          });

          if (!response.ok) {
            throw new Error('Failed to fetch from the endpoint');
          }

          result = await response.json();
        } catch (error) {
          console.error('Error fetching from endpoint:', error);
          toast({
            title: 'AI Generation Error',
            description: 'There was a problem generating your post. Please try again in a few minutes.',
            variant: 'destructive',
          });
          setIsLoading(false);
          return;
        }

        // Step 4: Check if generation was successful and update context
        if (result.success) {
          // Update the context with the AI-generated title
          if (result.title) {
            await updatePostInContext(agencyId, clientId, postId, {
              title: result.title,
              ...(result.post_content && { currentDraftText: result.post_content }),
              ...(result.generatedHooks && { generatedHooks: result.generatedHooks }),
              ...(result.hooks && { generatedHooks: result.hooks })
            });
          }

          toast({
            title: 'Post Generated',
            description: 'Your post has been successfully generated.',
          });
          console.log('Generated Post:', result.post_content);
          console.log('Generated Title:', result.title);
          console.log('Generated Hooks:', result.generatedHooks || result.hooks);
          resetForm();
          // Navigate to the PostDetails page - it will fetch fresh data from Firestore
          navigate(`/clients/${clientId}/posts/${postId}`);

          setIsOpen(false);

        } else {
          toast({
            title: 'AI Generation Error',
            description: result.error || 'Failed to generate post. Please try again in a few minutes.',
            variant: 'destructive',
          });
          setIsLoading(false);
          // Delete firestore document if generation failed
          await deletePost(agencyId, clientId, postId);
          return;
        }
      } catch (error) {
        console.error('Error generating post:', error);
        toast({
          title: 'Error',
          description: 'An unexpected error occurred. Please try again.',
          variant: 'destructive',
        });
      } finally {
        // Hide the loader
        setIsLoading(false);
      }
    }
  };

  const handleCreateFromVoice = () => {
    if (!agencyId) {
      toast({
        title: 'Error',
        description: 'No agency ID available. Please ensure you are signed in.',
        variant: 'destructive',
      });
      return;
    }

    if (clientId && hasRecording && selectedSubClient) {
      const temppostId = `temp-${Date.now()}`;
      const voiceData = {
        agencyId,
        language: recordingLanguage,
        notes: voiceNotes,
        objective: selectedObjective,
        template: selectedTemplate,
        subClientId: selectedSubClient,
        hasRecording: true
      };
      navigate(`/clients/${clientId}/posts/${temppostId}?new=true&method=voice&data=${encodeURIComponent(JSON.stringify(voiceData))}`);
      setIsOpen(false);
      resetForm();
    }
  };

  const handleCreateFromUrl = async () => {
    if (!agencyId) {
      toast({
        title: 'Error',
        description: 'No agency ID available. Please ensure you are signed in.',
        variant: 'destructive',
      });
      return;
    }

    if (urlInput.trim() && clientId && selectedSubClient) {
      try {
        const selectedProfile = profiles.find(profile => profile.id === selectedSubClient);
        if (!selectedProfile) {
          toast({
            title: 'Error',
            description: 'Selected profile not found',
            variant: 'destructive',
          });
          return;
        }

        // Show loader on the button
        setIsLoading(true);

        // Step 1: Generate a unique post ID
        const postId = uuidv4();

        // Step 2: Create the post in Firestore (without AI-generated content initially)
        const selectedTemplateObj = allTemplates.find(t => t.id === selectedTemplate);
        console.log('[CreatePostModal] Creating URL post for agency:', agencyId, 'client:', clientId);
        await createPost(agencyId, clientId, {

          profileId: selectedProfile.id,
          profileName: selectedProfile.profileName,
          profileRole: selectedProfile.role || '',
          objective: selectedObjective,
          templateUsedId: selectedTemplate,
          templateUsedName: selectedTemplateObj ? selectedTemplateObj.templateName : '',
          initialIdeaPrompt: urlRemarks.trim() ? urlRemarks.trim() : '',
        }, postId);

        // Step 2.5: Update the document with URL fields that the Railway API expects
        const postRef = firestoreDoc(db, 'agencies', agencyId, 'clients', clientId, 'ideas', postId);
        await updateDoc(postRef, {
          sourceUrl: urlInput.trim(), // Primary field for Railway API
          // sourceURL: {
          //   url: urlInput.trim(),
          //   remarks: urlRemarks.trim()
          // },
          updatedAt: new Date().toISOString()
        });

        // Step 3: Generate AI content from URL using Railway API
        let result;
        try {
          const response = await fetch('https://web-production-2fc1.up.railway.app/api/v1/posts/generate', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              agency_id: agencyId,
              client_id: clientId,
              subclient_id: selectedProfile.id,
              idea_id: postId,
              input_mode: 'link',
              save: true,
              create_title: true,
              create_hooks: true,
            }),
          });

          if (!response.ok) {
            throw new Error('Failed to fetch from the endpoint');
          }

          result = await response.json();
        } catch (error) {
          console.error('Error fetching from endpoint:', error);
          toast({
            title: 'AI Generation Error',
            description: 'There was a problem generating your post from the URL. Please try again in a few minutes.',
            variant: 'destructive',
          });
          setIsRefreshing(false);
          setIsLoading(false);
          return;
        }

        // Step 4: Check if generation was successful and update context
        if (result.success) {
          // Update the context with the AI-generated title and content
          if (result.title) {
            await updatePostInContext(agencyId, clientId, postId, {
              title: result.title,
              ...(result.post_content && { currentDraftText: result.post_content }),
              ...(result.generatedHooks && { generatedHooks: result.generatedHooks }),
              ...(result.hooks && { generatedHooks: result.hooks })
            });
          }

          toast({
            title: 'Post Generated',
            description: 'Your post has been successfully generated from the URL.',
          });
          console.log('Generated Post from URL:', result.post_content);
          console.log('Generated Title:', result.title);
          console.log('Generated Hooks:', result.generatedHooks || result.hooks);
          console.log('Source URL:', result.source_url);
          console.log('Source Type:', result.source_type);
          resetForm();
          navigate(`/clients/${clientId}/posts/${postId}?new=true`);

          setIsOpen(false);
          setIsLoading(false);
          setIsRefreshing(false);
        } else {
          toast({
            title: 'AI Generation Error',
            description: result.error || 'Failed to generate post from URL. Please try again in a few minutes.',
            variant: 'destructive',
          });
          setIsRefreshing(false);
          setIsLoading(false);
          // Delete firestore document if generation failed
          await deletePost(agencyId, clientId, postId);
          return;
        }
      } catch (error) {
        console.error('Error generating post from URL:', error);
        toast({
          title: 'Error',
          description: 'An unexpected error occurred. Please try again.',
          variant: 'destructive',
        });
      } finally {
        // Hide the loader
        setIsRefreshing(false);
        setIsLoading(false);
      }
    }
  };

  const handleStartFromScratch = async () => {
    if (!agencyId) {
      toast({
        title: 'Error',
        description: 'No agency ID available. Please ensure you are signed in.',
        variant: 'destructive',
      });
      return;
    }

    // Check if profile is selected
    if (!selectedSubClient) {
      toast({
        title: 'Select a Profile',
        description: 'Please select a profile first to create a post.',
        variant: 'destructive',
      });
      return;
    }

    if (clientId && selectedSubClient) {
      try {
        const selectedProfile = profiles.find(profile => profile.id === selectedSubClient);
        if (!selectedProfile) {
          toast({
            title: 'Error',
            description: 'Selected profile not found',
            variant: 'destructive',
          });
          return;
        }

        // Generate a unique post ID
        const postId = uuidv4();

        // Create a blank post in Firestore (bypassing AI generation)
        console.log('[CreatePostModal] Creating blank post for agency:', agencyId, 'client:', clientId);
        await createPost(agencyId, clientId, {
          profileId: selectedProfile.id,
          profileName: selectedProfile.profileName,
          profileRole: selectedProfile.role || '',
          objective: '',
          templateUsedId: '',
          templateUsedName: '',
          initialIdeaPrompt: '',
          title: 'Untitled Post',
        }, postId);

        // Save a blank draft
        await saveNewDraft(agencyId, clientId, postId, '', 'Blank draft created from scratch', false);

        toast({
          title: 'Blank Post Created',
          description: 'Your blank post has been created. Start writing!',
        });

        resetForm();
        navigate(`/clients/${clientId}/posts/${postId}?new=true&scratch=true`);
        setIsOpen(false);

      } catch (error) {
        console.error('Error creating blank post:', error);
        toast({
          title: 'Error',
          description: 'An unexpected error occurred. Please try again.',
          variant: 'destructive',
        });
      }
    }
  };

  const handleCreateFromSuggestion = (suggestion: string) => {
    if (!agencyId) {
      toast({
        title: 'Error',
        description: 'No agency ID available. Please ensure you are signed in.',
        variant: 'destructive',
      });
      return;
    }

    if (clientId && selectedSubClient && suggestion) {
      const temppostId = `temp-${Date.now()}`;
      const suggestionData = {
        agencyId,
        initialIdea: suggestion,
        objective: selectedObjective,
        template: selectedTemplate,
        subClientId: selectedSubClient
      };
      navigate(`/clients/${clientId}/posts/${temppostId}?new=true&method=suggestion&data=${encodeURIComponent(JSON.stringify(suggestionData))}`);
      setIsOpen(false);
      resetForm();
    }
  };

  // Generate a post from the voice transcript (same flow as from text)
  const handleCreateFromTranscript = async () => {
    if (!agencyId) {
      toast({
        title: 'Error',
        description: 'No agency ID available. Please ensure you are signed in.',
        variant: 'destructive',
      });
      return;
    }

    // Combine interim transcript if dictation is still active
    const combinedTranscript = (transcript + (interimTranscript ? (transcript ? ' ' : '') + interimTranscript : '')).trim();

    if (combinedTranscript && clientId && selectedSubClient) {
      try {
        // Stop dictation to freeze the text
        if (isDictating) stopDictation();

        const selectedProfile = profiles.find(profile => profile.id === selectedSubClient);
        if (!selectedProfile) {
          toast({
            title: 'Error',
            description: 'Selected profile not found',
            variant: 'destructive',
          });
          return;
        }

        // Show loader on the button
        setIsLoading(true);

        // Step 1: Generate a unique post ID
        const postId = uuidv4();

        // Step 2: Create the post in Firestore (without AI-generated content initially)
        const selectedTemplateObj = allTemplates.find(t => t.id === selectedTemplate);
        console.log('[CreatePostModal] Creating post from transcript for agency:', agencyId, 'client:', clientId);
        await createPost(agencyId, clientId, {
          profileId: selectedProfile.id,
          profileName: selectedProfile.profileName,
          profileRole: selectedProfile.role || '',
          objective: selectedObjective,
          templateUsedId: selectedTemplate,
          templateUsedName: selectedTemplateObj ? selectedTemplateObj.templateName : '',
          initialIdeaPrompt: combinedTranscript,
        }, postId);

        // Step 3: Generate AI content and let Railway save it to Firestore
        let result;
        try {
          const response = await fetch('https://web-production-2fc1.up.railway.app/api/v1/posts/generate', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              agency_id: agencyId,
              client_id: clientId,
              subclient_id: selectedProfile.id,
              idea_id: postId,
              save: true,
              create_title: true,
              create_hooks: true,
            }),
          });

          if (!response.ok) {
            throw new Error('Failed to fetch from the endpoint');
          }

          result = await response.json();
        } catch (error) {
          console.error('Error fetching from endpoint:', error);
          toast({
            title: 'AI Generation Error',
            description: 'There was a problem generating your post. Please try again in a few minutes.',
            variant: 'destructive',
          });
          setIsLoading(false);
          return;
        }

        // Step 4: Check if generation was successful and update context
        if (result.success) {
          if (result.title) {
            await updatePostInContext(agencyId, clientId, postId, {
              title: result.title,
              ...(result.post_content && { currentDraftText: result.post_content }),
              ...(result.generatedHooks && { generatedHooks: result.generatedHooks }),
              ...(result.hooks && { generatedHooks: result.hooks })
            });
          }

          toast({
            title: 'Post Generated',
            description: 'Your post has been successfully generated from the transcription.',
          });
          resetForm();
          navigate(`/clients/${clientId}/posts/${postId}`);
          setIsOpen(false);
        } else {
          toast({
            title: 'AI Generation Error',
            description: result.error || 'Failed to generate post. Please try again in a few minutes.',
            variant: 'destructive',
          });
          setIsLoading(false);
          await deletePost(agencyId, clientId, postId);
          return;
        }
      } catch (error) {
        console.error('Error generating post from transcript:', error);
        toast({
          title: 'Error',
          description: 'An unexpected error occurred. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleSuggestionSelect = (suggestion: string) => {
    setSelectedSuggestion(suggestion);
  };

  const handleCreateFromSelectedSuggestion = async () => {
    if (!agencyId) {
      toast({
        title: 'Error',
        description: 'No agency ID available. Please ensure you are signed in.',
        variant: 'destructive',
      });
      return;
    }

    if (selectedSuggestion && clientId && selectedSubClient) {
      try {
        const selectedProfile = profiles.find(profile => profile.id === selectedSubClient);
        if (!selectedProfile) {
          toast({
            title: 'Error',
            description: 'Selected profile not found',
            variant: 'destructive',
          });
          return;
        }

        // Show loader on the button
        setIsLoading(true);

        // Step 1: Generate a unique post ID
        const postId = uuidv4();

        // Step 2: Create the post in Firestore (without AI-generated content initially)
        const selectedTemplateObj = allTemplates.find(t => t.id === selectedTemplate);
        console.log('[CreatePostModal] Creating post from suggestion for agency:', agencyId, 'client:', clientId);
        await createPost(agencyId, clientId, {
          profileId: selectedProfile.id,
          profileName: selectedProfile.profileName,
          profileRole: selectedProfile.role || '',
          objective: selectedObjective,
          templateUsedId: selectedTemplate,
          templateUsedName: selectedTemplateObj ? selectedTemplateObj.templateName : '',
          initialIdeaPrompt: selectedSuggestion,
        }, postId);

        // Step 3: Generate AI content and let Railway save it to Firestore
        let result;
        try {
          const response = await fetch('https://web-production-2fc1.up.railway.app/api/v1/posts/generate', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              agency_id: agencyId,
              client_id: clientId,
              subclient_id: selectedProfile.id,
              idea_id: postId,
              save: true,
              create_title: true,
              create_hooks: true,
            }),
          });

          if (!response.ok) {
            throw new Error('Failed to fetch from the endpoint');
          }

          result = await response.json();
        } catch (error) {
          console.error('Error fetching from endpoint:', error);
          toast({
            title: 'AI Generation Error',
            description: 'There was a problem generating your post. Please try again in a few minutes.',
            variant: 'destructive',
          });
          setIsLoading(false);
          return;
        }

        // Step 4: Check if generation was successful and update context
        if (result.success) {
          // Update the context with the AI-generated title
          if (result.title) {
            await updatePostInContext(agencyId, clientId, postId, {
              title: result.title,
              ...(result.post_content && { currentDraftText: result.post_content }),
              ...(result.generatedHooks && { generatedHooks: result.generatedHooks }),
              ...(result.hooks && { generatedHooks: result.hooks })
            });
          }

          toast({
            title: 'Post Generated',
            description: 'Your post has been successfully generated from the AI suggestion.',
          });
          console.log('Generated Post from suggestion:', result.post_content);
          console.log('Generated Title:', result.title);
          console.log('Generated Hooks:', result.generatedHooks || result.hooks);
          resetForm();
          // Navigate to the PostDetails page - it will fetch fresh data from Firestore
          navigate(`/clients/${clientId}/posts/${postId}`);

          setIsOpen(false);

        } else {
          toast({
            title: 'AI Generation Error',
            description: result.error || 'Failed to generate post. Please try again in a few minutes.',
            variant: 'destructive',
          });
          setIsLoading(false);
          // Delete firestore document if generation failed
          await deletePost(agencyId, clientId, postId);
          return;
        }
      } catch (error) {
        console.error('Error generating post from suggestion:', error);
        toast({
          title: 'Error',
          description: 'An unexpected error occurred. Please try again.',
          variant: 'destructive',
        });
      } finally {
        // Hide the loader
        setIsLoading(false);
      }
    }
  };

  const handleCopySuggestion = (suggestion: string) => {
    navigator.clipboard.writeText(suggestion);
    toast({
      title: 'Copied',
      description: 'Suggestion copied to clipboard',
    });
  };

  const handleEditSuggestion = (suggestion: string) => {
    setEditingSuggestion(suggestion);
    setEditedSuggestionText(suggestion);
  };

  const handleSaveEditedSuggestion = () => {
    if (editingSuggestion && editedSuggestionText.trim()) {
      const updatedSuggestions = postSuggestions.map(s =>
        s === editingSuggestion ? editedSuggestionText.trim() : s
      );
      setPostSuggestions(updatedSuggestions);

      // Update selected suggestion if it was the one being edited
      if (selectedSuggestion === editingSuggestion) {
        setSelectedSuggestion(editedSuggestionText.trim());
      }

      setEditingSuggestion(null);
      setEditedSuggestionText('');

      toast({
        title: 'Updated',
        description: 'Suggestion has been updated',
      });
    }
  };

  const handleCancelEdit = () => {
    setEditingSuggestion(null);
    setEditedSuggestionText('');
  };

  // Fetch AI suggestions from Railway API
  const fetchAISuggestions = async (agencyId: string, clientId: string, subClientId: string) => {
    setIsRefreshing(true);
    setSelectedSuggestion(null);
    try {
      const response = await fetch('https://web-production-2fc1.up.railway.app/api/v1/ideas/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agency_id: agencyId,
          client_id: clientId,
          subclient_id: subClientId,
          num_ideas: 4,
          save: false,
          debug_prompts: false
        })
      });
      if (!response.ok) throw new Error('Failed to fetch suggestions');
      const data = await response.json();
      if (data.success && Array.isArray(data.ideas)) {
        setPostSuggestions(data.ideas.map((idea: any) => idea.text));
        setHasFetchedSuggestions(subClientId);
      } else {
        setPostSuggestions(["Could not fetch suggestions. Please try again."]);
      }
    } catch (e) {
      setPostSuggestions(["Could not fetch suggestions. Please try again."]);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Refresh suggestions handler
  const refreshSuggestions = async () => {
    if (!selectedSubClient || !agencyId || !clientId) return;
    await fetchAISuggestions(agencyId, clientId, selectedSubClient);
  };

  // Fetch suggestions when user navigates to suggestions tab
  useEffect(() => {
    if (selectedMethod === 'suggestions' && selectedSubClient && agencyId && clientId) {
      // Only fetch if we haven't fetched for this profile yet
      if (hasFetchedSuggestions !== selectedSubClient) {
        fetchAISuggestions(agencyId, clientId, selectedSubClient);
      }
    } else if (selectedMethod !== 'suggestions' && !selectedSubClient) {
      // Only reset to mock suggestions if no profile is selected
      setPostSuggestions(mockSuggestions);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedMethod, selectedSubClient, agencyId, clientId]);

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
    setTranscript('');
    setInterimTranscript('');
    setIsDictating(false);
    setSelectedSuggestion(null);
    setEditingSuggestion(null);
    setEditedSuggestionText('');
    setHasFetchedSuggestions(null);
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
    }
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
  };

  // Map UI language to BCP-47 code for Web Speech API
  const getSpeechLang = (lang: string) => {
    switch (lang) {
      case 'Spanish':
        return 'es-ES';
      case 'French':
        return 'fr-FR';
      case 'German':
        return 'de-DE';
      case 'Italian':
        return 'it-IT';
      case 'English':
      default:
        return 'en-US';
    }
  };

  const startDictation = () => {
    try {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (!SpeechRecognition) {
        toast({
          title: 'Speech recognition not supported',
          description: 'Please use Chrome/Edge on desktop for dictation.',
          variant: 'destructive',
        });
        return;
      }
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = getSpeechLang(recordingLanguage);

      recognition.onstart = () => {
        setIsDictating(true);
        setInterimTranscript('');
      };
      recognition.onerror = (e: any) => {
        console.error('Speech recognition error:', e);
        toast({ title: 'Dictation error', description: 'Please try again.', variant: 'destructive' });
        setIsDictating(false);
      };
      recognition.onend = () => {
        setIsDictating(false);
        setInterimTranscript('');
      };
      recognition.onresult = (event: any) => {
        let interim = '';
        let finalAdd = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const res = event.results[i];
          if (res.isFinal) {
            finalAdd += res[0].transcript;
          } else {
            interim += res[0].transcript;
          }
        }
        if (finalAdd) {
          setTranscript((prev) => (prev ? prev + ' ' : '') + finalAdd.trim());
        }
        setInterimTranscript(interim.trim());
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.error('Failed to start dictation:', err);
      toast({ title: 'Could not start dictation', description: 'Check microphone permissions and try again.', variant: 'destructive' });
    }
  };

  const stopDictation = () => {
    try {
      recognitionRef.current?.stop?.();
    } catch (err) {
      console.error('Failed to stop dictation:', err);
    } finally {
      setIsDictating(false);
      setInterimTranscript('');
    }
  };

  // Stop dictation when modal closes or method/language changes
  useEffect(() => {
    if (!isOpen || selectedMethod !== 'voice') {
      if (isDictating) stopDictation();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, selectedMethod]);

  useEffect(() => {
    if (isDictating) {
      // Restart with new language
      stopDictation();
      setTimeout(startDictation, 50);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recordingLanguage]);

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
      description: 'Turn videos or articles into content',
      icon: Youtube,
      color: 'bg-muted text-muted-foreground'
    },
    {
      id: 'suggestions',
      title: 'Post Suggestions',
      description: 'AI-generated post ideas',
      icon: Sparkles,
      color: 'bg-[#4F46E5] text-white'
    },
  ];

  const handleMethodSelect = (methodId: string) => {
    setSelectedMethod(methodId);
  };

  const renderObjectiveAndTemplate = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-fade-in">
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          Objective
        </label>
        <Select value={selectedObjective} onValueChange={(value) => setSelectedObjective(value === "none" ? "" : value)}>
          <SelectTrigger className="transition-all hover:border-[#4F46E5]/50 focus:border-[#4F46E5]">
            <SelectValue placeholder="Select an objective" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">
              <span className="text-muted-foreground ">Select an objective</span>
            </SelectItem>
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
          Template
        </label>
        <Select value={selectedTemplate} onValueChange={(value) => setSelectedTemplate(value === "none" ? "" : value)}>
          <SelectTrigger className="transition-all hover:border-[#4F46E5]/50 focus:border-[#4F46E5]">
            <SelectValue placeholder="Select a template" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">
              <span className="text-muted-foreground">Select a template</span>
            </SelectItem>
            {allTemplates.map(template => (
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
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
  };

  // Show authentication error if no agency ID
  if (!agencyId) {
    return (
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          {children}
        </DialogTrigger>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <div className="text-center">
              <h3 className="text-lg font-semibold text-red-600 mb-2">Authentication Required</h3>
              <p className="text-sm text-gray-600">
                Please sign in to create posts.
              </p>
            </div>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    );
  }

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

            <div className="text-xs text-muted-foreground">
              You can add media and polls after creating the post
            </div>

            <Button
              onClick={handleCreateFromText}
              disabled={!ideaText.trim() || !selectedSubClient || isLoading}
              className="w-full py-3 bg-[#4F46E5] hover:bg-[#4338CA] transition-all transform hover:scale-[1.02] disabled:transform-none"
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin w-4 h-4 mr-2 inline-block" /> Generating post from text...
                </>
              ) : (
                'Generate post from text'
              )}
            </Button>

            {/* Start from scratch link */}
            <div className="text-center">
              <span className="text-sm text-muted-foreground">Prefer to write it yourself? </span>
              <button
                onClick={handleStartFromScratch}
                className="text-sm text-[#4F46E5] hover:text-[#4338CA] underline font-medium transition-colors"
              >
                Start from scratch
              </button>
            </div>
          </div>
        );

      case 'voice':
        return (
          <div className="relative space-y-6 animate-fade-in">
            {/* Firefox Overlay */}
            {isFirefox && (
              <div className="absolute inset-0 bg-white/90 backdrop-blur-sm z-10 rounded-lg flex items-center justify-center">
                <div className="text-center bg-white rounded-lg shadow-lg p-6 border border-gray-200 max-w-sm">
                  <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Mic className="w-8 h-8 text-orange-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">Browser Not Supported</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Voice transcription requires Chrome, Edge, or Safari. Firefox doesn't support the Web Speech API yet.
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Try switching to Chrome or Edge to use voice dictation.
                  </p>
                </div>
              </div>
            )}

            {renderObjectiveAndTemplate()}

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Dictation Language
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
                Take notes before dictating (optional)
              </label>
              <Textarea
                value={voiceNotes}
                onChange={e => setVoiceNotes(e.target.value)}
                onFocus={() => setVoiceNotesFocused(true)}
                onBlur={() => setVoiceNotesFocused(false)}
                placeholder="Why you want to speak on this topic?&#10;What you want to convey to your audience?"
                className={`${(voiceNotesFocused || voiceNotes.trim()) ? 'min-h-[120px]' : 'min-h-[44px]'} resize-none transition-all duration-200 hover:border-[#4F46E5]/50 focus:border-[#4F46E5]`}
              />
            </div>

            {/* Dictation controls */}
            <div className="space-y-3">
              <Button
                onClick={isDictating ? stopDictation : startDictation}
                className={`w-full py-3 transition-all transform hover:scale-[1.02] ${isDictating ? 'bg-red-600 hover:bg-red-700' : 'bg-[#4F46E5] hover:bg-[#4338CA]'} `}
              >
                {isDictating ? (
                  <>
                    <div className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse" />
                    Stop dictation
                  </>
                ) : (
                  <>
                    <Mic className="w-4 h-4 mr-2" />
                    Dictate
                  </>
                )}
              </Button>

              {isDictating && (
                <div className="flex items-center gap-2 text-sm text-red-600">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                  Listening... Speak clearly into your microphone
                </div>
              )}
            </div>

            {/* Editable transcript */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-foreground">Transcript</label>
              <Textarea
                value={transcript + (interimTranscript ? (transcript ? ' ' : '') + interimTranscript : '')}
                onChange={(e) => setTranscript(e.target.value)}
                placeholder="Your words will appear here. You can edit this text."
                className="min-h-[50px] resize-none transition-all hover:border-[#4F46E5]/50 focus:border-[#4F46E5]"
              />
              <p className="text-xs text-muted-foreground">We don’t store audio. Dictation works in-browser and only saves text.</p>
              <Button
                onClick={handleCreateFromTranscript}
                disabled={!selectedSubClient || !((transcript + (interimTranscript ? (transcript ? ' ' : '') + interimTranscript : '')).trim()) || isLoading}
                className="w-full py-3 bg-[#4F46E5] hover:bg-[#4338CA] transition-all transform hover:scale-[1.02] disabled:transform-none mt-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="animate-spin w-4 h-4 mr-2 inline-block" /> Generating post from transcription...
                  </>
                ) : (
                  'Generate text from transcription'
                )}
              </Button>

              {/* Start from scratch link */}
              <div className="text-center mt-4">
                <span className="text-sm text-muted-foreground">Prefer to write it yourself? </span>
                <button
                  onClick={handleStartFromScratch}
                  className="text-sm text-[#4F46E5] hover:text-[#4338CA] underline font-medium transition-colors"
                >
                  Start from scratch
                </button>
              </div>
            </div>
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
                Additional remarks
              </label>
              <Textarea
                value={urlRemarks}
                onChange={e => setUrlRemarks(e.target.value)}
                placeholder="Any specific aspects you want to focus on or additional context..."
                className="min-h-[100px] resize-none transition-all hover:border-[#4F46E5]/50 focus:border-[#4F46E5]"
              />
            </div>

            <div className="text-xs text-muted-foreground">
              AI will analyze the content from the URL and generate a LinkedIn post
            </div>

            <Button
              onClick={handleCreateFromUrl}
              disabled={!urlInput.trim() || !selectedSubClient || isLoading}
              className="w-full py-3 bg-[#4F46E5] hover:bg-[#4338CA] transition-all transform hover:scale-[1.02] disabled:transform-none"
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin w-4 h-4 mr-2 inline-block" /> {loadingText}...
                </>
              ) : (
                'Generate post from link'
              )}
            </Button>

            {/* Start from scratch link */}
            <div className="text-center">
              <span className="text-sm text-muted-foreground">Prefer to write it yourself? </span>
              <button
                onClick={handleStartFromScratch}
                className="text-sm text-[#4F46E5] hover:text-[#4338CA] underline font-medium transition-colors"
              >
                Start from scratch
              </button>
            </div>
          </div>
        );

      case 'suggestions':
        return (
          <div className="relative h-full flex flex-col animate-fade-in overflow-hidden">
            <div className="relative h-full overflow-hidden">
              {/* Floating Refresh Button */}
              <button
                onClick={refreshSuggestions}
                disabled={isRefreshing || !selectedSubClient}
                className="absolute top-0 right-0 z-10 p-2 rounded-full bg-white border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed group"
                aria-label="Refresh suggestions"
              >
                <RefreshCw className={`h-4 w-4 text-gray-600 transition-transform duration-500 ${isRefreshing ? 'animate-spin' : 'group-hover:rotate-180'}`} />
              </button>

              {/* 2x2 Grid Container */}
              <div className="grid grid-cols-2 gap-3 h-full pr-12 overflow-hidden pb-16">
                {isRefreshing ? (
                  Array.from({ length: 4 }).map((_, index) => (
                    <div
                      key={`skeleton-${index}`}
                      className="relative p-4 rounded-xl border border-gray-200 bg-gradient-to-br from-gray-50 to-gray-100 animate-pulse flex-shrink-0"
                      style={{
                        animationDelay: `${index * 100}ms`,
                        height: '170px',
                        minWidth: 0
                      }}
                    >
                      <div className="space-y-2 w-full overflow-hidden">
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
                      className={`relative p-5 rounded-xl border transition-all duration-300 flex-shrink-0 ${!selectedSubClient
                        ? 'opacity-50 cursor-not-allowed blur-[2px] bg-gradient-to-br from-gray-100 to-gray-200 border-gray-200'
                        : editingSuggestion === suggestion
                          ? 'bg-gradient-to-br from-[#4F46E5]/10 to-[#4F46E5]/5 border-[#4F46E5] shadow-lg'
                          : selectedSuggestion === suggestion
                            ? 'cursor-pointer bg-gradient-to-br from-[#4F46E5]/10 to-[#4F46E5]/5 border-[#4F46E5] shadow-lg'
                            : 'cursor-pointer transform hover:shadow-lg bg-gradient-to-br from-white to-gray-50/80 hover:from-[#4F46E5]/5 hover:to-[#4F46E5]/10 hover:border-[#4F46E5]/30 border-gray-200'
                        } group flex items-start`}
                      style={{
                        animationDelay: `${index * 100}ms`,
                        height: '170px',
                        minWidth: 0
                      }}
                      onMouseEnter={() => selectedSubClient && editingSuggestion !== suggestion && setHoveredSuggestion(suggestion)}
                      onMouseLeave={() => editingSuggestion !== suggestion && setHoveredSuggestion(null)}
                      onClick={() => selectedSubClient && editingSuggestion !== suggestion && handleSuggestionSelect(suggestion)}
                      role="button"
                      tabIndex={selectedSubClient && editingSuggestion !== suggestion ? 0 : -1}
                      onKeyDown={(e) => {
                        if (selectedSubClient && editingSuggestion !== suggestion && (e.key === 'Enter' || e.key === ' ')) {
                          e.preventDefault();
                          handleSuggestionSelect(suggestion);
                        }
                      }}
                      aria-label={`Select post idea: ${truncateText(suggestion, 60)}`}
                    >
                      {editingSuggestion === suggestion ? (
                        <div className="relative z-10 w-full h-full flex flex-col">
                          <textarea
                            value={editedSuggestionText}
                            onChange={(e) => setEditedSuggestionText(e.target.value)}
                            className="w-full flex-1 text-sm resize-none border-none outline-none bg-transparent font-medium leading-relaxed p-0 m-0"
                            autoFocus
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && e.ctrlKey) {
                                e.preventDefault();
                                handleSaveEditedSuggestion();
                              } else if (e.key === 'Escape') {
                                e.preventDefault();
                                handleCancelEdit();
                              }
                              e.stopPropagation();
                            }}
                            onMouseDown={(e) => e.stopPropagation()}
                            onMouseUp={(e) => e.stopPropagation()}
                            onClick={(e) => e.stopPropagation()}
                            style={{ fontFamily: 'inherit' }}
                          />
                          <div className="flex gap-2 mt-2 flex-shrink-0">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSaveEditedSuggestion();
                              }}
                              className="px-2 py-1 text-xs bg-[#4F46E5] text-white rounded hover:bg-[#4338CA] transition-colors"
                            >
                              Save
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCancelEdit();
                              }}
                              className="px-2 py-1 text-xs bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition-colors"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="relative z-10 w-full overflow-hidden">
                            <p className="text-sm text-foreground leading-relaxed font-medium line-clamp-6 break-words overflow-hidden">
                              {suggestion}
                            </p>
                          </div>

                          {/* Action buttons on hover */}
                          {selectedSubClient && hoveredSuggestion === suggestion && editingSuggestion !== suggestion && (
                            <div className="absolute top-2 right-2 flex gap-1 z-20">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCopySuggestion(suggestion);
                                }}
                                className="p-1.5 bg-white/90 hover:bg-white border border-gray-200 rounded-md shadow-sm hover:shadow-md transition-all"
                                title="Copy suggestion"
                              >
                                <Copy className="w-3 h-3 text-gray-600" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEditSuggestion(suggestion);
                                }}
                                className="p-1.5 bg-white/90 hover:bg-white border border-gray-200 rounded-md shadow-sm hover:shadow-md transition-all"
                                title="Edit suggestion"
                              >
                                <Edit className="w-3 h-3 text-gray-600" />
                              </button>
                            </div>
                          )}

                          {/* Selection indicator */}
                          {/* {selectedSubClient && selectedSuggestion === suggestion && (
                            <div className="absolute top-2 right-2 w-3 h-3 bg-[#4F46E5] rounded-full z-10" />
                          )} */}
                        </>
                      )}
                    </div>
                  ))
                )}
              </div>

              {/* Create Post Button */}
              <div className="absolute bottom-0 left-0 right-12 bg-white/95 backdrop-blur-sm p-4">
                <Button
                  onClick={handleCreateFromSelectedSuggestion}
                  disabled={!selectedSuggestion || !selectedSubClient || isRefreshing || isLoading}
                  className="w-full py-3 bg-[#4F46E5] hover:bg-[#4338CA] transition-all transform hover:scale-[1.02] disabled:transform-none disabled:bg-gray-300 disabled:text-gray-500"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="animate-spin w-4 h-4 mr-2 inline-block" /> Generating post from idea...
                    </>
                  ) : isRefreshing
                    ? 'Generating suggestions...'
                    : selectedSuggestion
                      ? 'Create post from selected idea'
                      : 'Select an idea to continue'}
                </Button>

                {/* Start from scratch link */}
                <div className="text-center mt-3">
                  <span className="text-sm text-muted-foreground">Prefer to write it yourself? </span>
                  <button
                    onClick={handleStartFromScratch}
                    className="text-sm text-[#4F46E5] hover:text-[#4338CA] underline font-medium transition-colors"
                  >
                    Start from scratch
                  </button>
                </div>
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
          <div className="flex items-center gap-4 pb-4">
            <label className="text-lg font-semibold text-foreground">
              Create Post as:
            </label>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-3 px-4 py-3 bg-transparent border-0 rounded-md cursor-pointer hover:bg-gray-100 focus:outline-none focus:bg-gray-100 transition-all min-w-[280px]">
                  {selectedSubClient ? (
                    <>
                      <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
                        <User className="w-4 h-4 text-gray-600" />
                      </div>
                      <div className="flex flex-col items-start flex-1 min-w-0">
                        <div className="text-sm font-medium text-foreground truncate w-full">
                          {profiles.find(profile => profile.id === selectedSubClient)?.profileName || 'Unknown'}
                        </div>
                        <div className="text-xs text-muted-foreground truncate w-full">
                          {profiles.find(profile => profile.id === selectedSubClient)?.role || ''}
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="flex items-center gap-3 flex-1">
                      <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
                        <User className="w-4 h-4 text-gray-600" />
                      </div>
                      <span className="text-sm text-muted-foreground">Select who this post is for</span>
                    </div>
                  )}
                  <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-[280px] bg-white border shadow-lg z-50" align="start">
                {profiles.map(profile => (
                  <DropdownMenuItem
                    key={profile.id}
                    onClick={() => setSelectedSubClient(profile.id)}
                    className={`flex items-center gap-3 p-3 cursor-pointer hover:bg-gray-100 ${selectedSubClient === profile.id ? 'bg-gray-50' : ''
                      }`}
                  >
                    <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
                      <User className="w-4 h-4 text-gray-600" />
                    </div>
                    <div className="flex flex-col items-start flex-1 min-w-0">
                      <div className="text-sm font-medium text-foreground truncate w-full">
                        {profile.profileName}
                      </div>
                      <div className="text-xs text-muted-foreground truncate w-full">
                        {profile.role}
                      </div>
                    </div>
                    {selectedSubClient === profile.id && (
                      <div className="w-2 h-2 bg-[#4F46E5] rounded-full flex-shrink-0" />
                    )}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <Separator className="border-gray-200" />
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-6 pb-6">
          {/* Left side - Creation methods */}
          <div className="space-y-6">
            {/* Creation Methods */}
            <div className="space-y-3">
              {createMethods.map(method => (
                <button
                  key={method.id}
                  onClick={() => handleMethodSelect(method.id)}
                  className={`w-full p-4 rounded-lg text-left transition-all duration-200 transform hover:scale-[1.02] border ${selectedMethod === method.id
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