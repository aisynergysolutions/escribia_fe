import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { KPI } from '@/context/AnalyticsContext';

interface KPICardProps {
  title: string;
  kpi: KPI;
  icon?: React.ReactNode;
  formatter?: (value: number) => string;
  className?: string;
}

const defaultFormatter = (value: number): string => {
  return value.toLocaleString();
};

const formatPercentage = (value: number): string => {
  return `${(value * 100).toFixed(2)}%`;
};

const KPICard: React.FC<KPICardProps> = ({ 
  title, 
  kpi, 
  icon, 
  formatter = defaultFormatter,
  className = "" 
}) => {
  const getDeltaIcon = () => {
    if (kpi.delta === undefined || kpi.delta === 0) {
      return <Minus className="h-4 w-4 text-gray-400" />;
    }
    return kpi.delta > 0 
      ? <TrendingUp className="h-4 w-4 text-green-500" />
      : <TrendingDown className="h-4 w-4 text-red-500" />;
  };

  const getDeltaColor = () => {
    if (kpi.delta === undefined || kpi.delta === 0) return 'text-gray-500';
    return kpi.delta > 0 ? 'text-green-600' : 'text-red-600';
  };

  const formatDelta = () => {
    if (kpi.delta === undefined) return null;
    const sign = kpi.delta > 0 ? '+' : '';
    return `${sign}${formatter(kpi.delta)}`;
  };

  const formatDeltaPct = () => {
    if (kpi.deltaPct === undefined || kpi.deltaPct === null) return null;
    const sign = kpi.deltaPct > 0 ? '+' : '';
    return `(${sign}${kpi.deltaPct.toFixed(1)}%)`;
  };

  return (
    <div className={`bg-white p-6 rounded-2xl shadow-md ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium text-gray-600">{title}</h3>
        {icon && <div className="text-gray-400">{icon}</div>}
      </div>
      
      <div className="flex items-end gap-2 mb-2">
        <span className="text-2xl font-bold text-gray-900">
          {formatter(kpi.value)}
        </span>
        {kpi.insufficientSample && (
          <span className="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded-full">
            Low Sample
          </span>
        )}
      </div>

      {(kpi.delta !== undefined || kpi.deltaPct !== undefined) && (
        <div className="flex items-center gap-1">
          {getDeltaIcon()}
          <span className={`text-sm ${getDeltaColor()}`}>
            {formatDelta()}
            {formatDeltaPct() && (
              <span className="ml-1 text-gray-500">
                {formatDeltaPct()}
              </span>
            )}
          </span>
        </div>
      )}
    </div>
  );
};

// Predefined formatters for common KPI types
export const formatters = {
  default: defaultFormatter,
  percentage: formatPercentage,
  currency: (value: number) => `$${value.toLocaleString()}`,
  compact: (value: number) => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}K`;
    }
    return value.toString();
  }
};

export default KPICard;
