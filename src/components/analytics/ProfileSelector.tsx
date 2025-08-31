import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useProfiles, Profile } from '@/context/ProfilesContext';
import { Users, CheckCircle, AlertCircle, Clock } from 'lucide-react';

interface ProfileSelectorProps {
  clientId: string;
  selectedProfileIds: string[];
  onProfileSelectionChange: (profileIds: string[]) => void;
  className?: string;
}

const ProfileSelector: React.FC<ProfileSelectorProps> = ({
  clientId,
  selectedProfileIds,
  onProfileSelectionChange,
  className = ''
}) => {
  const { profiles, loading, error, fetchProfiles, setActiveClientId } = useProfiles();
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    if (clientId) {
      console.log('[ProfileSelector] Setting active client and fetching profiles for:', clientId);
      setActiveClientId(clientId);
      fetchProfiles(clientId);
    }
  }, [clientId, fetchProfiles, setActiveClientId]);

  // Debug log for profiles
  useEffect(() => {
    console.log('[ProfileSelector] Profiles updated:', { 
      clientId, 
      profilesCount: profiles.length, 
      profiles: profiles.map(p => ({ id: p.id, name: p.profileName, connected: p.linkedin?.linkedinConnected }))
    });
  }, [profiles, clientId]);

  const getStatusIcon = (profile: Profile) => {
    if (profile.linkedin?.linkedinConnected) {
      return <CheckCircle className="h-3 w-3 text-green-500" />;
    }
    if (profile.status === 'active') {
      return <Clock className="h-3 w-3 text-amber-500" />;
    }
    return <AlertCircle className="h-3 w-3 text-red-500" />;
  };

  const getStatusColor = (profile: Profile) => {
    if (profile.linkedin?.linkedinConnected) {
      return 'bg-green-50 text-green-700 border-green-200';
    }
    if (profile.status === 'active') {
      return 'bg-amber-50 text-amber-700 border-amber-200';
    }
    return 'bg-red-50 text-red-700 border-red-200';
  };

  const handleProfileToggle = (profileId: string) => {
    const isSelected = selectedProfileIds.includes(profileId);
    if (isSelected) {
      onProfileSelectionChange(selectedProfileIds.filter(id => id !== profileId));
    } else {
      onProfileSelectionChange([...selectedProfileIds, profileId]);
    }
  };

  const handleSelectAll = () => {
    const connectedProfiles = profiles.filter(p => p.linkedin?.linkedinConnected);
    const allConnectedIds = connectedProfiles.map(p => p.id);
    onProfileSelectionChange(allConnectedIds);
  };

  const handleSelectNone = () => {
    onProfileSelectionChange([]);
  };

  const connectedProfiles = profiles.filter(p => p.linkedin?.linkedinConnected);
  const selectedCount = selectedProfileIds.length;
  const connectedCount = connectedProfiles.length;

  if (loading) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <Users className="h-4 w-4 text-gray-400" />
        <span className="text-sm text-gray-500">Loading profiles...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <AlertCircle className="h-4 w-4 text-red-500" />
        <span className="text-sm text-red-600">Failed to load profiles</span>
      </div>
    );
  }

  if (profiles.length === 0) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <Users className="h-4 w-4 text-gray-400" />
        <span className="text-sm text-gray-500">No profiles found</span>
      </div>
    );
  }

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">
            Profile Filter
          </span>
          <Badge variant="outline" className="text-xs">
            {selectedCount === 0 ? 'All' : `${selectedCount} selected`}
          </Badge>
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-xs"
        >
          {isExpanded ? 'Hide' : 'Show'} Profiles
        </Button>
      </div>

      {isExpanded && (
        <div className="bg-gray-50 p-3 rounded-lg space-y-3">
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleSelectAll}
              className="text-xs"
            >
              Select All Connected
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSelectNone}
              className="text-xs"
            >
              Clear Selection
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {profiles.map((profile) => {
              const isSelected = selectedProfileIds.includes(profile.id);
              const isConnected = profile.linkedin?.linkedinConnected;
              
              return (
                <div
                  key={profile.id}
                  className={`
                    p-2 rounded-md border cursor-pointer transition-all
                    ${isSelected 
                      ? 'border-blue-300 bg-blue-50' 
                      : 'border-gray-200 bg-white hover:border-gray-300'
                    }
                    ${!isConnected ? 'opacity-50' : ''}
                  `}
                  onClick={() => isConnected && handleProfileToggle(profile.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 min-w-0">
                      {getStatusIcon(profile)}
                      <span className="text-sm font-medium truncate">
                        {profile.profileName}
                      </span>
                    </div>
                    {isSelected && (
                      <CheckCircle className="h-4 w-4 text-blue-500 flex-shrink-0" />
                    )}
                  </div>
                  <div className="mt-1">
                    <Badge 
                      variant="outline" 
                      className={`text-xs ${getStatusColor(profile)}`}
                    >
                      {isConnected ? 'Connected' : 'Not Connected'}
                    </Badge>
                  </div>
                  {!isConnected && (
                    <p className="text-xs text-gray-500 mt-1">
                      No analytics data available
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          {connectedCount === 0 && (
            <div className="text-center py-4">
              <AlertCircle className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600">
                No profiles have LinkedIn connected yet.
              </p>
              <p className="text-xs text-gray-500">
                Analytics are only available for connected LinkedIn profiles.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ProfileSelector;
