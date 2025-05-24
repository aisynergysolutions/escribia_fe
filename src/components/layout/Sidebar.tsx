
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  BarChart3, 
  User 
} from 'lucide-react';

const navItems = [
  { title: 'Dashboard', path: '/', icon: LayoutDashboard },
  { title: 'Clients', path: '/clients', icon: Users },
  { title: 'Templates', path: '/templates', icon: FileText },
  { title: 'Analytics', path: '/analytics', icon: BarChart3 },
  { title: 'Profile', path: '/profile', icon: User }
];

const Sidebar = () => {
  const location = useLocation();

  return (
    <div className="w-64 h-full bg-indigo-900 text-white">
      <div className="p-4 h-16 flex items-center border-b border-indigo-800">
        <h1 className="text-xl font-bold">LICC Platform</h1>
      </div>

      <nav className="p-4">
        <ul className="space-y-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || 
              (item.path !== '/' && location.pathname.startsWith(item.path));
            
            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`flex items-center p-3 rounded-lg transition-colors ${
                    isActive 
                      ? 'bg-indigo-800 text-white' 
                      : 'hover:bg-indigo-700'
                  }`}
                >
                  <item.icon className="mr-3 h-5 w-5" />
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
