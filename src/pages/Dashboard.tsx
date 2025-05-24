
import React from 'react';
import { Plus, TrendingUp, Users, BarChart3, Calendar as CalendarIcon, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import StatCard from '../components/ui/StatCard';
import PostCalendar from '../components/ui/PostCalendar';
import RecentActivity from '../components/ui/RecentActivity';
import { mockIdeas, mockClients } from '../types';

const Dashboard = () => {
  // Calculate KPI data
  const totalPosts = mockIdeas.length;
  const activeClients = mockClients.filter(client => client.status === 'active').length;
  const scheduledPosts = mockIdeas.filter(idea => idea.status === 'Scheduled').length;
  const engagementRate = 85.3;

  // Get recent clients
  const recentClients = [...mockClients]
    .sort((a, b) => b.updatedAt.seconds - a.updatedAt.seconds)
    .slice(0, 6);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'onboarding':
        return 'bg-blue-100 text-blue-800';
      case 'paused':
        return 'bg-yellow-100 text-yellow-800';
      case 'archived':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Top Banner */}
      <div className="h-14 bg-neutral-50 border-b border-neutral-200 px-6 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <div className="text-2xl font-semibold text-primary-600">escribia.io</div>
          <h1 className="text-2xl font-semibold text-neutral-900">Dashboard</h1>
        </div>
        
        <div className="flex items-center gap-4">
          <span className="text-neutral-600">Today • Nov 15, 2024</span>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
            <Input 
              placeholder="Search..." 
              className="pl-10 w-64 h-9 bg-white border-neutral-200"
            />
          </div>
          <Button className="bg-primary-600 hover:bg-primary-700 text-white h-9 px-4">
            <Plus className="h-4 w-4 mr-2" />
            New Post
          </Button>
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-primary-100 text-primary-700">
              JD
            </AvatarFallback>
          </Avatar>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6">
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
          <div className="lg:col-span-4 space-y-6">
            <RecentActivity />
            
            {/* Recent Clients */}
            <div className="bg-white rounded-[14px] shadow-[0_2px_6px_rgba(0,0,0,0.06)] border-0 p-6">
              <h3 className="text-xl font-semibold text-neutral-900 mb-4">Recent Clients</h3>
              <div className="space-y-3">
                {recentClients.map((client) => (
                  <div key={client.id} className="flex items-center gap-3 p-3 hover:bg-neutral-50 rounded-lg transition-colors">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-primary-100 text-primary-700">
                        {client.clientName.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-neutral-900 truncate">
                        {client.clientName}
                      </p>
                      <p className="text-xs text-neutral-600">{client.industry}</p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(client.status)}`}>
                      {client.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
