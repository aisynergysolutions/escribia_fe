import React from 'react';
import {
    LineChart,
    Line,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    TooltipProps
} from 'recharts';
import { TimeSeriesPoint } from '@/context/AnalyticsContext';
import { format, parseISO } from 'date-fns';

interface AnalyticsChartProps {
    data: TimeSeriesPoint[];
    metric: string;
    granularity: 'day' | 'week';
    type?: 'line' | 'bar';
    color?: string;
    className?: string;
}

const formatValue = (value: number, metric: string): string => {
    switch (metric) {
        case 'engagement_rate':
            return `${(value * 100).toFixed(2)}%`;
        case 'followers':
        case 'follower_gains':
        case 'impressions':
            return value.toLocaleString();
        case 'publishing_cadence':
            return `${value} posts`;
        default:
            return value.toLocaleString();
    }
};

const formatDate = (dateStr: string, granularity: 'day' | 'week'): string => {
    const date = parseISO(dateStr);
    if (granularity === 'week') {
        return format(date, 'MMM dd');
    }
    return format(date, 'MMM dd');
};

const CustomTooltip: React.FC<TooltipProps<number, string> & { metric: string }> = ({
    active,
    payload,
    label,
    metric
}) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload as TimeSeriesPoint;

        return (
            <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
                <p className="text-sm text-gray-600 mb-1">{label}</p>
                <p className="text-sm font-semibold">
                    {formatValue(data.value, metric)}
                </p>
                {data.insufficientSample && (
                    <p className="text-xs text-amber-600 mt-1">
                        Data may be unreliable
                    </p>
                )}
                {data.numerator !== undefined && data.denominator !== undefined && (
                    <p className="text-xs text-gray-500 mt-1">
                        {data.numerator} / {data.denominator.toLocaleString()}
                    </p>
                )}
            </div>
        );
    }
    return null;
};

const AnalyticsChart: React.FC<AnalyticsChartProps> = ({
    data,
    metric,
    granularity,
    type = 'line',
    color = '#3b82f6',
    className = ''
}) => {
    // Transform data for chart
    const chartData = data.map(point => ({
        ...point,
        formattedDate: formatDate(point.t, granularity),
        displayValue: point.value
    }));

    const commonProps = {
        data: chartData,
        margin: { top: 5, right: 30, left: 20, bottom: 5 }
    };

    const renderChart = () => {
        if (type === 'bar') {
            return (
                <BarChart {...commonProps}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis
                        dataKey="formattedDate"
                        tick={{ fontSize: 12 }}
                        stroke="#666"
                    />
                    <YAxis
                        tick={{ fontSize: 12 }}
                        stroke="#666"
                        tickFormatter={(value) => formatValue(value, metric)}
                        allowDecimals={false}

                    />
                    <Tooltip content={<CustomTooltip metric={metric} />} />
                    <Bar
                        dataKey="displayValue"
                        fill={color}
                        radius={[2, 2, 0, 0]}
                    />
                </BarChart>
            );
        }

        return (
            <LineChart {...commonProps}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                    dataKey="formattedDate"
                    tick={{ fontSize: 12 }}
                    stroke="#666"
                />
                <YAxis
                    tick={{ fontSize: 12 }}
                    stroke="#666"
                    tickFormatter={(value) => formatValue(value, metric)}
                />
                <Tooltip content={<CustomTooltip metric={metric} />} />
                <Line
                    type="monotone"
                    dataKey="displayValue"
                    stroke={color}
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 6, fill: color }}
                />
            </LineChart>
        );
    };

    return (
        <div className={`bg-white p-6 rounded-2xl shadow-md ${className}`}>
            <h3 className="text-lg font-semibold mb-4 capitalize">
                <span className="font-semibold">{metric.replace('_', ' ')}</span>
                <span className="ml-2 text-gray-500 font-normal text-base">
                    {granularity === 'day' ? 'Daily' : 'Weekly'}
                </span>
            </h3>
            <ResponsiveContainer width="100%" height={300}>
                {renderChart()}
            </ResponsiveContainer>
        </div>
    );
};

export default AnalyticsChart;
