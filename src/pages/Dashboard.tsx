
import React from 'react';
import { LineChart, TrendingUp } from 'lucide-react';
import StatCard from '../components/ui/StatCard';
import IdeaCard from '../components/ui/IdeaCard';
import { mockAgency, mockIdeas } from '../types';

const Dashboard = () => {
  // Get recent ideas
  const recentIdeas = [...mockIdeas].sort((a, b) => 
    b.updatedAt.seconds - a.updatedAt.seconds
  ).slice(0, 5);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Posts Generated This Month" 
          value={mockAgency.apiUsage.postsGeneratedThisMonth}
          icon={<LineChart className="h-5 w-5" />}
        />
        <StatCard 
          title="Clients Managed" 
          value={mockAgency.apiUsage.clientsManagedCount}
          icon={<Users className="h-5 w-5" />}
        />
        <StatCard 
          title="Successful Executions" 
          value={mockAgency.successfulExecutions}
          icon={<TrendingUp className="h-5 w-5" />}
        />
        <StatCard 
          title="Current Plan" 
          value={mockAgency.subscription.planId}
          description={`Expires: ${new Date(mockAgency.subscription.currentPeriodEnd.seconds * 1000).toLocaleDateString()}`}
        />
      </div>
      
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">Recent Activity</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recentIdeas.map((idea) => (
            <IdeaCard key={idea.id} idea={idea} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

// Fix missing import
import { Users } from 'lucide-react';
