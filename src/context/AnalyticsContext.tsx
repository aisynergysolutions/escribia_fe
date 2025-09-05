import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';

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
    code: number | string; // Can be numeric or string like 'timeout'
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

// Client-side state tracking as per analytics.md recommendations
export interface AnalyticsClientState {
    lastOverviewAt: number | null;
    lastForceAt: number | null;
    lastRateLimitAt: number | null;
    lastSuccessfulOverview: OverviewResponse | null;
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

    // Client state tracking
    clientState: AnalyticsClientState;

    // Actions
    fetchOverview: (agencyId: string, clientId: string, filters?: AnalyticsFilters) => Promise<void>;
    fetchTimeSeries: (agencyId: string, clientId: string, filters: TimeSeriesFilters) => Promise<void>;
    forceRefreshAll: (agencyId: string, clientId: string, filters?: AnalyticsFilters) => Promise<void>;
    clearData: () => void;
    canForceRefresh: () => boolean;
    hasRecentRateLimit: () => boolean;
};

const BASE_URL = 'https://web-production-2fc1.up.railway.app/api/v1/analytics';

const AnalyticsContext = createContext<AnalyticsContextType>({
    overviewData: null,
    overviewLoading: false,
    overviewError: null,
    timeSeriesData: {},
    timeSeriesLoading: {},
    timeSeriesError: {},
    clientState: {
        lastOverviewAt: null,
        lastForceAt: null,
        lastRateLimitAt: null,
        lastSuccessfulOverview: null,
    },
    fetchOverview: async () => { },
    fetchTimeSeries: async () => { },
    forceRefreshAll: async () => { },
    clearData: () => { },
    canForceRefresh: () => true,
    hasRecentRateLimit: () => false,
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

    // Client-side state tracking as per analytics.md
    const [clientState, setClientState] = useState<AnalyticsClientState>({
        lastOverviewAt: null,
        lastForceAt: null,
        lastRateLimitAt: null,
        lastSuccessfulOverview: null,
    });

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

    // Helper functions for rate limit and refresh management
    const canForceRefresh = (): boolean => {
        const now = Date.now();
        const lastForce = clientState.lastForceAt;
        const lastRateLimit = clientState.lastRateLimitAt;

        // Don't allow force refresh if we just did one within 5 seconds
        if (lastForce && now - lastForce < 5000) {
            return false;
        }

        // Don't allow force refresh if we had a rate limit within 60 seconds
        if (lastRateLimit && now - lastRateLimit < 60000) {
            return false;
        }

        return true;
    };

    const hasRecentRateLimit = (): boolean => {
        const now = Date.now();
        const lastRateLimit = clientState.lastRateLimitAt;
        return lastRateLimit ? now - lastRateLimit < 60000 : false;
    };

    // Check if response has rate limit errors (429s)
    const hasRateLimitErrors = (meta: AnalyticsMeta): boolean => {
        return meta.errors.some(error => error.code === 429 || error.code === '429');
    };

    // Determine if we should force refresh based on data age
    const shouldAutoForceRefresh = (): boolean => {
        if (!clientState.lastOverviewAt) return false;

        const age = Date.now() - clientState.lastOverviewAt;
        // Auto force refresh if data is older than 30 minutes and no recent rate limits
        return age > 30 * 60 * 1000 && !hasRecentRateLimit();
    };

    const fetchOverview = useCallback(async (agencyId: string, clientId: string, filters: AnalyticsFilters = {}) => {
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

            // Update client state tracking
            const now = Date.now();
            setClientState(prev => ({
                ...prev,
                lastOverviewAt: now,
                lastSuccessfulOverview: data,
                ...(filters.forceRefresh ? { lastForceAt: now } : {}),
                ...(hasRateLimitErrors(data.meta) ? { lastRateLimitAt: now } : {}),
            }));

            setOverviewData(data);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to fetch overview data';
            setOverviewError(errorMessage);
            console.error('[AnalyticsContext] Overview fetch error:', error);
        } finally {
            setOverviewLoading(false);
        }
    }, []);

    const fetchTimeSeries = useCallback(async (agencyId: string, clientId: string, filters: TimeSeriesFilters) => {
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

            // Update rate limit tracking if applicable
            if (hasRateLimitErrors(data.meta)) {
                setClientState(prev => ({ ...prev, lastRateLimitAt: Date.now() }));
            }

            setTimeSeriesData(prev => ({ ...prev, [cacheKey]: data }));
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to fetch time series data';
            setTimeSeriesError(prev => ({ ...prev, [cacheKey]: errorMessage }));
            console.error('[AnalyticsContext] Time series fetch error:', error);
        } finally {
            setTimeSeriesLoading(prev => ({ ...prev, [cacheKey]: false }));
        }
    }, [timeSeriesData]);

    // Force refresh both overview and all visible time series data
    const forceRefreshAll = useCallback(async (agencyId: string, clientId: string, filters: AnalyticsFilters = {}) => {
        if (!canForceRefresh()) {
            console.warn('[AnalyticsContext] Force refresh blocked due to recent refresh or rate limit');
            return;
        }

        const forceFilters = { ...filters, forceRefresh: true };

        // Force refresh overview
        await fetchOverview(agencyId, clientId, forceFilters);

        // Force refresh all currently loaded time series data
        const timeSeriesKeys = Object.keys(timeSeriesData);
        for (const key of timeSeriesKeys) {
            const [metric, granularity] = key.split('_') as [string, 'day' | 'week'];
            await fetchTimeSeries(agencyId, clientId, {
                ...forceFilters,
                metric: metric as any,
                granularity,
            });
        }
    }, [fetchOverview, fetchTimeSeries, timeSeriesData, canForceRefresh]);

    const clearData = () => {
        setOverviewData(null);
        setOverviewError(null);
        setTimeSeriesData({});
        setTimeSeriesError({});
        setClientState({
            lastOverviewAt: null,
            lastForceAt: null,
            lastRateLimitAt: null,
            lastSuccessfulOverview: null,
        });
    };

    const value: AnalyticsContextType = {
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
    };

    return (
        <AnalyticsContext.Provider value={value}>
            {children}
        </AnalyticsContext.Provider>
    );
};
