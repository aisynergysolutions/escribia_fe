
import React from 'react';
import PostCalendar from '../components/ui/PostCalendar';

const Calendar = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Calendar</h1>
        <p className="text-gray-600">View all scheduled posts across all clients</p>
      </div>
      
      <PostCalendar />
    </div>
  );
};

export default Calendar;
