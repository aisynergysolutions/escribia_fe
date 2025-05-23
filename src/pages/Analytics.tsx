
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, LineChart } from 'lucide-react';
import { mockIdeas, mockClients } from '../types';

const Analytics = () => {
  // This would ideally be calculated from real data
  const totalEngagement = mockIdeas.reduce((sum, idea) => {
    if (idea.performance) {
      return sum + (idea.performance.likes || 0) + (idea.performance.comments || 0) + (idea.performance.shares || 0);
    }
    return sum;
  }, 0);
  
  const totalViews = mockIdeas.reduce((sum, idea) => {
    if (idea.performance) {
      return sum + (idea.performance.views || 0);
    }
    return sum;
  }, 0);
  
  const postsPublished = mockIdeas.filter(idea => idea.status === 'Posted').length;
  
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Analytics</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="rounded-2xl shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Engagement</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalEngagement}</div>
            <p className="text-xs text-gray-500 mt-1">Likes, comments, and shares</p>
          </CardContent>
        </Card>
        
        <Card className="rounded-2xl shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Views</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalViews}</div>
            <p className="text-xs text-gray-500 mt-1">Across all clients</p>
          </CardContent>
        </Card>
        
        <Card className="rounded-2xl shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Posts Published</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{postsPublished}</div>
            <p className="text-xs text-gray-500 mt-1">Successfully published</p>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="rounded-2xl shadow-md">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Engagement by Client</CardTitle>
              <BarChart className="h-4 w-4 text-gray-500" />
            </div>
          </CardHeader>
          <CardContent className="h-80 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <p>Chart would be rendered here using recharts</p>
              <p className="text-sm">(Bar chart showing likes/comments/shares per client)</p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="rounded-2xl shadow-md">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Views Over Time</CardTitle>
              <LineChart className="h-4 w-4 text-gray-500" />
            </div>
          </CardHeader>
          <CardContent className="h-80 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <p>Chart would be rendered here using recharts</p>
              <p className="text-sm">(Line chart showing views over time)</p>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div>
        <h2 className="text-xl font-semibold mb-4">Performance by Client</h2>
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Client
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Posts
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Likes
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Comments
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Shares
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Views
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {mockClients.map((client) => {
                  // Calculate aggregated metrics for each client
                  const clientIdeas = mockIdeas.filter(idea => idea.clientId === client.id);
                  const postCount = clientIdeas.length;
                  const likes = clientIdeas.reduce((sum, idea) => sum + (idea.performance?.likes || 0), 0);
                  const comments = clientIdeas.reduce((sum, idea) => sum + (idea.performance?.comments || 0), 0);
                  const shares = clientIdeas.reduce((sum, idea) => sum + (idea.performance?.shares || 0), 0);
                  const views = clientIdeas.reduce((sum, idea) => sum + (idea.performance?.views || 0), 0);
                  
                  return (
                    <tr key={client.id}>
                      <td className="px-6 py-4 whitespace-nowrap font-medium">{client.clientName}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{postCount}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{likes}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{comments}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{shares}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{views}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
