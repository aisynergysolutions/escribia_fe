
import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Edit3, BarChart, Settings as SettingsIcon } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
        
        <TabsContent value="settings" className="space-y-4">
          <div className="bg-white p-6 rounded-2xl shadow-md">
            <h2 className="text-xl font-semibold mb-4">Brand Profile</h2>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-md font-medium text-gray-700">Basic Information</h3>
                  <ul className="mt-2 space-y-2">
                    <li><span className="text-gray-500">Language:</span> {client.brandProfile.language}</li>
                    <li><span className="text-gray-500">Location Focus:</span> {client.brandProfile.locationFocus}</li>
                    <li><span className="text-gray-500">Business Size:</span> {client.brandProfile.businessSize}</li>
                    <li><span className="text-gray-500">Writing Style:</span> {client.writingStyle || "Not specified"}</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-md font-medium text-gray-700">Business Focus</h3>
                  <ul className="mt-2 space-y-2">
                    <li><span className="text-gray-500">Sells What:</span> {client.brandProfile.sellsWhat}</li>
                    <li><span className="text-gray-500">Sells To Whom:</span> {client.brandProfile.sellsToWhom}</li>
                    <li><span className="text-gray-500">LinkedIn Profile:</span> <a href={client.brandProfile.linkedinProfileUrl} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">{client.brandProfile.linkedinProfileUrl}</a></li>
                  </ul>
                </div>
              </div>
              
              <div className="border-t pt-4">
                <h3 className="text-md font-medium text-gray-700">Brand Personality</h3>
                <div className="flex flex-wrap gap-2 mt-2">
                  {client.brandProfile.brandPersonality.map((trait, index) => (
                    <Badge key={index} variant="outline">{trait}</Badge>
                  ))}
                </div>
              </div>
              
              <div className="border-t pt-4">
                <h3 className="text-md font-medium text-gray-700">Brand Story</h3>
                <p className="mt-2 text-gray-700">{client.brandProfile.brandStory}</p>
              </div>
              
              {/* More sections could be added, but this covers the core */}
              
              <div className="border-t pt-4 flex justify-end">
                <Button className="bg-indigo-600 hover:bg-indigo-700">
                  <Edit3 className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ClientDetails;

// Fix missing import
import { PlusCircle } from 'lucide-react';
