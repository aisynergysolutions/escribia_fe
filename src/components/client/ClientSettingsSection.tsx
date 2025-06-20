import React, { useState, useRef, useEffect } from 'react';
import { Edit3, Calendar, Clock, Linkedin, Save, X, Plus, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import StatusBadge from '../common/StatusBadge';
import { formatDate } from '../../utils/dateUtils';
import { mockClients } from '../../types';
import EditableField from './EditableField';
import { SubClient } from '../../types/interfaces';
import { useNavigate } from 'react-router-dom';

const MOCK_LINKEDIN_ACCOUNT = "Acme Corp";
const MOCK_LINKEDIN_EXPIRY = "June 15, 2025";

interface ClientSettingsSectionProps {
  clientId: string;
}

const ClientSettingsSection: React.FC<ClientSettingsSectionProps> = ({ clientId }) => {
  const client = mockClients.find(c => c.id === clientId);
  const navigate = useNavigate();
  const [linkedinConnected, setLinkedinConnected] = React.useState(true);
  
  // Mock profiles data
  const [profiles] = useState<SubClient[]>([
    {
      id: 'company-1',
      name: client?.clientName || 'Company',
      role: 'Company Account',
      profileImage: client?.profileImage,
      writingStyle: 'Professional and informative corporate voice',
      linkedinConnected: true,
      linkedinAccountName: client?.clientName,
      linkedinExpiryDate: 'June 15, 2025',
      customInstructions: 'Focus on industry insights and company achievements',
      createdAt: client?.createdAt || { seconds: Date.now() / 1000, nanoseconds: 0 }
    },
    {
      id: 'ceo-1',
      name: 'Sarah Johnson',
      role: 'CEO',
      profileImage: '',
      writingStyle: 'Thought leadership, strategic insights',
      linkedinConnected: true,
      linkedinAccountName: 'Sarah Johnson',
      linkedinExpiryDate: 'July 20, 2025',
      customInstructions: 'Share vision, industry trends, and leadership perspectives',
      createdAt: { seconds: Date.now() / 1000, nanoseconds: 0 }
    },
    {
      id: 'cto-1',
      name: 'Michael Chen',
      role: 'CTO',
      profileImage: '',
      writingStyle: 'Technical expertise, innovation-focused',
      linkedinConnected: false,
      customInstructions: 'Technical insights, product development, innovation',
      createdAt: { seconds: Date.now() / 1000, nanoseconds: 0 }
    }
  ]);
  
  // Edit mode states
  const [editModes, setEditModes] = useState({
    clientInfo: false,
    integrations: false
  });

  // Form data state
  const [formData, setFormData] = useState({
    clientName: client?.clientName || '',
    status: client?.status || 'active',
    writingStyle: client?.writingStyle || '',
    brandBriefSummary: client?.brandBriefSummary || '',
    customInstructionsAI: client?.brandProfile.customInstructionsAI || ''
  });

  // Error state
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Refs for focus management
  const firstInputRefs = {
    clientInfo: useRef<HTMLInputElement>(null),
    integrations: useRef<HTMLTextAreaElement>(null)
  };

  if (!client) return null;

  const handleProfileClick = (profileId: string) => {
    navigate(`/clients/${clientId}/profiles/${profileId}`);
  };

  const getProfileStatus = (profile: SubClient) => {
    if (profile.linkedinConnected) return 'active';
    return 'onboarding';
  };

  const handleEditToggle = (section: 'clientInfo' | 'integrations') => {
    setEditModes(prev => ({ ...prev, [section]: !prev[section] }));
    setErrors({});
    
    // Focus first input when entering edit mode
    setTimeout(() => {
      if (!editModes[section]) {
        firstInputRefs[section].current?.focus();
      }
    }, 0);
  };

  const handleCancel = (section: 'clientInfo' | 'integrations') => {
    // Reset form data to original values
    setFormData({
      clientName: client.clientName,
      status: client.status,
      writingStyle: client.writingStyle || '',
      brandBriefSummary: client.brandBriefSummary || '',
      customInstructionsAI: client.brandProfile.customInstructionsAI || ''
    });
    setErrors({});
    setEditModes(prev => ({ ...prev, [section]: false }));
  };

  const validateForm = (section: 'clientInfo' | 'integrations') => {
    const newErrors: Record<string, string> = {};

    if (section === 'clientInfo') {
      if (!formData.clientName.trim()) newErrors.clientName = 'Client name is required';
      if (!formData.status) newErrors.status = 'Status is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = (section: 'clientInfo' | 'integrations') => {
    if (!validateForm(section)) return;

    // Here you would typically save to your backend
    console.log('Saving data for section:', section, formData);
    
    setEditModes(prev => ({ ...prev, [section]: false }));
    setErrors({});
  };

  const handleKeyDown = (e: React.KeyboardEvent, section: 'clientInfo' | 'integrations') => {
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
    }}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Client Information Section */}
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

        {/* Integrations Card */}
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

            <div className="my-6">
              <Separator />
            </div>

            {/* LinkedIn Integration Section */}
            <div className="flex flex-col gap-4">
              <h3 className="text-sm font-medium text-gray-500">
                LinkedIn Integration
              </h3>
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

      {/* Profiles Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Profiles</span>
            <Button variant="outline" size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Profile
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {profiles.map((profile) => (
              <Card 
                key={profile.id} 
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => handleProfileClick(profile.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={profile.profileImage} />
                      <AvatarFallback>
                        <User className="h-6 w-6" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium truncate">{profile.name}</h3>
                      <p className="text-sm text-gray-500 truncate">{profile.role}</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {profile.writingStyle}
                  </p>
                  <StatusBadge 
                    status={getProfileStatus(profile)} 
                    type="client" 
                    className="text-xs"
                  />
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ClientSettingsSection;
