
import React, { useState } from 'react';
import { Plus, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { mockClients } from '../../types';
import { SubClient } from '../../types/interfaces';
import { useNavigate } from 'react-router-dom';
import AddProfileModal from '../AddProfileModal';
import MainProfileCard from './MainProfileCard';

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

  const getLinkedInStatus = (profile: SubClient) => {
    return profile.linkedinConnected ? 'Connected' : 'Not Connected';
  };

  const getLinkedInStatusColor = (profile: SubClient) => {
    return profile.linkedinConnected 
      ? 'bg-green-100 text-green-800' 
      : 'bg-red-100 text-red-800';
  };

  return (
    <div className="space-y-8">
      {/* Main Profile Section */}
      <MainProfileCard client={client} clientId={clientId} />

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
          {profiles.map(profile => (
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
                      <User className="h-6 w-6" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium truncate">{profile.name}</h3>
                    <p className="text-sm text-gray-500 truncate">{profile.role}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 mb-2">
                  {profile.linkedinConnected ? (
                    <Badge className={`text-xs ${getLinkedInStatusColor(profile)}`}>
                      ✓ Connected
                    </Badge>
                  ) : (
                    <Badge className={`text-xs ${getLinkedInStatusColor(profile)}`}>
                      ❗ Not Connected
                    </Badge>
                  )}
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
