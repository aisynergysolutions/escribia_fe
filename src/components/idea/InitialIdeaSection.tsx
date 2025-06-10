
import React from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import CustomInputModal from '../CustomInputModal';
import { mockTemplates } from '../../types';

interface InitialIdeaSectionProps {
  isExpanded: boolean;
  onExpandChange: (expanded: boolean) => void;
  initialIdea: string;
  onInitialIdeaChange: (value: string) => void;
  objective: string;
  onObjectiveChange: (value: string) => void;
  template: string;
  onTemplateChange: (value: string) => void;
  onSendToAI: () => void;
  onAddCustomObjective: (objective: string) => void;
}

const predefinedObjectives = ['Thought Leadership', 'Lead Generation', 'Brand Awareness', 'Engagement', 'Product Launch', 'Event Promotion'];

const InitialIdeaSection: React.FC<InitialIdeaSectionProps> = ({
  isExpanded,
  onExpandChange,
  initialIdea,
  onInitialIdeaChange,
  objective,
  onObjectiveChange,
  template,
  onTemplateChange,
  onSendToAI,
  onAddCustomObjective
}) => {
  return (
    <Collapsible open={isExpanded} onOpenChange={onExpandChange}>
      <Card className="p-4">
        <CollapsibleTrigger asChild>
          <div className="flex items-center justify-between cursor-pointer hover:bg-gray-50 p-2 rounded">
            <h2 className="text-lg font-medium text-gray-700">Initial Idea</h2>
            <div className="flex items-center gap-2">
              {!isExpanded && initialIdea && (
                <span className="text-sm text-gray-500 truncate max-w-md">
                  {initialIdea.substring(0, 60)}...
                </span>
              )}
              {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </div>
          </div>
        </CollapsibleTrigger>
        
        <CollapsibleContent className="space-y-4 pt-4">
          <div>
            <label htmlFor="initialIdea" className="block text-sm font-medium mb-1">Initial Idea</label>
            <Textarea 
              id="initialIdea" 
              value={initialIdea} 
              onChange={e => onInitialIdeaChange(e.target.value)} 
              placeholder="Write your initial idea here..." 
              rows={4} 
              className="w-full" 
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="objective" className="block text-sm font-medium mb-1">Objective</label>
              <div className="flex items-center gap-2">
                <Select value={objective} onValueChange={onObjectiveChange}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Select objective" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {predefinedObjectives.map(obj => (
                        <SelectItem key={obj} value={obj}>{obj}</SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      Add Custom
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <CustomInputModal 
                      title="Add Custom Objective" 
                      placeholder="Enter custom objective..." 
                      onSave={onAddCustomObjective}
                    >
                      <DropdownMenuItem onSelect={e => e.preventDefault()}>
                        Add custom objective...
                      </DropdownMenuItem>
                    </CustomInputModal>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
            
            <div>
              <label htmlFor="template" className="block text-sm font-medium mb-1">Template</label>
              <Select value={template} onValueChange={onTemplateChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Not Selected" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="none">None</SelectItem>
                    {mockTemplates.map(templ => (
                      <SelectItem key={templ.id} value={templ.id}>{templ.templateName}</SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <Button onClick={onSendToAI} className="w-full bg-indigo-600 hover:bg-indigo-700">
            Send to AI
          </Button>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
};

export default InitialIdeaSection;
