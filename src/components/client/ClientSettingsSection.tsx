
import React, { useState } from 'react';
import { Edit3, Calendar, Clock, Linkedin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import StatusBadge from '../common/StatusBadge';
import { formatDate } from '../../utils/dateUtils';
import { mockClients } from '../../types';

interface ClientSettingsSectionProps {
  clientId: string;
}

const ClientSettingsSection: React.FC<ClientSettingsSectionProps> = ({ clientId }) => {
  const client = mockClients.find(c => c.id === clientId);
  const [isLinkedInConnected, setIsLinkedInConnected] = useState(false);

  if (!client) return null;

  const renderDetailItem = (label: string, value: React.ReactNode) => (
    <div>
      <h3 className="text-sm font-medium text-gray-500">{label}</h3>
      <div className="mt-1">{value}</div>
    </div>
  );

  return (
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
              <StatusBadge status={client.status} type="client" className="mt-1" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Created At</h3>
              <div className="mt-1 flex items-center gap-1">
                <Calendar className="h-4 w-4 text-gray-400" />
                <span>{formatDate(client.createdAt)}</span>
              </div>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Last Update</h3>
              <div className="mt-1 flex items-center gap-1">
                <Clock className="h-4 w-4 text-gray-400" />
                <span>{formatDate(client.updatedAt)}</span>
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

      {/* Integrations Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Integrations</span>
            <Button variant="outline" size="sm">
              <Edit3 className="h-4 w-4 mr-2" />
              Configure
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-gray-500">AI Training Status</h3>
            <StatusBadge status={client.aiTraining.status} type="ai" />
            {client.aiTraining.lastTrainedAt.seconds > 0 && (
              <div className="text-sm mt-1 text-gray-500">
                Last trained: {formatDate(client.aiTraining.lastTrainedAt)}
              </div>
            )}
          </div>
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-gray-500">LinkedIn Connection</h3>
            {isLinkedInConnected ? (
              <div className="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <p className="font-medium">Connected to {client.clientName}</p>
                  <p className="text-sm text-gray-500">Expires: June 15, 2025</p>
                </div>
                <Button variant="secondary" onClick={() => setIsLinkedInConnected(false)}>Disconnect</Button>
              </div>
            ) : (
              <Button onClick={() => setIsLinkedInConnected(true)}>
                <Linkedin className="mr-2 h-4 w-4" />
                Connect LinkedIn
              </Button>
            )}
          </div>
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-gray-500">Custom AI Instructions</h3>
            <p className="text-sm text-gray-600 border p-3 rounded-md bg-gray-50/50">{client.brandProfile.customInstructionsAI || "No custom instructions"}</p>
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
        <CardContent className="space-y-8 pt-6">
          {/* Business Basics */}
          <div>
            <h4 className="text-base font-medium mb-4 pb-2 border-b">Business Basics</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 py-2">
              {renderDetailItem("Language", <p>{client.brandProfile.language}</p>)}
              {renderDetailItem("Location Focus", <p>{client.brandProfile.locationFocus}</p>)}
              {renderDetailItem("Business Size", <p>{client.brandProfile.businessSize}</p>)}
              {renderDetailItem("Sells What", <p>{client.brandProfile.sellsWhat}</p>)}
              {renderDetailItem("Sells to Whom", <p>{client.brandProfile.sellsToWhom}</p>)}
              {renderDetailItem("LinkedIn Profile", 
                <a 
                  href={client.brandProfile.linkedinProfileUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-indigo-600 hover:underline flex items-center"
                >
                  <Linkedin className="h-4 w-4 mr-1" />
                  View Profile
                </a>
              )}
            </div>
          </div>
          
          {/* Brand Voice & Personality */}
          <div>
            <h4 className="text-base font-medium mb-4 pb-2 border-b">Brand Voice & Personality</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 py-2">
              {renderDetailItem("Brand Personality", 
                <div className="flex flex-wrap gap-1.5">
                  {client.brandProfile.brandPersonality.map((trait, idx) => (
                    <Badge key={idx} variant="outline">{trait}</Badge>
                  ))}
                </div>
              )}
              {renderDetailItem("Brand Tone", <p>{client.brandProfile.brandTone}</p>)}
              {renderDetailItem("Emotions to Evoke", 
                <div className="flex flex-wrap gap-1.5">
                  {client.brandProfile.emotionsToEvoke.map((emotion, idx) => (
                    <Badge key={idx} variant="secondary">{emotion}</Badge>
                  ))}
                </div>
              )}
              {renderDetailItem("Emoji Use", <p>{client.brandProfile.emojiUsage}</p>)}
              {renderDetailItem("Desired Post Length", <p>{client.brandProfile.desiredPostLength}</p>)}
            </div>
          </div>
          
          {/* Brand Story & Values */}
          <div>
            <h4 className="text-base font-medium mb-4 pb-2 border-b">Brand Story & Values</h4>
            <div className="grid grid-cols-1 gap-x-8 gap-y-4 py-2">
                {renderDetailItem("Core Values", <p className="whitespace-pre-wrap">{client.brandProfile.coreValues}</p>)}
                {renderDetailItem("Brand Story", <p className="whitespace-pre-wrap">{client.brandProfile.brandStory}</p>)}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ClientSettingsSection;
