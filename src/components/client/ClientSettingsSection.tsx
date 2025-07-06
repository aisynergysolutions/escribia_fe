import React, { useEffect } from 'react';
import { Plus, User, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useNavigate } from 'react-router-dom';
import AddProfileModal from '../AddProfileModal';
import { useClients } from '../../context/ClientsContext';
import { useProfiles } from '../../context/ProfilesContext';

interface ClientSettingsSectionProps {
  clientId: string;
}

const ClientSettingsSection: React.FC<ClientSettingsSectionProps> = ({
  clientId
}) => {
  const { clientDetails } = useClients();
  const navigate = useNavigate();

  // Use ProfilesContext
  const { profiles, loading, error, fetchProfiles } = useProfiles();

  // Fetch profiles when component mounts or clientId changes
  useEffect(() => {
    if (clientId) {
      fetchProfiles(clientId).then(() => {
        console.log('[ClientSettingsSection] Fetched profiles:', profiles);
      });
    }
    // eslint-disable-next-line
  }, [clientId]);

  useEffect(() => {
    // Log profiles whenever they change
    console.log('[ClientSettingsSection] Profiles:', profiles);
  }, [profiles]);

  if (!clientDetails) return null;

  // Company profile card
  // const companyProfile = {
  //   id: 'company-1',
  //   name: clientDetails.clientName,
  //   role: 'Company Account',
  //   profileImage: clientDetails.profileImageUrl,
  //   linkedinConnected: true, // Placeholder
  //   isCompany: true
  // };

  // Map Firestore profiles to card format
  const profileCards = profiles.map(profile => ({
    id: profile.id,
    name: profile.profileName,
    role: profile.role,
    profileImageUrl: '', // Add if you store images
    linkedinConnected: profile.status === 'connected', // Example logic
    isCompany: false,
    status: profile.status || 'Not connected', // Default to 'Not connected' if no status
  }));

  // Combine company profile with sub-profiles
  const allProfiles = [...profileCards];

  const handleProfileClick = (profileId: string) => {
    navigate(`/clients/${clientId}/profiles/${profileId}`);
  };

  const getStatusColor = (status: "Connected" | "Not connected" | "Onboarding") => {
    switch (status) {
      case "Connected":
        return 'bg-green-100 text-green-800 hover:bg-green-100 hover:text-green-800';
      case "Not connected":
        return 'bg-red-100 text-red-800 hover:bg-red-100 hover:text-red-800';
      case "Onboarding":
        return 'bg-blue-100 text-blue-800 hover:bg-blue-100 hover:text-blue-800';
      default:
        return "bg-red-100 text-red-800 hover:bg-red-100 hover:text-red-800";
    }
  };

  const normalizeStatus = (status: string | undefined) => {
    if (!status) return "Not connected";
    const s = status.toLowerCase();
    if (s === "onboarding") return "Onboarding";
    if (s === "connected") return "Connected";
    return "Not connected";
  };

  return (
    <div className="space-y-8">
      {/* Client Header Section */}
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold">{clientDetails.clientName}</h1>
          <Badge className="bg-green-100 text-green-800">
            {clientDetails.status === 'active' ? 'Active' : clientDetails.status}
          </Badge>
        </div>
        <p className="text-gray-600">
          {clientDetails.oneLiner || 'No summary available'}
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

        {loading ? (
          <div>Loading profiles...</div>
        ) : error ? (
          <div className="text-red-600">Error: {error}</div>
        ) : (
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
                      <AvatarImage src={profile.profileImageUrl} />
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
                    <Badge className={`text-xs ${getStatusColor(normalizeStatus(profile.status))}`}>
                      {normalizeStatus(profile.status)}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientSettingsSection;
