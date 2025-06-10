import React, { useState } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Edit3, BarChart, Settings as SettingsIcon, PlusCircle, Calendar, Clock, Linkedin, RefreshCw, Search, ArrowUpDown, FileText, MessageCircle, TrendingUp, Users } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import IdeaCard from '../components/ui/IdeaCard';
import PostCalendar from '../components/ui/PostCalendar';
import CommentCard from '../components/ui/CommentCard';
import StatCard from '../components/ui/StatCard';
import { mockClients, mockIdeas, Idea } from '../types';
import CreatePostModal from '../components/CreatePostModal';

// Mock LinkedIn posts data
const mockLinkedInPosts = [
  {
    id: '1',
    author: {
      name: 'Sarah Johnson',
      title: 'CTO at InnovateNow',
      profileImage: undefined
    },
    content: 'Just implemented a new AI-powered solution that reduced our processing time by 60%. The key was finding the right balance between automation and human oversight. What challenges are you facing with AI implementation in your organization?',
    publishedAt: '2024-01-15T10:30:00Z',
    engagement: { likes: 124, comments: 18, shares: 7 },
    url: 'https://linkedin.com/posts/example1',
    relevanceScore: 92
  },
  {
    id: '2',
    author: {
      name: 'Mike Chen',
      title: 'VP Engineering at DataFlow',
      profileImage: undefined
    },
    content: 'Enterprise software development is evolving rapidly. The companies that thrive are those that can adapt their architecture to be more modular and scalable. Thoughts on microservices vs monoliths in 2024?',
    publishedAt: '2024-01-14T14:15:00Z',
    engagement: { likes: 89, comments: 23, shares: 12 },
    url: 'https://linkedin.com/posts/example2',
    relevanceScore: 78
  }
];

