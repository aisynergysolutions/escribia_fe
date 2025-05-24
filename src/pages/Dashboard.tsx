
import React from 'react';
import { Users, FileText, TrendingUp, Calendar as CalendarIcon, MoreVertical } from 'lucide-react';
import StatCard from '../components/ui/StatCard';
import { mockAgency, mockIdeas, mockClients } from '../types';

const Dashboard = () => {
  // Get recent clients for the sidebar
  const recentClients = mockClients.slice(0, 3);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Welcome back! Here's what's happening with your clients.</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Content - Stats and Calendar */}
        <div className="lg:col-span-3 space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard 
              title="Total Clients" 
              value="24"
              trend="+2 this month"
              icon={<Users className="h-5 w-5" />}
            />
            <StatCard 
              title="Posts This Month" 
              value="156"
              trend="+23% vs last month"
              icon={<FileText className="h-5 w-5" />}
            />
            <StatCard 
              title="Avg. Engagement" 
              value="4.2%"
              trend="+0.8% vs last month"
              icon={<TrendingUp className="h-5 w-5" />}
            />
            <StatCard 
              title="Scheduled Posts" 
              value="42"
              description="Next 7 days"
              icon={<CalendarIcon className="h-5 w-5" />}
            />
          </div>

          {/* Content Calendar */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Content Calendar</h2>
              <div className="flex items-center gap-3">
                <button className="text-gray-400 hover:text-gray-600">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <span className="text-sm font-medium text-gray-900">May 2025</span>
                <button className="text-gray-400 hover:text-gray-600">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
                <button className="text-sm text-blue-600 font-medium ml-4">Today</button>
              </div>
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-px bg-gray-200 rounded-lg overflow-hidden">
              {/* Calendar Headers */}
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                <div key={day} className="bg-gray-50 p-3 text-center text-sm font-medium text-gray-600">
                  {day}
                </div>
              ))}
              
              {/* Calendar Days */}
              {Array.from({ length: 35 }, (_, i) => {
                const day = i - 4; // Start from Monday
                const isCurrentMonth = day > 0 && day <= 31;
                const hasEvent = [6, 12, 18].includes(day);
                
                return (
                  <div key={i} className={`bg-white p-3 min-h-[80px] ${!isCurrentMonth ? 'text-gray-300' : ''}`}>
                    {isCurrentMonth && (
                      <>
                        <div className="text-sm font-medium mb-2">{day}</div>
                        {hasEvent && (
                          <div className="space-y-1">
                            <div className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                              TechCorp
                            </div>
                            <div className="text-xs text-gray-500">Product Launch</div>
                            <div className="text-xs text-gray-500">9:00 AM</div>
                          </div>
                        )}
                        {day === 18 && (
                          <div className="mt-1">
                            <div className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">
                              StartupX
                            </div>
                            <div className="text-xs text-gray-500">Industry Insights</div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Sidebar - Recent Clients */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Clients</h3>
            <div className="space-y-4">
              {recentClients.map((client, index) => {
                const colors = ['bg-blue-500', 'bg-cyan-500', 'bg-blue-600'];
                const initials = client.companyName.split(' ').map(word => word[0]).join('').slice(0, 2);
                
                return (
                  <div key={client.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg ${colors[index]} flex items-center justify-center text-white font-medium text-sm`}>
                        {initials}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{client.companyName}</div>
                        <div className="text-sm text-gray-500">{client.status}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-gray-400" />
                        <span className="text-sm font-medium text-gray-900">
                          {index === 0 ? '12' : index === 1 ? '3' : '18'}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500">Posts</div>
                      <div className="text-xs text-gray-500 mt-1">
                        {index === 0 ? 'Today' : index === 1 ? 'Tomorrow' : 'May 24'}
                      </div>
                      <div className="text-xs text-gray-500">Next Post</div>
                      <div className="text-xs text-green-600 font-medium">
                        {index === 0 ? '+24%' : index === 1 ? '+8%' : '+31%'}
                      </div>
                      <div className="text-xs text-gray-500">Engagement</div>
                    </div>
                    <button className="text-gray-400 hover:text-gray-600">
                      <MoreVertical className="h-4 w-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
