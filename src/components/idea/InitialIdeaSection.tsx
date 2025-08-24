import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import CustomInputModal from '../CustomInputModal';

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
  isRegeneratingPost?: boolean; // Add loading prop
}

const predefinedObjectives = ['Thought Leadership', 'Brand Awareness', 'Lead Generation', 'Talent attraction'];

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
  onAddCustomObjective,
  isRegeneratingPost = false // Default to false
}) => {
  const [showCustomObjectiveModal, setShowCustomObjectiveModal] = useState(false);

  const handleCustomObjective = (customObjective: string) => {
    onAddCustomObjective(customObjective);
    setShowCustomObjectiveModal(false);
  };

  const getObjectiveDisplayName = (obj: string) => {
    return obj || 'Select objective';
  };

  return (
    <>
      <Collapsible open={isExpanded} onOpenChange={onExpandChange}>
        <Card className="p-4">
          <CollapsibleTrigger asChild>
            <div className="flex items-start justify-between cursor-pointer hover:bg-gray-50 p-2 rounded -m-2">
              <div className="flex-1 min-w-0">
                <h2 className="font-semibold text-lg mb-2">Initial Idea</h2>
                {!isExpanded && initialIdea && (
                  <span className="text-sm text-gray-500 block truncate">
                    {initialIdea}
                  </span>
                )}
              </div>
              <div className="flex-shrink-0 ml-2">
                {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </div>
            </div>
          </CollapsibleTrigger>

          <CollapsibleContent className="space-y-4 pt-2">
            <div>
              <Textarea
                id="initialIdea"
                value={initialIdea}
                onChange={e => onInitialIdeaChange(e.target.value)}
                placeholder="Write your initial idea here..."
                rows={4}
                className="w-full"
                disabled={isRegeneratingPost} // Disable during regeneration
              />
            </div>

            <div className="space-y-4">
              <div>
                <label htmlFor="objective" className="block text-sm font-medium mb-1">Objective</label>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-between"
                      disabled={isRegeneratingPost} // Disable during regeneration
                    >
                      <span className={objective ? '' : 'text-muted-foreground'}>
                        {getObjectiveDisplayName(objective)}
                      </span>
                      <ChevronDown className="h-4 w-4 opacity-50" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-full" align="start">
                    {predefinedObjectives.map(obj => (
                      <DropdownMenuItem key={obj} onClick={() => onObjectiveChange(obj)}>
                        {obj}
                      </DropdownMenuItem>
                    ))}
                    <DropdownMenuItem onClick={() => setShowCustomObjectiveModal(true)}>
                      Custom...
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div>
                <label htmlFor="template" className="block text-sm font-medium mb-1">Template</label>
                <Input
                  id="template"
                  value={(template === 'none') ? 'No template selected' : template}
                  readOnly
                  className={`w-full bg-gray-50 ${(!template || template === 'none' || template === 'No template selected') ? 'text-muted-foreground' : ''}`}
                  placeholder="No template selected"
                />
              </div>
            </div>

            <Button
              onClick={onSendToAI}
              className="w-full bg-indigo-600 hover:bg-indigo-700"
              disabled={isRegeneratingPost || !initialIdea.trim()} // Disable if loading or missing data
            >
              {isRegeneratingPost ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Regenerating Post...
                </>
              ) : (
                'Regenerate Post'
              )}
            </Button>
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