const ClientDetails = () => {
  const { clientId } = useParams<{ clientId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  
  // Posts filtering and sorting state
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'updated' | 'created' | 'title' | 'status'>('updated');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  // Find client data
  const client = mockClients.find(c => c.id === clientId);
  
  // Find ideas for this client
  const clientIdeas = mockIdeas.filter(idea => idea.clientId === clientId);
  
  // Determine current section based on path
  const getCurrentSection = () => {
    const path = location.pathname;
    if (path.endsWith('/posts')) return 'posts';
    if (path.endsWith('/comments')) return 'comments';
    if (path.endsWith('/calendar')) return 'calendar';
    if (path.endsWith('/resources')) return 'resources';
    if (path.endsWith('/analytics')) return 'analytics';
    if (path.endsWith('/settings')) return 'settings';
    return 'overview';
  };

  const currentSection = getCurrentSection();
  
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
  
  // Filter and sort posts
  const getFilteredAndSortedPosts = (): Idea[] => {
    let filtered = clientIdeas;
    
    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(idea => 
        idea.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        idea.currentDraftText.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(idea => idea.status === statusFilter);
    }
    
    // Sort posts
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'updated':
          return b.updatedAt.seconds - a.updatedAt.seconds;
        case 'created':
          return b.createdAt.seconds - a.createdAt.seconds;
        case 'title':
          return a.title.localeCompare(b.title);
        case 'status':
          return a.status.localeCompare(b.status);
        default:
          return 0;
      }
    });
    
    return filtered;
  };

  // Get allowed statuses for filter tabs
  const getAllowedStatuses = () => {
    const allowedStatuses = ['Drafting', 'Reviewed', 'Scheduled', 'Published'];
    return allowedStatuses.filter(status => 
      clientIdeas.some(idea => idea.status === status)
    );
  };

  const getAIStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'training_queued':
        return 'bg-blue-100 text-blue-800';
      case 'pending_data':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (seconds: number) => {
    if (!seconds) return 'N/A';
    return new Date(seconds * 1000).toLocaleDateString();
  };

  const handleNewIdea = () => {
    const tempIdeaId = `temp-${Date.now()}`;
    navigate(`/clients/${clientId}/ideas/${tempIdeaId}?new=true`);
  };

  const renderOverview = () => {
    // Calculate statistics
    const totalPosts = clientIdeas.length;
    const publishedPosts = clientIdeas.filter(idea => idea.status === 'Published').length;
    const scheduledPosts = clientIdeas.filter(idea => idea.status === 'Scheduled').length;
    const draftPosts = clientIdeas.filter(idea => idea.status === 'Drafting').length;
    
    // Calculate total engagement from published posts
    const totalEngagement = clientIdeas
      .filter(idea => idea.performance)
      .reduce((sum, idea) => {
        const perf = idea.performance!;
        return sum + perf.likes + perf.comments + perf.shares;
      }, 0);

    // Calculate average engagement per post
    const publishedWithPerformance = clientIdeas.filter(idea => idea.performance);
    const avgEngagement = publishedWithPerformance.length > 0 
      ? Math.round(totalEngagement / publishedWithPerformance.length) 
      : 0;

    return (
      <div className="space-y-6">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Posts"
            value={totalPosts}
            icon={<FileText className="h-4 w-4" />}
            description="All time posts"
          />
          <StatCard
            title="Published"
            value={publishedPosts}
            icon={<TrendingUp className="h-4 w-4" />}
            description="Live posts"
            className="border-green-200 bg-green-50"
          />
          <StatCard
            title="Scheduled"
            value={scheduledPosts}
            icon={<Calendar className="h-4 w-4" />}
            description="Ready to go"
            className="border-blue-200 bg-blue-50"
          />
          <StatCard
            title="Avg. Engagement"
            value={avgEngagement}
            icon={<Users className="h-4 w-4" />}
            description="Per published post"
            className="border-purple-200 bg-purple-50"
          />
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-md">
          <div className="mb-4">
            <h2 className="text-xl font-semibold mb-2">Brand Summary</h2>
            <p className="text-gray-700">
              {client.brandBriefSummary || "No brand summary available."}
            </p>
          </div>
          
          <div className="border-t pt-4">
            <h3 className="text-lg font-medium mb-2">AI Training Status</h3>
            <div className="flex items-center">
              <Badge className={getAIStatusColor(client.aiTraining.status)}>
                {client.aiTraining.status}
              </Badge>
              {client.aiTraining.lastTrainedAt.seconds > 0 && (
                <span className="text-sm text-gray-500 ml-3">
                  Last trained: {new Date(client.aiTraining.lastTrainedAt.seconds * 1000).toLocaleDateString()}
                </span>
              )}
            </div>
            {client.aiTraining.modelVersion && (
              <div className="text-sm text-gray-500 mt-1">
                Model version: {client.aiTraining.modelVersion}
              </div>
            )}
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-2xl shadow-md">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Recent Posts</h2>
            <Link to={`/clients/${clientId}/posts`}>
              <Button variant="ghost" className="text-indigo-600 hover:text-indigo-700">
                View All
              </Button>
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {clientIdeas.slice(0, 3).map((idea) => (
              <IdeaCard key={idea.id} idea={idea} />
            ))}
            
            {clientIdeas.length === 0 && (
              <p className="text-gray-500 col-span-3 text-center py-6">
                No posts found for this client yet.
              </p>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderPosts = () => {
    const filteredPosts = getFilteredAndSortedPosts();
    const allowedStatuses = getAllowedStatuses();
    
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">All Posts</h2>
          <CreatePostModal>
            <Button className="bg-indigo-600 hover:bg-indigo-700">
              <PlusCircle className="h-4 w-4 mr-2" />
              New Post
            </Button>
          </CreatePostModal>
        </div>

        {/* Search and Sort Controls */}
        <div className="bg-white p-4 rounded-xl shadow-sm border">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search posts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                <SelectTrigger className="w-[140px]">
                  <ArrowUpDown className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="updated">Last Updated</SelectItem>
                  <SelectItem value="created">Date Created</SelectItem>
                  <SelectItem value="title">Title</SelectItem>
                  <SelectItem value="status">Status</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Status Filter Tabs */}
        <Tabs value={statusFilter} onValueChange={setStatusFilter} className="w-full">
          <TabsList className="grid grid-cols-[repeat(auto-fit,minmax(120px,1fr))] w-full">
            <TabsTrigger value="all" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white">
              All ({clientIdeas.length})
            </TabsTrigger>
            {allowedStatuses.map((status) => {
              const count = clientIdeas.filter(idea => idea.status === status).length;
              return (
                <TabsTrigger 
                  key={status} 
                  value={status}
                  className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white"
                >
                  {status} ({count})
                </TabsTrigger>
              );
            })}
          </TabsList>
        </Tabs>
        
        {/* Posts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPosts.map((idea) => (
            <IdeaCard key={idea.id} idea={idea} />
          ))}
          
          {filteredPosts.length === 0 && (
            <div className="col-span-3 text-center py-12">
              <p className="text-gray-500">
                {searchTerm || statusFilter !== 'all' 
                  ? "No posts match your filters." 
                  : "No posts found for this client yet."
                }
              </p>
              {(searchTerm || statusFilter !== 'all') && (
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSearchTerm('');
                    setStatusFilter('all');
                  }}
                  className="mt-2"
                >
                  Clear Filters
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderCalendar = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Content Calendar</h2>
        <p className="text-gray-600">View scheduled posts for {client.clientName}</p>
      </div>
      <PostCalendar />
    </div>
  );

  const renderResources = () => (
    <div className="bg-white p-6 rounded-2xl shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Resources</h2>
        <Button className="bg-indigo-600 hover:bg-indigo-700">
          <PlusCircle className="h-4 w-4 mr-2" />
          Upload Resource
        </Button>
      </div>
      <div className="text-center text-gray-500 py-12">
        <p>Resource management for {client.clientName} will be implemented here.</p>
        <p className="text-sm mt-2">Upload brand assets, guidelines, and other resources.</p>
      </div>
    </div>
  );

  const renderAnalytics = () => (
    <div className="bg-white p-6 rounded-2xl shadow-md">
      <h2 className="text-xl font-semibold mb-4">Analytics</h2>
      <div className="text-center text-gray-500 py-12">
        <BarChart className="h-12 w-12 mx-auto mb-4 text-gray-300" />
        <p>Analytics dashboard for {client.clientName} will be implemented here.</p>
        <p className="text-sm mt-2">Track engagement, reach, and content performance.</p>
      </div>
    </div>
  );

  const renderSettings = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Client Information Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Client Information</span>
            <Button variant="outline" size="sm">
              <Edit3 className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Client Name</h3>
              <p className="mt-1">{client.clientName}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Status</h3>
              <Badge className={`mt-1 ${
                client.status === 'active' ? 'bg-green-100 text-green-800' :
                client.status === 'onboarding' ? 'bg-blue-100 text-blue-800' :
                client.status === 'paused' ? 'bg-yellow-100 text-yellow-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {client.status}
              </Badge>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Created At</h3>
              <div className="mt-1 flex items-center gap-1">
                <Calendar className="h-4 w-4 text-gray-400" />
                <span>{formatDate(client.createdAt.seconds)}</span>
              </div>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Last Update</h3>
              <div className="mt-1 flex items-center gap-1">
                <Clock className="h-4 w-4 text-gray-400" />
                <span>{formatDate(client.updatedAt.seconds)}</span>
              </div>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Writing Style</h3>
              <p className="mt-1">{client.writingStyle || "Not specified"}</p>
            </div>
            <div className="col-span-2">
              <h3 className="text-sm font-medium text-gray-500">Brand Brief Summary</h3>
              <p className="mt-1">{client.brandBriefSummary || "No summary available"}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AI and Integration Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>AI & Integration Settings</span>
            <Button variant="outline" size="sm">
              <Edit3 className="h-4 w-4 mr-2" />
              Configure
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500">AI Training Status</h3>
              <Badge className={`mt-1 ${getAIStatusColor(client.aiTraining.status)}`}>
                {client.aiTraining.status}
              </Badge>
              {client.aiTraining.lastTrainedAt.seconds > 0 && (
                <div className="text-sm mt-1">
                  Last trained: {formatDate(client.aiTraining.lastTrainedAt.seconds)}
                </div>
              )}
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">LinkedIn API Tokens</h3>
              <div className="mt-1">
                <div className="flex items-center">
                  <Linkedin className="h-4 w-4 text-gray-400 mr-1" />
                  <span>125 remaining</span>
                </div>
                <div className="text-sm mt-1">Expires: June 15, 2025</div>
              </div>
            </div>
            <div className="col-span-2">
              <h3 className="text-sm font-medium text-gray-500">Custom AI Instructions</h3>
              <p className="mt-1 text-sm">{client.brandProfile.customInstructionsAI || "No custom instructions"}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Brand Profile Settings */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Brand Profile</span>
            <Button variant="outline" size="sm">
              <Edit3 className="h-4 w-4 mr-2" />
              Edit Profile
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion type="multiple" className="w-full">
            <AccordionItem value="basics">
              <AccordionTrigger className="text-base font-medium">Business Basics</AccordionTrigger>
              <AccordionContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-2">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Language</h3>
                    <p className="mt-1">{client.brandProfile.language}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Location Focus</h3>
                    <p className="mt-1">{client.brandProfile.locationFocus}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Business Size</h3>
                    <p className="mt-1">{client.brandProfile.businessSize}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Sells What</h3>
                    <p className="mt-1">{client.brandProfile.sellsWhat}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Sells to Whom</h3>
                    <p className="mt-1">{client.brandProfile.sellsToWhom}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">LinkedIn Profile</h3>
                    <a 
                      href={client.brandProfile.linkedinProfileUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="mt-1 text-indigo-600 hover:underline flex items-center"
                    >
                      <Linkedin className="h-4 w-4 mr-1" />
                      View Profile
                    </a>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="brandPersonality">
              <AccordionTrigger className="text-base font-medium">Brand Voice & Personality</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4 py-2">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Brand Personality</h3>
                    <div className="flex flex-wrap gap-1.5 mt-1.5">
                      {client.brandProfile.brandPersonality.map((trait, idx) => (
                        <Badge key={idx} variant="outline">{trait}</Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Brand Tone</h3>
                      <p className="mt-1">{client.brandProfile.brandTone}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Emotions to Evoke</h3>
                      <div className="flex flex-wrap gap-1.5 mt-1.5">
                        {client.brandProfile.emotionsToEvoke.map((emotion, idx) => (
                          <Badge key={idx} variant="secondary">{emotion}</Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Emoji Use</h3>
                      <p className="mt-1">{client.brandProfile.emojiUsage}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Desired Post Length</h3>
                      <p className="mt-1">{client.brandProfile.desiredPostLength}</p>
                    </div>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="brandStory">
              <AccordionTrigger className="text-base font-medium">Brand Story & Values</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4 py-2">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Core Values</h3>
                    <p className="mt-1">{client.brandProfile.coreValues}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Brand Story</h3>
                    <p className="mt-1">{client.brandProfile.brandStory}</p>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="trainingData">
              <AccordionTrigger className="text-base font-medium">Training Data</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4 py-2">
                  <h3 className="text-sm font-medium text-gray-500">Data Sources</h3>
                  <div className="grid grid-cols-1 gap-2">
                    {client.brandProfile.trainingDataUrls.map((url, idx) => (
                      <a 
                        key={idx} 
                        href={url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-indigo-600 hover:underline block text-sm"
                      >
                        {url}
                      </a>
                    ))}
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Raw Training Data</h3>
                    <Textarea 
                      className="h-40" 
                      placeholder="No training data" 
                      value={client.brandProfile.trainingDataUrls.join("\n")} 
                      readOnly
                    />
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );

  const renderComments = () => {
    const handleRewrite = async (postId: string, guidelines?: string) => {
      console.log(`Rewriting comment for post ${postId} with guidelines:`, guidelines);
      // Here you would call your AI service to generate a new comment
    };

    const handlePost = (postId: string, comment: string) => {
      console.log(`Posting comment for post ${postId}:`, comment);
      // Here you would handle the actual posting logic
    };

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">Comment Opportunities</h2>
            <p className="text-gray-600 mt-1">AI-curated LinkedIn posts relevant to {client.clientName}</p>
          </div>
          <Button variant="outline" className="text-blue-600">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh Posts
          </Button>
        </div>

        <div className="space-y-6">
          {mockLinkedInPosts.map((post) => (
            <CommentCard
              key={post.id}
              post={post}
              aiGeneratedComment={`Great insights on ${post.content.slice(0, 50)}... As someone working in ${client.industry}, I'd love to share our experience with similar implementations. We've found that...`}
              onRewrite={(guidelines) => handleRewrite(post.id, guidelines)}
              onPost={(comment) => handlePost(post.id, comment)}
            />
          ))}
        </div>

        {mockLinkedInPosts.length === 0 && (
          <div className="text-center text-gray-500 py-12">
            <p>No relevant posts found at the moment.</p>
            <p className="text-sm mt-2">We'll continue monitoring LinkedIn for engagement opportunities.</p>
          </div>
        )}
      </div>
    );
  };

  const renderContent = () => {
    switch (currentSection) {
      case 'posts':
        return renderPosts();
      case 'comments':
        return renderComments();
      case 'calendar':
        return renderCalendar();
      case 'resources':
        return renderResources();
      case 'analytics':
        return renderAnalytics();
      case 'settings':
        return renderSettings();
      default:
        return renderOverview();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <h1 className="text-3xl font-bold capitalize">{currentSection}</h1>
      </div>
      
      {renderContent()}
    </div>
  );
};

export default ClientDetails;
