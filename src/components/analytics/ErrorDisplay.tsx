import React, { useState } from 'react';
import { AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProfileError } from '@/context/AnalyticsContext';

interface ErrorDisplayProps {
  errors: ProfileError[];
  className?: string;
}

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ errors, className = '' }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!errors || errors.length === 0) {
    return null;
  }

  return (
    <div className={`bg-amber-50 border border-amber-200 rounded-lg p-4 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          <span className="text-sm font-medium text-amber-800">
            {errors.length} profile{errors.length > 1 ? 's' : ''} had issues
          </span>
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

      {isExpanded && (
        <div className="mt-3 space-y-2">
          {errors.map((error, index) => (
            <div key={index} className="bg-white rounded p-3 border border-amber-200">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Profile: {error.profileId}
                  </p>
                  <p className="text-sm text-gray-600">
                    Endpoint: {error.endpoint}
                  </p>
                  <p className="text-sm text-red-600">
                    {error.message}
                  </p>
                </div>
                <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
                  {error.code}
                </span>
              </div>
              {error.detail && (
                <p className="text-xs text-gray-500 mt-2">
                  {error.detail}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ErrorDisplay;
