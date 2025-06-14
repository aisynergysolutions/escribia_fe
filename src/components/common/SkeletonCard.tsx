
import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface SkeletonCardProps {
  variant?: 'client' | 'idea' | 'default';
  className?: string;
}

const SkeletonCard: React.FC<SkeletonCardProps> = ({ 
  variant = 'default', 
  className = '' 
}) => {
  return (
    <Card className={`rounded-2xl shadow-md h-full flex flex-col ${className}`}>
      <CardHeader className="pb-2 flex-shrink-0">
        <div className="flex justify-between items-start gap-2">
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
        <div className="space-y-2 flex-1">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          {variant === 'client' && <Skeleton className="h-4 w-4/6" />}
        </div>
        <div className="mt-4 pt-2">
          <Skeleton className="h-3 w-32" />
        </div>
      </CardContent>
    </Card>
  );
};

export default SkeletonCard;
