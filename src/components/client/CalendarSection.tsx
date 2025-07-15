
import React, { useState, useCallback } from 'react';
import PostCalendar from '../ui/PostCalendar';
import ClientQueueView from '../ui/ClientQueueView';
import { mockClients } from '../../types';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../ui/tabs';

interface CalendarSectionProps {
  clientId: string;
}

const CalendarSection: React.FC<CalendarSectionProps> = ({ clientId }) => {
  const client = mockClients.find(c => c.id === clientId);
  const [refreshKey, setRefreshKey] = useState(0);

  // Function to trigger calendar refresh when posts are scheduled
  const handlePostScheduled = useCallback(() => {
    setRefreshKey(prev => prev + 1);
  }, []);

  return (
    <div className="space-y-6">
      <Tabs defaultValue="queue" className="w-full">
        <div className="flex justify-center mb-6">
          <TabsList className="grid w-fit grid-cols-2">
            <TabsTrigger value="calendar">Calendar</TabsTrigger>
            <TabsTrigger value="queue">Queue</TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="calendar" className="mt-0">
          <PostCalendar key={refreshKey} clientName={client?.clientName} />
        </TabsContent>
        
        <TabsContent value="queue" className="mt-0">
          <ClientQueueView clientId={clientId} onPostScheduled={handlePostScheduled} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CalendarSection;
