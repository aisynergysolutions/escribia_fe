
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
    fetchOverview,
    fetchTimeSeries,
    clearData
  } = useAnalytics();

  const [selectedGranularity, setSelectedGranularity] = useState<'day' | 'week'>('day');
  const [dateRange, setDateRange] = useState<{ start: Date; end: Date } | null>(null);
  const [selectedProfileIds, setSelectedProfileIds] = useState<string[]>([]);

  const client = mockClients.find(c => c.id === clientId);
  const agencyId = currentUser?.uid;

  // Load initial data
  useEffect(() => {
    if (agencyId && clientId) {
      loadAnalyticsData();
    }
    
    return () => {
      clearData();
    };
  }, [agencyId, clientId]);

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

  const loadAnalyticsData = async () => {
    if (!agencyId || !clientId) return;

    const filters = {
      ...(dateRange ? {
        start: dateRange.start.toISOString(),
        end: dateRange.end.toISOString(),
      } : {}),
      ...(selectedProfileIds.length > 0 ? {
        profileIds: selectedProfileIds,
      } : {}),
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

  const handleRefresh = () => {
    if (agencyId && clientId) {
      const filters = {
        ...(dateRange ? {
          start: dateRange.start.toISOString(),
          end: dateRange.end.toISOString(),
        } : {}),
        ...(selectedProfileIds.length > 0 ? {
          profileIds: selectedProfileIds,
        } : {}),
        forceRefresh: true,
      };
      
      fetchOverview(agencyId, clientId, filters);
    }
  };

  const handleDateRangeChange = (start: Date, end: Date) => {
    setDateRange({ start, end });
  };

  const handleProfileSelectionChange = (profileIds: string[]) => {
    setSelectedProfileIds(profileIds);
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
            <p className="text-gray-600">
              Performance metrics for {client?.clientName || 'Unknown Client'}
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <DateRangePicker onRangeChange={handleDateRangeChange} />
            <Button
              onClick={handleRefresh}
              variant="outline"
              size="sm"
              disabled={overviewLoading}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${overviewLoading ? 'animate-spin' : ''}`} />
              {overviewLoading ? 'Loading...' : 'Refresh'}
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
      {overviewData?.meta && (
        <div className="bg-gray-50 p-4 rounded-lg text-xs text-gray-600">
          <div className="flex flex-wrap gap-4">
            <span>Version: {overviewData.meta.version}</span>
            <span>Request ID: {overviewData.meta.requestId}</span>
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
      )}
    </div>
  );
};

export default AnalyticsSection;
