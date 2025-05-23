
import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Calendar, Clock, ExternalLink, FileText, MessageCircle, ThumbsUp, Share2, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { mockIdeas, mockClients } from '../types';

const IdeaDetails = () => {
  const { clientId, ideaId } = useParams<{ clientId: string, ideaId: string }>();
  const [activeTab, setActiveTab] = React.useState('overview');
  
  // Find the idea in our mock data
  const idea = mockIdeas.find(i => i.id === ideaId);
  const client = mockClients.find(c => c.id === clientId);
  
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
  
  const formatDate = (timestamp: { seconds: number; nanoseconds: number }) => {
    return new Date(timestamp.seconds * 1000).toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Link to={`/clients/${clientId}`}>
          <Button variant="outline" size="icon" className="rounded-full">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">{idea.title}</h1>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span>{client.clientName}</span>
            <span>•</span>
            <span>Created {formatDate(idea.createdAt)}</span>
          </div>
        </div>
        <Badge className={`ml-auto ${getStatusColor(idea.status)}`}>
          {idea.status}
        </Badge>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="drafts">Drafts History</TabsTrigger>
          <TabsTrigger value="visuals">Visuals</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Current Draft</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="whitespace-pre-wrap bg-slate-50 p-4 rounded-md">
                {idea.currentDraftText}
              </div>
              
              {idea.finalApprovedText && (
                <div className="mt-4">
                  <div className="font-medium text-sm mb-2">Final Approved Text:</div>
                  <div className="whitespace-pre-wrap bg-green-50 p-4 rounded-md">
                    {idea.finalApprovedText}
                  </div>
                </div>
              )}
              
              <div className="mt-4 text-sm text-gray-500">
                Last updated: {formatDate(idea.updatedAt)}
              </div>
            </CardContent>
          </Card>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Initial Idea</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <div className="font-medium text-sm mb-1">Original Prompt:</div>
                  <div className="text-gray-700">{idea.initialIdeaPrompt}</div>
                </div>
                
                <div>
                  <div className="font-medium text-sm mb-1">Generated Hooks:</div>
                  <div className="space-y-2">
                    {idea.generatedHooks.map((hook, index) => (
                      <div 
                        key={index} 
                        className={`p-2 rounded-md ${hook.selected ? 'bg-indigo-50 border border-indigo-200' : 'bg-slate-50'}`}
                      >
                        <div className="flex justify-between">
                          <div>{hook.text}</div>
                          {hook.selected && <Badge className="bg-indigo-600">Selected</Badge>}
                        </div>
                        <div className="text-sm text-gray-500 mt-1">Angle: {hook.angle}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Publication Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="font-medium text-sm mb-1">Objective:</div>
                  <Badge variant="outline">{idea.objective}</Badge>
                </div>
                
                {idea.scheduledPostAt && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <div>Scheduled for {formatDate(idea.scheduledPostAt)}</div>
                  </div>
                )}
                
                {idea.actuallyPostedAt && (
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <div>Posted on {formatDate(idea.actuallyPostedAt)}</div>
                  </div>
                )}
                
                {idea.livePostUrl && (
                  <a 
                    href={idea.livePostUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-indigo-600 hover:underline"
                  >
                    <ExternalLink className="h-4 w-4" />
                    View on LinkedIn
                  </a>
                )}
                
                {idea.templateUsedId && (
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-gray-500" />
                    <div>Template: {idea.templateUsedId}</div>
                  </div>
                )}
                
                {idea.internalNotes && (
                  <div>
                    <div className="font-medium text-sm mb-1">Internal Notes:</div>
                    <div className="bg-slate-50 p-3 rounded-md text-gray-700">
                      {idea.internalNotes}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          
          {idea.aiProcessingInfo && (
            <Card>
              <CardHeader>
                <CardTitle>AI Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="font-medium text-sm mb-1">Model Used:</div>
                    <div className="text-gray-700">{idea.aiProcessingInfo.modelUsed}</div>
                  </div>
                  <div>
                    <div className="font-medium text-sm mb-1">Processing Log:</div>
                    <div className="bg-slate-50 p-2 rounded-md text-xs text-gray-600 font-mono whitespace-pre-wrap">
                      {idea.aiProcessingInfo.log}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="drafts" className="space-y-4">
          <div className="bg-white p-6 rounded-2xl shadow-md">
            <h2 className="text-xl font-semibold mb-4">Version History</h2>
            
            <div className="space-y-6">
              {idea.drafts.map((draft, index) => (
                <div key={index} className="border-b pb-4 last:border-0 last:pb-0">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">v{draft.version}</Badge>
                      <span className="text-gray-500 text-sm">{formatDate(draft.createdAt)}</span>
                    </div>
                    <Badge className={draft.generatedByAI ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'}>
                      {draft.generatedByAI ? 'AI Generated' : 'Manual Edit'}
                    </Badge>
                  </div>
                  
                  {draft.notes && (
                    <div className="bg-amber-50 p-2 rounded-md text-amber-800 text-sm mb-2">
                      Note: {draft.notes}
                    </div>
                  )}
                  
                  <div className="bg-slate-50 p-3 rounded-md text-gray-700 whitespace-pre-wrap">
                    {draft.text}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="visuals" className="space-y-4">
          <div className="bg-white p-6 rounded-2xl shadow-md">
            <h2 className="text-xl font-semibold mb-4">Visual Assets</h2>
            
            {idea.visuals ? (
              <div className="space-y-4">
                <div>
                  <div className="aspect-video bg-slate-100 rounded-md overflow-hidden relative">
                    <img 
                      src={idea.visuals.assetUrl} 
                      alt="Post visual" 
                      className="w-full h-full object-cover"
                    />
                    <Badge 
                      className={`absolute top-2 right-2 ${
                        idea.visuals.status === 'approved' ? 'bg-green-100 text-green-800' : 
                        idea.visuals.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                        'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {idea.visuals.status}
                    </Badge>
                  </div>
                  
                  {idea.visuals.notes && (
                    <div className="mt-2 text-sm text-gray-700">
                      <span className="font-medium">Notes:</span> {idea.visuals.notes}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">No visuals attached to this post yet.</p>
                <Button className="mt-4 bg-indigo-600 hover:bg-indigo-700">
                  Add Visual
                </Button>
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="performance" className="space-y-4">
          <div className="bg-white p-6 rounded-2xl shadow-md">
            <h2 className="text-xl font-semibold mb-4">Performance Metrics</h2>
            
            {idea.performance ? (
              <div>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  <Card className="bg-slate-50">
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-2">
                        <ThumbsUp className="h-5 w-5 text-indigo-600" />
                        <div>
                          <div className="text-2xl font-bold">{idea.performance.likes}</div>
                          <div className="text-sm text-gray-500">Likes</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-slate-50">
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-2">
                        <MessageCircle className="h-5 w-5 text-indigo-600" />
                        <div>
                          <div className="text-2xl font-bold">{idea.performance.comments}</div>
                          <div className="text-sm text-gray-500">Comments</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-slate-50">
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-2">
                        <Share2 className="h-5 w-5 text-indigo-600" />
                        <div>
                          <div className="text-2xl font-bold">{idea.performance.shares}</div>
                          <div className="text-sm text-gray-500">Shares</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-slate-50">
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-2">
                        <Eye className="h-5 w-5 text-indigo-600" />
                        <div>
                          <div className="text-2xl font-bold">{idea.performance.views}</div>
                          <div className="text-sm text-gray-500">Views</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                <div className="text-sm text-gray-500">
                  Last fetched: {formatDate(idea.performance.lastFetched)}
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">No performance data available for this post.</p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default IdeaDetails;
