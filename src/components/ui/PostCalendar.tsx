
import React, { useState } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns';
import { ChevronLeft, ChevronRight, Clock } from 'lucide-react';
import { Button } from './button';
import { mockIdeas } from '../../types';

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

  const goToPreviousMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-slate-900">
          {format(currentMonth, 'MMMM yyyy')}
        </h3>
        <div className="flex items-center gap-1">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={goToPreviousMonth}
            className="h-8 w-8 p-0"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={goToNextMonth}
            className="h-8 w-8 p-0"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-px bg-slate-200 rounded-lg overflow-hidden">
        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
          <div key={day} className="bg-slate-50 p-3 text-center">
            <span className="text-xs font-medium text-slate-600">{day}</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-px bg-slate-200 mt-px">
        {monthDays.map(day => {
          const postsForDay = getPostsForDay(day);
          const isCurrentMonth = isSameMonth(day, currentMonth);
          const isToday = isSameDay(day, new Date());

          return (
            <div
              key={day.toISOString()}
              className={`min-h-[100px] p-2 bg-white ${
                !isCurrentMonth ? 'bg-slate-50' : ''
              } ${isToday ? 'bg-blue-50' : ''}`}
            >
              <div className={`text-sm mb-2 ${
                isCurrentMonth ? 'text-slate-900' : 'text-slate-400'
              } ${isToday ? 'font-bold text-blue-600' : ''}`}>
                {format(day, 'd')}
              </div>
              
              <div className="space-y-1">
                {postsForDay.map(post => (
                  <div
                    key={post.id}
                    className="bg-blue-100 text-blue-800 text-xs p-2 rounded-md cursor-pointer hover:bg-blue-200 transition-colors"
                    title={`${post.title} - ${format(new Date(post.scheduledPostAt!.seconds * 1000), 'HH:mm')}`}
                  >
                    <div className="flex items-center gap-1 mb-1">
                      <Clock className="h-3 w-3 flex-shrink-0" />
                      <span className="font-medium">
                        {format(new Date(post.scheduledPostAt!.seconds * 1000), 'HH:mm')}
                      </span>
                    </div>
                    <div className="truncate text-xs font-medium">
                      {post.title}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {scheduledPosts.length === 0 && (
        <div className="text-center text-slate-500 mt-8 py-8">
          No scheduled posts found
        </div>
      )}
    </div>
  );
};

export default PostCalendar;
