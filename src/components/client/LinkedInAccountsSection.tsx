
import React, { useState } from 'react';
import { Plus, Linkedin, RefreshCw, Settings, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { mockLinkedInAccounts } from '../../types';
import { LinkedInAccount } from '../../types/linkedinAccount';

interface LinkedInAccountsSectionProps {
  clientId: string;
}

const LinkedInAccountsSection: React.FC<LinkedInAccountsSectionProps> = ({ clientId }) => {
  const [accounts] = useState<LinkedInAccount[]>(
    mockLinkedInAccounts.filter(account => account.clientId === clientId)
  );

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'connected': return 'default';
      case 'expired': return 'destructive';
      case 'disconnected': return 'secondary';
      case 'pending': return 'outline';
      default: return 'secondary';
    }
  };

  const getAccountTypeLabel = (type: string) => {
    switch (type) {
      case 'company': return 'Company';
      case 'executive': return 'Executive';
      case 'department': return 'Department';
      case 'other': return 'Other';
      default: return type;
    }
  };

  const formatDate = (timestamp: { seconds: number; nanoseconds: number } | undefined) => {
    if (!timestamp) return 'Never';
    return new Date(timestamp.seconds * 1000).toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-semibold">LinkedIn Accounts</h2>
          <p className="text-gray-600">Manage multiple LinkedIn accounts for this client</p>
        </div>
        <Button className="bg-indigo-600 hover:bg-indigo-700">
          <Plus className="h-4 w-4 mr-2" />
          Add Account
        </Button>
      </div>

      <div className="grid gap-4">
        {accounts.map((account) => (
          <Card key={account.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={account.profileImage} alt={account.displayName} />
                    <AvatarFallback className="bg-blue-100 text-blue-700">
                      {account.displayName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-lg">{account.accountName}</CardTitle>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs">
                        {getAccountTypeLabel(account.accountType)}
                      </Badge>
                      <Badge variant={getStatusBadgeVariant(account.connectionStatus)} className="text-xs">
                        {account.connectionStatus}
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm">
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Settings className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Total Posts</span>
                  <div className="font-medium">{account.totalPosts}</div>
                </div>
                <div>
                  <span className="text-gray-500">Last Post</span>
                  <div className="font-medium">{formatDate(account.lastPostAt)}</div>
                </div>
                <div>
                  <span className="text-gray-500">Connection Expires</span>
                  <div className="font-medium">{formatDate(account.connectionExpiresAt)}</div>
                </div>
                <div>
                  <span className="text-gray-500">Actions</span>
                  <div className="flex gap-1 mt-1">
                    {account.connectionStatus === 'disconnected' || account.connectionStatus === 'expired' ? (
                      <Button size="sm" variant="outline" className="h-7 text-xs">
                        <Linkedin className="h-3 w-3 mr-1" />
                        Connect
                      </Button>
                    ) : (
                      <Button size="sm" variant="outline" className="h-7 text-xs">
                        <RefreshCw className="h-3 w-3 mr-1" />
                        Refresh
                      </Button>
                    )}
                  </div>
                </div>
              </div>
              
              {account.writingStyle && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <span className="text-gray-500 text-xs">Writing Style: </span>
                  <span className="text-sm">{account.writingStyle}</span>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {accounts.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <Linkedin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No LinkedIn accounts connected</h3>
          <p className="text-gray-500 mb-4">Add LinkedIn accounts to start managing posts for this client</p>
          <Button className="bg-indigo-600 hover:bg-indigo-700">
            <Plus className="h-4 w-4 mr-2" />
            Add First Account
          </Button>
        </div>
      )}
    </div>
  );
};

export default LinkedInAccountsSection;
