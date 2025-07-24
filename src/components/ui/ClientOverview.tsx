import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { FileText, Calendar, TrendingUp, Eye, MessageCircle, Heart, Share2, Sparkles, Copy, Send, MoreHorizontal, Clock, ExternalLink, ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { format, addMonths, subMonths } from 'date-fns';
import StatCard from './StatCard';
import PostCalendar from './PostCalendar';
import IdeaCard from './IdeaCard';
import { useClients } from '../../context/ClientsContext';
import { ScheduledPostsProvider } from '../../context/ScheduledPostsContext';

interface ClientOverviewProps {
  clientId: string;
}

// Mock recent comments data (keep for now)
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
  const [replyInputs, setReplyInputs] = useState<{ [key: string]: string }>({});
  const [calendarMonth, setCalendarMonth] = useState(new Date());

  // Get client details from context
  const { clientDetails, clientDetailsLoading } = useClients();

  // TODO: Replace with Firestore ideas fetch in the future
  const clientIdeas: any[] = []; // Placeholder for ideas, implement fetching if needed

  if (clientDetailsLoading) {
    return <div className="text-center py-12">Loading client...</div>;
  }

  if (!clientDetails) {
    return <div>Client not found</div>;
  }

  // Calculate statistics - removed totalPosts
  const publishedPosts = clientIdeas.filter(idea => idea.status === 'Published').length;
  const scheduledPosts = clientIdeas.filter(idea => idea.status === 'Scheduled').length;

  // Mock engagement data - in real app this would come from LinkedIn API
  const avgViews = 1250;
  const avgEngagement = 85;

  const handleSmartReply = (commentId: string, replyType: string) => {
    console.log('Smart reply for comment:', commentId, 'Type:', replyType);
    // Here you would generate AI reply based on the type
  };

  const handleReply = (commentId: string, content: string) => {
    console.log('Manual reply for comment:', commentId, content);
  };

  const handleCopyComment = (content: string) => {
    navigator.clipboard.writeText(content);
    console.log('Copied comment content');
  };

  const handleViewPost = (postTitle: string) => {
    console.log('Opening LinkedIn post:', postTitle);
    // In real app, this would open the actual LinkedIn post
  };

  const updateReplyInput = (commentId: string, value: string) => {
    setReplyInputs(prev => ({ ...prev, [commentId]: value }));
  };

  const goToPreviousMonth = () => {
    setCalendarMonth(subMonths(calendarMonth, 1));
  };

  const goToNextMonth = () => {
    setCalendarMonth(addMonths(calendarMonth, 1));
  };

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* KPI Cards - Only 4 cards now */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Scheduled"
            value={scheduledPosts}
            icon={<Clock className="h-4 w-4" />}
            description="Ready to go"
            className="border-blue-200 bg-blue-50"
          />
          <StatCard
            title="Published"
            value={publishedPosts}
            icon={<TrendingUp className="h-4 w-4" />}
            description="Live posts"
            className="border-green-200 bg-green-50"
          />
          <StatCard
            title="Avg. Views"
            value={avgViews.toLocaleString()}
            icon={<Eye className="h-4 w-4" />}
            description="Per post this month"
            className="border-purple-200 bg-purple-50"
          />
          <StatCard
            title="Avg. Engagement"
            value={`${avgEngagement}%`}
            icon={<Heart className="h-4 w-4" />}
            description="Engagement rate"
            className="border-orange-200 bg-orange-50"
          />
        </div>

        {/* Content Calendar */}
        <div className="bg-white rounded-2xl shadow-md">
          <div className="p-6 border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-blue-600" />
                <h2 className="text-xl font-semibold">Content Calendar for {clientDetails.clientName}</h2>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={goToPreviousMonth}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="font-medium min-w-[120px] text-center">
                  {format(calendarMonth, 'MMMM yyyy')}
                </span>
                <Button variant="outline" size="sm" onClick={goToNextMonth}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
          <div className="p-6">
            <ScheduledPostsProvider clientId={clientId}>
              <PostCalendar
                hideTitle={true}
                clientId={clientId}
                currentMonth={calendarMonth}
                onMonthChange={setCalendarMonth}
              />
            </ScheduledPostsProvider>
          </div>
        </div>

        {/* Recent Posts */}
        <div className="bg-white rounded-2xl shadow-md">
          <div className="flex justify-between items-center p-6 border-b">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-600" />
              <h2 className="text-xl font-semibold">Recent Posts</h2>
            </div>
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
                        value={replyInputs[comment.id] || ''}
                        onChange={(e) => updateReplyInput(comment.id, e.target.value)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleCopyComment(comment.content)}
                              className="text-gray-500 hover:text-gray-700"
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Copy comment</p>
                          </TooltipContent>
                        </Tooltip>

                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewPost(comment.postTitle)}
                              className="text-gray-500 hover:text-gray-700"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>View post on LinkedIn</p>
                          </TooltipContent>
                        </Tooltip>

                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-blue-600 border-blue-200 hover:bg-blue-50"
                            >
                              <Sparkles className="h-3 w-3 mr-1" />
                              Smart Reply
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-56" align="start">
                            <div className="space-y-2">
                              <h4 className="font-medium text-sm">Choose reply type:</h4>
                              <div className="grid gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="justify-start"
                                  onClick={() => handleSmartReply(comment.id, 'add-value')}
                                >
                                  Add Value
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="justify-start"
                                  onClick={() => handleSmartReply(comment.id, 'congratulate')}
                                >
                                  Congratulate
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="justify-start"
                                  onClick={() => handleSmartReply(comment.id, 'agree')}
                                >
                                  Agree
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="justify-start"
                                  onClick={() => handleSmartReply(comment.id, 'disagree')}
                                >
                                  Disagree
                                </Button>
                              </div>
                            </div>
                          </PopoverContent>
                        </Popover>
                      </div>

                      <Button
                        size="sm"
                        className="bg-blue-600 hover:bg-blue-700"
                        onClick={() => {
                          const content = replyInputs[comment.id] || '';
                          if (content.trim()) {
                            handleReply(comment.id, content);
                            updateReplyInput(comment.id, '');
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
    </TooltipProvider>
  );
};

export default ClientOverview;
