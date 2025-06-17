import React, { useState, useRef, useEffect } from 'react';
import { Edit3, Calendar, Clock, Linkedin, Save, X, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from "@/components/ui/separator";
import { cn } from '@/lib/utils';
import StatusBadge from '../common/StatusBadge';
import { formatDate } from '../../utils/dateUtils';
import { mockClients } from '../../types';
import EditableField from './EditableField';
import SubClientCard from './SubClientCard';
import { SubClient } from '../../types/interfaces';

const MOCK_LINKEDIN_ACCOUNT = "Acme Corp";
const MOCK_LINKEDIN_EXPIRY = "June 15, 2025";

interface ClientSettingsSectionProps {
  clientId: string;
}

const ClientSettingsSection: React.FC<ClientSettingsSectionProps> = ({ clientId }) => {
  const client = mockClients.find(c => c.id === clientId);
  const [linkedinConnected, setLinkedinConnected] = React.useState(true);
  
  // Sub-clients state
  const [subClients, setSubClients] = useState<SubClient[]>([
    {
      id: 'company-1',
      name: client?.clientName || 'Company',
      role: 'Company',
      profileImage: client?.profileImage,
      writingStyle: client?.writingStyle,
      linkedinConnected: true,
      linkedinAccountName: client?.clientName,
      linkedinExpiryDate: 'June 15, 2025',
      customInstructions: client?.brandProfile.customInstructionsAI,
      createdAt: client?.createdAt || { seconds: Date.now() / 1000, nanoseconds: 0 }
    }
  ]);
  
  // Edit mode states
  const [editModes, setEditModes] = useState({
    clientInfo: false,
    integrations: false,
    brandProfile: false
  });

  // Form data state - keep existing code (all form data initialization)
  const [formData, setFormData] = useState({
    clientName: client?.clientName || '',
    status: client?.status || 'active',
    writingStyle: client?.writingStyle || '',
    brandBriefSummary: client?.brandBriefSummary || '',
    customInstructionsAI: client?.brandProfile.customInstructionsAI || '',
    language: client?.brandProfile.language || '',
    locationFocus: client?.brandProfile.locationFocus || '',
    businessSize: client?.brandProfile.businessSize || '',
    sellsWhat: client?.brandProfile.sellsWhat || '',
    sellsToWhom: client?.brandProfile.sellsToWhom || '',
    brandPersonality: client?.brandProfile.brandPersonality || [],
    brandTone: client?.brandProfile.brandTone || '',
    emotionsToEvoke: client?.brandProfile.emotionsToEvoke || [],
    emojiUsage: client?.brandProfile.emojiUsage || '',
    desiredPostLength: client?.brandProfile.desiredPostLength || '',
    coreValues: client?.brandProfile.coreValues || '',
    brandStory: client?.brandProfile.brandStory || '',
    missionStatement: client?.brandProfile.missionStatement || '',
    uniqueSellingProposition: client?.brandProfile.uniqueSellingProposition || '',
    hotTakesOrOpinions: client?.brandProfile.hotTakesOrOpinions || '',
    inspirationSources: client?.brandProfile.inspirationSources || '',
    recentCompanyEvents: client?.brandProfile.recentCompanyEvents || '',
    linkedinProfileUrl: client?.brandProfile.linkedinProfileUrl || ''
  });

  // Error state
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Refs for focus management
  const firstInputRefs = {
    clientInfo: useRef<HTMLInputElement>(null),
    integrations: useRef<HTMLTextAreaElement>(null),
    brandProfile: useRef<HTMLInputElement>(null)
  };

  if (!client) return null;

  // Sub-client management functions
  const handleAddSubClient = () => {
    const newSubClient: SubClient = {
      id: `subclient-${Date.now()}`,
      name: '',
      role: '',
      linkedinConnected: false,
      createdAt: { seconds: Date.now() / 1000, nanoseconds: 0 }
    };
    setSubClients(prev => [...prev, newSubClient]);
  };

  const handleUpdateSubClient = (updatedSubClient: SubClient) => {
    setSubClients(prev => prev.map(sc => 
      sc.id === updatedSubClient.id ? updatedSubClient : sc
    ));
  };

  const handleDeleteSubClient = (subClientId: string) => {
    setSubClients(prev => prev.filter(sc => sc.id !== subClientId));
  };

  // Keep existing functions (handleEditToggle, handleCancel, validateForm, handleSave, handleKeyDown, updateFormData)
  const handleEditToggle = (section: 'clientInfo' | 'integrations' | 'brandProfile') => {
    setEditModes(prev => ({ ...prev, [section]: !prev[section] }));
    setErrors({});
    
    // Focus first input when entering edit mode
    setTimeout(() => {
      if (!editModes[section]) {
        firstInputRefs[section].current?.focus();
      }
    }, 0);
  };

  const handleCancel = (section: 'clientInfo' | 'integrations' | 'brandProfile') => {
    // Reset form data to original values
    setFormData({
      clientName: client.clientName,
      status: client.status,
      writingStyle: client.writingStyle || '',
      brandBriefSummary: client.brandBriefSummary || '',
      customInstructionsAI: client.brandProfile.customInstructionsAI || '',
      language: client.brandProfile.language,
      locationFocus: client.brandProfile.locationFocus,
      businessSize: client.brandProfile.businessSize,
      sellsWhat: client.brandProfile.sellsWhat,
      sellsToWhom: client.brandProfile.sellsToWhom,
      brandPersonality: client.brandProfile.brandPersonality,
      brandTone: client.brandProfile.brandTone,
      emotionsToEvoke: client.brandProfile.emotionsToEvoke,
      emojiUsage: client.brandProfile.emojiUsage,
      desiredPostLength: client.brandProfile.desiredPostLength,
      coreValues: client.brandProfile.coreValues,
      brandStory: client.brandProfile.brandStory,
      missionStatement: client.brandProfile.missionStatement,
      uniqueSellingProposition: client.brandProfile.uniqueSellingProposition,
      hotTakesOrOpinions: client.brandProfile.hotTakesOrOpinions,
      inspirationSources: client.brandProfile.inspirationSources,
      recentCompanyEvents: client.brandProfile.recentCompanyEvents,
      linkedinProfileUrl: client.brandProfile.linkedinProfileUrl
    });
    setErrors({});
    setEditModes(prev => ({ ...prev, [section]: false }));
  };

  const validateForm = (section: 'clientInfo' | 'integrations' | 'brandProfile') => {
    const newErrors: Record<string, string> = {};

    if (section === 'clientInfo') {
      if (!formData.clientName.trim()) newErrors.clientName = 'Client name is required';
      if (!formData.status) newErrors.status = 'Status is required';
    }

    if (section === 'brandProfile') {
      if (!formData.language.trim()) newErrors.language = 'Language is required';
      if (!formData.businessSize.trim()) newErrors.businessSize = 'Business size is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = (section: 'clientInfo' | 'integrations' | 'brandProfile') => {
    if (!validateForm(section)) return;

    // Here you would typically save to your backend
    console.log('Saving data for section:', section, formData);
    
    setEditModes(prev => ({ ...prev, [section]: false }));
    setErrors({});
  };

  const handleKeyDown = (e: React.KeyboardEvent, section: 'clientInfo' | 'integrations' | 'brandProfile') => {
    if (e.key === 'Escape') {
      handleCancel(section);
    }
  };

  const updateFormData = (field: string, value: string | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-6" onKeyDown={(e) => {
      if (editModes.clientInfo) handleKeyDown(e, 'clientInfo');
      if (editModes.integrations) handleKeyDown(e, 'integrations');
      if (editModes.brandProfile) handleKeyDown(e, 'brandProfile');
    }}>
      {/* Sub-Clients Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>LinkedIn Accounts</span>
            <Button variant="outline" size="sm" onClick={handleAddSubClient}>
              <Plus className="h-4 w-4 mr-2" />
              Add Person
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {subClients.map((subClient, index) => (
            <SubClientCard
              key={subClient.id}
              subClient={subClient}
              onUpdate={handleUpdateSubClient}
              onDelete={handleDeleteSubClient}
              isCompany={index === 0}
            />
          ))}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Client Information Section - keep existing code */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Client Information</span>
              {!editModes.clientInfo ? (
                <Button variant="outline" size="sm" onClick={() => handleEditToggle('clientInfo')}>
                  <Edit3 className="h-4 w-4" />
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => handleSave('clientInfo')}>
                    <Save className="h-4 w-4 mr-2" />
                    Save
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleCancel('clientInfo')}>
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                </div>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {!editModes.clientInfo ? (
                <>
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
                </>
              ) : (
                <>
                  <EditableField
                    label="Client Name"
                    value={formData.clientName}
                    onChange={(value) => updateFormData('clientName', value)}
                    error={errors.clientName}
                  />
                  <EditableField
                    label="Status"
                    value={formData.status}
                    onChange={(value) => updateFormData('status', value)}
                    type="select"
                    options={['active', 'onboarding', 'paused']}
                    error={errors.status}
                  />
                  <EditableField
                    label="Created At"
                    value={formatDate(client.createdAt)}
                    onChange={() => {}}
                    readOnly
                  />
                  <EditableField
                    label="Last Update"
                    value={formatDate(client.updatedAt)}
                    onChange={() => {}}
                    readOnly
                  />
                  <EditableField
                    label="Writing Style"
                    value={formData.writingStyle}
                    onChange={(value) => updateFormData('writingStyle', value)}
                    placeholder="e.g., Professional and informative"
                  />
                  <div className="col-span-2">
                    <EditableField
                      label="Brand Brief Summary"
                      value={formData.brandBriefSummary}
                      onChange={(value) => updateFormData('brandBriefSummary', value)}
                      type="textarea"
                      placeholder="Brief description of the client's business..."
                    />
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* INTEGRATIONS CARD - keep existing code */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Integrations</span>
              {!editModes.integrations ? (
                <Button variant="outline" size="sm" onClick={() => handleEditToggle('integrations')}>
                  <Edit3 className="h-4 w-4" />
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => handleSave('integrations')}>
                    <Save className="h-4 w-4 mr-2" />
                    Save
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleCancel('integrations')}>
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                </div>
              )}
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
                {!editModes.integrations ? (
                  <div className="text-sm text-gray-700 leading-snug">
                    {client.brandProfile.customInstructionsAI?.trim()
                      ? client.brandProfile.customInstructionsAI
                      : "No custom instructions provided for this client."}
                  </div>
                ) : (
                  <EditableField
                    label=""
                    value={formData.customInstructionsAI}
                    onChange={(value) => updateFormData('customInstructionsAI', value)}
                    type="textarea"
                    placeholder="Enter custom AI instructions..."
                  />
                )}
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
              <div
                className={cn(
                  "w-full min-w-0 rounded-lg bg-secondary py-3 px-4 flex transition-colors hover:bg-secondary/80",
                  !linkedinConnected ? "justify-center items-center" : "items-center"
                )}
                style={{ overflowX: linkedinConnected ? 'auto' : undefined }}
              >
                {!linkedinConnected ? (
                  <Button
                    onClick={() => setLinkedinConnected(true)}
                    type="button"
                    variant="default"
                  >
                    <Linkedin className="mr-2 h-4 w-4" />
                    Connect LinkedIn
                  </Button>
                ) : (
                  <div className="flex flex-nowrap items-center gap-4 min-w-0 w-full">
                    <span className="pl-2 flex-shrink-0">
                      <Linkedin className="h-5 w-5 text-[#0A66C2]" />
                    </span>
                    <span className="font-bold text-base body-medium whitespace-nowrap flex-shrink-0">
                      Connected as {MOCK_LINKEDIN_ACCOUNT}
                    </span>
                    <span className="text-sm text-muted-foreground body-small whitespace-nowrap flex-shrink-0">
                      Expires on {MOCK_LINKEDIN_EXPIRY}
                    </span>
                    <span className="flex-1 min-w-0"></span>
                    <Button
                      variant="link"
                      className="p-0 h-auto text-sm body-small pr-4"
                      onClick={() => setLinkedinConnected(false)}
                    >
                      Disconnect
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Brand Profile - keep existing code */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Brand Profile</span>
            {!editModes.brandProfile ? (
              <Button variant="outline" size="sm" onClick={() => handleEditToggle('brandProfile')}>
                <Edit3 className="h-4 w-4" />
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button size="sm" onClick={() => handleSave('brandProfile')}>
                  <Save className="h-4 w-4 mr-2" />
                  Save
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleCancel('brandProfile')}>
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
              </div>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-8">
          {/* Business Basics */}
          <div>
            <h4 className="font-semibold text-base mb-3">Business Basics</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-4">
              {!editModes.brandProfile ? (
                <>
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
                </>
              ) : (
                <>
                  <EditableField
                    label="Language"
                    value={formData.language}
                    onChange={(value) => updateFormData('language', value)}
                    error={errors.language}
                  />
                  <EditableField
                    label="Location Focus"
                    value={formData.locationFocus}
                    onChange={(value) => updateFormData('locationFocus', value)}
                  />
                  <EditableField
                    label="Business Size"
                    value={formData.businessSize}
                    onChange={(value) => updateFormData('businessSize', value)}
                    type="select"
                    options={['Small', 'Mid-market', 'Enterprise']}
                    error={errors.businessSize}
                  />
                  <EditableField
                    label="Sells What"
                    value={formData.sellsWhat}
                    onChange={(value) => updateFormData('sellsWhat', value)}
                  />
                  <EditableField
                    label="Sells to Whom"
                    value={formData.sellsToWhom}
                    onChange={(value) => updateFormData('sellsToWhom', value)}
                  />
                  <EditableField
                    label="LinkedIn Profile URL"
                    value={formData.linkedinProfileUrl}
                    onChange={(value) => updateFormData('linkedinProfileUrl', value)}
                    placeholder="https://linkedin.com/company/..."
                  />
                </>
              )}
            </div>
          </div>

          <div className="border-t border-slate-200" />

          {/* Brand Voice & Personality - keep existing code (all brand voice sections) */}
          <div>
            <h4 className="font-semibold text-base mb-3">Brand Voice & Personality</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-4">
              {!editModes.brandProfile ? (
                <>
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
                </>
              ) : (
                <>
                  <EditableField
                    label="Brand Personality"
                    value={formData.brandPersonality}
                    onChange={(value) => updateFormData('brandPersonality', value)}
                    type="badges"
                  />
                  <EditableField
                    label="Brand Tone"
                    value={formData.brandTone}
                    onChange={(value) => updateFormData('brandTone', value)}
                  />
                  <EditableField
                    label="Emotions to Evoke"
                    value={formData.emotionsToEvoke}
                    onChange={(value) => updateFormData('emotionsToEvoke', value)}
                    type="badges"
                  />
                  <EditableField
                    label="Emoji Use"
                    value={formData.emojiUsage}
                    onChange={(value) => updateFormData('emojiUsage', value)}
                    type="select"
                    options={['None', 'Minimal', 'Strategic', 'Frequent']}
                  />
                  <EditableField
                    label="Desired Post Length"
                    value={formData.desiredPostLength}
                    onChange={(value) => updateFormData('desiredPostLength', value)}
                    type="select"
                    options={['Short (50-150 words)', 'Short to medium (100-250 words)', 'Medium (150-300 words)', 'Medium (200-350 words)', 'Long (300+ words)']}
                  />
                </>
              )}
            </div>
          </div>

          <div className="border-t border-slate-200" />

          {/* Brand Story & Values - keep existing code (all brand story sections) */}
          <div>
            <h4 className="font-semibold text-base mb-3">Brand Story & Values</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-4">
              {!editModes.brandProfile ? (
                <>
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
                </>
              ) : (
                <>
                  <EditableField
                    label="Core Values"
                    value={formData.coreValues}
                    onChange={(value) => updateFormData('coreValues', value)}
                    type="textarea"
                  />
                  <EditableField
                    label="Brand Story"
                    value={formData.brandStory}
                    onChange={(value) => updateFormData('brandStory', value)}
                    type="textarea"
                  />
                  <EditableField
                    label="Mission Statement"
                    value={formData.missionStatement}
                    onChange={(value) => updateFormData('missionStatement', value)}
                    type="textarea"
                  />
                  <EditableField
                    label="Unique Selling Proposition"
                    value={formData.uniqueSellingProposition}
                    onChange={(value) => updateFormData('uniqueSellingProposition', value)}
                    type="textarea"
                  />
                  <EditableField
                    label="Hot Takes/Opinions"
                    value={formData.hotTakesOrOpinions}
                    onChange={(value) => updateFormData('hotTakesOrOpinions', value)}
                    type="textarea"
                  />
                  <EditableField
                    label="Inspiration Sources"
                    value={formData.inspirationSources}
                    onChange={(value) => updateFormData('inspirationSources', value)}
                    type="textarea"
                  />
                  <EditableField
                    label="Recent Company Events"
                    value={formData.recentCompanyEvents}
                    onChange={(value) => updateFormData('recentCompanyEvents', value)}
                    type="textarea"
                  />
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ClientSettingsSection;
