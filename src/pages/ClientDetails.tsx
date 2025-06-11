import React from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { mockClients } from '../types';
import ClientOverview from '../components/ui/ClientOverview';
import NotFound from './NotFound';

const ClientDetails = () => {
  const { clientId } = useParams<{ clientId: string }>();
  const location = useLocation();
  
  const client = mockClients.find(c => c.id === clientId);

  if (!client) {
    return <NotFound />;
  }

  // Determine which view to show based on the path
  const getPageContent = () => {
    const path = location.pathname;
    
    if (path === `/clients/${clientId}` || path === `/clients/${clientId}/`) {
      return <ClientOverview clientId={clientId!} />;
    }
    
    if (path.includes('/posts')) {
      return (
        <div className="space-y-6">
          <h1 className="text-3xl font-bold text-gray-900">Posts</h1>
          <p className="text-gray-600">Manage your posts for {client.clientName}</p>
          {/* Posts content will be implemented later */}
        </div>
      );
    }
    
    if (path.includes('/comments')) {
      return (
        <div className="space-y-6">
          <h1 className="text-3xl font-bold text-gray-900">Comments</h1>
          <p className="text-gray-600">Manage comments for {client.clientName}</p>
          {/* Comments content will be implemented later */}
        </div>
      );
    }
    
    if (path.includes('/calendar')) {
      return (
        <div className="space-y-6">
          <h1 className="text-3xl font-bold text-gray-900">Calendar</h1>
          <p className="text-gray-600">Content calendar for {client.clientName}</p>
          {/* Calendar content will be implemented later */}
        </div>
      );
    }
    
    if (path.includes('/resources')) {
      return (
        <div className="space-y-6">
          <h1 className="text-3xl font-bold text-gray-900">Resources</h1>
          <p className="text-gray-600">Resources for {client.clientName}</p>
          {/* Resources content will be implemented later */}
        </div>
      );
    }
    
    if (path.includes('/analytics')) {
      return (
        <div className="space-y-6">
          <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-600">Analytics for {client.clientName}</p>
          {/* Analytics content will be implemented later */}
        </div>
      );
    }
    
    if (path.includes('/settings')) {
      return (
        <div className="space-y-6">
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600">Settings for {client.clientName}</p>
          {/* Settings content will be implemented later */}
        </div>
      );
    }
    
    // Default to overview
    return <ClientOverview clientId={clientId!} />;
  };

  return (
    <div className="space-y-6">
      {getPageContent()}
    </div>
  );
};

export default ClientDetails;
