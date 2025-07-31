
import React from 'react';
import { MessageSquare, Sparkles, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EditingInstructionsProps {
  showChatBox: boolean;
  onToggleChatBox: () => void;
  editingInstructions: string;
  onEditingInstructionsChange: (value: string) => void;
  onRegeneratePost: () => void;
  onRegenerateWithInstructions: () => void;
  isLoading?: boolean;
}

const EditingInstructions: React.FC<EditingInstructionsProps> = ({
  showChatBox,
  onToggleChatBox,
  editingInstructions,
  onEditingInstructionsChange,
  onRegeneratePost,
  onRegenerateWithInstructions,
  isLoading = false
}) => {
  return (
    <div className="border-t bg-gray-50 rounded-b-md">
      <div className="flex items-center justify-between p-3 border-b border-gray-200">
        <Button variant="ghost" size="sm" onClick={onToggleChatBox} className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800">
          <MessageSquare className="h-4 w-4" />
          {showChatBox ? 'Hide' : 'Show'} editing instructions
        </Button>

        {/* <Button variant="ghost" size="sm" onClick={onRegeneratePost} className="flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50">
          <Sparkles className="h-4 w-4" />
          Regenerate with AI
        </Button> */}
      </div>

      {showChatBox && (
        <div className="p-4 space-y-3 rounded-b-md">
          <div className="flex gap-3">
            <textarea
              value={editingInstructions}
              onChange={e => onEditingInstructionsChange(e.target.value)}
              className="flex-1 min-h-[80px] border rounded-lg p-3 focus:outline-none focus:ring-2 focus-ring-indigo-500 resize-none bg-white text-sm"
              placeholder="Provide feedback or instructions for the AI to improve the generated content..."
            />
          </div>
          <div className="flex justify-end">
            <Button
              onClick={onRegenerateWithInstructions}
              size="sm"
              className="bg-indigo-600 hover:bg-indigo-700"
              disabled={!editingInstructions.trim() || isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Applying changes...
                </>
              ) : (
                'Send Instructions'
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditingInstructions;
