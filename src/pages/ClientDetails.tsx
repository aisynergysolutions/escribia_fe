
import React, { useState, useEffect } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import ClientOverview from '../components/ui/ClientOverview';
import PostsSection from '../components/client/PostsSection';
import CommentsSection from '../components/client/CommentsSection';
import CalendarSection from '../components/client/CalendarSection';
import ResourcesSection from '../components/client/ResourcesSection';
import AnalyticsSection from '../components/client/AnalyticsSection';
import ClientSettingsSection from '../components/client/ClientSettingsSection';
import LoadingGrid from '../components/common/LoadingGrid';
import { mockClients } from '../types';

const ClientDetails = () => {
  const { clientId } = useParams<{ clientId: string }>();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(true);

  // Find client data
  const client = mockClients.find(c => c.id === clientId);

  // Simulate loading delay for better UX
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 200);

    return () => clearTimeout(timer);
  }, [clientId, location.pathname]);

  // Determine current section based on path
  const getCurrentSection = () => {
    const path = location.pathname;
    if (path.endsWith('/posts')) return 'posts';
    if (path.endsWith('/comments')) return 'comments';
    if (path.endsWith('/calendar')) return 'calendar';
    if (path.endsWith('/resources')) return 'resources';
    if (path.endsWith('/analytics')) return 'analytics';
    if (path.endsWith('/settings')) return 'settings';
    return 'overview';
  };

  const currentSection = getCurrentSection();

  if (!client) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold">Client not found</h2>
        <Link to="/clients" className="text-indigo-600 hover:underline mt-4 inline-block">
          Return to clients list
        </Link>
      </div>
    );
  }

  if (isLoading) {
    return <LoadingGrid count={4} variant="client" className="grid grid-cols-1 lg:grid-cols-2 gap-6" />;
  }

  const renderContent = () => {
    switch (currentSection) {
      case 'posts':
        return <PostsSection clientId={clientId!} />;
      case 'comments':
        return <CommentsSection clientId={clientId!} />;
      case 'calendar':
        return <CalendarSection clientId={clientId!} />;
      case 'resources':
        return <ResourcesSection clientId={clientId!} />;
      case 'analytics':
        return <AnalyticsSection clientId={clientId!} />;
      case 'settings':
        return <ClientSettingsSection clientId={clientId!} />;
      default:
        return <ClientOverview clientId={clientId!} />;
    }
  };

  return (
    <div className="space-y-6">
      {renderContent()}
    </div>
  );
};

export default ClientDetails;
