import React from 'react';
import InitialIdeaSection from './InitialIdeaSection';

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
  isRegeneratingPost?: boolean; // Add loading prop
}

const IdeaForm: React.FC<IdeaFormProps> = ({
  formData,
  setters,
  options,
  isExpanded,
  onExpandChange,
  onSendToAI,
  onAddCustomObjective,
  isRegeneratingPost = false, // Default to false
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
        isRegeneratingPost={isRegeneratingPost} // Pass loading state
      />
    </div>
  );
};

export default IdeaForm;
