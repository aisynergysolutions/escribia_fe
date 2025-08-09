import React, { useState, useEffect, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './dialog';
import { Button } from './button';
import { Input } from './input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select';
import { Label } from './label';
import { Badge } from './badge';
import { Card } from './card';
import { Search, Clock, Calendar, User, AlertCircle } from 'lucide-react';
import { format, addMonths, addMinutes, isSameDay, isAfter, isBefore } from 'date-fns';
import { usePosts, PostCard } from '../../context/PostsContext';
import { doc, setDoc, collection, getDocs, getDoc, updateDoc, deleteField } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Timestamp } from 'firebase/firestore';
import { usePostDetails } from '../../context/PostDetailsContext';
import { useAuth } from '../../context/AuthContext';
import { getProfileName } from '../../types/post';

interface SchedulePostModalProps {
    isOpen: boolean;
    onClose: () => void;
    selectedDate: Date;
    selectedTime: string;
    clientId: string;
    onScheduleSuccess: () => void;
}

const POST_STATUSES = ['Draft', 'In Review', 'Approved', 'Scheduled'] as const;

const SchedulePostModal: React.FC<SchedulePostModalProps> = ({
    isOpen,
    onClose,
    selectedDate,
    selectedTime,
    clientId,
    onScheduleSuccess
}) => {
    const { posts, fetchPosts, loading } = usePosts();
    const { updatePostScheduling } = usePostDetails();
    const { currentUser } = useAuth();
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [selectedPostId, setSelectedPostId] = useState<string>('');
    const [isScheduling, setIsScheduling] = useState(false);

    // Local state for editable date and time
    const [localDate, setLocalDate] = useState(selectedDate);
    const [localTime, setLocalTime] = useState(selectedTime);

    // Get the current agency ID from the authenticated user
    const agencyId = currentUser?.uid;

    // Calculate minimum allowed date and time
    const now = new Date();
    const minDateTime = addMinutes(now, 6);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Memoize validation logic
    const validation = useMemo(() => {
        if (!localTime) return { isValid: false, errorMessage: 'Please select a time' };

        // Check if date is in the past
        const selectedDateOnly = new Date(localDate);
        selectedDateOnly.setHours(0, 0, 0, 0);

        if (isBefore(selectedDateOnly, today)) {
            return { isValid: false, errorMessage: 'Cannot schedule for past dates' };
        }

        // Create the full datetime for validation
        const [hours, minutes] = localTime.split(':').map(Number);
        const selectedDateTime = new Date(localDate);
        selectedDateTime.setHours(hours, minutes + 1, 0, 0);

        // If it's today, check if time is at least 6 minutes from now
        if (isSameDay(selectedDateTime, now)) {
            if (isBefore(selectedDateTime, minDateTime)) {
                return {
                    isValid: false,
                    errorMessage: `Time must be at least ${format(minDateTime, 'HH:mm')} (6 minutes from now)`
                };
            }
        }

        return { isValid: true, errorMessage: '' };
    }, [localDate, localTime, minDateTime, today, now]);

    // Fetch posts when modal opens
    useEffect(() => {
        if (isOpen && clientId && agencyId) {
            console.log('[SchedulePostModal] Fetching posts for agency:', agencyId, 'client:', clientId);
            fetchPosts(agencyId, clientId);
        }
    }, [isOpen, clientId, agencyId, fetchPosts]);

    // Update local state when props change
    useEffect(() => {
        setLocalDate(selectedDate);
        setLocalTime(selectedTime);
    }, [selectedDate, selectedTime]);

    // Reset state when modal closes
    useEffect(() => {
        if (!isOpen) {
            setSearchTerm('');
            setStatusFilter('all');
            setSelectedPostId('');
        }
    }, [isOpen]);

    // Filter posts based on search term and status
    const filteredPosts = posts.filter(post => {
        const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            getProfileName(post).toLowerCase().includes(searchTerm.toLowerCase());
        // const matchesStatus = !statusFilter || statusFilter === 'all' || post.status === statusFilter;
        const matchesStatus = true; // Always show all statuses in this modal
        // Only show posts that are not already scheduled
        // const isNotScheduled = post.status !== 'Scheduled' || !post.scheduledPostAt || post.scheduledPostAt.seconds === 0;

        // return matchesSearch && matchesStatus && isNotScheduled;
        return matchesSearch && matchesStatus;
    });

    const handleSchedulePost = async () => {
        if (!validation.isValid || !selectedPostId || !agencyId) return;

        const selectedPost = posts.find(p => p.postId === selectedPostId);
        if (!selectedPost) return;

        setIsScheduling(true);

        try {
            // Create the scheduled datetime
            const scheduledDateTime = new Date(localDate);
            const [hours, minutes] = localTime.split(':').map(Number);
            scheduledDateTime.setHours(hours, minutes, 0, 0);

            // Create year-month document name for the new schedule
            const newYearMonth = format(scheduledDateTime, 'yyyy-MM');

            // If the post is already scheduled, find and remove it from the previous location
            if (selectedPost.status === 'Scheduled' && selectedPost.scheduledPostAt && selectedPost.scheduledPostAt.seconds > 0) {
                const currentDate = new Date();

                // Generate a list of month documents to check (current month + 5 months ahead)
                const monthsToCheck = [];
                for (let i = 0; i <= 5; i++) {
                    const monthDate = addMonths(currentDate, i);
                    monthsToCheck.push(format(monthDate, 'yyyy-MM'));
                }

                // Search through month documents to find the existing scheduled post
                for (const yearMonth of monthsToCheck) {
                    const postEventRef = doc(
                        db,
                        'agencies', agencyId,
                        'clients', clientId,
                        'postEvents', yearMonth
                    );

                    try {
                        const monthDocSnap = await getDoc(postEventRef);

                        if (monthDocSnap.exists()) {
                            const data = monthDocSnap.data();
                            // Check if this post exists in this month document
                            if (data[selectedPost.postId]) {
                                console.log(`[SchedulePostModal] Found existing scheduled post in ${yearMonth}, removing it...`);

                                // Remove the post from this month document
                                await updateDoc(postEventRef, {
                                    [selectedPost.postId]: deleteField()
                                });

                                break; // Found and removed, no need to check other months
                            }
                        }
                    } catch (error) {
                        console.log(`[SchedulePostModal] Month document ${yearMonth} doesn't exist or error accessing it, skipping...`);
                        // Document doesn't exist or error accessing it, continue to next month
                    }
                }
            }

            // Prepare the post event data for the new schedule
            const postEventData = {
                title: selectedPost.title,
                profile: getProfileName(selectedPost),
                status: 'Scheduled',
                updatedAt: selectedPost.updatedAt,
                scheduledPostAt: Timestamp.fromDate(scheduledDateTime),
                postId: selectedPost.postId,
                scheduledDate: scheduledDateTime.toISOString(),
                timeSlot: localTime
            };

            // Save to Firestore in the new postEvents collection
            const newPostEventRef = doc(
                db,
                'agencies', agencyId,
                'clients', clientId,
                'postEvents', newYearMonth
            );

            // Update the new year-month document with the post field
            await setDoc(newPostEventRef, {
                [selectedPost.postId]: postEventData
            }, { merge: true });

            // Update the post status in the ideas collection
            const postRef = doc(
                db,
                'agencies', agencyId,
                'clients', clientId,
                'ideas', selectedPost.postId
            );

            await setDoc(postRef, {
                status: 'Scheduled',
                scheduledPostAt: Timestamp.fromDate(scheduledDateTime),
                updatedAt: Timestamp.now()
            }, { merge: true });

            // After successfully updating Firestore, update the PostDetailsContext
            await updatePostScheduling(
                agencyId,
                clientId,
                selectedPost.postId,
                'Scheduled',
                Timestamp.fromDate(scheduledDateTime)
            );

            // Call success callback to refresh the queue
            onScheduleSuccess();
            onClose();
        } catch (error) {
            console.error('Error scheduling post:', error);
            // TODO: Show error message to user
        } finally {
            setIsScheduling(false);
        }
    };

    const formatDateTime = () => {
        return `${format(localDate, 'EEEE, MMMM d, yyyy')} at ${localTime}`;
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Draft':
                return 'bg-gray-100 text-gray-800';
            case 'In Review':
                return 'bg-yellow-100 text-yellow-800';
            case 'Approved':
                return 'bg-green-100 text-green-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl h-[80vh] flex flex-col">
                <DialogHeader className="flex-shrink-0">
                    <DialogTitle className="flex items-center gap-2">
                        <Calendar className="h-5 w-5" />
                        Schedule Post
                    </DialogTitle>
                </DialogHeader>

                <div className="flex-1 flex flex-col gap-4 min-h-0">
                    {/* Date and Time Selector */}
                    <Card className="p-4">
                        <Label className="text-sm font-medium text-gray-600 mb-3 block">Schedule Date & Time</Label>
                        <div className="flex gap-4">
                            <div className="flex-1">
                                <Label htmlFor="schedule-date" className="text-xs text-gray-500">Date</Label>
                                <Input
                                    id="schedule-date"
                                    type="date"
                                    value={format(localDate, 'yyyy-MM-dd')}
                                    onChange={(e) => setLocalDate(new Date(e.target.value))}
                                    min={format(today, 'yyyy-MM-dd')}
                                    className="mt-1"
                                />
                            </div>
                            <div className="flex-1">
                                <Label htmlFor="schedule-time" className="text-xs text-gray-500">Time</Label>
                                <Input
                                    id="schedule-time"
                                    type="time"
                                    value={localTime}
                                    onChange={(e) => setLocalTime(e.target.value)}
                                    min={isSameDay(localDate, now) ? format(minDateTime, 'HH:mm') : undefined}
                                    className="mt-1"
                                />
                            </div>
                        </div>

                        {/* Validation error message */}
                        {!validation.isValid && localTime && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mt-3">
                                <div className="flex items-center gap-2">
                                    <AlertCircle className="h-4 w-4 text-red-600" />
                                    <p className="text-sm text-red-700">
                                        {validation.errorMessage}
                                    </p>
                                </div>
                            </div>
                        )}
                    </Card>

                    {/* Search Bar and Status Filter - Same Row */}
                    <div className="flex gap-4">
                        {/* Search Bar */}
                        <div className="relative flex-1">
                            <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <Input
                                placeholder="Search posts by title or profile..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>

                        {/* Status Filter */}
                        <div className="flex items-center gap-2">
                            <Label className="text-sm font-medium whitespace-nowrap">Filter:</Label>
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger className="w-40">
                                    <SelectValue placeholder="All statuses" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All statuses</SelectItem>
                                    {POST_STATUSES.filter(status => status !== 'Scheduled').map(status => (
                                        <SelectItem key={status} value={status}>{status}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Posts List */}
                    <div className="flex-1 overflow-y-auto space-y-3 border rounded-md p-2">
                        {loading ? (
                            <div className="flex items-center justify-center py-8">
                                <p className="text-gray-500">Loading posts...</p>
                            </div>
                        ) : filteredPosts.length === 0 ? (
                            <div className="flex items-center justify-center py-8 text-center">
                                <div>
                                    <p className="text-gray-500 mb-2">No posts found</p>
                                    <p className="text-sm text-gray-400">
                                        {searchTerm || (statusFilter && statusFilter !== 'all')
                                            ? 'Try adjusting your search or filter criteria'
                                            : 'Create some posts to schedule them'
                                        }
                                    </p>
                                </div>
                            </div>
                        ) : (
                            filteredPosts.map((post) => (
                                <Card
                                    key={post.postId}
                                    className={`p-4 cursor-pointer transition-all border-2 ${selectedPostId === post.postId
                                        ? 'border-blue-500 bg-blue-50'
                                        : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                    onClick={() => setSelectedPostId(post.postId)}
                                >
                                    <div className="space-y-3">
                                        <div className="flex items-start justify-between">
                                            <h3 className="font-semibold text-gray-900 flex-1 pr-3">
                                                {post.title}
                                            </h3>
                                            <Badge className={getStatusColor(post.status)}>
                                                {post.status}
                                            </Badge>
                                        </div>
                                        <div className="flex items-center justify-between w-full">
                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                                <User className="h-4 w-4" />
                                                <span>{getProfileName(post)}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-xs text-gray-500">
                                                <Clock className="h-3 w-3" />
                                                <span>Updated {format(new Date(post.updatedAt.seconds * 1000), 'MMM d, yyyy')}</span>
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            ))
                        )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-2 border-t">
                        <Button
                            onClick={handleSchedulePost}
                            disabled={!selectedPostId || !validation.isValid || isScheduling}
                            className="flex-1"
                        >
                            {isScheduling ? 'Scheduling...' : 'Schedule this post'}
                        </Button>

                        <Button
                            variant="outline"
                            onClick={onClose}
                            className="flex-1"
                        >
                            Cancel
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default SchedulePostModal;
