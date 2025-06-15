import React from 'react';
import { Edit3, Calendar, Clock, Linkedin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Textarea } from '@/components/ui/textarea';
import StatusBadge from '../common/StatusBadge';
import { formatDate } from '../../utils/dateUtils';
import { mockClients } from '../../types';
import LinkedInConnectionPanel from './LinkedInConnectionPanel';
import { Separator } from "@/components/ui/separator";

const MOCK_LINKEDIN_ACCOUNT = "Acme Corp";
const MOCK_LINKEDIN_EXPIRY = "June 15, 2025";

interface ClientSettingsSectionProps {
  clientId: string;
}

const ClientSettingsSection: React.FC<ClientSettingsSectionProps> = ({ clientId }) => {
  const client = mockClients.find(c => c.id === clientId);
  const [linkedinConnected, setLinkedinConnected] = React.useState(false);

  if (!client) return null;

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

      {/* INTEGRATIONS CARD */}
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
        <CardContent>
          {/* AI Section */}
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-2">
              AI Training Status
            </h3>
            <StatusBadge status={client.aiTraining.status} type="ai" className="mb-1" />
            {client.aiTraining.lastTrainedAt.seconds > 0 && (
              <div className="text-sm mt-1 mb-4">
                Last trained: {formatDate(client.aiTraining.lastTrainedAt)}
              </div>
            )}
            <div className="mt-1">
              <div className="text-xs font-semibold text-gray-500 mb-1">
                Custom AI Instructions
              </div>
              <div className="text-sm text-gray-700 leading-snug">
                {client.brandProfile.customInstructionsAI?.trim()
                  ? client.brandProfile.customInstructionsAI
                  : "No custom instructions provided for this client."}
              </div>
            </div>
          </div>

          {/* Divider and 24px spacing */}
          <div className="my-6">
            <Separator />
          </div>

          {/* LinkedIn Integration Section */}
          <div className="flex flex-col gap-4">
            <h3 className="text-sm font-medium text-gray-500">
              LinkedIn Integration
            </h3>
            {/* LinkedIn content box */}
            <div className="w-full rounded-lg bg-secondary px-6 py-3 flex items-center transition hover:bg-secondary/90 focus-within:ring-2 focus-within:ring-blue-400 outline-none gap-0">
              {!linkedinConnected ? (
                <>
                  <Linkedin className="h-5 w-5 text-[#0A66C2] mr-3" />
                  <Button
                    onClick={() => setLinkedinConnected(true)}
                    type="button"
                    variant="default"
                    className="ml-0"
                  >
                    <Linkedin className="mr-2 h-4 w-4" />
                    Connect LinkedIn
                  </Button>
                </>
              ) : (
                <>
                  <Linkedin className="h-5 w-5 text-[#0A66C2] mr-3" />
                  <span className="font-bold text-base mr-4 whitespace-nowrap">
                    Connected as {MOCK_LINKEDIN_ACCOUNT}
                  </span>
                  <span className="text-sm text-muted-foreground mr-4 whitespace-nowrap">
                    Expires on {MOCK_LINKEDIN_EXPIRY}
                  </span>
                  <button
                    type="button"
                    className="ml-auto text-sm font-medium text-blue-700 underline underline-offset-2 hover:text-blue-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring px-1"
                    tabIndex={0}
                    onClick={() => setLinkedinConnected(false)}
                  >
                    Disconnect
                  </button>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Brand Profile */}
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
        <CardContent className="space-y-8">

          {/* Business Basics */}
          <div>
            <h4 className="font-semibold text-base mb-3">Business Basics</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-2">
              <div>
                <span className="block text-xs font-semibold text-gray-500">Language</span>
                <span>{client.brandProfile.language}</span>
              </div>
              <div>
                <span className="block text-xs font-semibold text-gray-500">Location Focus</span>
                <span>{client.brandProfile.locationFocus}</span>
              </div>
              <div>
                <span className="block text-xs font-semibold text-gray-500">Business Size</span>
                <span>{client.brandProfile.businessSize}</span>
              </div>
              <div>
                <span className="block text-xs font-semibold text-gray-500">Sells What</span>
                <span>{client.brandProfile.sellsWhat}</span>
              </div>
              <div>
                <span className="block text-xs font-semibold text-gray-500">Sells to Whom</span>
                <span>{client.brandProfile.sellsToWhom}</span>
              </div>
              <div>
                <span className="block text-xs font-semibold text-gray-500">LinkedIn Profile</span>
                <a 
                  href={client.brandProfile.linkedinProfileUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-indigo-600 hover:underline flex items-center"
                >
                  <Linkedin className="h-4 w-4 mr-1" />
                  View Profile
                </a>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-200" />

          {/* Brand Voice & Personality */}
          <div>
            <h4 className="font-semibold text-base mb-3">Brand Voice & Personality</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-2">
              <div>
                <span className="block text-xs font-semibold text-gray-500">Brand Personality</span>
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  {client.brandProfile.brandPersonality.map((trait, idx) => (
                    <Badge key={idx} variant="outline">{trait}</Badge>
                  ))}
                </div>
              </div>
              <div>
                <span className="block text-xs font-semibold text-gray-500">Brand Tone</span>
                <span>{client.brandProfile.brandTone}</span>
              </div>
              <div>
                <span className="block text-xs font-semibold text-gray-500">Emotions to Evoke</span>
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  {client.brandProfile.emotionsToEvoke.map((emotion, idx) => (
                    <Badge key={idx} variant="secondary">{emotion}</Badge>
                  ))}
                </div>
              </div>
              <div>
                <span className="block text-xs font-semibold text-gray-500">Emoji Use</span>
                <span>{client.brandProfile.emojiUsage}</span>
              </div>
              <div>
                <span className="block text-xs font-semibold text-gray-500">Desired Post Length</span>
                <span>{client.brandProfile.desiredPostLength}</span>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-200" />

          {/* Brand Story & Values */}
          <div>
            <h4 className="font-semibold text-base mb-3">Brand Story & Values</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-2">
              <div>
                <span className="block text-xs font-semibold text-gray-500">Core Values</span>
                <span>{client.brandProfile.coreValues}</span>
              </div>
              <div>
                <span className="block text-xs font-semibold text-gray-500">Brand Story</span>
                <span>{client.brandProfile.brandStory}</span>
              </div>
              <div>
                <span className="block text-xs font-semibold text-gray-500">Mission Statement</span>
                <span>{client.brandProfile.missionStatement}</span>
              </div>
              <div>
                <span className="block text-xs font-semibold text-gray-500">Unique Selling Proposition</span>
                <span>{client.brandProfile.uniqueSellingProposition}</span>
              </div>
              <div>
                <span className="block text-xs font-semibold text-gray-500">Hot Takes/Opinions</span>
                <span>{client.brandProfile.hotTakesOrOpinions}</span>
              </div>
              <div>
                <span className="block text-xs font-semibold text-gray-500">Inspiration Sources</span>
                <span>{client.brandProfile.inspirationSources}</span>
              </div>
              <div>
                <span className="block text-xs font-semibold text-gray-500">Recent Company Events</span>
                <span>{client.brandProfile.recentCompanyEvents}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ClientSettingsSection;
