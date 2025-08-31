import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export const KPICardSkeleton: React.FC = () => (
  <div className="bg-white p-6 rounded-2xl shadow-md">
    <div className="flex items-center justify-between mb-2">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-5 w-5 rounded" />
    </div>
    <div className="flex items-end gap-2 mb-2">
      <Skeleton className="h-8 w-20" />
    </div>
    <div className="flex items-center gap-1">
      <Skeleton className="h-4 w-4 rounded" />
      <Skeleton className="h-4 w-16" />
    </div>
  </div>
);

export const ChartSkeleton: React.FC = () => (
  <div className="bg-white p-6 rounded-2xl shadow-md">
    <div className="flex items-center justify-between mb-6">
      <Skeleton className="h-6 w-40" />
      <div className="flex gap-2">
        <Skeleton className="h-8 w-16" />
        <Skeleton className="h-8 w-16" />
      </div>
    </div>
    
    {/* Chart tabs skeleton */}
    <div className="mb-6">
      <div className="grid grid-cols-4 gap-2 mb-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    </div>

    {/* Chart area skeleton */}
    <div className="h-64 bg-gray-50 rounded-lg flex items-end justify-between p-4 space-x-2">
      {Array.from({ length: 12 }).map((_, i) => (
        <Skeleton 
          key={i} 
          className="w-full bg-gray-200" 
          style={{ height: `${Math.random() * 80 + 20}%` }}
        />
      ))}
    </div>
  </div>
);

export const AnalyticsHeaderSkeleton: React.FC = () => (
  <div className="bg-white p-6 rounded-2xl shadow-md">
    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
      <div>
        <Skeleton className="h-6 w-48 mb-2" />
        <Skeleton className="h-4 w-64" />
      </div>
      
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-4" />
          <div className="flex gap-1">
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-8 w-20" />
          </div>
        </div>
        <Skeleton className="h-8 w-20" />
      </div>
    </div>
  </div>
);

export const AnalyticsFullSkeleton: React.FC = () => (
  <div className="space-y-6">
    {/* Header skeleton */}
    <AnalyticsHeaderSkeleton />

    {/* KPI Cards skeleton */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <KPICardSkeleton />
      <KPICardSkeleton />
      <KPICardSkeleton />
      <KPICardSkeleton />
    </div>

    {/* Charts skeleton */}
    <ChartSkeleton />

    {/* Meta info skeleton */}
    <div className="bg-gray-50 p-4 rounded-lg">
      <div className="flex flex-wrap gap-4">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-3 w-32" />
        <Skeleton className="h-3 w-28" />
      </div>
    </div>
  </div>
);
