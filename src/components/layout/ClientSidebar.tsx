
import React from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { 
  ArrowLeft,
  LayoutDashboard, 
  FileText, 
  Calendar,
  FolderOpen,
  BarChart3,
  Settings,
  MessageCircle
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { mockClients } from '../../types';

const clientNavItems = [
  { 
    title: 'Overview', 
    path: '', 
    icon: LayoutDashboard,
    group: 'main'
  },
  { 
    title: 'Posts', 
    path: '/posts', 
    icon: FileText,
    group: 'content'
  },
  { 
    title: 'Comments', 
    path: '/comments', 
    icon: MessageCircle,
    group: 'content'
  },
  { 
    title: 'Calendar', 
    path: '/calendar', 
    icon: Calendar,
    group: 'content'
  },
  { 
    title: 'Resources', 
    path: '/resources', 
    icon: FolderOpen,
    group: 'management'
  },
  { 
    title: 'Analytics', 
    path: '/analytics', 
    icon: BarChart3,
    group: 'management'
  },
  { 
    title: 'Settings', 
    path: '/settings', 
    icon: Settings,
    group: 'management'
  }
];

const ClientSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { clientId } = useParams<{ clientId: string }>();
  
  const client = mockClients.find(c => c.id === clientId);

  const handleBackToClients = () => {
    navigate('/clients');
  };

  const handleOverviewClick = () => {
    navigate(`/clients/${clientId}`);
  };

  if (!client) {
    return null;
  }

  const mainItems = clientNavItems.filter(item => item.group === 'main');
  const contentItems = clientNavItems.filter(item => item.group === 'content');
  const managementItems = clientNavItems.filter(item => item.group === 'management');

  const renderNavItems = (items: typeof clientNavItems) => {
    return items.map((item) => {
      const fullPath = `/clients/${clientId}${item.path}`;
      const isActive = location.pathname === fullPath || 
        (item.path === '' && location.pathname === `/clients/${clientId}`);
      
      return (
        <li key={item.path}>
          <Link
            to={fullPath}
            className={`flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
              isActive 
                ? 'bg-blue-100 text-blue-700 border border-blue-200 shadow-sm' 
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-800'
            }`}
          >
            <item.icon className="mr-3 h-5 w-5" strokeWidth={1.5} />
            <span>{item.title}</span>
          </Link>
        </li>
      );
    });
  };

  return (
    <div className="w-56 h-full bg-gradient-to-b from-slate-50 to-slate-100 border-r border-slate-200 flex flex-col">
      {/* Header with client name and back button */}
      <div className="p-6 border-b border-slate-200">
        <button
          onClick={handleBackToClients}
          className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors mb-3"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="text-sm">Back to Clients</span>
        </button>
        <button
          onClick={handleOverviewClick}
          className="text-left w-full hover:opacity-75 transition-opacity"
        >
          <h1 className="text-lg font-semibold text-slate-900 truncate">{client.clientName}</h1>
        </button>
        <p className="text-xs text-slate-500 mt-1">{client.industry}</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-6">
          {/* Main Navigation */}
          <li>
            <ul className="space-y-2">
              {renderNavItems(mainItems)}
            </ul>
          </li>

          <Separator className="mx-2" />

          {/* Content Management */}
          <li>
            <div className="px-4 mb-2">
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Content</h3>
            </div>
            <ul className="space-y-2">
              {renderNavItems(contentItems)}
            </ul>
          </li>

          <Separator className="mx-2" />

          {/* Management */}
          <li>
            <div className="px-4 mb-2">
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Management</h3>
            </div>
            <ul className="space-y-2">
              {renderNavItems(managementItems)}
            </ul>
          </li>
        </ul>
      </nav>

      {/* Client status at bottom */}
      <div className="p-4 border-t border-slate-200">
        <div className="bg-white rounded-lg p-3 border border-slate-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Status</span>
            <span className={`text-xs px-2 py-1 rounded-full ${
              client.status === 'active' ? 'bg-green-100 text-green-700' :
              client.status === 'onboarding' ? 'bg-blue-100 text-blue-700' :
              client.status === 'paused' ? 'bg-yellow-100 text-yellow-700' :
              'bg-gray-100 text-gray-700'
            }`}>
              {client.status}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientSidebar;
