import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Check, X, Linkedin } from 'lucide-react';
import { Client } from '../../types/interfaces';
interface EditableBrandProfileFormProps {
  client: Client;
  onSave: (updatedBrandProfile: Partial<Client['brandProfile']>) => void;
  onCancel: () => void;
}
const EditableBrandProfileForm: React.FC<EditableBrandProfileFormProps> = ({
  client,
  onSave,
  onCancel
}) => {
  const [formData, setFormData] = useState({
    language: client.brandProfile.language,
    locationFocus: client.brandProfile.locationFocus,
    businessSize: client.brandProfile.businessSize,
    sellsWhat: client.brandProfile.sellsWhat,
    sellsToWhom: client.brandProfile.sellsToWhom,
    linkedinProfileUrl: client.brandProfile.linkedinProfileUrl,
    brandTone: client.brandProfile.brandTone,
    emojiUsage: client.brandProfile.emojiUsage,
    desiredPostLength: client.brandProfile.desiredPostLength,
    coreValues: client.brandProfile.coreValues,
    brandStory: client.brandProfile.brandStory,
    customInstructionsAI: client.brandProfile.customInstructionsAI
  });
  const handleSave = () => {
    onSave(formData);
  };
  return <Card className="lg:col-span-2">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Brand Profile</span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleSave}>
              <Check className="h-4 w-4 mr-2" />
              Save Profile
            </Button>
            <Button variant="outline" size="sm" onClick={onCancel}>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Accordion type="multiple" className="w-full">
          <AccordionItem value="basics">
            <AccordionTrigger className="text-base font-medium">Business Basics</AccordionTrigger>
            <AccordionContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-2">
                <div>
                  <Label htmlFor="language" className="text-sm font-medium text-gray-500">
                    Language
                  </Label>
                  <Input id="language" value={formData.language} onChange={e => setFormData(prev => ({
                  ...prev,
                  language: e.target.value
                }))} className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="locationFocus" className="text-sm font-medium text-gray-500">
                    Location Focus
                  </Label>
                  <Input id="locationFocus" value={formData.locationFocus} onChange={e => setFormData(prev => ({
                  ...prev,
                  locationFocus: e.target.value
                }))} className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="businessSize" className="text-sm font-medium text-gray-500">
                    Business Size
                  </Label>
                  <Input id="businessSize" value={formData.businessSize} onChange={e => setFormData(prev => ({
                  ...prev,
                  businessSize: e.target.value
                }))} className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="sellsWhat" className="text-sm font-medium text-gray-500">
                    Sells What
                  </Label>
                  <Input id="sellsWhat" value={formData.sellsWhat} onChange={e => setFormData(prev => ({
                  ...prev,
                  sellsWhat: e.target.value
                }))} className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="sellsToWhom" className="text-sm font-medium text-gray-500">
                    Sells to Whom
                  </Label>
                  <Input id="sellsToWhom" value={formData.sellsToWhom} onChange={e => setFormData(prev => ({
                  ...prev,
                  sellsToWhom: e.target.value
                }))} className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="linkedinProfileUrl" className="text-sm font-medium text-gray-500">
                    LinkedIn Profile
                  </Label>
                  <Input id="linkedinProfileUrl" value={formData.linkedinProfileUrl} onChange={e => setFormData(prev => ({
                  ...prev,
                  linkedinProfileUrl: e.target.value
                }))} placeholder="https://linkedin.com/in/..." className="mt-1" />
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="brandPersonality">
            <AccordionTrigger className="text-base font-medium">Brand Voice & Personality</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4 py-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="brandTone" className="text-sm font-medium text-gray-500">
                      Brand Tone
                    </Label>
                    <Input id="brandTone" value={formData.brandTone} onChange={e => setFormData(prev => ({
                    ...prev,
                    brandTone: e.target.value
                  }))} className="mt-1" />
                  </div>
                  <div>
                    <Label htmlFor="emojiUsage" className="text-sm font-medium text-gray-500">
                      Emoji Use
                    </Label>
                    <Input id="emojiUsage" value={formData.emojiUsage} onChange={e => setFormData(prev => ({
                    ...prev,
                    emojiUsage: e.target.value
                  }))} className="mt-1" />
                  </div>
                  <div>
                    <Label htmlFor="desiredPostLength" className="text-sm font-medium text-gray-500">
                      Desired Post Length
                    </Label>
                    <Input id="desiredPostLength" value={formData.desiredPostLength} onChange={e => setFormData(prev => ({
                    ...prev,
                    desiredPostLength: e.target.value
                  }))} className="mt-1" />
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
                  <Label htmlFor="coreValues" className="text-sm font-medium text-gray-500">
                    Core Values
                  </Label>
                  <Textarea id="coreValues" value={formData.coreValues} onChange={e => setFormData(prev => ({
                  ...prev,
                  coreValues: e.target.value
                }))} className="mt-1 h-20" />
                </div>
                <div>
                  <Label htmlFor="brandStory" className="text-sm font-medium text-gray-500">
                    Brand Story
                  </Label>
                  <Textarea id="brandStory" value={formData.brandStory} onChange={e => setFormData(prev => ({
                  ...prev,
                  brandStory: e.target.value
                }))} className="mt-1 h-24" />
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="aiInstructions">
            
            <AccordionContent>
              <div className="space-y-4 py-2">
                <div>
                  <Label htmlFor="customInstructionsAI" className="text-sm font-medium text-gray-500">
                    Custom AI Instructions
                  </Label>
                  <Textarea id="customInstructionsAI" value={formData.customInstructionsAI} onChange={e => setFormData(prev => ({
                  ...prev,
                  customInstructionsAI: e.target.value
                }))} placeholder="Enter custom instructions for AI content generation" className="mt-1 h-32" />
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>;
};
export default EditableBrandProfileForm;