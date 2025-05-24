
import React, { useState } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, isToday } from 'date-fns';
import { ChevronLeft, ChevronRight, Clock } from 'lucide-react';
import { Button } from './button';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { mockIdeas, mockClients } from '../../types';

const PostCalendar = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Get scheduled posts for the current month
  const scheduledPosts = mockIdeas.filter(idea => 
    idea.scheduledPostAt && 
    idea.status === 'Scheduled'
  );

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const getPostsForDay = (day: Date) => {
    return scheduledPosts.filter(post => 
      post.scheduledPostAt && 
      isSameDay(new Date(post.scheduledPostAt.seconds * 1000), day)
    );
  };

  const getClientById = (clientId: string) => {
    return mockClients.find(client => client.id === clientId);
  };

  const goToPreviousMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  const goToToday = () => {
    setCurrentMonth(new Date());
  };

  return (
    <Card className="bg-white rounded-[14px] shadow-[0_2px_6px_rgba(0,0,0,0.06)] border-0">
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <CardTitle className="text-xl font-semibold text-neutral-900">
          Content Calendar
        </CardTitle>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={goToToday}
            className="text-xs px-3 h-8"
          >
            Today
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={goToPreviousMonth}
            className="h-8 w-8 p-0"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="font-medium min-w-[140px] text-center text-sm">
            {format(currentMonth, 'MMMM yyyy')}
          </span>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={goToNextMonth}
            className="h-8 w-8 p-0"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-7 gap-px mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="p-3 text-center text-xs font-medium text-neutral-700">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-px bg-neutral-200 rounded-lg overflow-hidden">
          {monthDays.map(day => {
            const postsForDay = getPostsForDay(day);
            const isCurrentMonth = isSameMonth(day, currentMonth);
            const isDayToday = isToday(day);

            return (
              <div
                key={day.toISOString()}
                className={`min-h-[100px] p-2 bg-white relative ${
                  !isCurrentMonth ? 'opacity-50' : ''
                } ${isDayToday ? 'ring-2 ring-primary-600 ring-inset' : ''}`}
              >
                <div className={`text-sm mb-2 font-medium ${
                  isCurrentMonth ? 'text-neutral-900' : 'text-neutral-400'
                } ${isDayToday ? 'text-primary-600' : ''}`}>
                  {format(day, 'd')}
                </div>
                
                <div className="space-y-1">
                  {postsForDay.slice(0, 2).map(post => {
                    const client = getClientById(post.clientId);
                    return (
                      <div
                        key={post.id}
                        className="bg-primary-100 text-primary-800 text-xs p-1.5 rounded cursor-pointer hover:bg-primary-200 transition-colors"
                        title={`${post.title} - ${format(new Date(post.scheduledPostAt!.seconds * 1000), 'HH:mm')}`}
                      >
                        <div className="flex items-center gap-1 mb-0.5">
                          <Clock className="h-3 w-3 flex-shrink-0" />
                          <span className="font-medium">
                            {format(new Date(post.scheduledPostAt!.seconds * 1000), 'HH:mm')}
                          </span>
                        </div>
                        <div className="truncate text-xs">
                          {post.title}
                        </div>
                        <div className="truncate text-xs opacity-75">
                          {client?.clientName}
                        </div>
                      </div>
                    );
                  })}
                  {postsForDay.length > 2 && (
                    <div className="text-xs text-neutral-600 text-center py-1">
                      +{postsForDay.length - 2} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {scheduledPosts.length === 0 && (
          <div className="text-center text-neutral-500 mt-8 py-8">
            <p className="text-sm">No scheduled posts found</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PostCalendar;
