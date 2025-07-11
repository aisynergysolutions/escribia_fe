import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Loader2, RefreshCw } from 'lucide-react';

export interface Hook {
  text: string;
  angle: string;
  selected?: boolean;
}

interface HooksSectionProps {
  hooks?: Hook[];
  selectedHookIndex: number;
  onHookSelect: (index: number) => Promise<void>; // Changed to async
  onRegenerateHooks: () => Promise<void>;
  onGenerateInitialHooks?: () => Promise<void>;
  isInitialLoad?: boolean;
}

const HooksSection: React.FC<HooksSectionProps> = ({
  hooks = [],
  selectedHookIndex,
  onHookSelect,
  onRegenerateHooks,
  onGenerateInitialHooks,
  isInitialLoad = false
}) => {
  const [loadingHookIndex, setLoadingHookIndex] = useState<number | null>(null);
  const [errorHook, setErrorHook] = useState<{
    index: number;
    message: string;
  } | null>(null);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [isGeneratingInitial, setIsGeneratingInitial] = useState(false);

  // Track if we've already attempted to generate hooks to prevent infinite loops
  const hasAttemptedGeneration = useRef(false);

  // Auto-generate hooks if empty on initial load
  useEffect(() => {
    const shouldGenerateHooks = isInitialLoad &&
      hooks.length === 0 &&
      onGenerateInitialHooks &&
      !isGeneratingInitial &&
      !hasAttemptedGeneration.current;

    if (shouldGenerateHooks) {
      hasAttemptedGeneration.current = true;
      setIsGeneratingInitial(true);
      onGenerateInitialHooks()
        .finally(() => setIsGeneratingInitial(false));
    }
  }, [isInitialLoad, hooks.length, onGenerateInitialHooks, isGeneratingInitial]);

  // Reset the attempt flag when hooks are successfully loaded
  useEffect(() => {
    if (hooks.length > 0) {
      hasAttemptedGeneration.current = false;
    }
  }, [hooks.length]);

  const handleHookClick = async (index: number) => {
    if (loadingHookIndex !== null || isRegenerating || isGeneratingInitial) return;
    setLoadingHookIndex(index);
    setErrorHook(null);

    try {
      await onHookSelect(index); // Wait for the actual hook application
    } catch (error) {
      console.error('Error applying hook:', error);
      setErrorHook({
        index,
        message: "Couldn't apply—try again"
      });
    } finally {
      setLoadingHookIndex(null);
    }
  };

  const handleRegenerateClick = async () => {
    setIsRegenerating(true);
    hasAttemptedGeneration.current = true; // Mark as attempted to prevent auto-generation

    try {
      await onRegenerateHooks(); // Wait for the actual API call
    } catch (error) {
      console.error('Error regenerating hooks:', error);
    } finally {
      setIsRegenerating(false);
    }
  };

  const isDisabled = isRegenerating || isGeneratingInitial;

  return (
    <div className="bg-card rounded-lg border p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Hooks</h3>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={handleRegenerateClick}
                variant="outline"
                size="icon"
                disabled={isDisabled}
              >
                {isRegenerating ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Regenerate hooks</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      <div className="space-y-3">
        {isGeneratingInitial ? (
          <div className="w-full p-8 rounded-md border border-dashed text-center flex flex-col items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin mb-2 text-muted-foreground" />
            <p className="text-muted-foreground">Generating hooks...</p>
          </div>
        ) : hooks.length === 0 ? (
          <div className="w-full p-3 rounded-md border border-dashed text-center flex items-center justify-center h-[68px]">
            <p className="italic text-muted-foreground">
              {hasAttemptedGeneration.current ? 'Failed to generate hooks' : 'No hooks available'}
            </p>
          </div>
        ) : (
          hooks.map((hook, index) => {
            const isSelected = selectedHookIndex === index;
            const isLoading = loadingHookIndex === index;
            const isError = errorHook?.index === index;
            return (
              <div key={index}>
                <button
                  onClick={() => handleHookClick(index)}
                  disabled={isLoading || isDisabled}
                  className={`w-full p-3 rounded-md border text-left transition-all 
                      focus-visible:outline-none focus-visible:border-[#4F46E5] focus-visible:ring-2 focus-visible:ring-[#4F46E5]/20 focus-visible:ring-offset-2
                      hover:border-[#4F46E5]
                      ${isLoading || isDisabled ? 'cursor-wait' : ''}
                      ${isSelected && !isLoading ? 'border-[#4F46E5] bg-[#4F46E5]/10' : ''}`}
                >
                  {isLoading ? (
                    <div className="flex justify-center items-center h-[42px]">
                      <Loader2 className="h-5 w-5 animate-spin" />
                    </div>
                  ) : (
                    <>
                      <div className="flex justify-between items-start">
                        <p className="pr-2 whitespace-pre-line text-sm">{hook.text}</p>
                        {isSelected && <Badge className="bg-[#4F46E5] hover:bg-[#4F46E5]/90 flex-shrink-0">Selected</Badge>}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Angle: {hook.angle}</p>
                    </>
                  )}
                </button>
                {isError && <p className="text-sm text-destructive mt-1.5 px-1">{errorHook.message}</p>}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default HooksSection;
