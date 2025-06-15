
import React from 'react';
import InitialIdeaSection from './InitialIdeaSection';
import ScheduleCard from './ScheduleCard';
import AssetsCard from './AssetsCard';
import OptionsCard from './OptionsCard';

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
  scheduling: {
    postDate: string;
    postTime: string;
    timezone: string;
    setPostDate: (value: string) => void;
    setPostTime: (value: string) => void;
    setTimezone: (value: string) => void;
  };
  assets: {
    uploadedFiles: File[];
    onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
    onFileDrop: (event: React.DragEvent<HTMLDivElement>) => void;
    onDragOver: (event: React.DragEvent<HTMLDivElement>) => void;
    onRemoveFile: (index: number) => void;
  };
  options: {
    useAsTrainingData: boolean;
    onUseAsTrainingDataChange: (value: boolean) => void;
  };
  isExpanded: boolean;
  onExpandChange: (expanded: boolean) => void;
  onSendToAI: () => void;
  onAddCustomObjective: (objective: string) => void;
}

const IdeaForm: React.FC<IdeaFormProps> = ({
  formData,
  setters,
  scheduling,
  assets,
  options,
  isExpanded,
  onExpandChange,
  onSendToAI,
  onAddCustomObjective
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
      
      <ScheduleCard
        postDate={scheduling.postDate}
        postTime={scheduling.postTime}
        timezone={scheduling.timezone}
        onPostDateChange={scheduling.setPostDate}
        onPostTimeChange={scheduling.setPostTime}
        onTimezoneChange={scheduling.setTimezone}
      />
      
      <AssetsCard
        uploadedFiles={assets.uploadedFiles}
        onFileUpload={assets.onFileUpload}
        onFileDrop={assets.onFileDrop}
        onDragOver={assets.onDragOver}
        onRemoveFile={assets.onRemoveFile}
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
