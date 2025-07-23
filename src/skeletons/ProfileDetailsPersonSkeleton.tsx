import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';

const ProfileDetailsPersonSkeleton: React.FC = () => {
    return (
        <div className="space-y-6 animate-pulse">
            {/* Header */}
            <div className="flex items-center gap-4">
                <div className="flex items-center justify-center rounded-full h-8 w-8 bg-gray-200 border border-gray-100">
                    <ArrowLeft className="h-4 w-4 text-gray-300" />
                </div>
                <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12 bg-gray-200">
                        <AvatarFallback className="bg-gray-200"></AvatarFallback>
                    </Avatar>
                    <div className="flex items-center gap-2">
                        <div className="h-7 w-48 bg-gray-200 rounded"></div>
                        <div className="h-5 w-5 bg-gray-200 rounded"></div>
                    </div>
                </div>
            </div>

            {/* Card 1: Profile Information & Connection */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div className="h-6 w-56 bg-gray-200 rounded"></div>
                        <div className="h-9 w-16 bg-gray-200 rounded"></div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Left column */}
                        <div className="space-y-4">
                            <div>
                                <div className="h-4 w-20 bg-gray-200 rounded mb-2"></div>
                                <div className="h-10 w-full bg-gray-200 rounded"></div>
                            </div>
                            <div>
                                <div className="h-4 w-24 bg-gray-200 rounded mb-2"></div>
                                <div className="h-10 w-full bg-gray-200 rounded"></div>
                            </div>
                            <div>
                                <div className="h-4 w-20 bg-gray-200 rounded mb-2"></div>
                                <div className="h-10 w-full bg-gray-200 rounded"></div>
                            </div>
                        </div>
                        {/* Right column */}
                        <div className="space-y-4">
                            <div>
                                <div className="h-4 w-36 bg-gray-200 rounded mb-2"></div>
                                <div className="h-10 w-full bg-gray-200 rounded"></div>
                            </div>
                            <div>
                                <div className="h-4 w-28 bg-gray-200 rounded mb-2"></div>
                                <div className="h-10 w-full bg-gray-200 rounded"></div>
                            </div>
                            <div>
                                <div className="h-4 w-16 bg-gray-200 rounded mb-2"></div>
                                <div className="h-10 w-full bg-gray-200 rounded"></div>
                            </div>
                        </div>
                    </div>

                    <Separator />

                    <div>
                        <div className="h-5 w-32 bg-gray-200 rounded mb-3"></div>
                        <div className="flex items-center justify-between">
                            <div className="h-4 w-40 bg-gray-200 rounded"></div>
                            <div className="h-6 w-6 bg-gray-200 rounded"></div>
                        </div>
                    </div>

                    <Separator />

                    <div>
                        <div className="h-5 w-20 bg-gray-200 rounded mb-3"></div>
                        <div className="h-10 w-full bg-gray-200 rounded"></div>
                    </div>

                    <Separator />

                    <div>
                        <div className="h-5 w-40 bg-gray-200 rounded mb-3"></div>
                        <div className="h-24 w-full bg-gray-200 rounded"></div>
                    </div>

                    <Separator />

                    <div>
                        <div className="h-5 w-32 bg-gray-200 rounded mb-3"></div>
                        <div className="space-y-2">
                            <div className="h-4 w-24 bg-gray-200 rounded"></div>
                            <div className="h-4 w-28 bg-gray-200 rounded"></div>
                            <div className="h-4 w-20 bg-gray-200 rounded"></div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Card 2: Strategy & Expertise */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div className="h-6 w-40 bg-gray-200 rounded"></div>
                        <div className="h-9 w-16 bg-gray-200 rounded"></div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div>
                        <div className="h-5 w-24 bg-gray-200 rounded mb-3"></div>
                        <div className="h-20 w-full bg-gray-200 rounded"></div>
                    </div>

                    <Separator />

                    <div>
                        <div className="h-5 w-28 bg-gray-200 rounded mb-3"></div>
                        <div className="h-20 w-full bg-gray-200 rounded"></div>
                    </div>

                    <Separator />

                    <div>
                        <div className="h-5 w-20 bg-gray-200 rounded mb-3"></div>
                        <div className="h-20 w-full bg-gray-200 rounded"></div>
                    </div>
                </CardContent>
            </Card>

            {/* Card 3: Personal Voice & Style */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div className="h-6 w-44 bg-gray-200 rounded"></div>
                        <div className="h-9 w-16 bg-gray-200 rounded"></div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div>
                                <div className="h-4 w-32 bg-gray-200 rounded mb-2"></div>
                                <div className="h-10 w-full bg-gray-200 rounded"></div>
                            </div>
                            <div>
                                <div className="h-4 w-20 bg-gray-200 rounded mb-2"></div>
                                <div className="h-10 w-full bg-gray-200 rounded"></div>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <div className="h-4 w-24 bg-gray-200 rounded mb-2"></div>
                                <div className="h-20 w-full bg-gray-200 rounded"></div>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="h-4 w-4 bg-gray-200 rounded"></div>
                                <div className="h-4 w-24 bg-gray-200 rounded"></div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Card 4: Content Guidelines */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div className="h-6 w-36 bg-gray-200 rounded"></div>
                        <div className="h-9 w-16 bg-gray-200 rounded"></div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div>
                        <div className="h-5 w-24 bg-gray-200 rounded mb-3"></div>
                        <div className="h-20 w-full bg-gray-200 rounded"></div>
                    </div>

                    <Separator />

                    <div>
                        <div className="h-5 w-32 bg-gray-200 rounded mb-3"></div>
                        <div className="h-20 w-full bg-gray-200 rounded"></div>
                    </div>

                    <Separator />

                    <div>
                        <div className="h-5 w-32 bg-gray-200 rounded mb-3"></div>
                        <div className="h-20 w-full bg-gray-200 rounded"></div>
                    </div>

                    <Separator />

                    <div>
                        <div className="h-5 w-24 bg-gray-200 rounded mb-3"></div>
                        <div className="h-10 w-full bg-gray-200 rounded"></div>
                    </div>

                    <Separator />

                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <div className="h-5 w-28 bg-gray-200 rounded"></div>
                            <div className="h-8 w-8 bg-gray-200 rounded"></div>
                        </div>
                        <div className="space-y-2">
                            {Array.from({ length: 3 }).map((_, index) => (
                                <div key={index} className="flex items-center gap-2">
                                    <div className="h-10 flex-1 bg-gray-200 rounded"></div>
                                    <div className="h-8 w-8 bg-gray-200 rounded"></div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <Separator />

                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <div className="h-5 w-32 bg-gray-200 rounded"></div>
                            <div className="h-8 w-8 bg-gray-200 rounded"></div>
                        </div>
                        <div className="space-y-2">
                            {Array.from({ length: 2 }).map((_, index) => (
                                <div key={index} className="flex items-center gap-2">
                                    <div className="h-20 flex-1 bg-gray-200 rounded"></div>
                                    <div className="h-8 w-8 bg-gray-200 rounded"></div>
                                </div>
                            ))}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Delete Profile Button */}
            <div className="flex justify-end">
                <div className="h-10 w-32 bg-gray-200 rounded"></div>
            </div>
        </div>
    );
};

export default ProfileDetailsPersonSkeleton;
