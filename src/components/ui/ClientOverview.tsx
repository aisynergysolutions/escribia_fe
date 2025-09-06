import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, TrendingUp, TrendingDown, Minus, Eye, MessageCircle, Heart, Clock, ChevronLeft, ChevronRight, FileText, Sparkles, Users, RefreshCw, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { format, addMonths, subMonths } from 'date-fns';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import StatCard from './StatCard';
import StatCardSkeleton from './StatCardSkeleton';
import PostCalendar from './PostCalendar';
import IdeaCard from './IdeaCard';
import { useClients } from '../../context/ClientsContext';
import { useAuth } from '../../context/AuthContext';
import { useAnalytics } from '../../context/AnalyticsContext';
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
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Get client details from context
  const { clientDetails, clientDetailsLoading } = useClients();
  const { currentUser } = useAuth();

  // Get analytics data from context with enhanced functionality
  const {
    overviewData,
    overviewLoading,
    overviewError,
    fetchOverview,
    canForceRefresh,
    hasRecentRateLimit,
    getDataAge,
    getRefreshRecommendation,
    hasRateLimitErrors,
    forceRefreshAll
  } = useAnalytics();

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

  // Smart analytics fetching following analytics.md guidelines
  const fetchAnalyticsData = useCallback(async (forceRefresh = false) => {
    if (!currentUser?.uid || !clientId) return;

    try {
      await fetchOverview(currentUser.uid, clientId, {
        include: ['posts', 'followers', 'impressions', 'engagement_rate'],
        forceRefresh
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
  }, [currentUser?.uid, clientId]); // Remove fetchOverview from dependencies

  // Handle explicit refresh button click
  const handleForceRefresh = useCallback(async () => {
    if (!canForceRefresh() || isRefreshing) return;

    setIsRefreshing(true);
    try {
      if (currentUser?.uid) {
        await forceRefreshAll(currentUser.uid, clientId, {
          include: ['posts', 'followers', 'impressions', 'engagement_rate']
        });
      }
    } catch (error) {
      console.error('Error during force refresh:', error);
    } finally {
      setIsRefreshing(false);
    }
  }, [canForceRefresh, isRefreshing, currentUser?.uid, clientId]); // Remove forceRefreshAll from dependencies

  // Fetch analytics data when component mounts or dependencies change
  useEffect(() => {
    if (currentUser?.uid && clientId) {
      fetchOverview(currentUser.uid, clientId, {
        include: ['posts', 'followers', 'impressions', 'engagement_rate']
      });
    }
  }, [currentUser?.uid, clientId]); // Use fetchOverview directly and only depend on stable values

  // Helper to get data freshness display
  const getDataFreshnessInfo = () => {
    const age = getDataAge();
    const recommendation = getRefreshRecommendation();

    if (!age) return { text: 'No data', variant: 'secondary' as const };

    const minutes = Math.floor(age / (1000 * 60));

    if (minutes < 2) return { text: 'Just now', variant: 'default' as const };
    if (minutes < 60) return { text: `${minutes}m ago`, variant: 'default' as const };

    const hours = Math.floor(minutes / 60);
    if (hours < 24) return { text: `${hours}h ago`, variant: recommendation === 'very_stale' ? 'destructive' as const : 'secondary' as const };

    const days = Math.floor(hours / 24);
    return { text: `${days}d ago`, variant: 'destructive' as const };
  };

  // Helper to check if we should show rate limit warning
  const shouldShowRateLimitWarning = () => {
    return overviewData?.meta && hasRateLimitErrors(overviewData.meta);
  };

  // Helper to check if we should show stale data warning
  const shouldShowStaleWarning = () => {
    const recommendation = getRefreshRecommendation();
    return recommendation === 'very_stale' && !hasRecentRateLimit();
  };

  if (clientDetailsLoading) {
    return <div className="text-center py-12">Loading client...</div>;
  }

  if (!clientDetails) {
    return <div>Client not found</div>;
  }

  if (!clientDetails) {
    return <div>Client not found</div>;
  }

  // Calculate statistics using the fetched posts
  const publishedPosts = recentPosts.filter(idea => idea.status === 'Published').length;
  const scheduledPosts = recentPosts.filter(idea => idea.status === 'Scheduled').length;

  // Get analytics KPIs or use fallback values
  const analyticsKPIs = overviewData?.kpis || {};

  // Format values for display
  const formatKPIValue = (kpi: any, fallback: string | number) => {
    if (overviewLoading) return '—';
    if (overviewError) return fallback;
    return kpi?.value !== undefined ? kpi.value : fallback;
  };

  const formatDelta = (kpi: any) => {
    if (!kpi?.delta && kpi?.delta !== 0) return null;

    const sign = kpi.delta > 0 ? '+' : '';

    // Round delta to avoid very long decimal numbers
    const roundedDelta = Math.abs(kpi.delta) < 1 ?
      parseFloat(kpi.delta.toFixed(3)) :
      Math.round(kpi.delta);

    return `${sign}${roundedDelta}`;
  };

  const formatDeltaPct = (kpi: any) => {
    // Handle case where deltaPct doesn't exist but delta does (for engagement rate)
    if ((!kpi?.deltaPct && kpi?.deltaPct !== 0) && kpi?.delta) {
      // For engagement rate, if we have a delta but no deltaPct, 
      // treat delta as a percentage change and multiply by 100
      const sign = kpi.delta > 0 ? '+' : '';
      const percentageValue = kpi.delta * 100; // Convert decimal to percentage
      return `${sign}${percentageValue.toFixed(1)}%`;
    }

    if (!kpi?.deltaPct && kpi?.deltaPct !== 0) return null;

    const sign = kpi.deltaPct > 0 ? '+' : '';

    // For very small percentages (< 0.1%), show more precision
    if (Math.abs(kpi.deltaPct) < 0.1) {
      return `${sign}${kpi.deltaPct.toFixed(3)}%`;
    }
    // For normal percentages, show 1 decimal place
    return `${sign}${kpi.deltaPct.toFixed(1)}%`;
  };

  // Get delta icon like KPICard
  const getDeltaIcon = (kpi: any) => {
    const deltaValue = kpi?.delta;
    if (deltaValue === undefined || deltaValue === 0) {
      return <Minus className="h-4 w-4 text-gray-400" />;
    }
    return deltaValue > 0
      ? <TrendingUp className="h-4 w-4 text-green-500" />
      : <TrendingDown className="h-4 w-4 text-red-500" />;
  };

  // Get delta color like KPICard
  const getDeltaColor = (kpi: any) => {
    const deltaValue = kpi?.delta;
    if (deltaValue === undefined || deltaValue === 0) return 'text-gray-500';
    return deltaValue > 0 ? 'text-green-600' : 'text-red-600';
  };

  // Create description with delta information using KPICard-style formatting
  const createDescription = (baseDesc: string, kpi: any) => {
    const delta = formatDelta(kpi);
    const deltaPct = formatDeltaPct(kpi);

    // Check if we have any change to display
    if (!delta && !deltaPct) {
      return baseDesc;
    }

    // Create the change indicator with icon and color
    const changeValue = deltaPct || delta;

    return (
      <div className="flex items-center gap-1">
        <span className="text-gray-600">{baseDesc}</span>
        <div className="flex items-center gap-1">
          {getDeltaIcon(kpi)}
          <span className={`text-sm ${getDeltaColor(kpi)}`}>
            {changeValue}
          </span>
        </div>
      </div>
    );
  };

  const goToPreviousMonth = () => {
    setCalendarMonth(subMonths(calendarMonth, 1));
  };

  const goToNextMonth = () => {
    setCalendarMonth(addMonths(calendarMonth, 1));
  };

  return (
    <div className="space-y-6">
      {/* Analytics Header with Refresh Controls */}
      {/* <div className="bg-white rounded-2xl shadow-md p-6"> */}
      {/* <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Analytics Overview</h2>
            <div className="flex items-center gap-2 mt-1">
              {overviewData && (
                <Badge variant={getDataFreshnessInfo().variant} className="text-xs">
                  Updated {getDataFreshnessInfo().text}
                </Badge>
              )}
              {shouldShowRateLimitWarning() && (
                <Badge variant="destructive" className="text-xs flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  Rate Limited
                </Badge>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {shouldShowStaleWarning() && (
              <div className="text-sm text-amber-600 mr-2">
                Data is stale - consider refreshing
              </div>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={handleForceRefresh}
              disabled={!canForceRefresh() || isRefreshing || overviewLoading}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              {isRefreshing ? 'Refreshing...' : 'Refresh'}
            </Button>
          </div>
        </div> */}

      {/* Rate limit cooldown info */}
      {/* </div> */}


      {/* KPI Cards - Using real analytics data */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {overviewLoading ? (
          // Show skeleton cards while loading
          <>
            <StatCardSkeleton className="border-green-200 bg-green-50" />
            <StatCardSkeleton className="border-blue-200 bg-blue-50" />
            <StatCardSkeleton className="border-purple-200 bg-purple-50" />
            <StatCardSkeleton className="border-orange-200 bg-orange-50" />
          </>
        ) : overviewError ? (
          // Show error state with retry button
          <div className="col-span-full">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
              <p className="text-red-600 mb-2">Failed to load analytics data</p>
              <p className="text-red-500 text-sm mb-3">{overviewError}</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => currentUser?.uid && fetchOverview(currentUser.uid, clientId, {
                  include: ['posts', 'followers', 'impressions', 'engagement_rate']
                })}
                className="text-red-600 border-red-200 hover:bg-red-50"
              >
                Try Again
              </Button>
            </div>
          </div>
        ) : (
          <>
            <StatCard
              title="Posts Published"
              value={formatKPIValue(analyticsKPIs.posts_published, 0)}
              icon={<TrendingUp className="h-4 w-4" />}
              description={createDescription("Last month", analyticsKPIs.posts_published)}
              className="border-green-200 bg-green-50"
            />
            <StatCard
              title="New Followers"
              value={formatKPIValue(analyticsKPIs.followers, '—')}
              icon={<Users className="h-4 w-4" />}
              description={createDescription("Total followers", analyticsKPIs.followers)}
              className="border-blue-200 bg-blue-50"
            />
            <StatCard
              title="Impressions"
              value={typeof formatKPIValue(analyticsKPIs.impressions, 0) === 'number'
                ? formatKPIValue(analyticsKPIs.impressions, 0).toLocaleString()
                : formatKPIValue(analyticsKPIs.impressions, 0)}
              icon={<Eye className="h-4 w-4" />}
              description={createDescription("Last month", analyticsKPIs.impressions)}
              className="border-purple-200 bg-purple-50"
            />
            <StatCard
              title="Engagement Rate"
              value={analyticsKPIs.engagement_rate?.value
                ? `${(analyticsKPIs.engagement_rate.value * 100).toFixed(1)}%`
                : formatKPIValue(analyticsKPIs.engagement_rate, '—')}
              icon={<Heart className="h-4 w-4" />}
              description={analyticsKPIs.engagement_rate?.insufficientSample
                ? "Low sample size"
                : createDescription("Average rate", analyticsKPIs.engagement_rate)}
              className="border-orange-200 bg-orange-50"
            />
          </>
        )}
      </div>

      {hasRecentRateLimit() && (
        <div className="mt-0 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-yellow-700 text-sm">
            <span className="font-medium">LinkedIn rate limit reached.</span> Please wait before refreshing again to avoid further limits.
          </p>
        </div>
      )}

      {/* Show warnings for partial errors or other issues */}
      {/* {overviewData?.meta?.errors && overviewData.meta.errors.length > 0 && !overviewLoading && (
        <div className={`border rounded-lg p-3 ${hasRateLimitErrors(overviewData.meta)
            ? 'bg-red-50 border-red-200'
            : 'bg-yellow-50 border-yellow-200'
          }`}>
          <div className="flex items-start gap-2">
            <AlertTriangle className={`h-4 w-4 mt-0.5 ${hasRateLimitErrors(overviewData.meta) ? 'text-red-600' : 'text-yellow-600'
              }`} />
            <div>
              <p className={`text-sm font-medium ${hasRateLimitErrors(overviewData.meta) ? 'text-red-700' : 'text-yellow-700'
                }`}>
                {hasRateLimitErrors(overviewData.meta)
                  ? 'LinkedIn Rate Limit Reached'
                  : 'Partial Analytics Data'
                }
              </p>
              <p className={`text-xs mt-1 ${hasRateLimitErrors(overviewData.meta) ? 'text-red-600' : 'text-yellow-600'
                }`}>
                {hasRateLimitErrors(overviewData.meta)
                  ? `${overviewData.meta.errors.filter(e => e.code === 429 || e.code === '429').length} profile(s) hit rate limits. Data will refresh automatically in a few minutes.`
                  : `${overviewData.meta.errors.length} profile(s) encountered connectivity issues. Some data may be incomplete.`
                }
              </p>
              {hasRateLimitErrors(overviewData.meta) && (
                <p className="text-xs mt-1 text-red-500">
                  Avoid frequent refreshes to prevent additional rate limiting.
                </p>
              )}
            </div>
          </div>
        </div>
      )} */}

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
