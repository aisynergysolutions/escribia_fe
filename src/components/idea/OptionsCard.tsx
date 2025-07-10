import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Save } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { usePostDetails } from '@/context/PostDetailsContext'; // Change from PostsContext to PostsDetailsContext

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
  const agencyId = 'agency1'; // TODO: Replace with real agencyId logic as needed
  const { updateInternalNotes, updateTrainAI } = usePostDetails(); // Use PostsDetailsContext
  const [savingNotes, setSavingNotes] = useState(false);
  const [savingTrainAI, setSavingTrainAI] = useState(false);

  const handleSaveNotes = async () => {
    if (!clientId || !postId) return;
    setSavingNotes(true);
    await updateInternalNotes(agencyId, clientId, postId, internalNotes);
    setSavingNotes(false);
  };

  const handleTrainAIToggle = async (checked: boolean) => {
    onUseAsTrainingDataChange(checked);
    if (!clientId || !postId) return;
    setSavingTrainAI(true);
    await updateTrainAI(agencyId, clientId, postId, checked);
    setSavingTrainAI(false);
  };

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
          <Label htmlFor="use-as-training-data">Use as training data</Label>
        </div>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Label htmlFor="internal-notes">Internal Notes</Label>
            <button
              type="button"
              onClick={handleSaveNotes}
              disabled={savingNotes}
              className="p-1 rounded hover:bg-gray-100 transition"
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
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default OptionsCard;