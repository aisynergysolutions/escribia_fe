import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Loader2, RefreshCw } from 'lucide-react';
import PostEditorDisabledOverlay from './PostEditorDisabledOverlay';

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
  // Add props for disabled overlay functionality
  postStatus?: string;
  postedAt?: import('firebase/firestore').Timestamp;
  onDuplicate?: () => Promise<string>;
  onNavigate?: (newPostId: string) => void;
}

const HooksSection: React.FC<HooksSectionProps> = ({
  hooks = [],
  selectedHookIndex,
  onHookSelect,
  onRegenerateHooks,
  onGenerateInitialHooks,
  isInitialLoad = false,
  postStatus,
  postedAt,
  onDuplicate,
  onNavigate
}) => {
  const [loadingHookIndex, setLoadingHookIndex] = useState<number | null>(null);
  const [errorHook, setErrorHook] = useState<{
    index: number;
    message: string;
  } | null>(null);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [isGeneratingInitial, setIsGeneratingInitial] = useState(false);
  const [showDisabledOverlay, setShowDisabledOverlay] = useState(false);

  // Track if we've already attempted to generate hooks to prevent infinite loops
  const hasAttemptedGeneration = useRef(false);

  // Check if post is in Posted status  
  const isPosted = postStatus === 'Posted' && postedAt && postedAt.seconds > 0;

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
    // Don't do anything if this hook is already selected
    if (selectedHookIndex === index) return;

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

  // Handle mouse events for disabled overlay
  const handleHooksSectionMouseEnter = () => {
    if (isPosted) {
      setShowDisabledOverlay(true);
    }
  };

  const handleHooksSectionMouseLeave = () => {
    setShowDisabledOverlay(false);
  };

  const isDisabled = isRegenerating || isGeneratingInitial || isPosted;

  return (
    <div
      className="bg-card rounded-lg border p-4 relative"
      onMouseEnter={handleHooksSectionMouseEnter}
      onMouseLeave={handleHooksSectionMouseLeave}
    >
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
            <p className="text-muted-foreground">Generating additional hooks...</p>
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
                  className={`w-full p-3 rounded-md border text-left transition-all relative
                      focus-visible:outline-none focus-visible:border-[#4F46E5] focus-visible:ring-2 focus-visible:ring-[#4F46E5]/20 focus-visible:ring-offset-2
                      hover:border-[#4F46E5]
                      ${isLoading || isDisabled ? 'cursor-wait' : ''}
                      ${isSelected && !isLoading ? 'border-[#4F46E5] bg-[#4F46E5]/10' : ''}
                      ${loadingHookIndex !== null && !isLoading ? 'opacity-50' : ''}`}
                >
                  <div className="flex justify-between items-start">
                    <p className="pr-2 whitespace-pre-line text-sm">{hook.text}</p>
                    {isSelected && !isLoading && <Badge className="bg-[#4F46E5] hover:bg-[#4F46E5]/90 flex-shrink-0">Selected</Badge>}
                  </div>
                  {/* <p className="text-xs text-gray-500 mt-1">Angle: {hook.angle}</p> */}

                  {/* Applying overlay */}
                  {isLoading && (
                    <div className="absolute inset-0 bg-background/80 backdrop-blur-sm rounded-md flex items-center justify-center">
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span className="text-sm font-medium">Applying...</span>
                      </div>
                    </div>
                  )}
                </button>
                {isError && <p className="text-sm text-destructive mt-1.5 px-1">{errorHook.message}</p>}
              </div>
            );
          })
        )}
      </div>

      {/* Disabled overlay for posted status */}
      <PostEditorDisabledOverlay
        visible={showDisabledOverlay}
        onDuplicate={onDuplicate}
        onNavigate={onNavigate}
        onClose={() => setShowDisabledOverlay(false)}
      />
    </div>
  );
};

export default HooksSection;
