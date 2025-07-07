import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getCompanyProfile, getPersonProfile, CompanyProfile, Profile } from '@/context/ProfilesContext';
import ProfileDetailsCompany from './ProfileDetailsCompany';
import ProfileDetailsPerson from './ProfileDetailsPerson';

const ProfileDetailsRouter: React.FC = () => {
  const { clientId, profileId } = useParams<{ clientId: string; profileId: string }>();
  const [profileType, setProfileType] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!clientId || !profileId) return;
    // Fetch the profileType field only
    getPersonProfile(clientId, profileId)
      .then(profile => {
        setProfileType(profile.profileType);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [clientId, profileId]);

  if (loading) return <div>Loading...</div>;
  if (!profileType) return <div>Profile not found.</div>;

  if (profileType === 'company' || profileType === 'Company') {
    return <ProfileDetailsCompany />;
  }
  // Default to person if not company
  return <ProfileDetailsPerson />;
};

export default ProfileDetailsRouter;