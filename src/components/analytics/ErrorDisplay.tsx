import React, { useState } from 'react';
import { AlertTriangle, ChevronDown, ChevronUp, Clock, Shield, AlertCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProfileError } from '@/context/AnalyticsContext';

interface ErrorDisplayProps {
    errors: ProfileError[];
    className?: string;
}

const getErrorIcon = (code: number | string) => {
    if (code === 429 || code === '429') return <Clock className="h-4 w-4 text-amber-600" />;
    if (code === 'timeout') return <Clock className="h-4 w-4 text-blue-600" />;
    if (code === 401 || code === 403) return <Shield className="h-4 w-4 text-red-600" />;
    if (code === 404) return <X className="h-4 w-4 text-gray-600" />;
    return <AlertCircle className="h-4 w-4 text-orange-600" />;
};

const getErrorMessage = (error: ProfileError): string => {
    const code = error.code;

    if (code === 429 || code === '429') return 'LinkedIn rate limit reached';
    if (code === 'timeout') return 'LinkedIn response timeout - partial data shown';
    if (code === 401 || code === 403) return 'Please reconnect LinkedIn account';
    if (code === 404) return 'Profile not found or access lost';
    if (typeof code === 'number' && code >= 500) return 'LinkedIn temporary error';

    return error.message;
};

const getErrorSeverity = (code: number | string): 'high' | 'medium' | 'low' => {
    if (code === 429 || code === '429') return 'high';
    if (code === 401 || code === 403) return 'high';
    if (code === 'timeout') return 'medium';
    if (typeof code === 'number' && code >= 500) return 'medium';
    return 'low';
};

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ errors, className = '' }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    if (!errors || errors.length === 0) {
        return null;
    }

    // Group errors by severity
    const highSeverityErrors = errors.filter(e => getErrorSeverity(e.code) === 'high');
    const hasRateLimit = errors.some(e => e.code === 429 || e.code === '429');
    const hasAuthErrors = errors.some(e => e.code === 401 || e.code === 403);

    return (
        <div className={`bg-amber-50 border border-amber-200 rounded-lg px-4 py-1 ${className}`}>
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-amber-600" />
                    <div>
                        <span className="text-sm font-medium text-amber-800">
                            {errors.length} issues
                        </span>
                        {hasRateLimit && (
                            <span className="ml-2 text-xs bg-amber-200 text-amber-800 px-2 py-1 rounded">
                                Rate Limited
                            </span>
                        )}
                        {hasAuthErrors && (
                            <span className="ml-2 text-xs bg-red-200 text-red-800 px-2 py-1 rounded">
                                Auth Required
                            </span>
                        )}
                    </div>
                </div>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="text-amber-700 hover:text-amber-800"
                >
                    {isExpanded ? (
                        <ChevronUp className="h-4 w-4" />
                    ) : (
                        <ChevronDown className="h-4 w-4" />
                    )}
                </Button>
            </div>

            {/* Quick summary for high-severity errors */}
            {/* {highSeverityErrors.length > 0 && !isExpanded && (
                <div className="mt-2 text-sm text-amber-700">
                    {hasRateLimit && "LinkedIn rate limit reached. "}
                    {hasAuthErrors && "Some profiles need reconnection. "}
                    Click to view details.
                </div>
            )} */}

            {isExpanded && (
                <div className="mt-3 space-y-2">
                    {errors.map((error, index) => {
                        const severity = getErrorSeverity(error.code);
                        const bgColor = severity === 'high' ? 'bg-red-50 border-red-200'
                            : severity === 'medium' ? 'bg-orange-50 border-orange-200'
                                : 'bg-gray-50 border-gray-200';

                        return (
                            <div key={index} className={`rounded p-3 border ${bgColor}`}>
                                <div className="flex justify-between items-start">
                                    <div className="flex items-start gap-2">
                                        {getErrorIcon(error.code)}
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">
                                                Profile: {error.profileId}
                                            </p>
                                            <p className="text-sm text-gray-600">
                                                Endpoint: {error.endpoint}
                                            </p>
                                            <p className="text-sm text-gray-800 mt-1">
                                                {getErrorMessage(error)}
                                            </p>
                                        </div>
                                    </div>
                                    <span className={`text-xs px-2 py-1 rounded ${severity === 'high' ? 'bg-red-100 text-red-800'
                                            : severity === 'medium' ? 'bg-orange-100 text-orange-800'
                                                : 'bg-gray-100 text-gray-800'
                                        }`}>
                                        {error.code}
                                    </span>
                                </div>
                                {error.detail && (
                                    <p className="text-xs text-gray-500 mt-2 ml-6">
                                        {error.detail}
                                    </p>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default ErrorDisplay;
