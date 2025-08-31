import React from 'react';
import { TrendingUp, BarChart3, FileText, Calendar } from 'lucide-react';

interface NoDataDisplayProps {
  title?: string;
  message?: string;
  icon?: React.ReactNode;
  className?: string;
}

export const NoDataDisplay: React.FC<NoDataDisplayProps> = ({ 
  title = "No Data Available",
  message = "There's no data to display for the selected time period.",
  icon,
  className = ""
}) => (
  <div className={`flex flex-col items-center justify-center py-12 text-center ${className}`}>
    <div className="text-gray-300 mb-4">
      {icon || <BarChart3 className="h-16 w-16" />}
    </div>
    <h3 className="text-lg font-medium text-gray-600 mb-2">{title}</h3>
    <p className="text-gray-500 max-w-md">{message}</p>
  </div>
);

export const NoKPIData: React.FC = () => (
  <div className="bg-white p-6 rounded-2xl shadow-md">
    <NoDataDisplay
      title="No KPIs Available"
      message="No key performance indicators are available for the selected time period."
      icon={<TrendingUp className="h-12 w-12" />}
    />
  </div>
);

export const NoChartData: React.FC<{ metric?: string }> = ({ metric = "data" }) => (
  <div className="h-64 bg-gray-50 rounded-lg">
    <NoDataDisplay
      title={`No ${metric} Data`}
      message={`No ${metric} data is available for the selected time period.`}
      icon={<BarChart3 className="h-12 w-12" />}
      className="h-full"
    />
  </div>
);

export const AnalyticsNoData: React.FC = () => (
  <div className="space-y-6">
    {/* Header with message */}
    <div className="bg-white p-6 rounded-2xl shadow-md">
      <NoDataDisplay
        title="No Analytics Data Available"
        message="There's no analytics data available for this client in the selected time period. Try selecting a different date range or check back later."
        icon={<Calendar className="h-16 w-16" />}
      />
    </div>
  </div>
);
