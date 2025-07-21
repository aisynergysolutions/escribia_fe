import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';

const PostDetailsSkeleton: React.FC = () => {
    return (
        <div className="space-y-4 animate-pulse">
            {/* Header Skeleton */}
            <div className="flex items-center justify-between">
                {/* Back button and title */}
                <div className="flex items-center gap-4">
                    <ArrowLeft className="h-5 w-5 text-gray-300" />
                    <div className="h-8 w-48 bg-gray-200 rounded"></div>
                </div>

                {/* Status and action buttons */}
                <div className="flex items-center gap-3">
                    <div className="h-8 w-24 bg-gray-200 rounded-full"></div>
                    <div className="h-9 w-32 bg-gray-200 rounded"></div>
                </div>
            </div>

            {/* Main Layout - 3 columns on large screens */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Post Editor (spans 2 columns) */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Post Editor Card */}
                    <Card className="bg-white border border-gray-200">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div className="h-6 w-32 bg-gray-200 rounded"></div>
                                <div className="flex items-center gap-2">
                                    <div className="h-8 w-8 bg-gray-200 rounded"></div>
                                    <div className="h-8 w-8 bg-gray-200 rounded"></div>
                                    <div className="h-8 w-8 bg-gray-200 rounded"></div>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {/* Post content area */}
                            <div className="space-y-3 mb-6">
                                <div className="h-4 w-full bg-gray-200 rounded"></div>
                                <div className="h-4 w-11/12 bg-gray-200 rounded"></div>
                                <div className="h-4 w-4/5 bg-gray-200 rounded"></div>
                                <div className="h-4 w-5/6 bg-gray-200 rounded"></div>
                                <div className="h-4 w-3/4 bg-gray-200 rounded"></div>
                                <div className="h-4 w-full bg-gray-200 rounded"></div>
                                <div className="h-4 w-2/3 bg-gray-200 rounded"></div>
                            </div>

                            {/* Editing instructions area */}
                            <div className="border-t border-gray-200 pt-4">
                                <div className="h-5 w-40 bg-gray-200 rounded mb-3"></div>
                                <div className="h-20 w-full bg-gray-200 rounded mb-3"></div>
                                <div className="h-9 w-36 bg-gray-200 rounded"></div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column - Sidebar */}
                <div className="space-y-6">
                    {/* Sub Client Display Card */}
                    <Card className="bg-white border border-gray-200">
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="h-12 w-12 bg-gray-200 rounded-full flex-shrink-0"></div>
                                <div className="flex-1">
                                    <div className="h-5 w-32 bg-gray-200 rounded mb-2"></div>
                                    <div className="h-4 w-24 bg-gray-200 rounded"></div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Idea Form Card */}
                    <Card className="bg-white border border-gray-200">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div className="h-6 w-24 bg-gray-200 rounded"></div>
                                <div className="h-4 w-4 bg-gray-200 rounded"></div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Initial Idea */}
                            <div>
                                <div className="h-4 w-20 bg-gray-200 rounded mb-2"></div>
                                <div className="h-24 w-full bg-gray-200 rounded"></div>
                            </div>

                            {/* Objective */}
                            <div>
                                <div className="h-4 w-16 bg-gray-200 rounded mb-2"></div>
                                <div className="h-10 w-full bg-gray-200 rounded"></div>
                            </div>

                            {/* Template */}
                            <div>
                                <div className="h-4 w-16 bg-gray-200 rounded mb-2"></div>
                                <div className="h-10 w-full bg-gray-200 rounded"></div>
                            </div>

                            {/* Send to AI button */}
                            <div className="h-10 w-full bg-gray-200 rounded"></div>
                        </CardContent>
                    </Card>

                    {/* Hooks Section */}
                    <Card className="bg-white border border-gray-200">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div className="h-6 w-16 bg-gray-200 rounded"></div>
                                <div className="h-8 w-24 bg-gray-200 rounded"></div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {/* Hook items */}
                            {[...Array(3)].map((_, index) => (
                                <div key={index} className="p-3 border border-gray-200 rounded-lg">
                                    <div className="h-4 w-full bg-gray-200 rounded mb-2"></div>
                                    <div className="h-4 w-4/5 bg-gray-200 rounded"></div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    {/* Options Card */}
                    <Card className="bg-white border border-gray-200">
                        <CardHeader>
                            <div className="h-6 w-16 bg-gray-200 rounded"></div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Training data checkbox */}
                            <div className="flex items-center gap-2">
                                <div className="h-4 w-4 bg-gray-200 rounded"></div>
                                <div className="h-4 w-32 bg-gray-200 rounded"></div>
                            </div>

                            {/* Internal notes */}
                            <div>
                                <div className="h-4 w-24 bg-gray-200 rounded mb-2"></div>
                                <div className="h-20 w-full bg-gray-200 rounded"></div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Delete Button Area */}
            <div className="flex justify-center pt-8 border-t border-gray-200">
                <div className="h-10 w-28 bg-gray-200 rounded"></div>
            </div>
        </div>
    );
};

export default PostDetailsSkeleton;
