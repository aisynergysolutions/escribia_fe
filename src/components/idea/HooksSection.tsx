
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';

export interface Hook {
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
  const [loadingHookIndex, setLoadingHookIndex] = useState<number | null>(null);
  const [errorHook, setErrorHook] = useState<{ index: number; message: string } | null>(null);

  const handleHookClick = async (index: number) => {
    if (loadingHookIndex !== null) return;

    setLoadingHookIndex(index);
    setErrorHook(null);

    // Simulate async operation
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Simulate success/failure
    const isSuccess = Math.random() > 0.3;

    if (isSuccess) {
      onHookSelect(index);
    } else {
      setErrorHook({ index, message: "Couldn’t apply—try again" });
    }

    setLoadingHookIndex(null);
  };

  return (
    <div className="bg-card rounded-lg border p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Hooks</h3>
        <Button onClick={onRegenerateHooks}>
          Regenerate Hooks
        </Button>
      </div>
      <div className="space-y-3">
        {hooks?.map((hook, index) => {
          const isSelected = selectedHookIndex === index;
          const isLoading = loadingHookIndex === index;
          const isError = errorHook?.index === index;

          return (
            <div key={index}>
              <button
                onClick={() => handleHookClick(index)}
                disabled={isLoading}
                className={`w-full p-3 rounded-md border text-left transition-all 
                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2
                  ${isLoading ? 'cursor-wait' : ''}
                  ${isSelected && !isLoading ? 'border-indigo-500 bg-indigo-50' : 'hover:border-gray-400'}`}
              >
                {isLoading ? (
                  <div className="flex justify-center items-center h-[42px]">
                    <Loader2 className="h-5 w-5 animate-spin" />
                  </div>
                ) : (
                  <>
                    <div className="flex justify-between items-start">
                      <p className="pr-2">{hook.text}</p>
                      {isSelected && <Badge className="bg-indigo-600 flex-shrink-0">Selected</Badge>}
                    </div>
                    <p className="text-sm text-gray-500 mt-1">Angle: {hook.angle}</p>
                  </>
                )}
              </button>
              {isError && (
                <p className="text-sm text-destructive mt-1.5 px-1">{errorHook.message}</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default HooksSection;
