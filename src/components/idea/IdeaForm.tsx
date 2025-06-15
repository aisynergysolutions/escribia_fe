
import React from 'react';
import InitialIdeaSection from './InitialIdeaSection';
import OptionsCard from './OptionsCard';
import HooksSection, { type Hook } from './HooksSection';

interface IdeaFormProps {
  formData: {
    initialIdea: string;
    objective: string;
    template: string;
    internalNotes: string;
  };
  setters: {
    setInitialIdea: (value: string) => void;
    setObjective: (value: string) => void;
    setTemplate: (value: string) => void;
    setInternalNotes: (value: string) => void;
  };
  options: {
    useAsTrainingData: boolean;
    onUseAsTrainingDataChange: (value: boolean) => void;
  };
  isExpanded: boolean;
  onExpandChange: (expanded: boolean) => void;
  onSendToAI: () => void;
  onAddCustomObjective: (objective: string) => void;
  hooks?: Hook[];
  selectedHookIndex: number;
  onHookSelect: (index: number) => void;
  onRegenerateHooks: () => void;
}

const IdeaForm: React.FC<IdeaFormProps> = ({
  formData,
  setters,
  options,
  isExpanded,
  onExpandChange,
  onSendToAI,
  onAddCustomObjective,
  hooks,
  selectedHookIndex,
  onHookSelect,
  onRegenerateHooks,
}) => {
  return (
    <div className="space-y-6">
      <InitialIdeaSection
        isExpanded={isExpanded}
        onExpandChange={onExpandChange}
        initialIdea={formData.initialIdea}
        onInitialIdeaChange={setters.setInitialIdea}
        objective={formData.objective}
        onObjectiveChange={setters.setObjective}
        template={formData.template}
        onTemplateChange={setters.setTemplate}
        onSendToAI={onSendToAI}
        onAddCustomObjective={onAddCustomObjective}
      />
      
      <HooksSection
        hooks={hooks}
        selectedHookIndex={selectedHookIndex}
        onHookSelect={onHookSelect}
        onRegenerateHooks={onRegenerateHooks}
      />
      
      <OptionsCard
        useAsTrainingData={options.useAsTrainingData}
        onUseAsTrainingDataChange={options.onUseAsTrainingDataChange}
        internalNotes={formData.internalNotes}
        onInternalNotesChange={setters.setInternalNotes}
      />
    </div>
  );
};

export default IdeaForm;
