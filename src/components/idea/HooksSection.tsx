import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Wand2 } from 'lucide-react';
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
  hooks = [],
  selectedHookIndex,
  onHookSelect,
  onRegenerateHooks
}) => {
  const [loadingHookIndex, setLoadingHookIndex] = useState<number | null>(null);
  const [errorHook, setErrorHook] = useState<{
    index: number;
    message: string;
  } | null>(null);
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
      setErrorHook({
        index,
        message: "Couldn’t apply—try again"
      });
    }
    setLoadingHookIndex(null);
  };
  const totalCards = 4;
  const displayableItems = Array.from({
    length: totalCards
  }).map((_, i) => hooks[i] || null);
  return <div className="bg-card rounded-lg border p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Hooks</h3>
        <Button onClick={onRegenerateHooks} variant="outline" className="text-sm">
          <Wand2 className="h-4 w-4 mr-2" />
          Regenerate hooks
        </Button>
      </div>
      <div className="space-y-3">
        {displayableItems.map((hook, index) => {
        if (!hook) {
          return <div key={`placeholder-${index}`} className="w-full p-3 rounded-md border border-dashed text-center flex items-center justify-center h-[68px]">
                <p className="italic text-muted-foreground">No hook available</p>
              </div>;
        }
        const isSelected = selectedHookIndex === index;
        const isLoading = loadingHookIndex === index;
        const isError = errorHook?.index === index;
        return <div key={index}>
              <button onClick={() => handleHookClick(index)} disabled={isLoading} className={`w-full p-3 rounded-md border text-left transition-all 
                  focus-visible:outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2
                  hover:border-primary
                  ${isLoading ? 'cursor-wait' : ''}
                  ${isSelected && !isLoading ? 'border-primary bg-primary/10' : ''}`}>
                {isLoading ? <div className="flex justify-center items-center h-[42px]">
                    <Loader2 className="h-5 w-5 animate-spin" />
                  </div> : <>
                    <div className="flex justify-between items-start">
                      <p className="pr-2 whitespace-pre-line">{hook.text}</p>
                      {isSelected && <Badge className="bg-primary flex-shrink-0">Selected</Badge>}
                    </div>
                    <p className="text-sm text-gray-500 mt-1">Angle: {hook.angle}</p>
                  </>}
              </button>
              {isError && <p className="text-sm text-destructive mt-1.5 px-1">{errorHook.message}</p>}
            </div>;
      })}
      </div>
    </div>;
};
export default HooksSection;