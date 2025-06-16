
import React, { useState } from 'react';
import PostCalendar from '../ui/PostCalendar';
import ClientQueueView from '../ui/ClientQueueView';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../ui/tabs';
import { mockClients } from '../../types';

interface CalendarSectionProps {
  clientId: string;
}

const CalendarSection: React.FC<CalendarSectionProps> = ({ clientId }) => {
  const client = mockClients.find(c => c.id === clientId);

  return (
    <div className="space-y-6">
      <div className="flex justify-center">
        <Tabs defaultValue="calendar" className="w-auto">
          <TabsList className="grid w-48 grid-cols-2">
            <TabsTrigger value="calendar">Calendar</TabsTrigger>
            <TabsTrigger value="queue">Queue</TabsTrigger>
          </TabsList>
          
          <TabsContent value="calendar" className="mt-6">
            <PostCalendar clientName={client?.clientName} />
          </TabsContent>
          
          <TabsContent value="queue" className="mt-6">
            <ClientQueueView clientId={clientId} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default CalendarSection;
