import React, { useState } from 'react';
import { Calendar, Link as LinkIcon, Plus } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Timestamp } from 'firebase/firestore';

interface ManualPostModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSave: (postedAt: Timestamp, linkedinPostUrl?: string) => Promise<void>;
    title?: string;
    description?: string;
}

const ManualPostModal: React.FC<ManualPostModalProps> = ({
    open,
    onOpenChange,
    onSave,
    title = "Add Post Details",
    description = "Please provide the details for this manually posted content."
}) => {
    const [postDate, setPostDate] = useState('');
    const [postTime, setPostTime] = useState('');
    const [linkedinUrl, setLinkedinUrl] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Get current date and time as defaults
    React.useEffect(() => {
        if (open && !postDate && !postTime) {
            const now = new Date();
            setPostDate(now.toISOString().split('T')[0]); // YYYY-MM-DD format
            setPostTime(now.toTimeString().slice(0, 5)); // HH:MM format
        }
    }, [open, postDate, postTime]);

    const handleSubmit = async () => {
        if (!postDate || !postTime) {
            return;
        }

        try {
            setIsSubmitting(true);

            // Combine date and time into a proper timestamp
            const dateTimeString = `${postDate}T${postTime}:00`;
            const postedDate = new Date(dateTimeString);
            const postedTimestamp = Timestamp.fromDate(postedDate);

            await onSave(postedTimestamp, linkedinUrl.trim() || undefined);

            // Reset form
            setPostDate('');
            setPostTime('');
            setLinkedinUrl('');
            onOpenChange(false);
        } catch (error) {
            console.error('Error saving manual post details:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCancel = () => {
        // Reset form
        setPostDate('');
        setPostTime('');
        setLinkedinUrl('');
        onOpenChange(false);
    };

    const isValidUrl = (url: string) => {
        if (!url.trim()) return true; // Empty URL is valid (optional)
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    };

    const canSubmit = postDate && postTime && isValidUrl(linkedinUrl);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Plus className="h-5 w-5" />
                        {title}
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-6">
                    <p className="text-sm text-gray-600">
                        {description}
                    </p>

                    <div className="space-y-4">
                        {/* Date and Time */}
                        <div className="space-y-3">
                            <Label className="text-sm font-medium">When was this posted?</Label>
                            <div className="flex gap-3">
                                <div className="flex-1">
                                    <Label htmlFor="post-date" className="text-xs text-gray-500">Date</Label>
                                    <div className="relative">
                                        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                        <Input
                                            id="post-date"
                                            type="date"
                                            value={postDate}
                                            onChange={(e) => setPostDate(e.target.value)}
                                            className="pl-10"
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="flex-1">
                                    <Label htmlFor="post-time" className="text-xs text-gray-500">Time</Label>
                                    <Input
                                        id="post-time"
                                        type="time"
                                        value={postTime}
                                        onChange={(e) => setPostTime(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        {/* LinkedIn URL */}
                        <div className="space-y-2">
                            <Label htmlFor="linkedin-url" className="text-sm font-medium">
                                LinkedIn Post URL <span className="text-gray-400">(optional)</span>
                            </Label>
                            <div className="relative">
                                <LinkIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <Input
                                    id="linkedin-url"
                                    type="url"
                                    placeholder="https://www.linkedin.com/posts/..."
                                    value={linkedinUrl}
                                    onChange={(e) => setLinkedinUrl(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                            {linkedinUrl && !isValidUrl(linkedinUrl) && (
                                <p className="text-xs text-red-600">Please enter a valid URL</p>
                            )}
                        </div>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <p className="text-blue-800 text-xs">
                            <strong>Note:</strong> This information will be saved to track when and where this post was published manually.
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex justify-end gap-3 pt-4 border-t">
                    <Button
                        variant="outline"
                        onClick={handleCancel}
                        disabled={isSubmitting}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={!canSubmit || isSubmitting}
                        className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400"
                    >
                        {isSubmitting ? 'Saving...' : 'Save Details'}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default ManualPostModal;
