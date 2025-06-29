
import React, { useState } from 'react';
import { Plus, User, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { mockClients } from '../../types';
import { SubClient } from '../../types/interfaces';
import { useNavigate } from 'react-router-dom';
import AddProfileModal from '../AddProfileModal';

interface ClientSettingsSectionProps {
  clientId: string;
}

const ClientSettingsSection: React.FC<ClientSettingsSectionProps> = ({
  clientId
}) => {
  const client = mockClients.find(c => c.id === clientId);
  const navigate = useNavigate();

  // Mock profiles data (excluding the main company profile)
  const [profiles] = useState<SubClient[]>([
    {
      id: 'ceo-1',
      name: 'Sarah Johnson',
      role: 'CEO',
      profileImage: '',
      writingStyle: 'Thought leadership, strategic insights',
      linkedinConnected: true,
      linkedinAccountName: 'Sarah Johnson',
      linkedinExpiryDate: 'July 20, 2025',
      customInstructions: 'Share vision, industry trends, and leadership perspectives',
      createdAt: {
        seconds: Date.now() / 1000,
        nanoseconds: 0
      }
    },
    {
      id: 'cto-1',
      name: 'Michael Chen',
      role: 'CTO',
      profileImage: '',
      writingStyle: 'Technical expertise, innovation-focused',
      linkedinConnected: false,
      customInstructions: 'Technical insights, product development, innovation',
      createdAt: {
        seconds: Date.now() / 1000,
        nanoseconds: 0
      }
    }
  ]);

  if (!client) return null;

  const handleProfileClick = (profileId: string) => {
    navigate(`/clients/${clientId}/profiles/${profileId}`);
  };

  const getLinkedInStatusColor = (connected: boolean) => {
    return connected 
      ? 'bg-green-100 text-green-800' 
      : 'bg-red-100 text-red-800';
  };

  // Create company profile object
  const companyProfile = {
    id: 'company-1',
    name: client.clientName,
    role: 'Company Account',
    profileImage: client.profileImage,
    linkedinConnected: true, // Mock data
    isCompany: true
  };

  // Combine company profile with other profiles
  const allProfiles = [companyProfile, ...profiles];

  return (
    <div className="space-y-8">
      {/* Client Header Section */}
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold">{client.clientName}</h1>
          <Badge className="bg-green-100 text-green-800">
            {client.status === 'active' ? 'Active' : client.status}
          </Badge>
        </div>
        <p className="text-gray-600">
          {client.brandBriefSummary || 'No summary available'}
        </p>
      </div>

      {/* Associated Profiles Section */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold">Associated Profiles</h2>
          <AddProfileModal>
            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white" size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add New Profile
            </Button>
          </AddProfileModal>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {allProfiles.map(profile => (
            <Card 
              key={profile.id} 
              className="cursor-pointer hover:shadow-md transition-shadow border hover:border-blue-200"
              onClick={() => handleProfileClick(profile.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={profile.profileImage} />
                    <AvatarFallback>
                      {profile.isCompany ? (
                        <Building2 className="h-6 w-6" />
                      ) : (
                        <User className="h-6 w-6" />
                      )}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium truncate">{profile.name}</h3>
                    <p className="text-sm text-gray-500 truncate">{profile.role}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Badge className={`text-xs ${getLinkedInStatusColor(profile.linkedinConnected)}`}>
                    {profile.linkedinConnected ? '✓ Connected' : '❗ Not Connected'}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ClientSettingsSection;
