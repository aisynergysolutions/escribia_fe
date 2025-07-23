import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getCompanyProfile, getPersonProfile, CompanyProfile, Profile } from '@/context/ProfilesContext';
import ProfileDetailsCompany from './ProfileDetailsCompany';
import ProfileDetailsPerson from './ProfileDetailsPerson';
import ProfileDetailsCompanySkeleton from '@/skeletons/ProfileDetailsCompanySkeleton';
import ProfileDetailsPersonSkeleton from '@/skeletons/ProfileDetailsPersonSkeleton';
import { useAuth } from '@/context/AuthContext';

const ProfileDetailsRouter: React.FC = () => {
  const { clientId, profileId } = useParams<{ clientId: string; profileId: string }>();
  const { currentUser } = useAuth();
  const [profileType, setProfileType] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [error, setError] = useState(false);

  // Get the agency ID from the current user
  const agencyId = currentUser?.uid;

  useEffect(() => {
    if (!clientId || !profileId || !agencyId) return;

    // Try to fetch as person profile first to determine the type
    getPersonProfile(agencyId, clientId, profileId)
      .then(profile => {
        setProfileType(profile.profileType);
        setLoading(false);
        // Don't set dataLoaded yet - let the actual components handle their own loading
      })
      .catch(() => {
        // If person profile fails, try company profile
        getCompanyProfile(agencyId, clientId, profileId)
          .then(profile => {
            setProfileType('company');
            setLoading(false);
            // Don't set dataLoaded yet - let the actual components handle their own loading
          })
          .catch(() => {
            setError(true);
            setLoading(false);
          });
      });
  }, [clientId, profileId, agencyId]);

  if (loading) {
    // Show a generic person skeleton while determining profile type
    return <ProfileDetailsPersonSkeleton />;
  }

  if (error || !profileType) {
    return <div>Profile not found.</div>;
  }

  if (profileType === 'company' || profileType === 'Company') {
    return <ProfileDetailsCompany />;
  }

  // Default to person if not company
  return <ProfileDetailsPerson />;
};

export default ProfileDetailsRouter;