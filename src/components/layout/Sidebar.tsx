
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  BarChart3, 
  User,
  Settings
} from 'lucide-react';

const navItems = [
  { title: 'Dashboard', path: '/', icon: LayoutDashboard },
  { title: 'Clients', path: '/clients', icon: Users },
  { title: 'Templates', path: '/templates', icon: FileText },
  { title: 'Analytics', path: '/analytics', icon: BarChart3 }
];

const Sidebar = () => {
  const location = useLocation();

  return (
    <div className="w-56 h-full bg-white border-r border-gray-200 flex flex-col">
      {/* Header with Escribia.io branding */}
      <div className="p-6 border-b border-gray-100">
        <h1 className="text-xl font-semibold text-gray-900">Escribia.io</h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || 
              (item.path !== '/' && location.pathname.startsWith(item.path));
            
            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive 
                      ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700' 
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
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

      {/* Profile and Settings at bottom */}
      <div className="p-4 border-t border-gray-100">
        <div className="space-y-1">
          <Link
            to="/profile"
            className={`flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              location.pathname === '/profile'
                ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700' 
                : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            <User className="mr-3 h-5 w-5" strokeWidth={1.5} />
            <span>Profile</span>
          </Link>
          
          <button className="flex items-center w-full px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors">
            <Settings className="mr-3 h-5 w-5" strokeWidth={1.5} />
            <span>Settings</span>
          </button>
        </div>
        
        {/* User info */}
        <div className="flex items-center mt-3 pt-3 border-t border-gray-100">
          <div className="h-8 w-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-medium">
            A
          </div>
          <div className="ml-3 min-w-0 flex-1">
            <div className="text-sm font-medium text-gray-900 truncate">Admin User</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
