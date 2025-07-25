import React from 'react';
import { Card } from '@/components/ui/card';

const QueueViewSkeleton: React.FC = () => {
    return (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-8">
            {/* Header Skeleton */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <div className="h-8 w-16 bg-gray-200 rounded animate-pulse mb-2"></div>
                    <div className="h-4 w-44 bg-gray-200 rounded animate-pulse"></div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="h-8 w-44 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-8 w-36 bg-gray-200 rounded animate-pulse"></div>
                </div>
            </div>

            {/* Day Cards Skeleton */}
            <div className="space-y-4">
                {[...Array(3)].map((_, dayIndex) => (
                    <Card key={dayIndex} className="bg-white border border-gray-200 p-6">
                        {/* Day Header Skeleton with emoji */}
                        <div className="mb-4">
                            <div className="h-5 w-48 bg-gray-200 rounded animate-pulse"></div>
                        </div>

                        {/* Post Slots Skeleton */}
                        <div className="space-y-1">
                            {[...Array(3)].map((_, slotIndex) => (
                                <div
                                    key={slotIndex}
                                    className="flex items-center gap-6 py-3 pr-2 border border-gray-100 rounded-lg"
                                >
                                    {/* Time Column Skeleton */}
                                    <div className="min-w-[80px]">
                                        <div className="h-5 w-14 bg-gray-200 rounded animate-pulse"></div>
                                    </div>

                                    {/* Post Content Skeleton */}
                                    <div className="flex-1 min-w-0 space-y-2">
                                        <div className="h-5 w-3/4 bg-gray-200 rounded animate-pulse"></div>
                                        <div className="h-4 w-1/2 bg-gray-200 rounded animate-pulse"></div>
                                    </div>

                                    {/* Badge Skeleton */}
                                    <div className="flex-shrink-0">
                                        <div className="h-6 w-16 bg-gray-200 rounded-full animate-pulse"></div>
                                    </div>

                                    {/* Actions Dropdown Skeleton */}
                                    <div className="flex-shrink-0">
                                        <div className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>
                ))}
            </div>

            {/* Load More Button Skeleton */}
            <div className="flex justify-center mt-8">
                <div className="h-10 w-32 bg-gray-200 rounded animate-pulse"></div>
            </div>
        </div>
    );
};

export default QueueViewSkeleton;
