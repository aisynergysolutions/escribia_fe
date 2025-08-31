import React, { useState } from 'react';
import { Copy, Lock, Loader2, Check, BookOpen, ArrowUpRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

type DuplicationState = 'idle' | 'duplicating' | 'success' | 'navigate';

interface PostEditorDisabledOverlayProps {
    visible: boolean;
    onDuplicate?: () => Promise<string>; // Now returns the new post ID
    onNavigate?: (newPostId: string) => void;
    onClose?: () => void;
}

const PostEditorDisabledOverlay: React.FC<PostEditorDisabledOverlayProps> = ({
    visible,
    onDuplicate,
    onNavigate,
    onClose
}) => {
    const [duplicationState, setDuplicationState] = useState<DuplicationState>('idle');
    const [newPostId, setNewPostId] = useState<string>('');

    if (!visible) return null;

    const handleDuplicate = async () => {
        if (!onDuplicate) return;

        setDuplicationState('duplicating');

        try {
            const duplicatedPostId = await onDuplicate();
            setNewPostId(duplicatedPostId);
            setDuplicationState('success');

            // Show success state briefly, then switch to navigate state
            setTimeout(() => {
                setDuplicationState('navigate');
            }, 2000);
        } catch (error) {
            console.error('Error duplicating post:', error);
            setDuplicationState('idle');
            // Could add error toast here if needed
        }
    };

    const handleNavigate = () => {
        if (onNavigate && newPostId) {
            onNavigate(newPostId);
        }
    };

    const getDuplicateButtonContent = () => {
        switch (duplicationState) {
            case 'duplicating':
                return (
                    <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Duplicating...
                    </>
                );
            case 'success':
                return (
                    <>
                        <Check className="w-4 h-4" />
                        Duplicated!
                    </>
                );
            case 'navigate':
                return (
                    <>
                        <ArrowUpRight className="w-4 h-4" />
                        Go to Duplicate
                    </>
                );
            default:
                return (
                    <>
                        <Copy className="w-4 h-4" />
                        Duplicate Post
                    </>
                );
        }
    };

    const getDuplicateButtonProps = () => {
        switch (duplicationState) {
            case 'duplicating':
                return {
                    disabled: true,
                    className: "flex items-center gap-2 bg-blue-600",
                    onClick: undefined
                };
            case 'success':
                return {
                    disabled: true,
                    className: "flex items-center gap-2 bg-green-600",
                    onClick: undefined
                };
            case 'navigate':
                return {
                    disabled: false,
                    className: "flex items-center gap-2 bg-blue-600 hover:bg-blue-700",
                    onClick: handleNavigate
                };
            default:
                return {
                    disabled: false,
                    className: "flex items-center gap-2 bg-blue-600 hover:bg-blue-700",
                    onClick: handleDuplicate
                };
        }
    };

    return (
        <div
            className="absolute inset-0 z-50 flex items-center justify-center backdrop-blur-sm rounded-lg"
        //   onClick={(e) => {
        //     // Close overlay when clicking on the background
        //     if (e.target === e.currentTarget && onClose) {
        //       onClose();
        //     }
        //   }}
        >
            <Card className="max-w-md mx-4 shadow-xl border-2 border-gray-200">
                <CardContent className="p-6 text-center">
                    <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full">
                        <Lock className="w-8 h-8 text-blue-600" />
                    </div>

                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        Post Already Published
                    </h3>

                    <p className="text-sm text-gray-600 mb-6 leading-relaxed">
                        If you want to make changes, you can duplicate it and continue editing the copy.
                    </p>

                    <div className="flex justify-center">
                        <Button
                            size="sm"
                            {...getDuplicateButtonProps()}
                        >
                            {getDuplicateButtonContent()}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default PostEditorDisabledOverlay;
