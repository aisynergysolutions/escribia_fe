
import React, { useState } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns';
import { ChevronLeft, ChevronRight, Clock, ExternalLink } from 'lucide-react';
import { Button } from './button';
import { Card } from './card';
import { mockIdeas, mockClients } from '../../types';
import { useParams, useNavigate } from 'react-router-dom';
import DayPostsModal from './DayPostsModal';

interface PostCalendarProps {
  showAllClients?: boolean;
}

const PostCalendar: React.FC<PostCalendarProps> = ({ showAllClients = false }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { clientId } = useParams<{ clientId: string }>();
  const navigate = useNavigate();

  // Get scheduled posts for the current month
  const getScheduledPosts = () => {
    let filteredIdeas = mockIdeas.filter(idea => 
      idea.scheduledPostAt && 
      idea.status === 'Scheduled'
    );

    // If not showing all clients, filter by current client
    if (!showAllClients && clientId) {
      filteredIdeas = filteredIdeas.filter(idea => idea.clientId === clientId);
    }

    return filteredIdeas;
  };

  const scheduledPosts = getScheduledPosts();

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const getPostsForDay = (day: Date) => {
    return scheduledPosts.filter(post => 
      post.scheduledPostAt && 
      isSameDay(new Date(post.scheduledPostAt.seconds * 1000), day)
    );
  };

  const getClientName = (clientId: string) => {
    const client = mockClients.find(c => c.id === clientId);
    return client?.clientName || 'Unknown Client';
  };

  const handlePostClick = (post: any) => {
    navigate(`/clients/${post.clientId}/ideas/${post.id}`);
  };

  const handleDayClick = (day: Date) => {
    setSelectedDate(day);
    setIsModalOpen(true);
  };

  const goToPreviousMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  return (
    <>
      <Card className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">
            {showAllClients ? 'All Clients Calendar' : 'Content Calendar'}
          </h3>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={goToPreviousMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="font-medium min-w-[120px] text-center">
              {format(currentMonth, 'MMMM yyyy')}
            </span>
            <Button variant="outline" size="sm" onClick={goToNextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1 mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {monthDays.map(day => {
            const postsForDay = getPostsForDay(day);
            const isCurrentMonth = isSameMonth(day, currentMonth);
            const isToday = isSameDay(day, new Date());

            return (
              <div
                key={day.toISOString()}
                className={`min-h-[80px] p-1 border rounded-sm cursor-pointer hover:bg-gray-50 ${
                  isCurrentMonth ? 'bg-white' : 'bg-gray-50'
                } ${isToday ? 'ring-2 ring-blue-500' : ''}`}
                onClick={() => handleDayClick(day)}
              >
                <div className={`text-sm mb-1 ${
                  isCurrentMonth ? 'text-gray-900' : 'text-gray-400'
                } ${isToday ? 'font-bold' : ''}`}>
                  {format(day, 'd')}
                </div>
                
                <div className="space-y-1">
                  {postsForDay.length > 0 && (
                    <div>
                      {postsForDay.length > 1 ? (
                        <div className="bg-blue-100 text-blue-800 text-xs p-1 rounded">
                          <div className="flex items-center gap-1 mb-1">
                            <Clock className="h-3 w-3 flex-shrink-0" />
                            <span className="font-medium">
                              {postsForDay.length} posts
                            </span>
                          </div>
                          <div className="text-xs">
                            Click to view
                          </div>
                        </div>
                      ) : (
                        <div className="bg-blue-100 text-blue-800 text-xs p-1 rounded">
                          <div className="flex items-center gap-1 mb-1">
                            <Clock className="h-3 w-3 flex-shrink-0" />
                            <span className="truncate">
                              {format(new Date(postsForDay[0].scheduledPostAt!.seconds * 1000), 'HH:mm')}
                            </span>
                          </div>
                          <div className="truncate text-xs font-medium">
                            {postsForDay[0].title}
                          </div>
                          {showAllClients && (
                            <div className="truncate text-xs mt-0.5 text-blue-600 font-medium">
                              {getClientName(postsForDay[0].clientId)}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {scheduledPosts.length === 0 && (
          <div className="text-center text-gray-500 mt-4 py-8">
            No scheduled posts found
          </div>
        )}
      </Card>

      <DayPostsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        selectedDate={selectedDate}
        posts={selectedDate ? getPostsForDay(selectedDate) : []}
        onPostClick={handlePostClick}
        showAllClients={showAllClients}
      />
    </>
  );
};

export default PostCalendar;
