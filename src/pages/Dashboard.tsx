
import React from 'react';
import { Users, FileText, TrendingUp, Calendar } from 'lucide-react';
import StatCard from '../components/ui/StatCard';
import IdeaCard from '../components/ui/IdeaCard';
import PostCalendar from '../components/ui/PostCalendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { mockAgency, mockIdeas, mockClients } from '../types';

const Dashboard = () => {
  // Get recent ideas
  const recentIdeas = [...mockIdeas].sort((a, b) => 
    b.updatedAt.seconds - a.updatedAt.seconds
  ).slice(0, 5);

  return (
    <div className="space-y-8">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-600">Welcome back! Here's what's happening with your clients.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Clients" 
          value={mockClients.length}
          change="+2 this month"
          icon={<Users className="h-5 w-5" />}
        />
        <StatCard 
          title="Posts This Month" 
          value={mockAgency.apiUsage.postsGeneratedThisMonth}
          change="+23% vs last month"
          icon={<FileText className="h-5 w-5" />}
        />
        <StatCard 
          title="Avg. Engagement" 
          value="4.2%"
          change="+0.8% vs last month"
          icon={<TrendingUp className="h-5 w-5" />}
        />
        <StatCard 
          title="Scheduled Posts" 
          value="42"
          description="Next 7 days"
          icon={<Calendar className="h-5 w-5" />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card className="bg-white border border-slate-200">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold text-slate-900">Content Calendar</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <PostCalendar />
            </CardContent>
          </Card>
        </div>
        
        <div className="space-y-6">
          <Card className="bg-white border border-slate-200">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-slate-900">Recent Clients</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {mockClients.slice(0, 3).map((client) => (
                <div key={client.id} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-slate-50 transition-colors">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                    <span className="text-blue-600 font-semibold text-sm">
                      {client.clientName.charAt(0)}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">
                      {client.clientName}
                    </p>
                    <p className="text-sm text-slate-500">{client.status}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-500">Today</p>
                    <p className="text-xs font-medium text-slate-700">Next Post</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="bg-white border border-slate-200">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-slate-900">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {recentIdeas.slice(0, 4).map((idea) => (
                <div key={idea.id} className="flex items-start space-x-3 p-2 rounded-lg hover:bg-slate-50 transition-colors">
                  <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 flex-shrink-0"></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">
                      {idea.title}
                    </p>
                    <p className="text-xs text-slate-500">
                      {idea.status} • {new Date(idea.updatedAt.seconds * 1000).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
