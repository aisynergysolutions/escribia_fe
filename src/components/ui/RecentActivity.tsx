
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Check, Edit } from 'lucide-react';
import { mockIdeas, mockClients } from '../../types';

const RecentActivity = () => {
  // Get recent ideas that need approval
  const recentIdeas = [...mockIdeas]
    .filter(idea => idea.status === 'Draft' || idea.status === 'Review')
    .sort((a, b) => b.updatedAt.seconds - a.updatedAt.seconds)
    .slice(0, 6);

  const getClientById = (clientId: string) => {
    return mockClients.find(client => client.id === clientId);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Draft':
        return 'bg-orange-100 text-orange-800';
      case 'Review':
        return 'bg-blue-100 text-blue-800';
      case 'Approved':
        return 'bg-mint-100 text-mint-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatTimeAgo = (seconds: number) => {
    const now = Date.now() / 1000;
    const diff = now - seconds;
    
    if (diff < 3600) {
      return `${Math.floor(diff / 60)}m ago`;
    } else if (diff < 86400) {
      return `${Math.floor(diff / 3600)}h ago`;
    } else {
      return `${Math.floor(diff / 86400)}d ago`;
    }
  };

  return (
    <Card className="bg-white rounded-[14px] shadow-[0_2px_6px_rgba(0,0,0,0.06)] border-0 h-fit">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-semibold text-neutral-900">
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {recentIdeas.map((idea) => {
          const client = getClientById(idea.clientId);
          return (
            <div key={idea.id} className="flex items-start gap-3 p-3 hover:bg-neutral-50 rounded-lg transition-colors">
              <Avatar className="h-8 w-8 flex-shrink-0">
                <AvatarImage src={client?.avatar} />
                <AvatarFallback className="text-xs bg-primary-100 text-primary-700">
                  {client?.clientName.charAt(0)}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="text-sm font-medium text-neutral-900 truncate">
                    {idea.title}
                  </h4>
                  <Badge className={`text-xs px-2 py-0.5 ${getStatusColor(idea.status)}`}>
                    {idea.status}
                  </Badge>
                </div>
                <p className="text-xs text-neutral-600 mb-2">
                  {client?.clientName}
                </p>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="h-7 px-3 text-xs border-primary-600 text-primary-600 hover:bg-primary-50"
                  >
                    <Edit className="h-3 w-3 mr-1" />
                    Edit
                  </Button>
                  {idea.status === 'Review' && (
                    <Button 
                      size="sm" 
                      className="h-7 px-3 text-xs bg-primary-600 hover:bg-primary-700"
                    >
                      <Check className="h-3 w-3 mr-1" />
                      Approve
                    </Button>
                  )}
                  <span className="text-xs text-neutral-500 ml-auto">
                    {formatTimeAgo(idea.updatedAt.seconds)}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
        
        {recentIdeas.length === 0 && (
          <div className="text-center py-8 text-neutral-500">
            <p className="text-sm">No recent activity</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RecentActivity;
