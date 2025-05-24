
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from '@/hooks/use-toast';
import { Client } from '../types';

interface AddClientModalProps {
  onAddClient: (client: Client) => void;
  children: React.ReactNode;
}

const AddClientModal: React.FC<AddClientModalProps> = ({ onAddClient, children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    clientName: '',
    industry: '',
    contactName: '',
    contactEmail: '',
    status: 'onboarding' as 'active' | 'onboarding' | 'paused' | 'archived',
    brandBriefSummary: '',
    writingStyle: '',
    language: 'English',
    locationFocus: '',
    businessSize: '',
    sellsWhat: '',
    sellsToWhom: '',
    brandPersonality: '',
    brandTone: '',
    emotionsToEvoke: '',
    emojiUsage: 'Minimal',
    desiredPostLength: 'Medium (150-300 words)',
    coreValues: '',
    brandStory: '',
    uniqueSellingProposition: '',
    hotTakesOrOpinions: '',
    missionStatement: '',
    inspirationSources: '',
    recentCompanyEvents: '',
    linkedinProfileUrl: '',
    customInstructionsAI: ''
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = () => {
    if (!formData.clientName.trim() || !formData.contactEmail.trim()) {
      toast({
        title: "Validation Error",
        description: "Client name and contact email are required.",
        variant: "destructive",
      });
      return;
    }

    const now = { seconds: Math.floor(Date.now() / 1000), nanoseconds: 0 };
    
    const newClient: Client = {
      id: `client_${Date.now()}`,
      clientName: formData.clientName,
      industry: formData.industry,
      contactName: formData.contactName,
      contactEmail: formData.contactEmail,
      status: formData.status,
      brandBriefSummary: formData.brandBriefSummary,
      writingStyle: formData.writingStyle,
      createdAt: now,
      updatedAt: now,
      brandProfile: {
        language: formData.language,
        locationFocus: formData.locationFocus,
        businessSize: formData.businessSize,
        sellsWhat: formData.sellsWhat,
        sellsToWhom: formData.sellsToWhom,
        brandPersonality: formData.brandPersonality.split(',').map(p => p.trim()).filter(Boolean),
        brandTone: formData.brandTone,
        emotionsToEvoke: formData.emotionsToEvoke.split(',').map(e => e.trim()).filter(Boolean),
        emojiUsage: formData.emojiUsage,
        desiredPostLength: formData.desiredPostLength,
        coreValues: formData.coreValues,
        brandStory: formData.brandStory,
        uniqueSellingProposition: formData.uniqueSellingProposition,
        hotTakesOrOpinions: formData.hotTakesOrOpinions,
        missionStatement: formData.missionStatement,
        inspirationSources: formData.inspirationSources,
        recentCompanyEvents: formData.recentCompanyEvents,
        linkedinProfileUrl: formData.linkedinProfileUrl,
        trainingDataUrls: [],
        customInstructionsAI: formData.customInstructionsAI,
      },
      aiTraining: {
        status: 'pending_data',
        lastTrainedAt: { seconds: 0, nanoseconds: 0 }
      }
    };

    onAddClient(newClient);
    setIsOpen(false);
    
    // Reset form
    setFormData({
      clientName: '',
      industry: '',
      contactName: '',
      contactEmail: '',
      status: 'onboarding',
      brandBriefSummary: '',
      writingStyle: '',
      language: 'English',
      locationFocus: '',
      businessSize: '',
      sellsWhat: '',
      sellsToWhom: '',
      brandPersonality: '',
      brandTone: '',
      emotionsToEvoke: '',
      emojiUsage: 'Minimal',
      desiredPostLength: 'Medium (150-300 words)',
      coreValues: '',
      brandStory: '',
      uniqueSellingProposition: '',
      hotTakesOrOpinions: '',
      missionStatement: '',
      inspirationSources: '',
      recentCompanyEvents: '',
      linkedinProfileUrl: '',
      customInstructionsAI: ''
    });

    toast({
      title: "Success",
      description: "Client added successfully!",
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Client</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Basic Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="clientName">Client Name *</Label>
                <Input
                  id="clientName"
                  value={formData.clientName}
                  onChange={(e) => handleInputChange('clientName', e.target.value)}
                  placeholder="Enter client name"
                />
              </div>
              <div>
                <Label htmlFor="industry">Industry</Label>
                <Input
                  id="industry"
                  value={formData.industry}
                  onChange={(e) => handleInputChange('industry', e.target.value)}
                  placeholder="e.g., Technology, Marketing"
                />
              </div>
              <div>
                <Label htmlFor="contactName">Contact Name</Label>
                <Input
                  id="contactName"
                  value={formData.contactName}
                  onChange={(e) => handleInputChange('contactName', e.target.value)}
                  placeholder="Primary contact person"
                />
              </div>
              <div>
                <Label htmlFor="contactEmail">Contact Email *</Label>
                <Input
                  id="contactEmail"
                  type="email"
                  value={formData.contactEmail}
                  onChange={(e) => handleInputChange('contactEmail', e.target.value)}
                  placeholder="contact@company.com"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="onboarding">Onboarding</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="paused">Paused</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="writingStyle">Writing Style</Label>
                <Input
                  id="writingStyle"
                  value={formData.writingStyle}
                  onChange={(e) => handleInputChange('writingStyle', e.target.value)}
                  placeholder="e.g., Professional, Casual, Creative"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="brandBriefSummary">Brand Brief Summary</Label>
              <Textarea
                id="brandBriefSummary"
                value={formData.brandBriefSummary}
                onChange={(e) => handleInputChange('brandBriefSummary', e.target.value)}
                placeholder="Brief description of the client's brand and business"
                rows={3}
              />
            </div>
          </div>

          {/* Brand Profile */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Brand Profile</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="businessSize">Business Size</Label>
                <Select value={formData.businessSize} onValueChange={(value) => handleInputChange('businessSize', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select business size" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Startup">Startup</SelectItem>
                    <SelectItem value="Small">Small</SelectItem>
                    <SelectItem value="Mid-market">Mid-market</SelectItem>
                    <SelectItem value="Enterprise">Enterprise</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="locationFocus">Location Focus</Label>
                <Input
                  id="locationFocus"
                  value={formData.locationFocus}
                  onChange={(e) => handleInputChange('locationFocus', e.target.value)}
                  placeholder="e.g., Global, North America, Local"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="sellsWhat">What They Sell</Label>
                <Input
                  id="sellsWhat"
                  value={formData.sellsWhat}
                  onChange={(e) => handleInputChange('sellsWhat', e.target.value)}
                  placeholder="Products or services offered"
                />
              </div>
              <div>
                <Label htmlFor="sellsToWhom">Target Audience</Label>
                <Input
                  id="sellsToWhom"
                  value={formData.sellsToWhom}
                  onChange={(e) => handleInputChange('sellsToWhom', e.target.value)}
                  placeholder="Who they sell to"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="brandPersonality">Brand Personality</Label>
                <Input
                  id="brandPersonality"
                  value={formData.brandPersonality}
                  onChange={(e) => handleInputChange('brandPersonality', e.target.value)}
                  placeholder="Comma-separated traits (e.g., Professional, Innovative)"
                />
              </div>
              <div>
                <Label htmlFor="brandTone">Brand Tone</Label>
                <Input
                  id="brandTone"
                  value={formData.brandTone}
                  onChange={(e) => handleInputChange('brandTone', e.target.value)}
                  placeholder="e.g., Authoritative yet approachable"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="missionStatement">Mission Statement</Label>
              <Textarea
                id="missionStatement"
                value={formData.missionStatement}
                onChange={(e) => handleInputChange('missionStatement', e.target.value)}
                placeholder="Company's mission statement"
                rows={2}
              />
            </div>

            <div>
              <Label htmlFor="uniqueSellingProposition">Unique Selling Proposition</Label>
              <Textarea
                id="uniqueSellingProposition"
                value={formData.uniqueSellingProposition}
                onChange={(e) => handleInputChange('uniqueSellingProposition', e.target.value)}
                placeholder="What makes them unique in the market"
                rows={2}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              Add Client
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddClientModal;
