
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import GeneratedPostEditor from './GeneratedPostEditor';
import HooksSection from './HooksSection';

interface PostEditorProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  postData: {
    generatedPost: string;
    editingInstructions: string;
    hasUnsavedChanges: boolean;
  };
  postHandlers: {
    onGeneratedPostChange: (text: string) => void;
    onEditingInstructionsChange: (text: string) => void;
    onCopyText: () => void;
    onRegenerateWithInstructions: () => void;
    onSave: () => void;
    onUnsavedChangesChange: (hasChanges: boolean) => void;
  };
  hooks?: any[];
  selectedHookIndex: number;
  onHookSelect: (index: number) => void;
  onRegenerateHooks: () => void;
  versionHistory: any[];
  onRestoreVersion: (text: string) => void;
}

const PostEditor: React.FC<PostEditorProps> = ({
  activeTab,
  onTabChange,
  postData,
  postHandlers,
  hooks,
  selectedHookIndex,
  onHookSelect,
  onRegenerateHooks,
  versionHistory,
  onRestoreVersion
}) => {
  return (
    <Tabs value={activeTab} onValueChange={onTabChange}>
      <TabsList className="bg-slate-100">
        <TabsTrigger value="generatedPost">Generated Post</TabsTrigger>
        <TabsTrigger value="hooks">Hooks</TabsTrigger>
      </TabsList>
      
      <TabsContent value="generatedPost" className="space-y-6 pt-4">
        <GeneratedPostEditor
          generatedPost={postData.generatedPost}
          onGeneratedPostChange={postHandlers.onGeneratedPostChange}
          editingInstructions={postData.editingInstructions}
          onEditingInstructionsChange={postHandlers.onEditingInstructionsChange}
          onCopyText={postHandlers.onCopyText}
          onRegenerateWithInstructions={postHandlers.onRegenerateWithInstructions}
          onSave={postHandlers.onSave}
          hasUnsavedChanges={postData.hasUnsavedChanges}
          onUnsavedChangesChange={postHandlers.onUnsavedChangesChange}
          versionHistory={versionHistory}
          onRestoreVersion={onRestoreVersion}
        />
      </TabsContent>
      
      <TabsContent value="hooks" className="pt-4">
        <HooksSection
          hooks={hooks}
          selectedHookIndex={selectedHookIndex}
          onHookSelect={onHookSelect}
          onRegenerateHooks={onRegenerateHooks}
        />
      </TabsContent>
    </Tabs>
  );
};

export default PostEditor;
