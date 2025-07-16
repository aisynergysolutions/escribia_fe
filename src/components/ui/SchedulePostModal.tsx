import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './dialog';
import { Button } from './button';
import { Input } from './input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select';
import { Label } from './label';
import { Badge } from './badge';
import { Card } from './card';
import { Search, Clock, Calendar, User } from 'lucide-react';
import { format, addMonths } from 'date-fns';
import { usePosts, PostCard } from '../../context/PostsContext';
import { doc, setDoc, collection, getDocs, getDoc, updateDoc, deleteField } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Timestamp } from 'firebase/firestore';

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
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [selectedPostId, setSelectedPostId] = useState<string>('');
    const [isScheduling, setIsScheduling] = useState(false);
    
    // Local state for editable date and time
    const [localDate, setLocalDate] = useState(selectedDate);
    const [localTime, setLocalTime] = useState(selectedTime);

    // Fetch posts when modal opens
    useEffect(() => {
        if (isOpen && clientId) {
            fetchPosts('agency1', clientId);
        }
    }, [isOpen, clientId, fetchPosts]);

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
            post.profile.toLowerCase().includes(searchTerm.toLowerCase());
        // const matchesStatus = !statusFilter || statusFilter === 'all' || post.status === statusFilter;
        const matchesStatus = true; // Always show all statuses in this modal
        // Only show posts that are not already scheduled
        // const isNotScheduled = post.status !== 'Scheduled' || !post.scheduledPostAt || post.scheduledPostAt.seconds === 0;

        // return matchesSearch && matchesStatus && isNotScheduled;
        return matchesSearch && matchesStatus;
    });

    const handleSchedulePost = async () => {
        if (!selectedPostId) return;

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
                        'agencies', 'agency1',
                        'clients', clientId,
                        'postEvents', yearMonth
                    );

                    try {
                        const monthDocSnap = await getDoc(postEventRef);

                        if (monthDocSnap.exists()) {
                            const data = monthDocSnap.data();
                            // Check if this post exists in this month document
                            if (data[selectedPost.postId]) {
                                console.log(`Found existing scheduled post in ${yearMonth}, removing it...`);

                                // Remove the post from this month document
                                await updateDoc(postEventRef, {
                                    [selectedPost.postId]: deleteField()
                                });

                                break; // Found and removed, no need to check other months
                            }
                        }
                    } catch (error) {
                        console.log(`Month document ${yearMonth} doesn't exist or error accessing it, skipping...`);
                        // Document doesn't exist or error accessing it, continue to next month
                    }
                }
            }

            // Prepare the post event data for the new schedule
            const postEventData = {
                title: selectedPost.title,
                profile: selectedPost.profile,
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
                'agencies', 'agency1',
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
                'agencies', 'agency1',
                'clients', clientId,
                'ideas', selectedPost.postId
            );

            await setDoc(postRef, {
                status: 'Scheduled',
                scheduledPostAt: Timestamp.fromDate(scheduledDateTime),
                updatedAt: Timestamp.now()
            }, { merge: true });

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
                                    className="mt-1"
                                />
                            </div>
                        </div>
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
                                                <span>{post.profile}</span>
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
                            disabled={!selectedPostId || !localTime || isScheduling}
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
