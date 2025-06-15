import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
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
  return <Card>
      <CardHeader>
        <CardTitle className="text-lg">Options</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-2">
          <Switch id="use-as-training-data" checked={useAsTrainingData} onCheckedChange={onUseAsTrainingDataChange} />
          <Label htmlFor="use-as-training-data">Use as training data</Label>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="internal-notes">Internal Notes</Label>
          <Textarea id="internal-notes" placeholder="Add any internal notes here..." value={internalNotes} onChange={e => onInternalNotesChange(e.target.value)} rows={3} />
        </div>
      </CardContent>
    </Card>;
};
export default OptionsCard;