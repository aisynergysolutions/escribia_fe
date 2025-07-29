import React from 'react';
import { AlertTriangle, X } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from './dialog';
import { Button } from './button';

interface ErrorDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    errorMessage: string;
    postTitle: string;
}

const ErrorDetailsModal: React.FC<ErrorDetailsModalProps> = ({
    isOpen,
    onClose,
    errorMessage,
    postTitle
}) => {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-red-600">
                        <AlertTriangle className="h-5 w-5" />
                        Post Error Details
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    <div>
                        <p className="text-sm text-gray-600 mb-2">
                            <strong>Post:</strong> {postTitle}
                        </p>
                    </div>

                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                            <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                            <div>
                                <h4 className="text-sm font-medium text-red-800 mb-1">
                                    Error Message
                                </h4>
                                <p className="text-sm text-red-700 whitespace-pre-wrap">
                                    {errorMessage || 'No error message available'}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end">
                        <Button onClick={onClose} variant="outline">
                            Close
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default ErrorDetailsModal;
