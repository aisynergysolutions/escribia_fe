
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
  MessageCircle,
  PlusCircle,
  Users
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { mockClients } from '../../types';
import CreatePostModal from '../CreatePostModal';

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
    title: 'Profiles', 
    path: '/settings', 
    icon: Users,
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
            className={`flex items-center px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
              isActive 
                ? 'bg-blue-100 text-blue-700 border border-blue-200 shadow-sm' 
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-800'
            }`}
          >
            <item.icon className="mr-2 h-3.5 w-3.5" strokeWidth={1.5} />
            <span>{item.title}</span>
          </Link>
        </li>
      );
    });
  };

  return (
    <div className="w-56 h-full bg-gradient-to-b from-slate-50 to-slate-100 border-r border-slate-200 flex flex-col">
      {/* Header with client name and back button */}
      <div className="p-4 border-b border-slate-200">
        <button
          onClick={handleBackToClients}
          className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors mb-3"
        >
          <ArrowLeft className="h-3 w-3" />
          <span className="text-xs">Back to Clients</span>
        </button>
        
        <button
          onClick={handleOverviewClick}
          className="text-left w-full hover:opacity-75 transition-opacity mb-3"
        >
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={client.profileImage} alt={client.clientName} />
              <AvatarFallback className="bg-indigo-100 text-indigo-700 font-semibold">
                {client.clientName.split(' ').map(n => n[0]).join('').slice(0, 2)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <h1 className="text-base font-semibold text-slate-900 truncate">{client.clientName}</h1>
            </div>
          </div>
        </button>
        
        {/* Create Post Button with Modal */}
        <CreatePostModal>
          <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white" size="sm">
            <PlusCircle className="h-3 w-3 mr-1" />
            Create Post
          </Button>
        </CreatePostModal>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3">
        <ul className="space-y-3">
          {/* Main Navigation */}
          <li>
            <ul className="space-y-1">
              {renderNavItems(mainItems)}
            </ul>
          </li>

          <Separator className="mx-1" />

          {/* Content Management */}
          <li>
            <div className="px-3 mb-1">
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Content</h3>
            </div>
            <ul className="space-y-1">
              {renderNavItems(contentItems)}
            </ul>
          </li>

          <Separator className="mx-1" />

          {/* Management */}
          <li>
            <div className="px-3 mb-1">
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Management</h3>
            </div>
            <ul className="space-y-1">
              {renderNavItems(managementItems)}
            </ul>
          </li>
        </ul>
      </nav>

      {/* Client status at bottom */}
      <div className="p-3 border-t border-slate-200">
        <div className="bg-white rounded-lg p-2 border border-slate-200">
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
