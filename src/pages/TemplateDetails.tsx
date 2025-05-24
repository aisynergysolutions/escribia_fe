
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit2, Save, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { mockTemplates } from '../types';
import { useToast } from '@/hooks/use-toast';

const contentTypeOptions = [
  'Listicle',
  'Storytelling',
  'How-to / Guide',
  'Case Study / Success Story',
  'Opinion / Thought Leadership',
  'News / Announcement',
  'Q&A / Interview'
];

const TemplateDetails = () => {
  const { templateId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const template = mockTemplates.find(t => t.id === templateId);
  const [isEditing, setIsEditing] = useState(false);
  
  const [formData, setFormData] = useState({
    templateName: template?.templateName || '',
    templateContent: template?.templateContent || '',
    objective: template?.objective || '',
    funnelStage: template?.funnelStage || '',
    contentTypes: template?.tags || []
  });

  if (!template) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Template not found</h2>
        <p className="text-gray-600 mb-4">The template you're looking for doesn't exist.</p>
        <Button onClick={() => navigate('/templates')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Templates
        </Button>
      </div>
    );
  }

  const handleSave = () => {
    console.log('Saving template:', formData);
    toast({
      title: "Template Updated",
      description: `Template "${formData.templateName}" has been updated successfully.`,
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setFormData({
      templateName: template.templateName,
      templateContent: template.templateContent,
      objective: template.objective,
      funnelStage: template.funnelStage,
      contentTypes: template.tags
    });
    setIsEditing(false);
  };

  const handleContentTypeChange = (contentType: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      contentTypes: checked 
        ? [...prev.contentTypes, contentType]
        : prev.contentTypes.filter(type => type !== contentType)
    }));
  };

  const getFunnelStageColor = (stage: string) => {
    switch (stage) {
      case 'TOFU':
        return 'bg-green-100 text-green-800';
      case 'MOFU':
        return 'bg-blue-100 text-blue-800';
      case 'BOFU':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/templates')}
            className="p-2"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">
              {isEditing ? 'Edit Template' : template.templateName}
            </h1>
            <div className="flex items-center space-x-2 mt-1">
              <Badge className={getFunnelStageColor(template.funnelStage)}>
                {template.funnelStage}
              </Badge>
              <span className="text-sm text-gray-500">
                Used {template.usageCount} times
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex space-x-2">
          {isEditing ? (
            <>
              <Button variant="outline" onClick={handleCancel}>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button onClick={handleSave}>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </>
          ) : (
            <Button onClick={() => setIsEditing(true)}>
              <Edit2 className="h-4 w-4 mr-2" />
              Edit Template
            </Button>
          )}
        </div>
      </div>

      {/* Template Content */}
      <div className="bg-white rounded-lg border p-6 space-y-6">
        {isEditing ? (
          <>
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
            </div>

            {/* Template Guidelines */}
            <div className="space-y-2">
              <Label htmlFor="templateContent" className="text-sm font-medium">
                Template Guidelines <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="templateContent"
                value={formData.templateContent}
                onChange={(e) => setFormData(prev => ({ ...prev, templateContent: e.target.value }))}
                placeholder="Outline the structure your AI should follow..."
                className="min-h-[200px]"
              />
              <p className="text-xs text-gray-600">
                Outline the structure your AI should follow when using this template. Use {'{brackets}'} for variables.
              </p>
            </div>

            {/* Content Objective */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">
                Content Objective <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.objective}
                onValueChange={(value) => setFormData(prev => ({ ...prev, objective: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select content objective" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Personal Post">Personal Post</SelectItem>
                  <SelectItem value="Brand Awareness">Brand Awareness/Community Engagement</SelectItem>
                  <SelectItem value="Conversions">Conversions/Lead Generation</SelectItem>
                </SelectContent>
              </Select>
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
            </div>
          </>
        ) : (
          <>
            {/* View Mode */}
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">Template Guidelines</h3>
                <div className="bg-gray-50 p-4 rounded-md">
                  <pre className="whitespace-pre-wrap text-sm text-gray-700">
                    {template.templateContent}
                  </pre>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-1">Content Objective</h4>
                  <p className="text-gray-600">{template.objective}</p>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900 mb-1">Funnel Stage</h4>
                  <Badge className={getFunnelStageColor(template.funnelStage)}>
                    {template.funnelStage}
                  </Badge>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-2">Content Types</h4>
                <div className="flex flex-wrap gap-2">
                  {template.tags.map((tag, index) => (
                    <Badge key={index} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default TemplateDetails;
