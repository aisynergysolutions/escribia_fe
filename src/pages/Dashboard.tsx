
import React, { useMemo } from 'react';
import { LineChart, TrendingUp, Users } from 'lucide-react';
import StatCard from '../components/ui/StatCard';
import IdeaCard from '../components/ui/IdeaCard';
import PostCalendar from '../components/ui/PostCalendar';
import { mockAgency, mockIdeas } from '../types';
const Dashboard = () => {
  // Memoize recent ideas calculation for better performance
  const recentIdeas = useMemo(() => {
    return [...mockIdeas].sort((a, b) => b.updatedAt.seconds - a.updatedAt.seconds).slice(0, 3);
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
  return <div className="space-y-6">
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
        <PostCalendar />
        
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">Recent Activity</h2>
          <div className="space-y-4">
            {memoizedIdeaCards}
          </div>
        </div>
      </div>
    </div>;
};
export default Dashboard;
