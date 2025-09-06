import React, { useEffect, useCallback, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, AlertTriangle, TrendingUp } from 'lucide-react';
import { useAnalytics } from '../../context/AnalyticsContext';

/**
 * Example component showing best practices for using the Analytics Context
 * following the guidelines from analytics.md
 */
interface AnalyticsUsageExampleProps {
    agencyId: string;
    clientId: string;
}

const AnalyticsUsageExample: React.FC<AnalyticsUsageExampleProps> = ({
    agencyId,
    clientId
}) => {
    const [isRefreshing, setIsRefreshing] = useState(false);

    const {
        overviewData,
        overviewLoading,
        overviewError,
        fetchOverview,
        forceRefreshAll,
        canForceRefresh,
        hasRecentRateLimit,
        getDataAge,
        getRefreshRecommendation,
        hasRateLimitErrors,
        clientState
    } = useAnalytics();

    // Initial load following analytics.md freshness policy
    useEffect(() => {
        if (!agencyId || !clientId) return;

        // Use smart fetching - the context will handle freshness policy
        fetchOverview(agencyId, clientId, {
            include: ['posts', 'followers', 'impressions', 'engagement_rate']
        });
    }, [agencyId, clientId, fetchOverview]);

    // Handle explicit user refresh
    const handleExplicitRefresh = useCallback(async () => {
        if (!canForceRefresh() || isRefreshing) {
            console.log('[Analytics] Refresh blocked - recent refresh or rate limit');
            return;
        }

        setIsRefreshing(true);
        try {
            // Use forceRefreshAll for explicit user action
            await forceRefreshAll(agencyId, clientId, {
                include: ['posts', 'followers', 'impressions', 'engagement_rate']
            });
        } catch (error) {
            console.error('[Analytics] Force refresh failed:', error);
        } finally {
            setIsRefreshing(false);
        }
    }, [agencyId, clientId, forceRefreshAll, canForceRefresh, isRefreshing]);

    // Helper to get user-friendly freshness display
    const getFreshnessDisplay = () => {
        const age = getDataAge();
        if (!age) return 'No data';

        const minutes = Math.floor(age / (1000 * 60));
        if (minutes < 2) return 'Just now';
        if (minutes < 60) return `${minutes}m ago`;

        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours}h ago`;

        const days = Math.floor(hours / 24);
        return `${days}d ago`;
    };

    // Determine refresh button state and message
    const getRefreshButtonState = () => {
        if (isRefreshing) return { disabled: true, text: 'Refreshing...', variant: 'default' as const };
        if (!canForceRefresh()) return { disabled: true, text: 'Cooling down...', variant: 'secondary' as const };
        if (hasRecentRateLimit()) return { disabled: true, text: 'Rate limited', variant: 'destructive' as const };

        const recommendation = getRefreshRecommendation();
        if (recommendation === 'fresh') return { disabled: false, text: 'Refresh (unnecessary)', variant: 'secondary' as const };
        if (recommendation === 'very_stale') return { disabled: false, text: 'Refresh (recommended)', variant: 'default' as const };

        return { disabled: false, text: 'Refresh', variant: 'outline' as const };
    };

    const refreshButtonState = getRefreshButtonState();

    return (
        <div className="p-6 bg-white rounded-lg shadow">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Analytics Data</h3>

                <div className="flex items-center gap-2">
                    {/* Data freshness indicator */}
                    {overviewData && (
                        <Badge variant="secondary" className="text-xs">
                            {getFreshnessDisplay()}
                        </Badge>
                    )}

                    {/* Rate limit indicator */}
                    {overviewData?.meta && hasRateLimitErrors(overviewData.meta) && (
                        <Badge variant="destructive" className="text-xs flex items-center gap-1">
                            <AlertTriangle className="h-3 w-3" />
                            Rate Limited
                        </Badge>
                    )}

                    {/* Refresh button following analytics.md guidelines */}
                    <Button
                        variant={refreshButtonState.variant}
                        size="sm"
                        onClick={handleExplicitRefresh}
                        disabled={refreshButtonState.disabled}
                        className="flex items-center gap-2"
                    >
                        <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                        {refreshButtonState.text}
                    </Button>
                </div>
            </div>

            {/* Rate limit warning as per analytics.md */}
            {hasRecentRateLimit() && (
                <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-yellow-700 text-sm">
                        <span className="font-medium">LinkedIn rate limit reached.</span>
                        {' '}Retry in a few minutes to avoid further limits.
                    </p>
                </div>
            )}

            {/* Content based on state */}
            {overviewLoading ? (
                <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                    <span className="ml-2 text-gray-600">Loading analytics...</span>
                </div>
            ) : overviewError ? (
                <div className="text-center py-8">
                    <p className="text-red-600 mb-2">Failed to load analytics</p>
                    <p className="text-sm text-gray-500 mb-4">{overviewError}</p>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => fetchOverview(agencyId, clientId, {
                            include: ['posts', 'followers', 'impressions', 'engagement_rate']
                        })}
                    >
                        Try Again
                    </Button>
                </div>
            ) : overviewData ? (
                <div className="space-y-4">
                    {/* Example KPI display */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-gray-50 rounded-lg">
                            <div className="flex items-center gap-2">
                                <TrendingUp className="h-4 w-4 text-green-600" />
                                <span className="text-sm font-medium">Posts Published</span>
                            </div>
                            <p className="text-2xl font-bold mt-1">
                                {overviewData.kpis.posts_published?.value || 0}
                            </p>
                            {overviewData.kpis.posts_published?.deltaPct && (
                                <p className="text-xs text-gray-500">
                                    {overviewData.kpis.posts_published.deltaPct > 0 ? '+' : ''}
                                    {overviewData.kpis.posts_published.deltaPct.toFixed(1)}% vs last period
                                </p>
                            )}
                        </div>

                        <div className="p-4 bg-gray-50 rounded-lg">
                            <div className="flex items-center gap-2">
                                <TrendingUp className="h-4 w-4 text-blue-600" />
                                <span className="text-sm font-medium">Engagement Rate</span>
                            </div>
                            <p className="text-2xl font-bold mt-1">
                                {overviewData.kpis.engagement_rate?.value
                                    ? `${(overviewData.kpis.engagement_rate.value * 100).toFixed(1)}%`
                                    : '—'
                                }
                            </p>
                            {overviewData.kpis.engagement_rate?.insufficientSample && (
                                <p className="text-xs text-amber-600">Low sample size</p>
                            )}
                        </div>
                    </div>

                    {/* Error details for debugging (optional) */}
                    {overviewData.meta.errors.length > 0 && (
                        <details className="mt-4">
                            <summary className="text-sm text-gray-600 cursor-pointer">
                                Debug Info ({overviewData.meta.errors.length} errors)
                            </summary>
                            <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto">
                                {JSON.stringify(overviewData.meta.errors, null, 2)}
                            </pre>
                        </details>
                    )}
                </div>
            ) : (
                <div className="text-center py-8 text-gray-500">
                    No analytics data available
                </div>
            )}
        </div>
    );
};

export default AnalyticsUsageExample;

/**
 * USAGE BEST PRACTICES (based on analytics.md):
 * 
 * 1. INITIAL LOAD:
 *    - Use normal fetchOverview() on mount - context handles freshness policy
 *    - Don't use forceRefresh=true unless explicitly requested by user
 * 
 * 2. FORCE REFRESH:
 *    - Only use forceRefreshAll() for explicit user refresh button clicks
 *    - Always check canForceRefresh() before attempting
 *    - Show appropriate disabled states and cooldown messages
 * 
 * 3. RATE LIMIT HANDLING:
 *    - Check hasRecentRateLimit() to show warnings
 *    - Use hasRateLimitErrors() to detect 429s in response
 *    - Show non-blocking warnings, don't block the UI
 * 
 * 4. FRESHNESS MANAGEMENT:
 *    - Use getDataAge() and getRefreshRecommendation() for UI hints
 *    - Show data age badges and refresh recommendations
 *    - Fresh data (< 2min): gray out refresh button
 *    - Stale data (> 30min): highlight refresh button
 * 
 * 5. ERROR HANDLING:
 *    - Preserve previous data on errors when possible
 *    - Show specific error messages for different failure types
 *    - Provide retry mechanisms for transient failures
 * 
 * 6. STATE PERSISTENCE:
 *    - Context automatically handles session storage
 *    - Data persists across page navigations
 *    - Automatic cleanup on clearData()
 */
