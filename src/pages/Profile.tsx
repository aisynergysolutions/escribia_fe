
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LogOut } from 'lucide-react';
import { mockAgency } from '../types';

const Profile = () => {
  const handleLogout = () => {
    console.log('Logging out...');
    // Add logout functionality here
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Account Settings</h1>
        <Button 
          variant="outline" 
          onClick={handleLogout}
          className="text-red-600 border-red-200 hover:bg-red-50"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Logout
        </Button>
      </div>
      
      <Tabs defaultValue="agency" className="space-y-4">
        <TabsList>
          <TabsTrigger value="agency">Agency Info</TabsTrigger>
          <TabsTrigger value="subscription">Subscription</TabsTrigger>
          <TabsTrigger value="referral">Referrals</TabsTrigger>
        </TabsList>
        
        <TabsContent value="agency" className="space-y-4">
          <Card className="rounded-2xl shadow-md">
            <CardHeader>
              <CardTitle>Agency Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">Agency Name</label>
                <input 
                  type="text" 
                  className="w-full p-2 border rounded-md" 
                  value={mockAgency.agencyName} 
                  readOnly 
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Primary Contact Email</label>
                <input 
                  type="email" 
                  className="w-full p-2 border rounded-md" 
                  value={mockAgency.primaryContactEmail}
                  readOnly
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Default Language</label>
                  <select className="w-full p-2 border rounded-md">
                    <option value="en" selected={mockAgency.settings.defaultLanguage === "en"}>English</option>
                    <option value="es" selected={mockAgency.settings.defaultLanguage === "es"}>Spanish</option>
                    <option value="fr" selected={mockAgency.settings.defaultLanguage === "fr"}>French</option>
                    <option value="de" selected={mockAgency.settings.defaultLanguage === "de"}>German</option>
                  </select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Timezone</label>
                  <select className="w-full p-2 border rounded-md">
                    <option value="Europe/Madrid" selected={mockAgency.settings.timezone === "Europe/Madrid"}>Europe/Madrid</option>
                    <option value="America/New_York">America/New York</option>
                    <option value="America/Los_Angeles">America/Los Angeles</option>
                    <option value="Asia/Tokyo">Asia/Tokyo</option>
                  </select>
                </div>
              </div>
              
              <div className="pt-4">
                <Button className="bg-indigo-600 hover:bg-indigo-700">
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="subscription" className="space-y-4">
          <Card className="rounded-2xl shadow-md">
            <CardHeader>
              <CardTitle>Subscription Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-semibold">
                      {mockAgency.subscription.planId.charAt(0).toUpperCase() + mockAgency.subscription.planId.slice(1).replace('_', ' ')}
                    </h3>
                    <p className="text-gray-600 text-sm">
                      Status: <span className="font-medium capitalize">{mockAgency.subscription.status}</span>
                    </p>
                  </div>
                  <Button className="bg-indigo-600 hover:bg-indigo-700">
                    Upgrade Plan
                  </Button>
                </div>
                <div className="mt-2 text-sm text-gray-500">
                  Renews on {new Date(mockAgency.subscription.currentPeriodEnd.seconds * 1000).toLocaleDateString()}
                </div>
              </div>
              
              <div>
                <h3 className="text-md font-medium mb-2">Payment History</h3>
                <div className="bg-white border rounded-lg overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Amount
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Transaction ID
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {mockAgency.subscription.paymentHistory.map((payment, index) => (
                        <tr key={index}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            {new Date(payment.paymentDate.seconds * 1000).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            ${payment.amount.toFixed(2)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-mono">
                            {payment.transactionId}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="referral" className="space-y-4">
          <Card className="rounded-2xl shadow-md">
            <CardHeader>
              <CardTitle>Referral Program</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-green-50 border border-green-100 rounded-lg p-4">
                <h3 className="text-lg font-semibold">Your Referral Code</h3>
                <div className="flex items-center gap-2 mt-2">
                  <div className="bg-white border rounded px-3 py-2 font-mono flex-1">
                    {mockAgency.referral.code}
                  </div>
                  <Button variant="outline">
                    Copy
                  </Button>
                </div>
                <p className="mt-2 text-sm text-gray-600">
                  Share this code with other agencies and earn rewards!
                </p>
              </div>
              
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-md font-medium">Current Balance:</h3>
                  <span className="text-xl font-semibold text-green-600">${mockAgency.referral.balance}</span>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  Source: {mockAgency.referral.source}
                </p>
              </div>
              
              <div className="pt-2">
                <Button disabled={mockAgency.referral.balance <= 0}>
                  Redeem Balance
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Profile;
