import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LogOut, Upload, Plus, MoreHorizontal, User, Mail, Phone } from 'lucide-react';
import { mockAgency } from '../types';
const Profile = () => {
  const [agencyData, setAgencyData] = useState({
    logo: '',
    name: mockAgency.agencyName,
    website: 'https://acme-media.com',
    userName: 'John Smith',
    email: mockAgency.primaryContactEmail,
    phone: '+1 (555) 123-4567',
    defaultLanguage: mockAgency.settings.defaultLanguage,
    timezone: mockAgency.settings.timezone,
    agencySize: '11-50'
  });
  const [teamMembers] = useState([{
    id: 1,
    name: 'John Smith',
    email: 'john@acme-media.com',
    role: 'Admin',
    status: 'Active',
    avatar: ''
  }, {
    id: 2,
    name: 'Sarah Johnson',
    email: 'sarah@acme-media.com',
    role: 'Member',
    status: 'Active',
    avatar: ''
  }, {
    id: 3,
    name: 'Mike Wilson',
    email: 'mike@acme-media.com',
    role: 'Member',
    status: 'Pending',
    avatar: ''
  }]);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('Member');
  const handleLogout = () => {
    console.log('Logging out...');
    // Add logout functionality here
  };
  const handleSaveChanges = () => {
    console.log('Saving agency changes...', agencyData);
    // Add save functionality here
  };
  const handleInviteUser = () => {
    console.log('Inviting user:', {
      email: inviteEmail,
      role: inviteRole
    });
    setIsInviteModalOpen(false);
    setInviteEmail('');
    setInviteRole('Member');
  };
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = e => {
        setAgencyData(prev => ({
          ...prev,
          logo: e.target?.result as string
        }));
      };
      reader.readAsDataURL(file);
    }
  };
  return <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Account Settings</h1>
        <Button variant="outline" onClick={handleLogout} className="text-red-600 border-red-200 hover:bg-red-50">
          <LogOut className="h-4 w-4 mr-2" />
          Logout
        </Button>
      </div>
      
      <Tabs defaultValue="agency" className="space-y-4">
        <TabsList>
          <TabsTrigger value="agency">Agency Info</TabsTrigger>
          <TabsTrigger value="team">Team</TabsTrigger>
          <TabsTrigger value="subscription">Subscription</TabsTrigger>
          <TabsTrigger value="referral">Referrals</TabsTrigger>
        </TabsList>
        
        <TabsContent value="agency" className="space-y-6">
          {/* Agency Profile Section */}
          <Card className="rounded-2xl shadow-md">
            <CardHeader>
              <CardTitle>Agency Profile</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="logo" className="text-base font-medium">Agency Logo</Label>
                <div className="mt-2 flex items-center gap-4">
                  <div className="w-20 h-20 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50">
                    {agencyData.logo ? <img src={agencyData.logo} alt="Agency Logo" className="w-full h-full object-cover rounded-lg" /> : <Upload className="h-8 w-8 text-gray-400" />}
                  </div>
                  <div>
                    <input id="logo" type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                    <Button variant="outline" onClick={() => document.getElementById('logo')?.click()}>
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Logo
                    </Button>
                    <p className="text-sm text-gray-500 mt-1">PNG, JPG up to 5MB</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="agencyName" className="text-base font-medium">Agency Name</Label>
                  <Input id="agencyName" value={agencyData.name} onChange={e => setAgencyData(prev => ({
                  ...prev,
                  name: e.target.value
                }))} className="mt-2" />
                </div>
                <div>
                  <Label htmlFor="website" className="text-base font-medium">Agency Website</Label>
                  <Input id="website" type="url" value={agencyData.website} onChange={e => setAgencyData(prev => ({
                  ...prev,
                  website: e.target.value
                }))} className="mt-2" placeholder="https://your-agency.com" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Information Section */}
          <Card className="rounded-2xl shadow-md">
            <CardHeader>
              <CardTitle>User Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <Label htmlFor="userName" className="flex items-center gap-2 text-base font-medium">
                    <User className="h-4 w-4" />
                    Name
                  </Label>
                  <Input id="userName" value={agencyData.userName} onChange={e => setAgencyData(prev => ({
                  ...prev,
                  userName: e.target.value
                }))} className="mt-2" />
                </div>
                <div>
                  <Label htmlFor="email" className="flex items-center gap-2 text-base font-medium">
                    <Mail className="h-4 w-4" />
                    Email Address
                  </Label>
                  <Input id="email" type="email" value={agencyData.email} onChange={e => setAgencyData(prev => ({
                  ...prev,
                  email: e.target.value
                }))} className="mt-2" />
                </div>
                <div>
                  <Label htmlFor="phone" className="flex items-center gap-2 text-base font-medium">
                    <Phone className="h-4 w-4" />
                    Phone Number
                  </Label>
                  <Input id="phone" type="tel" value={agencyData.phone} onChange={e => setAgencyData(prev => ({
                  ...prev,
                  phone: e.target.value
                }))} className="mt-2" placeholder="+1 (555) 123-4567" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* General Settings Section */}
          <Card className="rounded-2xl shadow-md">
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <Label className="text-base font-medium">Default Language</Label>
                  <Select value={agencyData.defaultLanguage} onValueChange={value => setAgencyData(prev => ({
                  ...prev,
                  defaultLanguage: value
                }))}>
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Spanish</SelectItem>
                      <SelectItem value="fr">French</SelectItem>
                      <SelectItem value="de">German</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label className="text-base font-medium">Timezone</Label>
                  <Select value={agencyData.timezone} onValueChange={value => setAgencyData(prev => ({
                  ...prev,
                  timezone: value
                }))}>
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Europe/Madrid">Europe/Madrid</SelectItem>
                      <SelectItem value="America/New_York">America/New York</SelectItem>
                      <SelectItem value="America/Los_Angeles">America/Los Angeles</SelectItem>
                      <SelectItem value="Asia/Tokyo">Asia/Tokyo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-base font-medium">Agency Size (Number of Employees)</Label>
                  <Select value={agencyData.agencySize} onValueChange={value => setAgencyData(prev => ({
                  ...prev,
                  agencySize: value
                }))}>
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1-10">1-10</SelectItem>
                      <SelectItem value="11-50">11-50</SelectItem>
                      <SelectItem value="51-200">51-200</SelectItem>
                      <SelectItem value="201-500">201-500</SelectItem>
                      <SelectItem value="500+">500+</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="pt-6">
                <Button onClick={handleSaveChanges} className="bg-indigo-600 hover:bg-indigo-700">
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="team" className="space-y-4">
          <Card className="rounded-2xl shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Team Members</span>
                <Dialog open={isInviteModalOpen} onOpenChange={setIsInviteModalOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-indigo-600 hover:bg-indigo-700">
                      <Plus className="h-4 w-4 mr-2" />
                      Invite Teammate
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Invite Team Member</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 pt-4">
                      <div>
                        <Label htmlFor="inviteEmail">Email Address</Label>
                        <Input id="inviteEmail" type="email" value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} placeholder="teammate@company.com" className="mt-1" />
                      </div>
                      <div>
                        <Label>Role</Label>
                        <Select value={inviteRole} onValueChange={setInviteRole}>
                          <SelectTrigger className="mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Admin">Admin</SelectItem>
                            <SelectItem value="Member">Member</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex gap-2 pt-4">
                        <Button onClick={handleInviteUser} className="flex-1">
                          Send Invitation
                        </Button>
                        <Button variant="outline" onClick={() => setIsInviteModalOpen(false)}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {teamMembers.map(member => <TableRow key={member.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={member.avatar} />
                            <AvatarFallback>
                              {member.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium">{member.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-gray-600">{member.email}</TableCell>
                      <TableCell>
                        <Badge variant={member.role === 'Admin' ? 'default' : 'secondary'}>
                          {member.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={member.status === 'Active' ? 'default' : 'secondary'}>
                          {member.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>)}
                </TableBody>
              </Table>
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
                      {mockAgency.subscription.paymentHistory.map((payment, index) => <tr key={index}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            {new Date(payment.paymentDate.seconds * 1000).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            ${payment.amount.toFixed(2)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-mono">
                            {payment.transactionId}
                          </td>
                        </tr>)}
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
    </div>;
};
export default Profile;