import React from 'react';
import { Search, PlusCircle } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface PostsSectionSkeletonProps {
    rowCount?: number;
}

const PostsSectionSkeleton: React.FC<PostsSectionSkeletonProps> = ({ rowCount = 5 }) => {
    const statusTabs = ['Drafted', 'Needs Visual', 'Waiting Approval', 'Approved', 'Scheduled', 'Posted'];

    return (
        <div className="space-y-6 animate-pulse">
            {/* Unified Control Bar Skeleton */}
            <div className="bg-white p-6 rounded-xl shadow-sm border">
                <div className="flex items-center gap-6">
                    {/* Left Side: Status Filter Tabs */}
                    <div className="flex-1 relative">
                        <div className="overflow-x-auto scrollbar-hide">
                            <div className="flex w-max min-w-full gap-2">
                                {statusTabs.map((status, index) => (
                                    <div
                                        key={status}
                                        className="px-4 py-2 bg-gray-200 rounded-md"
                                    >
                                        <div className="h-4 w-20 bg-gray-300 rounded"></div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right Side: Search & Primary Action */}
                    <div className="flex items-center gap-4 flex-shrink-0">
                        {/* Search Input Skeleton */}
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-300 h-4 w-4" />
                            <div className="h-10 w-48 bg-gray-200 rounded pl-9"></div>
                        </div>

                        {/* New Post Button Skeleton */}
                        <div className="h-10 w-10 bg-gray-200 rounded flex items-center justify-center">
                            <PlusCircle className="h-4 w-4 text-gray-300" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Posts Table Skeleton */}
            <div className="bg-white rounded-xl shadow-sm border">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-gray-50 border-b">
                            <TableHead className="font-semibold text-gray-700 uppercase text-xs tracking-wide">
                                <div className="flex items-center gap-2">
                                    <div className="h-4 w-8 bg-gray-300 rounded"></div>
                                </div>
                            </TableHead>
                            <TableHead className="font-semibold text-gray-700 uppercase text-xs tracking-wide">
                                <div className="flex items-center gap-2">
                                    <div className="h-4 w-12 bg-gray-300 rounded"></div>
                                </div>
                            </TableHead>
                            <TableHead className="font-semibold text-gray-700 uppercase text-xs tracking-wide">
                                <div className="flex items-center gap-2">
                                    <div className="h-4 w-10 bg-gray-300 rounded"></div>
                                </div>
                            </TableHead>
                            <TableHead className="font-semibold text-gray-700 uppercase text-xs tracking-wide">
                                <div className="flex items-center gap-2">
                                    <div className="h-4 w-20 bg-gray-300 rounded"></div>
                                </div>
                            </TableHead>
                            <TableHead className="font-semibold text-gray-700 uppercase text-xs tracking-wide">
                                <div className="flex items-center gap-2">
                                    <div className="h-4 w-20 bg-gray-300 rounded"></div>
                                </div>
                            </TableHead>
                            <TableHead className="w-12"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {Array.from({ length: rowCount }).map((_, index) => (
                            <TableRow key={index} className="border-b border-gray-100">
                                {/* Post Title */}
                                <TableCell className="py-4">
                                    <div className="h-5 w-48 bg-gray-200 rounded"></div>
                                </TableCell>
                                {/* Profile */}
                                <TableCell className="py-4">
                                    <div className="h-4 w-24 bg-gray-200 rounded"></div>
                                </TableCell>
                                {/* Status Badge */}
                                <TableCell className="py-4">
                                    <div className="h-6 w-16 bg-gray-200 rounded-full"></div>
                                </TableCell>
                                {/* Last Updated */}
                                <TableCell className="py-4">
                                    <div className="h-4 w-20 bg-gray-200 rounded"></div>
                                </TableCell>
                                {/* Scheduled For */}
                                <TableCell className="py-4">
                                    <div className="h-4 w-16 bg-gray-200 rounded"></div>
                                </TableCell>
                                {/* Actions Button */}
                                <TableCell className="py-4">
                                    <div className="h-8 w-8 bg-gray-200 rounded"></div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
};

export default PostsSectionSkeleton;
