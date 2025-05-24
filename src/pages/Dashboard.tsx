
import React from 'react';
import { Plus, TrendingUp, Users, BarChart3, Calendar as CalendarIcon } from 'lucide-react';
import StatCard from '../components/ui/StatCard';
import PostCalendar from '../components/ui/PostCalendar';
import RecentActivity from '../components/ui/RecentActivity';
import { mockAgency, mockIdeas, mockClients } from '../types';

const Dashboard = () => {
  // Calculate KPI data
  const totalPosts = mockIdeas.length;
  const activeClients = mockClients.filter(client => client.status === 'Active').length;
  const scheduledPosts = mockIdeas.filter(idea => idea.status === 'Scheduled').length;
  const engagementRate = 85.3; // Mock data

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Main Content */}
      <div className="flex-1 p-6">
        {/* KPI Cards Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard 
            title="Total Posts" 
            value={totalPosts}
            change="+12%"
            trend="up"
            icon={<BarChart3 className="h-5 w-5" />}
          />
          <StatCard 
            title="Active Clients" 
            value={activeClients}
            change="+3"
            trend="up"
            icon={<Users className="h-5 w-5" />}
          />
          <StatCard 
            title="Engagement Rate" 
            value={`${engagementRate}%`}
            change="+5.2%"
            trend="up"
            icon={<TrendingUp className="h-5 w-5" />}
          />
          <StatCard 
            title="Scheduled Posts" 
            value={scheduledPosts}
            change="+8"
            trend="up"
            icon={<CalendarIcon className="h-5 w-5" />}
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Content Calendar - 8 columns */}
          <div className="lg:col-span-8">
            <PostCalendar />
          </div>
          
          {/* Recent Activity Sidebar - 4 columns */}
          <div className="lg:col-span-4">
            <RecentActivity />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
