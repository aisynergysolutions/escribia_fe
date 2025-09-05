import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

interface StatCardSkeletonProps {
    className?: string;
}

const StatCardSkeleton: React.FC<StatCardSkeletonProps> = ({ className }) => {
    return (
        <Card className={`rounded-2xl shadow-md ${className}`}>
            <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                    <div className="h-4 w-16 bg-gray-200 rounded animate-pulse" />
                    <div className="h-4 w-4 bg-gray-200 rounded animate-pulse" />
                </div>
            </CardHeader>
            <CardContent>
                <div className="h-8 w-20 bg-gray-200 rounded animate-pulse mb-1" />
                <div className="h-3 w-24 bg-gray-200 rounded animate-pulse" />
            </CardContent>
        </Card>
    );
};

export default StatCardSkeleton;
