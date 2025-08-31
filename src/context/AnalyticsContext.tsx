import React, { createContext, useContext, useState, ReactNode } from 'react';

// Types based on the analytics endpoints documentation
export interface KPI {
  value: number;
  delta?: number;
  deltaPct?: number;
  insufficientSample?: boolean;
}

export interface OverviewKPIs {
  posts_published?: KPI;
  followers?: KPI;
  impressions?: KPI;
  engagement_rate?: KPI;
}

export interface TimeSeriesPoint {
  t: string; // Date string
  value: number;
  numerator?: number; // For engagement_rate
  denominator?: number; // For engagement_rate
  insufficientSample?: boolean;
}

export interface ProfileError {
  profileId: string;
  endpoint: string;
  code: number;
  message: string;
  detail?: string;
}

export interface LogEntry {
  profileId: string;
  type?: string;
  endpoint: string;
  ms: number;
  code: number;
  cache: boolean;
}

export interface AnalyticsMeta {
  version: string;
  notes: string[];
  partial?: boolean;
  errors: ProfileError[];
  requestId: string;
  logs: LogEntry[];
}

export interface OverviewResponse {
  kpis: OverviewKPIs;
  meta: AnalyticsMeta;
}

export interface TimeSeriesResponse {
  metric: string;
  granularity: string;
  series: TimeSeriesPoint[];
  compareTo: {
    partial: boolean;
  };
  meta: AnalyticsMeta;
}

export interface AnalyticsFilters {
  start?: string; // ISO datetime
  end?: string; // ISO datetime
  tz?: string; // IANA timezone
  profileIds?: string[];
  include?: string[]; // Subset of posts,followers,impressions,engagement_rate
  forceRefresh?: boolean;
}

export interface TimeSeriesFilters extends AnalyticsFilters {
  metric: 'followers' | 'follower_gains' | 'impressions' | 'engagement_rate' | 'publishing_cadence';
  granularity: 'day' | 'week';
}

type AnalyticsContextType = {
  // Overview data
  overviewData: OverviewResponse | null;
  overviewLoading: boolean;
  overviewError: string | null;
  
  // Time series data
  timeSeriesData: { [key: string]: TimeSeriesResponse };
  timeSeriesLoading: { [key: string]: boolean };
  timeSeriesError: { [key: string]: string | null };
  
  // Actions
  fetchOverview: (agencyId: string, clientId: string, filters?: AnalyticsFilters) => Promise<void>;
  fetchTimeSeries: (agencyId: string, clientId: string, filters: TimeSeriesFilters) => Promise<void>;
  clearData: () => void;
};

const BASE_URL = 'https://web-production-2fc1.up.railway.app/api/v1/analytics';

const AnalyticsContext = createContext<AnalyticsContextType>({
  overviewData: null,
  overviewLoading: false,
  overviewError: null,
  timeSeriesData: {},
  timeSeriesLoading: {},
  timeSeriesError: {},
  fetchOverview: async () => {},
  fetchTimeSeries: async () => {},
  clearData: () => {},
});

export const useAnalytics = () => {
  const context = useContext(AnalyticsContext);
  if (!context) {
    throw new Error('useAnalytics must be used within an AnalyticsProvider');
  }
  return context;
};

export const AnalyticsProvider = ({ children }: { children: ReactNode }) => {
  const [overviewData, setOverviewData] = useState<OverviewResponse | null>(null);
  const [overviewLoading, setOverviewLoading] = useState(false);
  const [overviewError, setOverviewError] = useState<string | null>(null);
  
  const [timeSeriesData, setTimeSeriesData] = useState<{ [key: string]: TimeSeriesResponse }>({});
  const [timeSeriesLoading, setTimeSeriesLoading] = useState<{ [key: string]: boolean }>({});
  const [timeSeriesError, setTimeSeriesError] = useState<{ [key: string]: string | null }>({});

  const buildQueryParams = (params: Record<string, any>): string => {
    const searchParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          value.forEach(item => {
            searchParams.append(`${key}[]`, item);
          });
        } else {
          searchParams.append(key, value.toString());
        }
      }
    });
    
    return searchParams.toString();
  };

  const fetchOverview = async (agencyId: string, clientId: string, filters: AnalyticsFilters = {}) => {
    setOverviewLoading(true);
    setOverviewError(null);

    try {
      const params = {
        agency_id: agencyId,
        client_id: clientId,
        ...filters,
        profile_ids: filters.profileIds, // Will be handled by buildQueryParams for array
        include: filters.include?.join(','),
      };

      const queryString = buildQueryParams(params);
      const response = await fetch(`${BASE_URL}/overview?${queryString}`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data: OverviewResponse = await response.json();
      setOverviewData(data);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch overview data';
      setOverviewError(errorMessage);
      console.error('[AnalyticsContext] Overview fetch error:', error);
    } finally {
      setOverviewLoading(false);
    }
  };

  const fetchTimeSeries = async (agencyId: string, clientId: string, filters: TimeSeriesFilters) => {
    const cacheKey = `${filters.metric}_${filters.granularity}`;
    
    setTimeSeriesLoading(prev => ({ ...prev, [cacheKey]: true }));
    setTimeSeriesError(prev => ({ ...prev, [cacheKey]: null }));

    try {
      const params = {
        agency_id: agencyId,
        client_id: clientId,
        metric: filters.metric,
        granularity: filters.granularity,
        start: filters.start,
        end: filters.end,
        tz: filters.tz,
        profile_ids: filters.profileIds,
        forceRefresh: filters.forceRefresh,
      };

      const queryString = buildQueryParams(params);
      const response = await fetch(`${BASE_URL}/timeseries?${queryString}`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data: TimeSeriesResponse = await response.json();
      setTimeSeriesData(prev => ({ ...prev, [cacheKey]: data }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch time series data';
      setTimeSeriesError(prev => ({ ...prev, [cacheKey]: errorMessage }));
      console.error('[AnalyticsContext] Time series fetch error:', error);
    } finally {
      setTimeSeriesLoading(prev => ({ ...prev, [cacheKey]: false }));
    }
  };

  const clearData = () => {
    setOverviewData(null);
    setOverviewError(null);
    setTimeSeriesData({});
    setTimeSeriesError({});
  };

  const value: AnalyticsContextType = {
    overviewData,
    overviewLoading,
    overviewError,
    timeSeriesData,
    timeSeriesLoading,
    timeSeriesError,
    fetchOverview,
    fetchTimeSeries,
    clearData,
  };

  return (
    <AnalyticsContext.Provider value={value}>
      {children}
    </AnalyticsContext.Provider>
  );
};
