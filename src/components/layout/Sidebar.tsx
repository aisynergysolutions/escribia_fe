
import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  Calendar,
  BarChart3, 
  LogOut
} from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

const navItems = [
  { title: 'Dashboard', path: '/', icon: LayoutDashboard },
  { title: 'Clients', path: '/clients', icon: Users },
  { title: 'Calendar', path: '/calendar', icon: Calendar },
  { title: 'Templates', path: '/templates', icon: FileText },
  { title: 'Analytics', path: '/analytics', icon: BarChart3 }
];

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    console.log('Logging out...');
    // navigate('/login'); // uncomment when login page exists
  };

  return (
    <div className="w-56 h-full bg-white border-r border-gray-200 flex flex-col">
      {/* Header with Escribia.io branding */}
      <div className="p-6 border-b border-gray-100">
        <h1 className="text-xl font-semibold text-gray-900">Escribia.io</h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-3">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || 
              (item.path !== '/' && location.pathname.startsWith(item.path));
            
            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActive 
                      ? 'bg-blue-100 text-blue-700 border border-blue-200 shadow-sm' 
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

      {/* Profile Section at bottom */}
      <div className="p-4 border-t border-gray-100">
        <Link
          to="/profile"
          className="flex items-center w-full p-3 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <Avatar className="h-8 w-8">
            <AvatarImage src="" alt="Admin User" />
            <AvatarFallback className="bg-blue-600 text-white text-sm font-medium">
              A
            </AvatarFallback>
          </Avatar>
          <div className="ml-3 min-w-0 flex-1 text-left">
            <div className="text-sm font-medium text-gray-900 truncate">Admin User</div>
            <div className="text-xs text-gray-500 truncate">admin@acme.com</div>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default Sidebar;
