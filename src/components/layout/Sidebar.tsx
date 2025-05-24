
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  BarChart3, 
  User,
  Calendar
} from 'lucide-react';

const navItems = [
  { title: 'Dashboard', path: '/', icon: LayoutDashboard },
  { title: 'Clients', path: '/clients', icon: Users },
  { title: 'Content Calendar', path: '/calendar', icon: Calendar },
  { title: 'Templates', path: '/templates', icon: FileText },
  { title: 'Analytics', path: '/analytics', icon: BarChart3 },
  { title: 'Settings', path: '/profile', icon: User }
];

const Sidebar = () => {
  const location = useLocation();

  return (
    <div className="w-64 h-full bg-white border-r border-slate-200 flex flex-col">
      <div className="p-6 border-b border-slate-200">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">E</span>
          </div>
          <span className="text-xl font-semibold text-slate-900">escribia.io</span>
        </div>
      </div>

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
                      ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-500' 
                      : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <item.icon className={`mr-3 h-5 w-5 ${isActive ? 'text-blue-500' : 'text-slate-500'}`} />
                  <span>{item.title}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;
