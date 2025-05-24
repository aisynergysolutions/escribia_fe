
import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  BarChart3, 
  LogOut,
  ChevronUp
} from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { mockAgency } from '../../types';

const navItems = [
  { title: 'Dashboard', path: '/', icon: LayoutDashboard },
  { title: 'Clients', path: '/clients', icon: Users },
  { title: 'Templates', path: '/templates', icon: FileText },
  { title: 'Analytics', path: '/analytics', icon: BarChart3 }
];

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [showProfile, setShowProfile] = useState(false);

  const handleLogout = () => {
    // Add logout functionality here
    console.log('Logging out...');
    // navigate('/login'); // uncomment when login page exists
  };

  return (
    <div className="w-64 h-full bg-white border-r border-gray-200 flex flex-col">
      {/* Header with Escribia.io branding */}
      <div className="p-6 border-b border-gray-100">
        <h1 className="text-xl font-semibold text-gray-900">Escribia.io</h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || 
              (item.path !== '/' && location.pathname.startsWith(item.path));
            
            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActive 
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25' 
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
        {showProfile ? (
          <div className="space-y-4">
            <div className="space-y-4">
              <Tabs defaultValue="agency" className="space-y-4">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="agency">Agency</TabsTrigger>
                  <TabsTrigger value="subscription">Plan</TabsTrigger>
                  <TabsTrigger value="referral">Referrals</TabsTrigger>
                </TabsList>
                
                <TabsContent value="agency" className="space-y-3">
                  <Card className="rounded-lg shadow-sm">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Agency Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 text-xs">
                      <div className="space-y-1">
                        <label className="text-xs font-medium">Agency Name</label>
                        <input 
                          type="text" 
                          className="w-full p-2 border rounded text-xs" 
                          value={mockAgency.agencyName} 
                          readOnly 
                        />
                      </div>
                      
                      <div className="space-y-1">
                        <label className="text-xs font-medium">Email</label>
                        <input 
                          type="email" 
                          className="w-full p-2 border rounded text-xs" 
                          value={mockAgency.primaryContactEmail}
                          readOnly
                        />
                      </div>
                      
                      <div className="grid grid-cols-1 gap-2">
                        <div className="space-y-1">
                          <label className="text-xs font-medium">Language</label>
                          <select className="w-full p-2 border rounded text-xs">
                            <option value="en" selected={mockAgency.settings.defaultLanguage === "en"}>English</option>
                            <option value="es" selected={mockAgency.settings.defaultLanguage === "es"}>Spanish</option>
                          </select>
                        </div>
                        
                        <div className="space-y-1">
                          <label className="text-xs font-medium">Timezone</label>
                          <select className="w-full p-2 border rounded text-xs">
                            <option value="Europe/Madrid" selected={mockAgency.settings.timezone === "Europe/Madrid"}>Europe/Madrid</option>
                            <option value="America/New_York">America/New York</option>
                          </select>
                        </div>
                      </div>
                      
                      <Button size="sm" className="w-full bg-indigo-600 hover:bg-indigo-700 text-xs">
                        Save Changes
                      </Button>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="subscription" className="space-y-3">
                  <Card className="rounded-lg shadow-sm">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Subscription</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 text-xs">
                      <div className="bg-indigo-50 border border-indigo-100 rounded p-3">
                        <div className="flex justify-between items-center">
                          <div>
                            <h3 className="text-sm font-semibold">
                              {mockAgency.subscription.planId.charAt(0).toUpperCase() + mockAgency.subscription.planId.slice(1).replace('_', ' ')}
                            </h3>
                            <p className="text-xs text-gray-600">
                              Status: <span className="font-medium capitalize">{mockAgency.subscription.status}</span>
                            </p>
                          </div>
                        </div>
                        <div className="mt-2 text-xs text-gray-500">
                          Renews: {new Date(mockAgency.subscription.currentPeriodEnd.seconds * 1000).toLocaleDateString()}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="referral" className="space-y-3">
                  <Card className="rounded-lg shadow-sm">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Referrals</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 text-xs">
                      <div className="bg-green-50 border border-green-100 rounded p-3">
                        <h3 className="text-sm font-semibold">Your Referral Code</h3>
                        <div className="flex items-center gap-2 mt-2">
                          <div className="bg-white border rounded px-2 py-1 font-mono flex-1 text-xs">
                            {mockAgency.referral.code}
                          </div>
                          <Button variant="outline" size="sm" className="text-xs">
                            Copy
                          </Button>
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-medium">Balance:</h3>
                          <span className="text-sm font-semibold text-green-600">${mockAgency.referral.balance}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
            
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setShowProfile(false)}
                className="flex-1 text-xs"
              >
                Close
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleLogout}
                className="flex-1 text-xs text-red-600 border-red-200 hover:bg-red-50"
              >
                <LogOut className="h-3 w-3 mr-1" />
                Logout
              </Button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowProfile(true)}
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
            <ChevronUp className="h-4 w-4 text-gray-400" />
          </button>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
