import React from 'react';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
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
  return <Card className="p-6">
      <h2 className="font-semibold mb-4 text-lg">Options</h2>
      
      <div className="flex items-center space-x-2 mb-4">
        <input type="checkbox" id="training-data" checked={useAsTrainingData} onChange={e => onUseAsTrainingDataChange(e.target.checked)} className="rounded border-gray-300" />
        <label htmlFor="training-data">Use as training data</label>
      </div>
      
      <div>
        <label htmlFor="internalNotes" className="block text-sm font-medium mb-1">Internal Notes</label>
        <Textarea id="internalNotes" value={internalNotes} onChange={e => onInternalNotesChange(e.target.value)} placeholder="Add internal notes here (not visible to clients)..." rows={3} />
      </div>
    </Card>;
};
export default OptionsCard;