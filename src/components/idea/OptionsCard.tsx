import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Save, AlertCircle } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { usePostDetails } from '@/context/PostDetailsContext';
import { useAuth } from '@/context/AuthContext';

interface OptionsCardProps {
  useAsTrainingData: boolean;
  onUseAsTrainingDataChange: (value: boolean) => void;
  internalNotes: string;
  onInternalNotesChange: (value: string) => void;
}

const OptionsCard: React.FC<OptionsCardProps> = ({
  useAsTrainingData,
  onUseAsTrainingDataChange,
  internalNotes,
  onInternalNotesChange
}) => {
  const { clientId, postId } = useParams<{ clientId: string; postId: string }>();
  const { currentUser } = useAuth();
  const { updateInternalNotes, updateTrainAI } = usePostDetails();
  const [savingNotes, setSavingNotes] = useState(false);
  const [savingTrainAI, setSavingTrainAI] = useState(false);

  // Get the agency ID from the current user
  const agencyId = currentUser?.uid;

  const handleSaveNotes = async () => {
    if (!agencyId) {
      console.error('No agency ID available for saving notes');
      return;
    }

    if (!clientId || !postId) {
      console.error('Missing clientId or postId');
      return;
    }

    setSavingNotes(true);
    try {
      await updateInternalNotes(agencyId, clientId, postId, internalNotes);
    } catch (error) {
      console.error('Error saving notes:', error);
    } finally {
      setSavingNotes(false);
    }
  };

  const handleTrainAIToggle = async (checked: boolean) => {
    onUseAsTrainingDataChange(checked);
    
    if (!agencyId) {
      console.error('No agency ID available for updating trainAI');
      return;
    }

    if (!clientId || !postId) {
      console.error('Missing clientId or postId');
      return;
    }

    setSavingTrainAI(true);
    try {
      await updateTrainAI(agencyId, clientId, postId, checked);
    } catch (error) {
      console.error('Error updating trainAI:', error);
    } finally {
      setSavingTrainAI(false);
    }
  };

  // Show authentication error if no agency ID
  if (!agencyId) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            Options
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
            <div className="flex items-center gap-2 text-red-600">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm">No agency ID available. Please ensure you are signed in.</span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          Options
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-2">
          <Switch
            id="use-as-training-data"
            checked={useAsTrainingData}
            onCheckedChange={handleTrainAIToggle}
            disabled={savingTrainAI}
          />
          <Label htmlFor="use-as-training-data">
            Use as training data
            {savingTrainAI && <span className="ml-2 text-xs text-gray-500">Saving...</span>}
          </Label>
        </div>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Label htmlFor="internal-notes">Internal Notes</Label>
            <button
              type="button"
              onClick={handleSaveNotes}
              disabled={savingNotes}
              className="p-1 rounded hover:bg-gray-100 transition disabled:opacity-50"
              title="Save internal notes"
            >
              <Save className={`h-4 w-4 ${savingNotes ? 'animate-spin' : ''}`} />
            </button>
          </div>
          <Textarea
            id="internal-notes"
            placeholder="Add any internal notes here..."
            value={internalNotes}
            onChange={e => onInternalNotesChange(e.target.value)}
            rows={3}
            disabled={savingNotes}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default OptionsCard;