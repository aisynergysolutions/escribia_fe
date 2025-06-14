
import React, { useState } from 'react';
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
  const [showCustomObjectiveModal, setShowCustomObjectiveModal] = useState(false);

  const handleCustomObjective = (customObjective: string) => {
    onAddCustomObjective(customObjective);
    setShowCustomObjectiveModal(false);
  };

  const getObjectiveDisplayName = (obj: string) => {
    if (predefinedObjectives.includes(obj)) {
      return obj;
    }
    return obj || 'Select objective';
  };

  return (
    <>
      <Collapsible open={isExpanded} onOpenChange={onExpandChange}>
        <Card className="p-4 transition-all duration-200 hover:shadow-md">
          <CollapsibleTrigger asChild>
            <div className="flex items-start justify-between cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors duration-150 -mx-2">
              <div className="flex-1 min-w-0">
                <h2 className="font-semibold text-lg mb-2">Initial Idea</h2>
                {!isExpanded && initialIdea && (
                  <div className="text-sm text-gray-500 truncate transition-opacity duration-200 opacity-70 hover:opacity-100">
                    {initialIdea}
                  </div>
                )}
              </div>
              <div className="flex-shrink-0 ml-2 transition-transform duration-200">
                {isExpanded ? (
                  <ChevronUp className="h-4 w-4 transform transition-transform duration-200" />
                ) : (
                  <ChevronDown className="h-4 w-4 transform transition-transform duration-200" />
                )}
              </div>
            </div>
          </CollapsibleTrigger>
          
          <CollapsibleContent className="data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
            <div className="space-y-4 pt-2">
              <div className="animate-fade-in">
                <Textarea 
                  id="initialIdea" 
                  value={initialIdea} 
                  onChange={e => onInitialIdeaChange(e.target.value)} 
                  placeholder="Write your initial idea here..." 
                  rows={4} 
                  className="w-full transition-all duration-150 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" 
                />
              </div>
              
              <div className="space-y-4 animate-fade-in" style={{ animationDelay: '0.1s' }}>
                <div>
                  <label htmlFor="objective" className="block text-sm font-medium mb-2">Objective</label>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="w-full justify-between hover:bg-gray-50 transition-colors duration-150">
                        <span className={objective ? '' : 'text-muted-foreground'}>
                          {getObjectiveDisplayName(objective)}
                        </span>
                        <ChevronDown className="h-4 w-4 opacity-50 transition-transform duration-200" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-full bg-white shadow-lg border z-50" align="start">
                      {predefinedObjectives.map(obj => (
                        <DropdownMenuItem 
                          key={obj} 
                          onClick={() => onObjectiveChange(obj)}
                          className="hover:bg-gray-50 transition-colors duration-150"
                        >
                          {obj}
                        </DropdownMenuItem>
                      ))}
                      <DropdownMenuItem 
                        onClick={() => setShowCustomObjectiveModal(true)}
                        className="hover:bg-gray-50 transition-colors duration-150"
                      >
                        Custom...
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                
                <div>
                  <label htmlFor="template" className="block text-sm font-medium mb-2">Template</label>
                  <Select value={template} onValueChange={onTemplateChange}>
                    <SelectTrigger className="transition-all duration-150 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
                      <SelectValue placeholder="Not Selected" />
                    </SelectTrigger>
                    <SelectContent className="bg-white shadow-lg border z-50">
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
              
              <div className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
                <Button 
                  onClick={onSendToAI} 
                  className="w-full bg-indigo-600 hover:bg-indigo-700 transition-colors duration-150 transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  Regenerate Post
                </Button>
              </div>
            </div>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      <CustomInputModal 
        open={showCustomObjectiveModal} 
        onOpenChange={setShowCustomObjectiveModal} 
        title="Add Custom Objective" 
        placeholder="Enter custom objective..." 
        onSave={handleCustomObjective} 
      />
    </>
  );
};

export default InitialIdeaSection;
