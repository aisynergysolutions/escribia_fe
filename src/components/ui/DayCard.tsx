
import React from 'react';
import { format } from 'date-fns';
import { Card } from './card';
import { cn } from '@/lib/utils';

interface DayCardProps {
  date: Date;
  children: React.ReactNode;
  className?: string;
}

const DayCard: React.FC<DayCardProps> = ({ date, children, className }) => {
  return (
    <Card className={cn("bg-white border border-gray-200 p-6", className)}>
      <div className="mb-4">
        <h4 className="text-sm font-medium text-gray-900 flex items-center gap-2">
          📅 {format(date, 'EEEE, MMM d')}
        </h4>
      </div>
      <div className="space-y-1">
        {children}
      </div>
    </Card>
  );
};

export default DayCard;
