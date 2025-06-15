
import React, { useMemo, useState, useEffect } from 'react';
import { LineChart, TrendingUp, Users } from 'lucide-react';
import StatCard from '../components/ui/StatCard';
import IdeaCard from '../components/ui/IdeaCard';
import PostCalendar from '../components/ui/PostCalendar';
import LoadingGrid from '../components/common/LoadingGrid';
import { Skeleton } from '@/components/ui/skeleton';
import { mockAgency, mockIdeas } from '../types';

const Dashboard = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  // Memoize recent ideas calculation for better performance
  const recentIdeas = useMemo(() => {
    return [...mockIdeas].sort((a, b) => b.updatedAt.seconds - a.updatedAt.seconds).slice(0, 5);
  }, []);

  // Memoize stat calculations
  const stats = useMemo(() => ({
    postsGenerated: mockAgency.apiUsage.postsGeneratedThisMonth,
    clientsManaged: mockAgency.apiUsage.clientsManagedCount,
    successfulExecutions: mockAgency.successfulExecutions,
    planId: mockAgency.subscription.planId,
    planExpiry: new Date(mockAgency.subscription.currentPeriodEnd.seconds * 1000).toLocaleDateString()
  }), []);

  const memoizedIdeaCards = useMemo(() => {
    return recentIdeas.map(idea => <IdeaCard key={idea.id} idea={idea} />);
  }, [recentIdeas]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-96" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="bg-white p-6 rounded-lg shadow-sm border animate-pulse">
              <div className="flex items-center justify-between">
                <div>
                  <Skeleton className="h-4 w-24 mb-2" />
                  <Skeleton className="h-8 w-16" />
                </div>
                <Skeleton className="h-5 w-5" />
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border animate-pulse">
            <Skeleton className="h-6 w-32 mb-4" />
            <Skeleton className="h-64 w-full" />
          </div>
          
          <div className="space-y-4">
            <Skeleton className="h-6 w-32" />
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="bg-white p-4 rounded-lg shadow-sm border animate-pulse">
                  <div className="flex justify-between items-start mb-2">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-5 w-16" />
                  </div>
                  <Skeleton className="h-4 w-full mb-1" />
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="h-3 w-24 mt-2" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="font-bold text-gray-900 text-xl">
          Welcome back, {mockAgency.agencyName}—here's your content overview.
        </h1>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Posts Generated This Month" value={stats.postsGenerated} icon={<LineChart className="h-5 w-5" />} />
        <StatCard title="Clients Managed" value={stats.clientsManaged} icon={<Users className="h-5 w-5" />} />
        <StatCard title="Successful Executions" value={stats.successfulExecutions} icon={<TrendingUp className="h-5 w-5" />} />
        <StatCard title="Current Plan" value={stats.planId} description={`Expires: ${stats.planExpiry}`} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="max-h-[500px] overflow-hidden">
          <PostCalendar />
        </div>
        
        <div className="space-y-4 max-h-[500px] overflow-y-auto">
          <h2 className="text-2xl font-semibold sticky top-0 bg-white py-2">Recent Activity</h2>
          <div className="space-y-4">
            {memoizedIdeaCards}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
