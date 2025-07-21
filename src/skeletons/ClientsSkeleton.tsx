import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { PlusCircle, Search } from 'lucide-react';

interface ClientsSkeletonProps {
    count?: number;
}

const ClientsSkeleton: React.FC<ClientsSkeletonProps> = ({ count = 6 }) => {
    return (
        <div className="space-y-6">
            {/* Header Skeleton */}
            <div className="flex justify-between items-center">
                <div className="h-9 w-20 bg-gray-200 rounded animate-pulse"></div>
                <div className="flex items-center gap-2 h-10 w-40 bg-gray-200 rounded animate-pulse">
                    {/* Placeholder for the Add New Client button */}
                </div>
            </div>

            {/* Search Bar Skeleton */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-300" />
                <div className="h-10 w-full bg-gray-200 rounded-md animate-pulse pl-10"></div>
            </div>

            {/* Client Cards Grid Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: count }).map((_, index) => (
                    <Card key={index} className="rounded-2xl shadow-md h-full flex flex-col animate-pulse">
                        <CardHeader className="pb-2 flex-shrink-0">
                            <div className="flex justify-between items-start gap-2">
                                {/* Client name skeleton */}
                                <div className="h-6 w-3/4 bg-gray-200 rounded"></div>
                                {/* Status badge skeleton */}
                                <div className="h-5 w-16 bg-gray-200 rounded-full flex-shrink-0"></div>
                            </div>
                        </CardHeader>
                        <CardContent className="flex-1 flex flex-col">
                            <div className="space-y-2 flex-1">
                                {/* Brand brief summary skeleton */}
                                <div className="h-4 w-full bg-gray-200 rounded"></div>
                                <div className="h-4 w-5/6 bg-gray-200 rounded"></div>
                                <div className="h-4 w-4/6 bg-gray-200 rounded"></div>
                            </div>
                            <div className="mt-4 pt-2">
                                {/* Last updated skeleton */}
                                <div className="h-3 w-32 bg-gray-200 rounded"></div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
};

export default ClientsSkeleton;
