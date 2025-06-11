
import React, { useState } from 'react';
import { Eye, MessageCircle, Calendar, TrendingUp, FileText, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import StatCard from './StatCard';
import PostCalendar from './PostCalendar';
import IdeaCard from './IdeaCard';
import { mockIdeas } from '../../types';

interface ClientOverviewProps {
  clientId: string;
}

const ClientOverview: React.FC<ClientOverviewProps> = ({ clientId }) => {
  const [timeRange, setTimeRange] = useState<'week' | 'month'>('month');

  // Mock data - in real app this would come from props or API
  const kpiData = {
    week: {
      scheduled: 3,
      published: 8,
      avgViews: 1250,
      avgEngagement: 85
    },
    month: {
      scheduled: 12,
      published: 28,
      avgViews: 1580,
      avgEngagement: 152
    }
  };

  const currentData = kpiData[timeRange];

  // Mock recent comments
  const recentComments = [
    {
      id: '1',
      author: 'Sarah Johnson',
      role: 'Marketing Director',
      avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=Sarah Johnson',
      comment: 'Great insights on digital transformation! This really resonates with our current initiatives.',
      time: '2 hours ago',
      postTitle: 'Digital Transformation Mistakes'
    },
    {
      id: '2',
      author: 'Michael Chen',
      role: 'Software Engineer',
      avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=Michael Chen',
      comment: 'Thanks for sharing this. The ROI metrics section was particularly helpful.',
      time: '5 hours ago',
      postTitle: 'Enterprise Software ROI Metrics'
    },
    {
      id: '3',
      author: 'Emily Rodriguez',
      role: 'Product Manager',
      avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=Emily Rodriguez',
      comment: 'Looking forward to implementing some of these strategies in our next sprint.',
      time: '1 day ago',
      postTitle: 'The Future of AI in Marketing'
    }
  ];

  // Get recent ideas for this client
  const recentIdeas = [...mockIdeas].sort((a, b) => 
    b.updatedAt.seconds - a.updatedAt.seconds
  ).slice(0, 3);

  const handleSmartReply = (commentId: string) => {
    console.log('Smart reply for comment:', commentId);
  };

  const handleReply = (commentId: string, message: string) => {
    console.log('Reply to comment:', commentId, 'with message:', message);
  };

  return (
    <div className="space-y-6">
      {/* KPI Cards with Time Range Toggle */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Performance Overview</h2>
        <Tabs value={timeRange} onValueChange={(value) => setTimeRange(value as 'week' | 'month')}>
          <TabsList className="grid w-fit grid-cols-2">
            <TabsTrigger value="week">Week</TabsTrigger>
            <TabsTrigger value="month">Month</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Posts Scheduled" 
          value={currentData.scheduled}
          icon={<Calendar className="h-5 w-5" />}
        />
        <StatCard 
          title="Posts Published" 
          value={currentData.published}
          icon={<FileText className="h-5 w-5" />}
        />
        <StatCard 
          title="Avg. Views" 
          value={currentData.avgViews.toLocaleString()}
          icon={<Eye className="h-5 w-5" />}
        />
        <StatCard 
          title="Avg. Engagement" 
          value={currentData.avgEngagement}
          icon={<TrendingUp className="h-5 w-5" />}
        />
      </div>

      {/* Content Calendar */}
      <Card>
        <CardHeader>
          <CardTitle>Content Calendar</CardTitle>
        </CardHeader>
        <CardContent>
          <PostCalendar />
        </CardContent>
      </Card>

      {/* Recent Posts and Comments */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Posts */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Posts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentIdeas.map((idea) => (
                <IdeaCard key={idea.id} idea={idea} />
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Comments */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Recent Comments</CardTitle>
              <Button variant="ghost" size="sm" className="text-blue-600">
                View all comments
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {recentComments.map((comment) => (
                <div key={comment.id} className="space-y-3">
                  <div className="flex items-start gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={comment.avatar} />
                      <AvatarFallback className="bg-blue-100 text-blue-700">
                        {comment.author.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-sm text-gray-900">{comment.author}</h4>
                        <span className="text-xs text-gray-500">{comment.time}</span>
                      </div>
                      <p className="text-xs text-gray-600 mb-1">{comment.role}</p>
                      <p className="text-sm text-gray-700 mb-2">{comment.comment}</p>
                      <p className="text-xs text-blue-600 mb-3">on "{comment.postTitle}"</p>
                      
                      <div className="flex items-center gap-2">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="h-7 px-3 text-xs bg-gradient-to-r from-pink-50 to-purple-50 border-pink-200 text-pink-700 hover:from-pink-100 hover:to-purple-100"
                          onClick={() => handleSmartReply(comment.id)}
                        >
                          ✨ Smart Reply
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="h-7 px-3 text-xs"
                        >
                          💬 Reply
                        </Button>
                      </div>
                    </div>
                  </div>
                  {comment.id !== recentComments[recentComments.length - 1].id && (
                    <div className="border-b border-gray-100"></div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ClientOverview;
