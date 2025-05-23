
import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Edit3, BarChart, Settings as SettingsIcon, PlusCircle, Calendar, Clock, Linkedin } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Textarea } from '@/components/ui/textarea';
import IdeaCard from '../components/ui/IdeaCard';
import { mockClients, mockIdeas } from '../types';

const ClientDetails = () => {
  const { clientId } = useParams<{ clientId: string }>();
  const [activeTab, setActiveTab] = useState('overview');
  
  // Find client data
  const client = mockClients.find(c => c.id === clientId);
  
  // Find ideas for this client
  const clientIdeas = mockIdeas.filter(idea => idea.clientId === clientId);
  
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

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <Link to="/clients">
          <Button variant="outline" size="icon" className="rounded-full">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">{client.clientName}</h1>
        <Badge className={`ml-2 ${
          client.status === 'active' ? 'bg-green-100 text-green-800' :
          client.status === 'onboarding' ? 'bg-blue-100 text-blue-800' :
          client.status === 'paused' ? 'bg-yellow-100 text-yellow-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {client.status}
        </Badge>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="ideas">Ideas</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
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
              <h2 className="text-xl font-semibold">Recent Ideas</h2>
              <Link to={`/clients/${clientId}?tab=ideas`}>
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
                  No ideas found for this client yet.
                </p>
              )}
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="ideas" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">All Ideas</h2>
            <Button className="bg-indigo-600 hover:bg-indigo-700">
              <PlusCircle className="h-4 w-4 mr-2" />
              New Idea
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {clientIdeas.map((idea) => (
              <IdeaCard key={idea.id} idea={idea} />
            ))}
            
            {clientIdeas.length === 0 && (
              <p className="text-gray-500 col-span-3 text-center py-12">
                No ideas found for this client yet.
              </p>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="settings" className="space-y-6">
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
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ClientDetails;
