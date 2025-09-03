
import React, { useEffect, useState } from 'react';
import {
  Users,
  Eye,
  Heart,
  FileText,
  RefreshCw,
  Activity,
  TrendingUp,
  Calendar
} from 'lucide-react';
import { useAnalytics } from '@/context/AnalyticsContext';
import { useAuth } from '@/context/AuthContext';
import { useProfiles } from '@/context/ProfilesContext';
import { mockClients } from '../../types';
import KPICard, { formatters } from '../analytics/KPICard';
import AnalyticsChart from '../analytics/AnalyticsChart';
import DateRangePicker from '../analytics/DateRangePicker';
import ProfileSelector from '../analytics/ProfileSelector';
import ErrorDisplay from '../analytics/ErrorDisplay';
import { NoDataDisplay, NoKPIData, NoChartData, AnalyticsNoData } from '../analytics/NoDataDisplay';
import { AnalyticsFullSkeleton, KPICardSkeleton, ChartSkeleton } from '../../skeletons/AnalyticsSkeleton';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface AnalyticsSectionProps {
  clientId: string;
}

const AnalyticsSection: React.FC<AnalyticsSectionProps> = ({ clientId }) => {
  const { currentUser } = useAuth();
  const {
    overviewData,
    overviewLoading,
    overviewError,
    timeSeriesData,
    timeSeriesLoading,
    timeSeriesError,
    clientState,
    fetchOverview,
    fetchTimeSeries,
    forceRefreshAll,
    clearData,
    canForceRefresh,
    hasRecentRateLimit,
  } = useAnalytics();

  const [selectedGranularity, setSelectedGranularity] = useState<'day' | 'week'>('day');
  const [dateRange, setDateRange] = useState<{ start: Date; end: Date } | null>(null);
  const [selectedProfileIds, setSelectedProfileIds] = useState<string[]>([]);
  const [showStaleDataWarning, setShowStaleDataWarning] = useState(false);

  const client = mockClients.find(c => c.id === clientId);
  const agencyId = currentUser?.uid;

  // Helper functions for data freshness
  const getDataAge = (): number | null => {
    return clientState.lastOverviewAt ? Date.now() - clientState.lastOverviewAt : null;
  };

  const getDataFreshnessLabel = (): string => {
    const age = getDataAge();
    if (!age) return 'Never loaded';

    const minutes = Math.floor(age / (60 * 1000));
    const hours = Math.floor(age / (60 * 60 * 1000));
    const days = Math.floor(age / (24 * 60 * 60 * 1000));

    if (minutes < 2) return 'Just now';
    if (minutes < 60) return `${minutes} min ago`;
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    return `${days} day${days > 1 ? 's' : ''} ago`;
  };

  const isDataStale = (): boolean => {
    const age = getDataAge();
    return age ? age > 30 * 60 * 1000 : false; // 30 minutes
  };

  const isDataVeryStale = (): boolean => {
    const age = getDataAge();
    return age ? age > 6 * 60 * 60 * 1000 : false; // 6 hours
  };

  // Load initial data with freshness policy
  useEffect(() => {
    if (agencyId && clientId) {
      loadAnalyticsDataWithFreshnessPolicy();
    }

    return () => {
      clearData();
    };
  }, [agencyId, clientId]);

  // Freshness policy implementation as per analytics.md
  const loadAnalyticsDataWithFreshnessPolicy = async () => {
    if (!agencyId || !clientId) return;

    const now = Date.now();
    const lastOverviewAt = clientState.lastOverviewAt;

    let shouldForceRefresh = false;

    if (!lastOverviewAt) {
      // First visit - use cached (no force)
      console.log('[Analytics] First load - using cached data');
      setShowStaleDataWarning(false);
    } else {
      const age = now - lastOverviewAt;

      if (age < 2 * 60 * 1000) {
        // <2m - reuse recent data, maybe skip network entirely
        console.log('[Analytics] Data is very fresh (<2m) - skipping refresh');
        setShowStaleDataWarning(false);
        return;
      } else if (age >= 2 * 60 * 1000 && age < 12 * 60 * 1000) {
        // 2-12m - normal request to reuse server aggregate cache
        console.log('[Analytics] Data moderately fresh (2-12m) - normal refresh');
        setShowStaleDataWarning(false);
      } else if (age >= 12 * 60 * 1000 && age < 30 * 60 * 1000) {
        // 12-30m - normal request, schedule conditional force refresh
        console.log('[Analytics] Data getting stale (12-30m) - normal refresh with possible force later');
        setShowStaleDataWarning(false);
        // TODO: Schedule background force refresh if no rate limits
      } else if (age >= 30 * 60 * 1000 && age < 6 * 60 * 60 * 1000) {
        // 30m-6h - show hint but don't auto force
        console.log('[Analytics] Data stale (30m-6h) - show refresh hint');
        setShowStaleDataWarning(true);
      } else if (age >= 6 * 60 * 60 * 1000) {
        // >6h - prompt user proactively
        console.log('[Analytics] Data very stale (>6h) - suggest refresh to user');
        setShowStaleDataWarning(true);
      }
    }

    await loadAnalyticsData(shouldForceRefresh);
  };

  // Reload data when date range or selected profiles change
  useEffect(() => {
    if (agencyId && clientId && (dateRange || selectedProfileIds.length > 0)) {
      loadAnalyticsData();
    }
  }, [dateRange, selectedProfileIds]);

  // Reload time series data when granularity changes
  useEffect(() => {
    if (agencyId && clientId && overviewData) {
      const filters = {
        ...(dateRange ? {
          start: dateRange.start.toISOString(),
          end: dateRange.end.toISOString(),
        } : {}),
        ...(selectedProfileIds.length > 0 ? {
          profileIds: selectedProfileIds,
        } : {}),
      };

      // Fetch time series data for charts with new granularity
      const metrics: Array<'impressions' | 'engagement_rate' | 'follower_gains' | 'publishing_cadence'> = [
        'impressions',
        'engagement_rate',
        'follower_gains',
        'publishing_cadence'
      ];

      metrics.forEach(metric => {
        fetchTimeSeries(agencyId, clientId, {
          ...filters,
          metric,
          granularity: selectedGranularity
        });
      });
    }
  }, [selectedGranularity]);

  const loadAnalyticsData = async (forceRefresh: boolean = false) => {
    if (!agencyId || !clientId) return;

    const filters = {
      ...(dateRange ? {
        start: dateRange.start.toISOString(),
        end: dateRange.end.toISOString(),
      } : {}),
      ...(selectedProfileIds.length > 0 ? {
        profileIds: selectedProfileIds,
      } : {}),
      ...(forceRefresh ? { forceRefresh: true } : {}),
    };

    // Fetch overview data
    await fetchOverview(agencyId, clientId, filters);

    // Fetch time series data for charts
    const metrics: Array<'impressions' | 'engagement_rate' | 'follower_gains' | 'publishing_cadence'> = [
      'impressions',
      'engagement_rate',
      'follower_gains',
      'publishing_cadence'
    ];

    for (const metric of metrics) {
      await fetchTimeSeries(agencyId, clientId, {
        ...filters,
        metric,
        granularity: selectedGranularity
      });
    }
  };

  const handleRefresh = async () => {
    if (!agencyId || !clientId) return;

    if (!canForceRefresh()) {
      console.warn('Refresh blocked due to recent refresh or rate limit');
      return;
    }

    const filters = {
      ...(dateRange ? {
        start: dateRange.start.toISOString(),
        end: dateRange.end.toISOString(),
      } : {}),
      ...(selectedProfileIds.length > 0 ? {
        profileIds: selectedProfileIds,
      } : {}),
    };

    await forceRefreshAll(agencyId, clientId, filters);
  };

  const handleDateRangeChange = (start: Date, end: Date) => {
    setDateRange({ start, end });
  };

  const handleProfileSelectionChange = (profileIds: string[]) => {
    setSelectedProfileIds(profileIds);
  };

  // Check if any time series data is currently loading
  const isAnyTimeSeriesLoading = (): boolean => {
    return Object.values(timeSeriesLoading).some(loading => loading);
  };

  const getTimeSeriesKey = (metric: string) => `${metric}_${selectedGranularity}`;

  // Check if we have any KPI data
  const hasKPIData = overviewData?.kpis && Object.keys(overviewData.kpis).length > 0;

  // Check if any KPI has actual value
  const hasAnyKPIValues = hasKPIData && Object.values(overviewData.kpis).some(kpi => kpi && kpi.value !== undefined);

  // Show full skeleton while initial loading
  if (overviewLoading && !overviewData) {
    return <AnalyticsFullSkeleton />;
  }

  // Show no data state if we have loaded but have no KPI data
  if (!overviewLoading && overviewData && !hasAnyKPIValues) {
    return <AnalyticsNoData />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl shadow-md">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold mb-2">Analytics Dashboard</h2>
            {/* <p className="text-gray-600">
              Performance metrics for {client?.clientName || 'Unknown Client'}
            </p> */}
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <DateRangePicker
              onRangeChange={handleDateRangeChange}
              disabled={overviewLoading || isAnyTimeSeriesLoading()}
            />
            <Button
              onClick={handleRefresh}
              variant="outline"
              size="sm"
              disabled={overviewLoading || !canForceRefresh()}
              className="flex items-center gap-2"
              title={
                hasRecentRateLimit()
                  ? "Cooling down after rate limit - retry in a moment"
                  : !canForceRefresh() && !hasRecentRateLimit()
                    ? "Please wait a moment before refreshing again"
                    : "Force refresh data from LinkedIn"
              }
            >
              <RefreshCw className={`h-4 w-4 ${overviewLoading ? 'animate-spin' : ''}`} />
              {overviewLoading
                ? 'Loading...'
                : hasRecentRateLimit()
                  ? 'Cooling down...'
                  : 'Refresh'
              }
            </Button>
          </div>
        </div>

        {/* Profile Selector */}
        <div className="mt-4 pt-4 border-t border-gray-100">
          <ProfileSelector
            clientId={clientId}
            selectedProfileIds={selectedProfileIds}
            onProfileSelectionChange={handleProfileSelectionChange}
          />
        </div>
      </div>

      {/* Error Display */}
      {overviewData?.meta.errors && overviewData.meta.errors.length > 0 && (
        <ErrorDisplay errors={overviewData.meta.errors} />
      )}

      {/* Rate Limit Warning */}
      {hasRecentRateLimit() && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4 text-amber-600" />
            <p className="text-amber-800 font-medium">LinkedIn Rate Limit Reached</p>
          </div>
          <p className="text-amber-700 text-sm mt-1">
            Refreshing is temporarily disabled. Please wait a few minutes before trying again.
          </p>
        </div>
      )}

      {/* Stale Data Warning */}
      {(showStaleDataWarning || isDataStale()) && !hasRecentRateLimit() && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-blue-800 font-medium">
                  {isDataVeryStale() ? 'Data is Several Hours Old' : 'Data is Getting Stale'}
                </p>
                <p className="text-blue-700 text-sm mt-1">
                  Last updated {getDataFreshnessLabel()}.
                  {isDataVeryStale()
                    ? ' Consider refreshing for the latest insights.'
                    : ' You may want to refresh for more recent data.'
                  }
                </p>
              </div>
            </div>
            <Button
              onClick={handleRefresh}
              size="sm"
              disabled={overviewLoading || !canForceRefresh()}
              className="text-sm"
            >
              Refresh Now
            </Button>
          </div>
        </div>
      )}

      {/* Overview Error */}
      {overviewError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Failed to load analytics: {overviewError}</p>
        </div>
      )}

      {/* KPI Cards */}
      {overviewLoading && !overviewData ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <KPICardSkeleton />
          <KPICardSkeleton />
          <KPICardSkeleton />
          <KPICardSkeleton />
        </div>
      ) : overviewData?.kpis && hasAnyKPIValues ? (
        <div className="space-y-4">
          {/* {selectedProfileIds.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-800">
                📊 Analytics filtered to {selectedProfileIds.length} selected profile{selectedProfileIds.length > 1 ? 's' : ''}
              </p>
            </div>
          )} */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {overviewData.kpis.posts_published && (
              <KPICard
                title="Posts Published"
                kpi={overviewData.kpis.posts_published}
                icon={<FileText className="h-5 w-5" />}
                formatter={formatters.default}
              />
            )}

            {overviewData.kpis.followers && (
              <KPICard
                title="Followers"
                kpi={overviewData.kpis.followers}
                icon={<Users className="h-5 w-5" />}
                formatter={formatters.compact}
              />
            )}

            {overviewData.kpis.impressions && (
              <KPICard
                title="Impressions"
                kpi={overviewData.kpis.impressions}
                icon={<Eye className="h-5 w-5" />}
                formatter={formatters.compact}
              />
            )}

            {overviewData.kpis.engagement_rate && (
              <KPICard
                title="Engagement Rate"
                kpi={overviewData.kpis.engagement_rate}
                icon={<Heart className="h-5 w-5" />}
                formatter={formatters.percentage}
              />
            )}
          </div>
        </div>
      ) : null}

      {/* Charts */}
      {overviewLoading && !overviewData ? (
        <ChartSkeleton />
      ) : (
        <div className="bg-white p-6 rounded-2xl shadow-md">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold">Performance Trends</h3>
              {selectedProfileIds.length > 0 && (
                <p className="text-sm text-gray-600 mt-1">
                  Showing data for {selectedProfileIds.length} selected profile{selectedProfileIds.length > 1 ? 's' : ''}
                </p>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                variant={selectedGranularity === 'day' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedGranularity('day')}
              >
                Daily
              </Button>
              <Button
                variant={selectedGranularity === 'week' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedGranularity('week')}
              >
                Weekly
              </Button>
            </div>
          </div>

          <Tabs defaultValue="impressions" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="impressions">Impressions</TabsTrigger>
              <TabsTrigger value="engagement">Engagement</TabsTrigger>
              <TabsTrigger value="followers">Followers</TabsTrigger>
              <TabsTrigger value="publishing">Publishing</TabsTrigger>
            </TabsList>

            <TabsContent value="impressions" className="mt-6">
              {timeSeriesData[getTimeSeriesKey('impressions')] ? (
                <AnalyticsChart
                  data={timeSeriesData[getTimeSeriesKey('impressions')].series}
                  metric="impressions"
                  granularity={selectedGranularity}
                  type="bar"
                  color="#3b82f6"
                />
              ) : timeSeriesLoading[getTimeSeriesKey('impressions')] ? (
                <div className="flex items-center justify-center h-64">
                  <RefreshCw className="h-6 w-6 animate-spin text-blue-500" />
                </div>
              ) : (
                <NoChartData metric="impressions" />
              )}
            </TabsContent>

            <TabsContent value="engagement" className="mt-6">
              {timeSeriesData[getTimeSeriesKey('engagement_rate')] ? (
                <AnalyticsChart
                  data={timeSeriesData[getTimeSeriesKey('engagement_rate')].series}
                  metric="engagement_rate"
                  granularity={selectedGranularity}
                  type="line"
                  color="#10b981"
                />
              ) : timeSeriesLoading[getTimeSeriesKey('engagement_rate')] ? (
                <div className="flex items-center justify-center h-64">
                  <RefreshCw className="h-6 w-6 animate-spin text-green-500" />
                </div>
              ) : (
                <NoChartData metric="engagement rate" />
              )}
            </TabsContent>

            <TabsContent value="followers" className="mt-6">
              {timeSeriesData[getTimeSeriesKey('follower_gains')] ? (
                <AnalyticsChart
                  data={timeSeriesData[getTimeSeriesKey('follower_gains')].series}
                  metric="follower_gains"
                  granularity={selectedGranularity}
                  type="bar"
                  color="#8b5cf6"
                />
              ) : timeSeriesLoading[getTimeSeriesKey('follower_gains')] ? (
                <div className="flex items-center justify-center h-64">
                  <RefreshCw className="h-6 w-6 animate-spin text-purple-500" />
                </div>
              ) : (
                <NoChartData metric="follower gains" />
              )}
            </TabsContent>

            <TabsContent value="publishing" className="mt-6">
              {timeSeriesData[getTimeSeriesKey('publishing_cadence')] ? (
                <AnalyticsChart
                  data={timeSeriesData[getTimeSeriesKey('publishing_cadence')].series}
                  metric="publishing_cadence"
                  granularity="week"
                  type="bar"
                  color="#f59e0b"
                />
              ) : timeSeriesLoading[getTimeSeriesKey('publishing_cadence')] ? (
                <div className="flex items-center justify-center h-64">
                  <RefreshCw className="h-6 w-6 animate-spin text-amber-500" />
                </div>
              ) : (
                <NoChartData metric="publishing cadence" />
              )}
            </TabsContent>
          </Tabs>
        </div>
      )}

      {/* Meta Information */}
      {/* {overviewData?.meta && (
        <div className="bg-gray-50 p-4 rounded-lg text-xs text-gray-600">
          <div className="flex flex-wrap gap-4">
            <span>Version: {overviewData.meta.version}</span>
            <span>Request ID: {overviewData.meta.requestId}</span>
            {clientState.lastOverviewAt && (
              <span>
                Updated: {new Date(clientState.lastOverviewAt).toLocaleString()}
                {clientState.lastForceAt && clientState.lastForceAt === clientState.lastOverviewAt && (
                  <span className="text-green-600 ml-1">(forced)</span>
                )}
              </span>
            )}
            {selectedProfileIds.length > 0 && (
              <span>Profiles: {selectedProfileIds.length} selected</span>
            )}
            {selectedProfileIds.length === 0 && (
              <span>Profiles: All client profiles</span>
            )}
            {overviewData.meta.partial && (
              <span className="text-amber-600">⚠ Partial comparison data</span>
            )}
            {overviewData.meta.notes.length > 0 && (
              <span>Notes: {overviewData.meta.notes.join(', ')}</span>
            )}
          </div>
        </div>
      )} */}
    </div>
  );
};

export default AnalyticsSection;
