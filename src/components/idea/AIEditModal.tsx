import React, { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Sparkles, ArrowRight, Loader2 } from 'lucide-react';

interface AIEditModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    selectedText: string;
    onApplyEdit: (action: string, customPrompt?: string) => Promise<void>;
    isLoading?: boolean;
}

const AIEditModal: React.FC<AIEditModalProps> = ({
    open,
    onOpenChange,
    selectedText,
    onApplyEdit,
    isLoading = false
}) => {
    const [instruction, setInstruction] = useState('');

    const handleApply = async () => {
        if (instruction.trim()) {
            await onApplyEdit('custom_prompt', instruction);
            setInstruction('');
            // Don't close modal here - let the parent handle it after successful response
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && (e.ctrlKey || e.metaKey) && !isLoading) {
            e.preventDefault();
            handleApply();
        }
    };

    const handleQuickEdit = async (action: string) => {
        await onApplyEdit(action);
        // Don't close modal here - let the parent handle it after successful response
    };

    return (
        <Dialog open={open} onOpenChange={isLoading ? undefined : onOpenChange}>
            <DialogContent className="sm:max-w-[525px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-blue-600" />
                        AI Edit Selected Text
                    </DialogTitle>
                    <DialogDescription>
                        Tell AI how you'd like to modify the selected text.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Selected text display */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">
                            Selected text:
                        </label>
                        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                            <p className="text-sm text-gray-800 italic">
                                "{selectedText}"
                            </p>
                        </div>
                    </div>

                    {/* Quick edit options */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">
                            Quick options:
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleQuickEdit('shorten')}
                                disabled={isLoading}
                                className="justify-start text-left h-auto py-2"
                            >
                                <div>
                                    <div className="font-medium">Make shorter</div>
                                    <div className="text-xs text-gray-500">More concise</div>
                                </div>
                            </Button>

                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleQuickEdit('lengthen')}
                                disabled={isLoading}
                                className="justify-start text-left h-auto py-2"
                            >
                                <div>
                                    <div className="font-medium">Make longer</div>
                                    <div className="text-xs text-gray-500">More detailed</div>
                                </div>
                            </Button>

                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleQuickEdit('rephrase')}
                                disabled={isLoading}
                                className="justify-start text-left h-auto py-2"
                            >
                                <div>
                                    <div className="font-medium">Say differently</div>
                                    <div className="text-xs text-gray-500">Rephrase</div>
                                </div>
                            </Button>

                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleQuickEdit('fix_grammar')}
                                disabled={isLoading}
                                className="justify-start text-left h-auto py-2"
                            >
                                <div>
                                    <div className="font-medium">Fix grammar</div>
                                    <div className="text-xs text-gray-500">Spelling & grammar</div>
                                </div>
                            </Button>
                        </div>
                    </div>

                    {/* Custom instruction */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">
                            Or describe your own changes:
                        </label>
                        <Textarea
                            placeholder="Describe how you want the text to be changed..."
                            value={instruction}
                            onChange={(e) => setInstruction(e.target.value)}
                            onKeyDown={handleKeyPress}
                            className="min-h-[80px]"
                            autoFocus
                            disabled={isLoading}
                        />
                        <p className="text-xs text-gray-500">
                            {isLoading ? 'Processing your request...' : 'Press Ctrl+Enter to apply, or use the button below'}
                        </p>
                    </div>
                </div>

                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={() => {
                            setInstruction('');
                            onOpenChange(false);
                        }}
                        disabled={isLoading}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleApply}
                        disabled={!instruction.trim() || isLoading}
                        className="flex items-center gap-2"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Applying changes...
                            </>
                        ) : (
                            <>
                                Apply Changes
                                <ArrowRight className="h-4 w-4" />
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default AIEditModal;
