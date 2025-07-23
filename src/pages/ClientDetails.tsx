import React, { useEffect } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import ClientOverview from '../components/ui/ClientOverview';
import PostsSection from '../components/client/PostsSection';
import CommentsSection from '../components/client/CommentsSection';
import CalendarSection from '../components/client/CalendarSection';
import ResourcesSection from '../components/client/ResourcesSection';
import AnalyticsSection from '../components/client/AnalyticsSection';
import ClientSettingsSection from '../components/client/ClientSettingsSection';
import { useClients } from '../context/ClientsContext';

const ClientDetails = () => {
  const { clientId } = useParams<{ clientId: string }>();
  const location = useLocation();
  const {
    getClientDetails,
    clientDetails,
    clientDetailsLoading,
    clientDetailsError,
  } = useClients();

  useEffect(() => {
    console.log('[ClientDetails] clientId from params:', clientId);
    if (clientId) {
      getClientDetails(clientId).then((details) => {
        console.log('[ClientDetails] getClientDetails result:', details);
      });
    }
    // eslint-disable-next-line
  }, [clientId]);

  useEffect(() => {
    console.log('[ClientDetails] clientDetails:', clientDetails);
    console.log('[ClientDetails] clientDetailsLoading:', clientDetailsLoading);
    console.log('[ClientDetails] clientDetailsError:', clientDetailsError);
  }, [clientDetails, clientDetailsLoading, clientDetailsError]);

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

  if (clientDetailsLoading) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold">Loading client details...</h2>
      </div>
    );
  }

  if (clientDetailsError || !clientDetails) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold">Client not found</h2>
        <Link to="/clients" className="text-indigo-600 hover:underline mt-4 inline-block">
          Return to clients list
        </Link>
      </div>
    );
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
