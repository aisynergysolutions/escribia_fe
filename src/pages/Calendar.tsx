
import React, { useState } from 'react';
import PostCalendar from '../components/ui/PostCalendar';
import QueueView from '../components/ui/QueueView';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/tabs';

const Calendar = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Calendar</h1>
        <p className="text-gray-600">View all scheduled posts across all clients</p>
      </div>
      
      <Tabs defaultValue="calendar" className="w-full">
        <div className="flex justify-center mb-6">
          <TabsList className="grid w-[280px] grid-cols-2">
            <TabsTrigger value="calendar">Calendar</TabsTrigger>
            <TabsTrigger value="queue">Queue</TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="calendar" className="mt-0">
          <PostCalendar showAllClients={true} />
        </TabsContent>
        
        <TabsContent value="queue" className="mt-0">
          <QueueView />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Calendar;
