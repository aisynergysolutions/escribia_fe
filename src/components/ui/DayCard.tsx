
import React from 'react';
import { format } from 'date-fns';
import { Card } from './card';

interface DayCardProps {
  date: Date;
  children: React.ReactNode;
}

const DayCard: React.FC<DayCardProps> = ({ date, children }) => {
  return (
    <Card className="bg-white border border-gray-200 p-6 mb-6">
      <div className="mb-4">
        <h4 className="text-sm font-medium text-gray-900 flex items-center gap-2">
          📅 {format(date, 'EEEE, MMM d')}
        </h4>
      </div>
      <div className="space-y-0">
        {children}
      </div>
    </Card>
  );
};

export default DayCard;
