
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { FileText, Calendar, TrendingUp, Eye, MessageCircle, Heart, Share2, Sparkles, Copy, Send, MoreHorizontal } from 'lucide-react';
import { Link } from 'react-router-dom';
import StatCard from './StatCard';
import PostCalendar from './PostCalendar';
import IdeaCard from './IdeaCard';
import { mockClients, mockIdeas } from '../../types';

interface ClientOverviewProps {
  clientId: string;
}

// Mock recent comments data
const mockRecentComments = [
  {
    id: '1',
    author: {
      name: 'Sarah Johnson',
      title: 'Marketing Director at InnovateCorp',
      avatar: undefined
    },
    content: 'Great insights on digital transformation! This really resonates with our current challenges.',
    postTitle: 'The Future of Enterprise Software',
    timeAgo: '2 hours ago',
    engagement: { likes: 12, replies: 3 }
  },
  {
    id: '2',
    author: {
      name: 'Michael Chen',
      title: 'CTO at DataFlow Systems',
      avatar: undefined
    },
    content: 'Would love to discuss this further. We\'ve had similar experiences with ROI measurement.',
    postTitle: 'Enterprise Software ROI Metrics',
    timeAgo: '5 hours ago',
    engagement: { likes: 8, replies: 1 }
  },
  {
    id: '3',
    author: {
      name: 'Emily Rodriguez',
      title: 'VP of Operations',
      avatar: undefined
    },
    content: 'This is exactly what we needed to hear. Thank you for sharing these practical tips!',
    postTitle: 'Digital Transformation Mistakes',
    timeAgo: '1 day ago',
    engagement: { likes: 15, replies: 2 }
  }
];

const ClientOverview: React.FC<ClientOverviewProps> = ({ clientId }) => {
  const client = mockClients.find(c => c.id === clientId);
  const clientIdeas = mockIdeas.filter(idea => idea.clientId === clientId);

  if (!client) {
    return <div>Client not found</div>;
  }

  // Calculate statistics
  const totalPosts = clientIdeas.length;
  const publishedPosts = clientIdeas.filter(idea => idea.status === 'Published').length;
  const scheduledPosts = clientIdeas.filter(idea => idea.status === 'Scheduled').length;
  
  // Mock engagement data - in real app this would come from LinkedIn API
  const avgViews = 1250;
  const avgEngagement = 85;

  const handleSmartReply = (commentId: string) => {
    console.log('Smart reply for comment:', commentId);
  };

  const handleReply = (commentId: string, content: string) => {
    console.log('Manual reply for comment:', commentId, content);
  };

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Posts"
          value={totalPosts}
          icon={<FileText className="h-4 w-4" />}
          description="This month"
        />
        <StatCard
          title="Published"
          value={publishedPosts}
          icon={<TrendingUp className="h-4 w-4" />}
          description="Live posts"
          className="border-green-200 bg-green-50"
        />
        <StatCard
          title="Scheduled"
          value={scheduledPosts}
          icon={<Calendar className="h-4 w-4" />}
          description="Ready to go"
          className="border-blue-200 bg-blue-50"
        />
        <StatCard
          title="Avg. Views"
          value={avgViews.toLocaleString()}
          icon={<Eye className="h-4 w-4" />}
          description="Per post this month"
          className="border-purple-200 bg-purple-50"
        />
      </div>

      {/* Content Calendar */}
      <div className="bg-white rounded-2xl shadow-md">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold">Content Calendar</h2>
          <p className="text-gray-600 mt-1">Scheduled posts for {client.clientName}</p>
        </div>
        <div className="p-6">
          <PostCalendar />
        </div>
      </div>

      {/* Recent Posts */}
      <div className="bg-white rounded-2xl shadow-md">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold">Recent Posts</h2>
          <Link to={`/clients/${clientId}/posts`}>
            <Button variant="ghost" className="text-indigo-600 hover:text-indigo-700">
              View All
            </Button>
          </Link>
        </div>
        
        <div className="p-6">
          {clientIdeas.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {clientIdeas.slice(0, 3).map((idea) => (
                <IdeaCard key={idea.id} idea={idea} />
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-6">
              No posts found for this client yet.
            </p>
          )}
        </div>
      </div>

      {/* Recent Comments Section */}
      <div className="bg-white rounded-2xl shadow-md">
        <div className="flex justify-between items-center p-6 border-b">
          <div className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-blue-600" />
            <h2 className="text-xl font-semibold">Recent Comments</h2>
          </div>
          <Button variant="ghost" className="text-indigo-600 hover:text-indigo-700">
            View All Comments
          </Button>
        </div>
        
        <div className="divide-y">
          {mockRecentComments.map((comment) => (
            <div key={comment.id} className="p-6">
              <div className="flex gap-4">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={comment.author.avatar} alt={comment.author.name} />
                  <AvatarFallback className="bg-gray-100">
                    {comment.author.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 space-y-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-gray-900">{comment.author.name}</h4>
                      <span className="text-gray-500 text-sm">•</span>
                      <span className="text-gray-500 text-sm">{comment.timeAgo}</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-1">{comment.author.title}</p>
                    <p className="text-sm text-gray-500">Commented on: <span className="font-medium">{comment.postTitle}</span></p>
                  </div>
                  
                  <p className="text-gray-800">{comment.content}</p>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Heart className="h-4 w-4" />
                      <span>{comment.engagement.likes}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MessageCircle className="h-4 w-4" />
                      <span>{comment.engagement.replies}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 pt-2">
                    <Textarea 
                      placeholder="Reply here..."
                      className="flex-1 min-h-[40px] text-sm resize-none"
                      id={`reply-${comment.id}`}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleSmartReply(comment.id)}
                        className="text-blue-600 border-blue-200 hover:bg-blue-50"
                      >
                        <Sparkles className="h-3 w-3 mr-1" />
                        Smart Reply
                      </Button>
                      <Button variant="outline" size="sm">
                        <Copy className="h-3 w-3 mr-1" />
                        Copy
                      </Button>
                      <Button variant="outline" size="sm">
                        <MoreHorizontal className="h-3 w-3" />
                      </Button>
                    </div>
                    <Button 
                      size="sm"
                      className="bg-blue-600 hover:bg-blue-700"
                      onClick={() => {
                        const textarea = document.getElementById(`reply-${comment.id}`) as HTMLTextAreaElement;
                        if (textarea) {
                          handleReply(comment.id, textarea.value);
                          textarea.value = '';
                        }
                      }}
                    >
                      <Send className="h-3 w-3 mr-1" />
                      Reply
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {mockRecentComments.length === 0 && (
          <div className="text-center text-gray-500 py-12">
            <MessageCircle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No recent comments to display</p>
            <p className="text-sm mt-2">Comments on your posts will appear here</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientOverview;
