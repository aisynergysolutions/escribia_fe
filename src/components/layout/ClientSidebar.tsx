
import React from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { 
  ArrowLeft,
  LayoutDashboard, 
  FileText, 
  Calendar,
  FolderOpen,
  BarChart3,
  Settings
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { mockClients } from '../../types';

const clientNavItems = [
  { title: 'Overview', path: '', icon: LayoutDashboard },
  { title: 'Posts', path: '/posts', icon: FileText },
  { title: 'Calendar', path: '/calendar', icon: Calendar },
  { title: 'Resources', path: '/resources', icon: FolderOpen },
  { title: 'Analytics', path: '/analytics', icon: BarChart3 },
  { title: 'Settings', path: '/settings', icon: Settings }
];

const ClientSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { clientId } = useParams<{ clientId: string }>();
  
  const client = mockClients.find(c => c.id === clientId);

  const handleBackToClients = () => {
    navigate('/clients');
  };

  if (!client) {
    return null;
  }

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
        <div className="flex items-center gap-2 mb-1">
          <h1 className="text-lg font-semibold text-slate-900 truncate">{client.clientName}</h1>
          <Badge className={`${
            client.status === 'active' ? 'bg-green-100 text-green-800' :
            client.status === 'onboarding' ? 'bg-blue-100 text-blue-800' :
            client.status === 'paused' ? 'bg-yellow-100 text-yellow-800' :
            'bg-gray-100 text-gray-800'
          }`}>
            {client.status}
          </Badge>
        </div>
        <p className="text-xs text-slate-500">{client.industry}</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {clientNavItems.map((item) => {
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
          })}
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
