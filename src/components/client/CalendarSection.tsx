
import React from 'react';
import PostCalendar from '../ui/PostCalendar';
import { mockClients } from '../../types';

interface CalendarSectionProps {
  clientId: string;
}

const CalendarSection: React.FC<CalendarSectionProps> = ({ clientId }) => {
  const client = mockClients.find(c => c.id === clientId);

  return (
    <div className="space-y-6">
      <PostCalendar clientName={client?.clientName} />
    </div>
  );
};

export default CalendarSection;
