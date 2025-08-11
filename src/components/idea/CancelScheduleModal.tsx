import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { usePostDetails } from '@/context/PostDetailsContext';
import { db } from '@/lib/firebase';
import { doc, setDoc, deleteField, getDoc } from 'firebase/firestore';
import { format } from 'date-fns';

interface CancelScheduleModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    clientId?: string;
    postId?: string;
    scheduledPostAt?: import('firebase/firestore').Timestamp;
    onCancelConfirm?: () => void;
}

const CancelScheduleModal: React.FC<CancelScheduleModalProps> = ({
    open,
    onOpenChange,
    clientId,
    postId,
    scheduledPostAt,
    onCancelConfirm
}) => {
    const [isCancelling, setIsCancelling] = useState(false);
    const { toast } = useToast();
    const { currentUser } = useAuth();
    const { updatePostStatus } = usePostDetails();

    // Get the current agency ID from the authenticated user
    const agencyId = currentUser?.uid;

    // Format the scheduled date and time for display
    const formatScheduledDateTime = () => {
        if (!scheduledPostAt) return '';
        const date = new Date(scheduledPostAt.seconds * 1000);
        return format(date, 'EEEE, MMMM d, yyyy \'at\' h:mm a');
    };

    const handleCancelSchedule = async () => {
        if (!agencyId || !clientId || !postId || !scheduledPostAt) {
            toast({
                title: "Error",
                description: "Missing required information to cancel the schedule.",
                variant: "destructive"
            });
            return;
        }

        setIsCancelling(true);

        try {
            // 1. Remove from postEvents collection
            const scheduledDate = new Date(scheduledPostAt.seconds * 1000);
            const yearMonth = format(scheduledDate, 'yyyy-MM');

            const postEventRef = doc(
                db,
                'agencies', agencyId,
                'clients', clientId,
                'postEvents', yearMonth
            );

            // Get the current document
            const postEventDoc = await getDoc(postEventRef);

            if (postEventDoc.exists()) {
                // Remove only this specific post from the year-month document
                await setDoc(postEventRef, {
                    [postId]: deleteField()
                }, { merge: true });
            }

            // 2. Update the post in the ideas collection
            const postRef = doc(
                db,
                'agencies', agencyId,
                'clients', clientId,
                'ideas', postId
            );

            await setDoc(postRef, {
                status: 'Drafted', // Reset to drafted status
                scheduledPostAt: deleteField(), // Remove the scheduled date
                updatedAt: new Date() // Update the timestamp
            }, { merge: true });

            // 3. Update the PostDetailsContext
            if (updatePostStatus) {
                await updatePostStatus(agencyId, clientId, postId, 'Drafted');
            }

            console.log('[CancelScheduleModal] Schedule successfully cancelled for agency:', agencyId, {
                postId,
                scheduledDate
            });

            // Show success message
            toast({
                title: "Schedule Cancelled",
                description: "The post schedule has been successfully cancelled and the post is now in draft status.",
            });

            // Call the parent callback if provided
            if (onCancelConfirm) {
                onCancelConfirm();
            }

            // Close the modal
            onOpenChange(false);

        } catch (error) {
            console.error('[CancelScheduleModal] Error cancelling schedule for agency:', agencyId, error);

            // Show error message
            toast({
                title: "Cancellation Failed",
                description: "There was an error cancelling the schedule. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsCancelling(false);
        }
    };

    // Show authentication error if no agency ID
    if (!agencyId) {
        return (
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Authentication Required</DialogTitle>
                    </DialogHeader>
                    <div className="text-center py-6">
                        <p className="text-gray-600">Please log in to cancel the schedule.</p>
                    </div>
                </DialogContent>
            </Dialog>
        );
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-orange-500" />
                        Cancel Schedule
                    </DialogTitle>
                    <DialogDescription>
                        Are you sure you want to cancel the scheduled post?
                    </DialogDescription>
                </DialogHeader>

                <div className="py-4">
                    <div className="bg-gray-50 rounded-lg p-4 mb-4">
                        <p className="text-sm text-gray-600 mb-2">Currently scheduled for:</p>
                        <p className="font-medium text-gray-900">{formatScheduledDateTime()}</p>
                    </div>

                    <div className="text-sm text-gray-600 space-y-2">
                        <p>This action will:</p>
                        <ul className="list-disc list-inside space-y-1 ml-2">
                            <li>Remove the post from the scheduled queue</li>
                            <li>Change the post status back to "Drafted"</li>
                            <li>Allow you to reschedule or modify the post later</li>
                        </ul>
                    </div>
                </div>

                <div className="flex justify-end gap-3">
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={isCancelling}
                    >
                        Keep Schedule
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={handleCancelSchedule}
                        disabled={isCancelling}
                    >
                        {isCancelling ? 'Cancelling...' : 'Cancel Schedule'}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default CancelScheduleModal;
