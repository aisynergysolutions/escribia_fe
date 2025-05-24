
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface CreateTemplateModalProps {
  children: React.ReactNode;
  onSave: (templateData: any) => void;
}

const contentTypeOptions = [
  'Listicle',
  'Storytelling',
  'How-to / Guide',
  'Case Study / Success Story',
  'Opinion / Thought Leadership',
  'News / Announcement',
  'Q&A / Interview'
];

const CreateTemplateModal: React.FC<CreateTemplateModalProps> = ({ children, onSave }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    templateName: '',
    templateGuidelines: '',
    contentObjective: '',
    funnelStage: '',
    contentTypes: [] as string[]
  });

  const handleSave = () => {
    if (formData.templateName && formData.templateGuidelines && formData.contentObjective && formData.funnelStage && formData.contentTypes.length > 0) {
      onSave(formData);
      setFormData({
        templateName: '',
        templateGuidelines: '',
        contentObjective: '',
        funnelStage: '',
        contentTypes: []
      });
      setIsOpen(false);
    }
  };

  const handleContentTypeChange = (contentType: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      contentTypes: checked 
        ? [...prev.contentTypes, contentType]
        : prev.contentTypes.filter(type => type !== contentType)
    }));
  };

  const isFormValid = formData.templateName && formData.templateGuidelines && formData.contentObjective && formData.funnelStage && formData.contentTypes.length > 0;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Template</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Template Name */}
          <div className="space-y-2">
            <Label htmlFor="templateName" className="text-sm font-medium">
              Template Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="templateName"
              value={formData.templateName}
              onChange={(e) => setFormData(prev => ({ ...prev, templateName: e.target.value }))}
              placeholder="Enter template name"
            />
            <p className="text-xs text-gray-600">
              Give this template a name you'll recognize when choosing it later. It won't affect how your post is written.
            </p>
          </div>

          {/* Template Guidelines */}
          <div className="space-y-2">
            <Label htmlFor="templateGuidelines" className="text-sm font-medium">
              Template Guidelines <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="templateGuidelines"
              value={formData.templateGuidelines}
              onChange={(e) => setFormData(prev => ({ ...prev, templateGuidelines: e.target.value }))}
              placeholder="Outline the structure your AI should follow..."
              className="min-h-[100px]"
            />
            <p className="text-xs text-gray-600">
              Outline the structure your AI should follow when using this template. Use {'{brackets}'} for variables, and model it after the examples in your Template Library.
            </p>
          </div>

          {/* Content Objective */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              Content Objective <span className="text-red-500">*</span>
            </Label>
            <Select
              value={formData.contentObjective}
              onValueChange={(value) => setFormData(prev => ({ ...prev, contentObjective: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select content objective" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="personal-post">Personal Post</SelectItem>
                <SelectItem value="brand-awareness">Brand Awareness/Community Engagement</SelectItem>
                <SelectItem value="conversions">Conversions/Lead Generation</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-600">
              What is this post meant to achieve? Choose the outcome you'd want if someone read it.
            </p>
          </div>

          {/* Funnel Stage */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              Funnel Stage <span className="text-red-500">*</span>
            </Label>
            <Select
              value={formData.funnelStage}
              onValueChange={(value) => setFormData(prev => ({ ...prev, funnelStage: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select funnel stage" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="TOFU">ToFu: Educational, no pitch</SelectItem>
                <SelectItem value="MOFU">MoFu: Build trust or interest</SelectItem>
                <SelectItem value="BOFU">BoFu: Strong call to action, lead conversion</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-600">
              Pick where this content fits in your buyer journey.
            </p>
          </div>

          {/* Content Type */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              Content Type <span className="text-red-500">*</span>
            </Label>
            <div className="grid grid-cols-2 gap-3">
              {contentTypeOptions.map((type) => (
                <div key={type} className="flex items-center space-x-2">
                  <Checkbox
                    id={type}
                    checked={formData.contentTypes.includes(type)}
                    onCheckedChange={(checked) => handleContentTypeChange(type, checked as boolean)}
                  />
                  <Label htmlFor={type} className="text-sm cursor-pointer">
                    {type}
                  </Label>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-600">
              Select one or more formats this template works best for.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!isFormValid}>
            Create Template
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateTemplateModal;
