import React from 'react';
import { Plus, User, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface ClientSettingsSectionSkeletonProps {
    profileCount?: number;
}

const ClientSettingsSectionSkeleton: React.FC<ClientSettingsSectionSkeletonProps> = ({
    profileCount = 6
}) => {
    return (
        <div className="space-y-8 animate-pulse">
            {/* Client Header Section Skeleton */}
            <div className="space-y-2">
                <div className="flex items-center gap-3">
                    <div className="h-8 w-48 bg-gray-200 rounded"></div>
                    <div className="h-6 w-16 bg-gray-200 rounded-full"></div>
                </div>
                <div className="h-5 w-80 bg-gray-200 rounded"></div>
            </div>

            {/* Associated Profiles Section Skeleton */}
            <div>
                <div className="flex items-center justify-between mb-6">
                    <div className="h-7 w-40 bg-gray-200 rounded"></div>
                    <div className="flex items-center gap-2 h-9 w-36 bg-gray-200 rounded">
                        {/* Placeholder for Add New Profile button */}
                        <Plus className="h-4 w-4 text-gray-300 ml-2" />
                    </div>
                </div>

                {/* Profile Cards Grid Skeleton */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Array.from({ length: profileCount }).map((_, index) => (
                        <Card key={index} className="border">
                            <CardContent className="p-4">
                                <div className="flex items-center gap-3 mb-3">
                                    <Avatar className="h-12 w-12 bg-gray-200">
                                        <AvatarFallback className="bg-gray-200">
                                            {index % 2 === 0 ? (
                                                <User className="h-6 w-6 text-gray-300" />
                                            ) : (
                                                <Building2 className="h-6 w-6 text-gray-300" />
                                            )}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 min-w-0">
                                        <div className="h-5 w-24 bg-gray-200 rounded mb-1"></div>
                                        <div className="h-4 w-32 bg-gray-200 rounded"></div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="h-5 w-20 bg-gray-200 rounded-full"></div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ClientSettingsSectionSkeleton;
