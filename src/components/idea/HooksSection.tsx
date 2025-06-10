
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface Hook {
  text: string;
  angle: string;
  selected?: boolean;
}

interface HooksSectionProps {
  hooks?: Hook[];
  selectedHookIndex: number;
  onHookSelect: (index: number) => void;
  onRegenerateHooks: () => void;
}

const HooksSection: React.FC<HooksSectionProps> = ({
  hooks,
  selectedHookIndex,
  onHookSelect,
  onRegenerateHooks
}) => {
  return (
    <div className="bg-white rounded-lg border p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Generated Hooks</h3>
        <Button onClick={onRegenerateHooks} className="bg-indigo-600 hover:bg-indigo-700">
          Regenerate Hooks
        </Button>
      </div>
      <div className="space-y-4">
        {hooks?.map((hook, index) => (
          <div 
            key={index} 
            className={`p-3 rounded-md border cursor-pointer ${
              selectedHookIndex === index ? 'border-indigo-500 bg-indigo-50' : 'hover:bg-gray-50'
            }`} 
            onClick={() => onHookSelect(index)}
          >
            <div className="flex justify-between">
              <p>{hook.text}</p>
              {selectedHookIndex === index ? (
                <Badge className="bg-indigo-600">Selected</Badge>
              ) : (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={e => {
                    e.stopPropagation();
                    onHookSelect(index);
                  }}
                >
                  Select
                </Button>
              )}
            </div>
            <p className="text-sm text-gray-500 mt-1">Angle: {hook.angle}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HooksSection;
