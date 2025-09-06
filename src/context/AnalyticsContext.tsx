import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

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

// Storage key for persisting state
const ANALYTICS_STATE_KEY = 'analytics_client_state';

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

    // New methods for improved analytics handling
    shouldAutoForceRefresh: () => boolean;
    getDataAge: () => number | null;
    getRefreshRecommendation: () => 'fresh' | 'normal' | 'stale' | 'very_stale' | 'none';
    hasRateLimitErrors: (meta?: AnalyticsMeta) => boolean;
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
    shouldAutoForceRefresh: () => false,
    getDataAge: () => null,
    getRefreshRecommendation: () => 'none',
    hasRateLimitErrors: () => false,
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

    // Initialize client state from session storage or defaults
    const [clientState, setClientState] = useState<AnalyticsClientState>(() => {
        try {
            const stored = sessionStorage.getItem(ANALYTICS_STATE_KEY);
            if (stored) {
                const parsed = JSON.parse(stored);
                return {
                    lastOverviewAt: parsed.lastOverviewAt || null,
                    lastForceAt: parsed.lastForceAt || null,
                    lastRateLimitAt: parsed.lastRateLimitAt || null,
                    lastSuccessfulOverview: parsed.lastSuccessfulOverview || null,
                };
            }
        } catch (error) {
            console.warn('[AnalyticsContext] Failed to load state from session storage:', error);
        }
        return {
            lastOverviewAt: null,
            lastForceAt: null,
            lastRateLimitAt: null,
            lastSuccessfulOverview: null,
        };
    });

    // Persist client state to session storage
    useEffect(() => {
        try {
            sessionStorage.setItem(ANALYTICS_STATE_KEY, JSON.stringify(clientState));
        } catch (error) {
            console.warn('[AnalyticsContext] Failed to persist state to session storage:', error);
        }
    }, [clientState]);

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

    // Helper functions for improved analytics handling according to analytics.md
    const getDataAge = (): number | null => {
        return clientState.lastOverviewAt ? Date.now() - clientState.lastOverviewAt : null;
    };

    const getRefreshRecommendation = (): 'fresh' | 'normal' | 'stale' | 'very_stale' | 'none' => {
        const age = getDataAge();
        if (!age) return 'none';

        if (age < 2 * 60 * 1000) return 'fresh'; // < 2 minutes
        if (age < 12 * 60 * 1000) return 'normal'; // < 12 minutes
        if (age < 30 * 60 * 1000) return 'stale'; // < 30 minutes
        return 'very_stale'; // >= 30 minutes
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
    const hasRateLimitErrors = (meta?: AnalyticsMeta): boolean => {
        if (!meta) return false;
        return meta.errors.some(error => error.code === 429 || error.code === '429');
    };

    // Determine if we should force refresh based on data age - following analytics.md guidelines
    const shouldAutoForceRefresh = (): boolean => {
        if (!clientState.lastOverviewAt) return false;

        const age = getDataAge();
        if (!age) return false;

        // Auto force refresh if data is older than 30 minutes and no recent rate limits
        // This follows the analytics.md recommendation for staleness
        return age > 30 * 60 * 1000 && !hasRecentRateLimit();
    };

    // Smart fetch with freshness policy according to analytics.md
    const fetchOverviewSmart = useCallback(async (
        agencyId: string,
        clientId: string,
        filters: AnalyticsFilters = {},
        skipFreshnessCheck = false
    ) => {
        // If skipFreshnessCheck is true, always fetch (used for explicit refresh)
        if (!skipFreshnessCheck) {
            // Check data age directly to avoid dependency issues
            const currentState = JSON.parse(sessionStorage.getItem(ANALYTICS_STATE_KEY) || '{}');
            const age = currentState.lastOverviewAt ? Date.now() - currentState.lastOverviewAt : null;

            let recommendation = 'none';
            if (age) {
                if (age < 2 * 60 * 1000) recommendation = 'fresh';
                else if (age < 12 * 60 * 1000) recommendation = 'normal';
                else if (age < 30 * 60 * 1000) recommendation = 'stale';
                else recommendation = 'very_stale';
            }

            // Check for recent rate limits
            const lastRateLimit = currentState.lastRateLimitAt;
            const hasRecentRateLimit = lastRateLimit ? Date.now() - lastRateLimit < 60000 : false;

            // Skip if data is fresh (< 2 minutes) unless forced
            if (recommendation === 'fresh' && !filters.forceRefresh) {
                console.log('[AnalyticsContext] Skipping fetch - data is fresh');
                return;
            }

            // For normal age (2-12 minutes), do normal fetch without force
            if (recommendation === 'normal') {
                filters = { ...filters, forceRefresh: false };
            }

            // For stale data (12-30 minutes), schedule background force refresh if no recent rate limits
            if (recommendation === 'stale' && !hasRecentRateLimit && !filters.forceRefresh) {
                // Do normal fetch first, then schedule force refresh
                setTimeout(() => {
                    const updatedState = JSON.parse(sessionStorage.getItem(ANALYTICS_STATE_KEY) || '{}');
                    const updatedLastRateLimit = updatedState.lastRateLimitAt;
                    const stillHasRecentRateLimit = updatedLastRateLimit ? Date.now() - updatedLastRateLimit < 60000 : false;

                    if (!stillHasRecentRateLimit) {
                        fetchOverviewSmart(agencyId, clientId, { ...filters, forceRefresh: true }, true);
                    }
                }, 1000);
            }

            // For very stale data (> 30 minutes), suggest force refresh but don't auto-force
            if (recommendation === 'very_stale' && !filters.forceRefresh) {
                console.log('[AnalyticsContext] Data is very stale - consider using forceRefresh');
            }
        }

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

            // Check for rate limit errors
            const hasRateLimitErrorsInResponse = data.meta.errors.some(error => error.code === 429 || error.code === '429');

            // Update client state tracking
            const now = Date.now();
            setClientState(prev => ({
                ...prev,
                lastOverviewAt: now,
                lastSuccessfulOverview: data,
                ...(filters.forceRefresh ? { lastForceAt: now } : {}),
                ...(hasRateLimitErrorsInResponse ? { lastRateLimitAt: now } : {}),
            }));

            setOverviewData(data);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to fetch overview data';
            setOverviewError(errorMessage);
            console.error('[AnalyticsContext] Overview fetch error:', error);
        } finally {
            setOverviewLoading(false);
        }
    }, []); // Remove dependencies to prevent infinite loops

    // Legacy fetchOverview for backward compatibility
    const fetchOverview = useCallback(async (agencyId: string, clientId: string, filters: AnalyticsFilters = {}) => {
        return fetchOverviewSmart(agencyId, clientId, filters, true);
    }, [fetchOverviewSmart]);

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

        // Clear session storage as well
        try {
            sessionStorage.removeItem(ANALYTICS_STATE_KEY);
        } catch (error) {
            console.warn('[AnalyticsContext] Failed to clear session storage:', error);
        }
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
        shouldAutoForceRefresh,
        getDataAge,
        getRefreshRecommendation,
        hasRateLimitErrors,
    };

    return (
        <AnalyticsContext.Provider value={value}>
            {children}
        </AnalyticsContext.Provider>
    );
};
