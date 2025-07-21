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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Copy } from 'lucide-react';
import OnboardingProfileModal from '../OnboardingProfileModal';
import ClientSettingsSectionSkeleton from '../../skeletons/ClientSettingsSectionSkeleton';

interface ClientSettingsSectionProps {
  clientId: string;
}

const ClientSettingsSection: React.FC<ClientSettingsSectionProps> = ({
  clientId
}) => {
  const { clientDetails } = useClients();
  const navigate = useNavigate();

  // Use ProfilesContext
  const { profiles, loading, error, fetchProfiles, setActiveClientId } = useProfiles();

  // Fetch profiles when component mounts or clientId changes
  useEffect(() => {
    setActiveClientId(clientId);
    fetchProfiles(clientId); // Will only fetch if not cached
    // eslint-disable-next-line
  }, [clientId]);

  useEffect(() => {
    // Log profiles whenever they change
    console.log('[ClientSettingsSection] Profiles:', profiles);
  }, [profiles]);

  if (!clientDetails) return null;

  // Map Firestore profiles to card format
  const profileCards = profiles.map(profile => ({
    id: profile.id,
    name: profile.profileName,
    role: profile.role,
    profileType: profile.profileType || '', // Optional, if you want to include profileType
    profileImageUrl: '', // Add if you store images
    linkedinConnected: profile.status === 'connected',
    isCompany: false,
    status: profile.status || 'Not connected',
    onboardingLink: profile.onboardingLink || '',
  }));

  // Combine company profile with sub-profiles
  const allProfiles = [...profileCards];

  const handleProfileClick = (profileId: string) => {
    const profile = allProfiles.find(p => p.id === profileId);
    if (profile?.status === 'Onboarding') {
      setSelectedProfile(profile);
      setOnboardingDialogOpen(true);
    } else {
      navigate(`/clients/${clientId}/profiles/${profileId}`);
    }
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

  const [onboardingDialogOpen, setOnboardingDialogOpen] = React.useState(false);
  const [selectedProfile, setSelectedProfile] = React.useState<any>(null);

  const handleDeleteProfile = async () => {
    // Implement Firestore delete logic for subClient here
    // Example:
    // await deleteProfile(clientId, selectedProfile.id);
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
          <ClientSettingsSectionSkeleton profileCount={6} />
        ) : error ? (
          <div className="text-center text-red-600 py-8">
            <p className="text-lg font-medium">Error loading profiles</p>
            <p className="text-sm mt-2">{error}</p>
          </div>
        ) : allProfiles.length === 0 ? (
          <div className="text-center text-gray-500 py-12">
            <User className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p className="text-lg font-medium mb-2">No profiles yet</p>
            <p className="text-sm">Add a profile to start posting for this client</p>
          </div>
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
                        {profile.role?.toLowerCase().includes("company") ? (
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

      {/* Onboarding Dialog */}
      <OnboardingProfileModal
        open={onboardingDialogOpen}
        onOpenChange={setOnboardingDialogOpen}
        profileName={selectedProfile?.name || ''}
        onboardingLink={selectedProfile?.onboardingLink}
        onDeleteProfile={handleDeleteProfile}
      />
    </div>
  );
};

export default ClientSettingsSection;
