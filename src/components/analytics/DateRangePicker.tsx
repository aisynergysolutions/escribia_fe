import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Calendar } from 'lucide-react';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';

interface DateRangePickerProps {
    onRangeChange: (start: Date, end: Date) => void;
    className?: string;
}

const DateRangePicker: React.FC<DateRangePickerProps> = ({ onRangeChange, className = '' }) => {
    const [selectedRange, setSelectedRange] = useState<string>('28_days');

    const presetRanges = [
        { label: 'Last 7 days', value: '7_days', days: 7 },
        { label: 'Last 14 days', value: '14_days', days: 14 },
        { label: 'Last 28 days', value: '28_days', days: 28 },
        { label: 'Last 90 days', value: '90_days', days: 90 },
    ];

    const handleRangeSelect = (range: string, days: number) => {
        setSelectedRange(range);
        const end = endOfDay(new Date());
        const start = startOfDay(subDays(end, days));
        onRangeChange(start, end);
    };

    const getCurrentRangeLabel = () => {
        const range = presetRanges.find(r => r.value === selectedRange);
        return range?.label || 'Last 28 days';
    };

    return (
        <div className={`flex items-center gap-2 ${className}`}>
            {/* <Calendar className="h-4 w-4 text-gray-500" /> */}
            <div className="flex gap-1">
                {presetRanges.map((range) => (
                    <Button
                        key={range.value}
                        variant={selectedRange === range.value ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => handleRangeSelect(range.value, range.days)}
                        className="text-xs"
                    >
                        {range.label}
                    </Button>
                ))}
            </div>
        </div>
    );
};

export default DateRangePicker;
