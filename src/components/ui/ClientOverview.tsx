import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, TrendingUp, Eye, MessageCircle, Heart, Clock, ChevronLeft, ChevronRight, FileText, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { format, addMonths, subMonths } from 'date-fns';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import StatCard from './StatCard';
import PostCalendar from './PostCalendar';
import IdeaCard from './IdeaCard';
import { useClients } from '../../context/ClientsContext';
import { useAuth } from '../../context/AuthContext';
import { ScheduledPostsProvider } from '../../context/ScheduledPostsContext';
import { Idea } from '@/types/interfaces';

interface ClientOverviewProps {
  clientId: string;
}

const ClientOverview: React.FC<ClientOverviewProps> = ({ clientId }) => {
  const [calendarMonth, setCalendarMonth] = useState(new Date());
  const [recentPosts, setRecentPosts] = useState<Idea[]>([]);
  const [postsLoading, setPostsLoading] = useState(true);
  const [postsError, setPostsError] = useState<string | null>(null);

  // Get client details from context
  const { clientDetails, clientDetailsLoading } = useClients();
  const { currentUser } = useAuth();

  // Fetch recent posts from Firebase
  const fetchRecentPosts = async () => {
    if (!currentUser?.uid || !clientId) return;

    setPostsLoading(true);
    setPostsError(null);

    try {
      const ideasRef = collection(db, 'agencies', currentUser.uid, 'clients', clientId, 'ideas');
      const recentPostsQuery = query(
        ideasRef,
        orderBy('updatedAt', 'desc'),
        limit(3)
      );

      const snapshot = await getDocs(recentPostsQuery);
      const posts: Idea[] = snapshot.docs.map(doc => {
        const data = doc.data();

        return {
          id: doc.id,
          title: data.title || 'Untitled Post',
          status: data.status || 'Drafted',
          updatedAt: data.updatedAt,
          createdAt: data.createdAt,
          // Required Idea fields
          clientId: clientId,
          subClientId: data.profileId || data.subClientId,
          initialIdeaPrompt: data.initialIdeaPrompt || '',
          currentDraftText: data.currentDraftText || '',
          objective: data.objective || '',
          templateUsedId: data.templateUsedId || '',
          scheduledPostAt: data.scheduledPostAt,
          generatedHooks: data.generatedHooks || [],
          drafts: data.drafts || [],
          internalNotes: data.internalNotes || '',
        };
      });

      setRecentPosts(posts);
    } catch (error) {
      console.error('Error fetching recent posts:', error);
      setPostsError('Failed to load recent posts');
    } finally {
      setPostsLoading(false);
    }
  };

  // Fetch posts when component mounts or dependencies change
  useEffect(() => {
    fetchRecentPosts();
  }, [currentUser?.uid, clientId]);

  if (clientDetailsLoading) {
    return <div className="text-center py-12">Loading client...</div>;
  }

  if (!clientDetails) {
    return <div>Client not found</div>;
  }

  // Calculate statistics using the fetched posts
  const publishedPosts = recentPosts.filter(idea => idea.status === 'Published').length;
  const scheduledPosts = recentPosts.filter(idea => idea.status === 'Scheduled').length;

  // Mock engagement data - in real app this would come from LinkedIn API
  const avgViews = 1250;
  const avgEngagement = 85;

  const goToPreviousMonth = () => {
    setCalendarMonth(subMonths(calendarMonth, 1));
  };

  const goToNextMonth = () => {
    setCalendarMonth(addMonths(calendarMonth, 1));
  };

  return (
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
          {postsLoading ? (
            <div className="text-center py-6">
              <div className="flex items-center justify-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                <span className="text-gray-500">Loading recent posts...</span>
              </div>
            </div>
          ) : postsError ? (
            <div className="text-center py-6">
              <p className="text-red-500 mb-2">{postsError}</p>
              <Button
                variant="outline"
                size="sm"
                onClick={fetchRecentPosts}
                className="text-blue-600 border-blue-200 hover:bg-blue-50"
              >
                Try Again
              </Button>
            </div>
          ) : recentPosts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recentPosts.map((idea) => (
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

      {/* Recommended Comments Section */}
      <div className="bg-white rounded-2xl shadow-md relative">
        <div className="flex justify-between items-center p-6 border-b">
          <div className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-blue-600" />
            <h2 className="text-xl font-semibold">Recommended Comments</h2>
          </div>
        </div>

        {/* Coming Soon Overlay */}
        <div className="p-16 text-center">
          <Sparkles className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-700 mb-2">
            Comment Recommendations
          </h3>
          <p className="text-gray-500 text-sm mb-4">
            Coming soon
          </p>
        </div>
      </div>
    </div>
  );
}; export default ClientOverview;
