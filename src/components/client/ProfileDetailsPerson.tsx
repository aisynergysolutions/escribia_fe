import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit3, Save, X, Linkedin, User, MapPin, Calendar, ExternalLink, Trash2, Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Progress } from '@/components/ui/progress';
import { Slider } from '@/components/ui/slider';
import {
  getPersonProfile,
  updatePersonProfileInfo,
  updatePersonProfileStrategy,
  updatePersonProfileVoice,
  updatePersonProfileGuidelines,
  updatePersonProfileCustomInstructions,
  useProfiles
} from '@/context/ProfilesContext';
import LinkedInConnectionPanel from './LinkedInConnectionPanel';
import { useAuth } from '@/context/AuthContext';
import ProfileDetailsPersonSkeleton from '@/skeletons/ProfileDetailsPersonSkeleton';

// Use types directly from ProfilesContext
import type { Profile } from '@/context/ProfilesContext';

const ProfileDetailsPerson: React.FC = () => {
  const { clientId, profileId } = useParams<{ clientId: string; profileId: string }>();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { deleteProfile, updateProfileInCache } = useProfiles();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [editingSection, setEditingSection] = useState<string | null>(null);

  // Get the agency ID from the current user
  const agencyId = currentUser?.uid;

  // Form data states
  const [profileInfoData, setProfileInfoData] = useState({
    fullName: '',
    currentRole: '',
    joinedDate: '',
    operatingLocation: '',
    linkedinUrl: '',
    language: '',
    customInstructions: '',
    contactEmail: '',
    onboardingLink: '',
    status: '',
    profileType: '',
    createdAt: '',
    clientId: '',
  });

  const [strategyData, setStrategyData] = useState({
    primaryGoal: '',
    audienceFocus: '',
    expertise: '',
  });

  const [voiceData, setVoiceData] = useState({
    personalBrandPersona: '',
    coreTone: '',
    postLengthValue: 0,
    emojiUsageValue: 0,
    addHashtags: false,
  });

  const [guidelinesData, setGuidelinesData] = useState({
    uniquePOV: '',
    personalStories: '',
    hookGuidelines: '',
    sampleCTA: '',
    topicsToAvoid: [] as string[],
    favPosts: [] as string[],
  });

  useEffect(() => {
    if (clientId && profileId && agencyId) {
      getPersonProfile(agencyId, clientId, profileId).then(fetchedProfile => {
        setProfile(fetchedProfile);

        // Populate form data
        setProfileInfoData({
          fullName: fetchedProfile.profileName,
          currentRole: fetchedProfile.role,
          joinedDate: formatDateForInput(fetchedProfile.joinedDate || ''),
          operatingLocation: fetchedProfile.location || '',
          linkedinUrl: `https://linkedin.com/in/${fetchedProfile.linkedin?.linkedinName || ''}`,
          language: fetchedProfile.contentProfile?.contentLanguage || '',
          customInstructions: fetchedProfile.contentProfile?.customInstructions || '',
          contactEmail: fetchedProfile.contactEmail || '',
          onboardingLink: fetchedProfile.onboardingLink,
          status: fetchedProfile.status,
          profileType: fetchedProfile.profileType || '',
          createdAt: fetchedProfile.createdAt,
          clientId: fetchedProfile.clientId,
        });

        setStrategyData({
          primaryGoal: fetchedProfile.contentProfile?.primaryGoal || '',
          audienceFocus: fetchedProfile.contentProfile?.audienceFocus || '',
          expertise: fetchedProfile.contentProfile?.expertise || '',
        });

        setVoiceData({
          personalBrandPersona: fetchedProfile.contentProfile?.contentPersona || '',
          coreTone: fetchedProfile.contentProfile?.coreTones || '',
          postLengthValue: getPostLengthValue(fetchedProfile.contentProfile?.postLength || ''),
          emojiUsageValue: getEmojiUsageValue(fetchedProfile.contentProfile?.emojiUsage || ''),
          addHashtags: fetchedProfile.contentProfile?.addHashtags || false,
        });

        setGuidelinesData({
          uniquePOV: fetchedProfile.contentProfile?.hotTakes || '',
          personalStories: fetchedProfile.contentProfile?.personalStories || '',
          hookGuidelines: fetchedProfile.contentProfile?.hookGuidelines || '',
          sampleCTA: fetchedProfile.contentProfile?.sampleCTA || '',
          topicsToAvoid: fetchedProfile.contentProfile?.topicsToAvoid || [],
          favPosts: fetchedProfile.contentProfile?.favPosts || [],
        });
      });
    }
  }, [clientId, profileId, agencyId]);

  // Helper functions
  const formatDate = (dateString: string | any) => {
    try {
      if (!dateString) return 'N/A';
      if (typeof dateString === 'object' && dateString.seconds) {
        const date = new Date(dateString.seconds * 1000);
        return date.toLocaleDateString();
      }
      const date = new Date(dateString);
      return date.toLocaleDateString();
    } catch (error) {
      return dateString || 'N/A';
    }
  };

  const formatDateForInput = (dateString: string | any) => {
    try {
      if (!dateString) return '';
      if (typeof dateString === 'object' && dateString.seconds) {
        const date = new Date(dateString.seconds * 1000);
        return date.toISOString().split('T')[0];
      }
      if (typeof dateString === 'string' && dateString.includes('T')) {
        const date = new Date(dateString);
        return date.toISOString().split('T')[0];
      }
      const date = new Date(dateString);
      if (!isNaN(date.getTime())) {
        return date.toISOString().split('T')[0];
      }
      return '';
    } catch (error) {
      return '';
    }
  };

  const getPostLengthValue = (postLength: string) => {
    if (postLength.includes('Super Short')) return 0;
    if (postLength.includes('Short')) return 1;
    if (postLength.includes('Medium')) return 2;
    if (postLength.includes('Long')) return 3;
    return 0;
  };

  const getEmojiUsageValue = (emojiUsage: string) => {
    if (emojiUsage.includes('Professional')) return 0;
    if (emojiUsage.includes('Sparingly')) return 1;
    if (emojiUsage.includes('Moderately')) return 2;
    if (emojiUsage.includes('Frequently')) return 3;
    return 0;
  };

  const getPostLengthLabel = (value: number) => {
    const labels = ['Super Short (50–90 words)', 'Short (80–130 words)', 'Medium (130–280 words)', 'Long (280–450 words)'];
    return labels[value] || labels[0];
  };

  const getEmojiUsageLabel = (value: number) => {
    const labels = ['Professional ⚫️', 'Sparingly 👍', 'Moderately 😊', 'Frequently ✨'];
    return labels[value] || labels[0];
  };

  const getFlagEmoji = (language: string) => {
    const flags: { [key: string]: string } = {
      'English': '🇺🇸',
      'Dutch': '🇳🇱',
      'Spanish': '🇪🇸',
      'German': '🇩🇪',
      'French': '🇫🇷',
      'Italian': '🇮🇹',
      'Portuguese': '🇵🇹'
    };
    return flags[language] || '🇺🇸';
  };

  const handleSectionEdit = (section: string) => {
    setEditingSection(section);
  };

  const handleSectionSave = async (section: string) => {
    if (!clientId || !profileId || !agencyId) return;

    try {
      switch (section) {
        case 'profileInfo':
          await updatePersonProfileInfo(agencyId, clientId, profileId, {
            profileName: profileInfoData.fullName,
            role: profileInfoData.currentRole,
            joinedDate: profileInfoData.joinedDate,
            location: profileInfoData.operatingLocation,
            contactEmail: profileInfoData.contactEmail,
            status: profileInfoData.status,
          });

          await updatePersonProfileCustomInstructions(
            agencyId,
            clientId,
            profileId,
            profileInfoData.customInstructions
          );

          if (profile) {
            setProfile({
              ...profile,
              profileName: profileInfoData.fullName,
              role: profileInfoData.currentRole,
              joinedDate: profileInfoData.joinedDate,
              location: profileInfoData.operatingLocation,
              contactEmail: profileInfoData.contactEmail,
              status: profileInfoData.status,
              contentProfile: {
                ...profile.contentProfile,
                customInstructions: profileInfoData.customInstructions,
              }
            });

            // Update the cache so ClientSettingsSection shows updated data
            updateProfileInCache(clientId, profileId, {
              profileName: profileInfoData.fullName,
              role: profileInfoData.currentRole,
              status: profileInfoData.status,
            });
          }
          break;

        case 'strategy':
          await updatePersonProfileStrategy(agencyId, clientId, profileId, {
            primaryGoal: strategyData.primaryGoal,
            audienceFocus: strategyData.audienceFocus,
            expertise: strategyData.expertise,
          });

          if (profile) {
            setProfile({
              ...profile,
              contentProfile: {
                ...profile.contentProfile,
                primaryGoal: strategyData.primaryGoal,
                audienceFocus: strategyData.audienceFocus,
                expertise: strategyData.expertise,
              }
            });

            // Update cache - role might be updated based on expertise
            updateProfileInCache(clientId, profileId, {
              contentProfile: {
                ...profile.contentProfile,
                primaryGoal: strategyData.primaryGoal,
                audienceFocus: strategyData.audienceFocus,
                expertise: strategyData.expertise,
              }
            });
          }
          break;

        case 'voice':
          const postLengthLabels = ['Super Short (50–90 words)', 'Short (80–130 words)', 'Medium (130–280 words)', 'Long (280–450 words)'];
          const emojiUsageLabels = ['Professional ⚫️', 'Sparingly 👍', 'Moderately 😊', 'Frequently ✨'];

          await updatePersonProfileVoice(agencyId, clientId, profileId, {
            contentPersona: voiceData.personalBrandPersona,
            coreTones: voiceData.coreTone,
            postLength: postLengthLabels[voiceData.postLengthValue],
            emojiUsage: emojiUsageLabels[voiceData.emojiUsageValue],
            addHashtags: voiceData.addHashtags,
          });

          if (profile) {
            setProfile({
              ...profile,
              contentProfile: {
                ...profile.contentProfile,
                contentPersona: voiceData.personalBrandPersona,
                coreTones: voiceData.coreTone,
                postLength: postLengthLabels[voiceData.postLengthValue],
                emojiUsage: emojiUsageLabels[voiceData.emojiUsageValue],
                addHashtags: voiceData.addHashtags,
              }
            });

            // Update cache
            updateProfileInCache(clientId, profileId, {
              contentProfile: {
                ...profile.contentProfile,
                contentPersona: voiceData.personalBrandPersona,
                coreTones: voiceData.coreTone,
                postLength: postLengthLabels[voiceData.postLengthValue],
                emojiUsage: emojiUsageLabels[voiceData.emojiUsageValue],
                addHashtags: voiceData.addHashtags,
              }
            });
          }
          break;

        case 'guidelines':
          await updatePersonProfileGuidelines(agencyId, clientId, profileId, {
            hotTakes: guidelinesData.uniquePOV,
            personalStories: guidelinesData.personalStories,
            hookGuidelines: guidelinesData.hookGuidelines,
            sampleCTA: guidelinesData.sampleCTA,
            topicsToAvoid: guidelinesData.topicsToAvoid,
            favPosts: guidelinesData.favPosts,
          });

          if (profile) {
            setProfile({
              ...profile,
              contentProfile: {
                ...profile.contentProfile,
                hotTakes: guidelinesData.uniquePOV,
                personalStories: guidelinesData.personalStories,
                hookGuidelines: guidelinesData.hookGuidelines,
                sampleCTA: guidelinesData.sampleCTA,
                topicsToAvoid: guidelinesData.topicsToAvoid,
                favPosts: guidelinesData.favPosts,
              }
            });

            // Update cache
            updateProfileInCache(clientId, profileId, {
              contentProfile: {
                ...profile.contentProfile,
                hotTakes: guidelinesData.uniquePOV,
                personalStories: guidelinesData.personalStories,
                hookGuidelines: guidelinesData.hookGuidelines,
                sampleCTA: guidelinesData.sampleCTA,
                topicsToAvoid: guidelinesData.topicsToAvoid,
                favPosts: guidelinesData.favPosts,
              }
            });
          }
          break;
      }

      setEditingSection(null);
      // You could add a toast notification here to show success
      console.log(`Successfully updated ${section} section`);
    } catch (error) {
      console.error(`Error updating ${section} section:`, error);
      // You could add error handling/toast notification here
      alert(`Failed to update ${section}. Please try again.`);
    }
  };

  const handleSectionCancel = (section: string) => {
    if (!profile) return;

    // Reset form data to original values
    switch (section) {
      case 'profileInfo':
        setProfileInfoData({
          fullName: profile.profileName,
          currentRole: profile.role,
          joinedDate: formatDateForInput(profile.joinedDate),
          operatingLocation: profile.location,
          linkedinUrl: `https://linkedin.com/in/${profile.linkedin.linkedinName}`,
          language: profile.contentProfile.contentLanguage,
          customInstructions: profile.contentProfile.customInstructions,
          contactEmail: profile.contactEmail,
          onboardingLink: profile.onboardingLink,
          status: profile.status,
          profileType: profile.profileType,
          createdAt: profile.createdAt,
          clientId: profile.clientId,
        });
        break;

      case 'strategy':
        setStrategyData({
          primaryGoal: profile.contentProfile.primaryGoal,
          audienceFocus: profile.contentProfile.audienceFocus,
          expertise: profile.contentProfile.expertise || '',
        });
        break;

      case 'voice':
        setVoiceData({
          personalBrandPersona: profile.contentProfile.contentPersona,
          coreTone: profile.contentProfile.coreTones,
          postLengthValue: getPostLengthValue(profile.contentProfile.postLength),
          emojiUsageValue: getEmojiUsageValue(profile.contentProfile.emojiUsage),
          addHashtags: profile.contentProfile.addHashtags,
        });
        break;

      case 'guidelines':
        setGuidelinesData({
          uniquePOV: profile.contentProfile.hotTakes,
          personalStories: profile.contentProfile.personalStories || '',
          hookGuidelines: profile.contentProfile.hookGuidelines,
          sampleCTA: profile.contentProfile.sampleCTA,
          topicsToAvoid: profile.contentProfile.topicsToAvoid,
          favPosts: profile.contentProfile.favPosts,
        });
        break;
    }

    setEditingSection(null);
  };

  const handleDeleteProfile = async () => {
    if (!clientId || !profileId) return;

    try {
      await deleteProfile(clientId, profileId);
      console.log('Profile deleted successfully');
      navigate(`/clients/${clientId}/settings`);
    } catch (error) {
      console.error('Error deleting profile:', error);
      alert('Failed to delete profile. Please try again.');
    }
  };

  const handleAddTopicToAvoid = () => {
    setGuidelinesData(prev => ({
      ...prev,
      topicsToAvoid: [...prev.topicsToAvoid, 'New topic']
    }));
  };

  const handleRemoveTopicToAvoid = (index: number) => {
    setGuidelinesData(prev => ({
      ...prev,
      topicsToAvoid: prev.topicsToAvoid.filter((_, i) => i !== index)
    }));
  };

  const handleTopicToAvoidChange = (index: number, value: string) => {
    setGuidelinesData(prev => ({
      ...prev,
      topicsToAvoid: prev.topicsToAvoid.map((topic, i) => i === index ? value : topic)
    }));
  };

  const handleAddFavPost = () => {
    setGuidelinesData(prev => ({
      ...prev,
      favPosts: [...prev.favPosts, 'New favorite post']
    }));
  };

  const handleRemoveFavPost = (index: number) => {
    setGuidelinesData(prev => ({
      ...prev,
      favPosts: prev.favPosts.filter((_, i) => i !== index)
    }));
  };

  const handleFavPostChange = (index: number, value: string) => {
    setGuidelinesData(prev => ({
      ...prev,
      favPosts: prev.favPosts.map((post, i) => i === index ? value : post)
    }));
  };

  if (!profile) return <ProfileDetailsPersonSkeleton />;

  const { linkedin, contentProfile } = profile;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(`/clients/${clientId}/settings`)}
          className="flex items-center justify-center rounded-full h-8 w-8 bg-transparent shadow-none border border-gray-100"
          aria-label="Back"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex items-center gap-4">
          <Avatar className="h-12 w-12">
            <AvatarImage src={linkedin.profileImage} />
            <AvatarFallback>
              <User className="h-6 w-6" />
            </AvatarFallback>
          </Avatar>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-semibold">{profile.profileName}</h1>
            <Badge variant="outline">{profile.role}</Badge>
          </div>
        </div>
      </div>

      {/* Card 1: Profile Information & Connection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Profile Information & Connection</span>
            {editingSection !== 'profileInfo' ? (
              <Button variant="outline" size="sm" onClick={() => handleSectionEdit('profileInfo')}>
                <Edit3 className="h-4 w-4 mr-2" />
                Edit
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button size="sm" onClick={() => handleSectionSave('profileInfo')}>
                  <Save className="h-4 w-4 mr-2" />
                  Save
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleSectionCancel('profileInfo')}>
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
              </div>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Full Name
                </Label>
                {editingSection === 'profileInfo' ? (
                  <Input
                    value={profileInfoData.fullName}
                    onChange={(e) => setProfileInfoData(prev => ({ ...prev, fullName: e.target.value }))}
                    className="mt-1"
                  />
                ) : (
                  <p className="text-sm mt-1">{profileInfoData.fullName}</p>
                )}
              </div>
              <div>
                <Label>Current Role</Label>
                {editingSection === 'profileInfo' ? (
                  <Input
                    value={profileInfoData.currentRole}
                    onChange={(e) => setProfileInfoData(prev => ({ ...prev, currentRole: e.target.value }))}
                    className="mt-1"
                  />
                ) : (
                  <p className="text-sm mt-1">{profileInfoData.currentRole}</p>
                )}
              </div>
              <div>
                <Label className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Joined Company Date
                </Label>
                {editingSection === 'profileInfo' ? (
                  <Input
                    type="date"
                    value={profileInfoData.joinedDate}
                    onChange={(e) => setProfileInfoData(prev => ({ ...prev, joinedDate: e.target.value }))}
                    className="mt-1"
                  />
                ) : (
                  <p className="text-sm mt-1">{formatDate(profileInfoData.joinedDate)}</p>
                )}
              </div>
              <div>
                <Label>Contact Email</Label>
                {editingSection === 'profileInfo' ? (
                  <Input
                    type="email"
                    value={profileInfoData.contactEmail}
                    onChange={(e) => setProfileInfoData(prev => ({ ...prev, contactEmail: e.target.value }))}
                    className="mt-1"
                  />
                ) : (
                  <p className="text-sm mt-1">{profileInfoData.contactEmail}</p>
                )}
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <Label className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Operating Location
                </Label>
                {editingSection === 'profileInfo' ? (
                  <Input
                    value={profileInfoData.operatingLocation}
                    onChange={(e) => setProfileInfoData(prev => ({ ...prev, operatingLocation: e.target.value }))}
                    className="mt-1"
                  />
                ) : (
                  <p className="text-sm mt-1">{profileInfoData.operatingLocation}</p>
                )}
              </div>
              <div>
                <Label>LinkedIn URL</Label>
                {editingSection === 'profileInfo' ? (
                  <Input
                    type="url"
                    value={profileInfoData.linkedinUrl}
                    onChange={(e) => setProfileInfoData(prev => ({ ...prev, linkedinUrl: e.target.value }))}
                    className="mt-1"
                  />
                ) : (
                  <a
                    href={profileInfoData.linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:underline flex items-center gap-1 mt-1"
                  >
                    {profileInfoData.linkedinUrl}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
              <div>
                <Label>Content Language</Label>
                {editingSection === 'profileInfo' ? (
                  <Select value={profileInfoData.language} onValueChange={(value) => setProfileInfoData(prev => ({ ...prev, language: value }))}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="English">🇺🇸 English</SelectItem>
                      <SelectItem value="Dutch">🇳🇱 Dutch</SelectItem>
                      <SelectItem value="Spanish">🇪🇸 Spanish</SelectItem>
                      <SelectItem value="German">🇩🇪 German</SelectItem>
                      <SelectItem value="French">🇫🇷 French</SelectItem>
                      <SelectItem value="Italian">🇮🇹 Italian</SelectItem>
                      <SelectItem value="Portuguese">🇵🇹 Portuguese</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <p className="text-sm mt-1 flex items-center gap-2">
                    {getFlagEmoji(profileInfoData.language)} {profileInfoData.language}
                  </p>
                )}
              </div>
              <div>
                <Label>Status</Label>
                <p className="text-sm mt-1">{profile.status}</p>
              </div>
            </div>
          </div>

          <Separator />

          <div>
            <Label className="text-base font-medium">Custom AI Instructions</Label>
            {editingSection === 'profileInfo' ? (
              <Textarea
                value={profileInfoData.customInstructions}
                onChange={(e) => setProfileInfoData(prev => ({ ...prev, customInstructions: e.target.value }))}
                className="mt-2"
                rows={3}
                placeholder="Enter custom AI instructions for this profile..."
              />
            ) : (
              <p className="text-sm mt-2 p-3 bg-muted rounded-md">
                {profileInfoData.customInstructions || 'No custom instructions specified'}
              </p>
            )}
          </div>

          <Separator />

          <div>
            <Label className="text-base font-medium">LinkedIn Integration</Label>
            <div className="mt-3">
              <LinkedInConnectionPanel
                linkedinInfo={linkedin}
                profileId={profileId!}
                clientId={clientId!}
                profileType="Person"
              />
            </div>
          </div>

          <Separator />

          <div>
            <Label className="text-base font-medium">Onboarding Link</Label>
            <a
              href={profile.onboardingLink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-600 hover:underline flex items-center gap-1 mt-1"
            >
              {profile.onboardingLink}
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>

          <Separator />

          {/* Add Profile Details Section */}
          <div>
            <Label className="text-base font-medium">Profile Details</Label>
            <div className="mt-2 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="font-medium">Profile Type:</span>
                <Badge variant="outline" className="ml-2">
                  {profile.profileType}
                </Badge>
              </div>
              <div>
                <span className="font-medium">Created:</span>
                <p className="text-muted-foreground mt-1">{formatDate(profile.createdAt)}</p>
              </div>
              <div>
                <span className="font-medium">Client ID:</span>
                <p className="text-muted-foreground mt-1 font-mono text-xs">{profile.clientId}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Card 2: Strategy & Expertise */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Strategy & Expertise</span>
            {editingSection !== 'strategy' ? (
              <Button variant="outline" size="sm" onClick={() => handleSectionEdit('strategy')}>
                <Edit3 className="h-4 w-4 mr-2" />
                Edit
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button size="sm" onClick={() => handleSectionSave('strategy')}>
                  <Save className="h-4 w-4 mr-2" />
                  Save
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleSectionCancel('strategy')}>
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
              </div>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label className="text-base font-medium">Primary LinkedIn Goal</Label>
            {editingSection === 'strategy' ? (
              <Select value={strategyData.primaryGoal} onValueChange={(value) => setStrategyData(prev => ({ ...prev, primaryGoal: value }))}>
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Build Thought Leadership">Build Thought Leadership</SelectItem>
                  <SelectItem value="Generate Leads">Generate Leads</SelectItem>
                  <SelectItem value="Build Network">Build Network</SelectItem>
                  <SelectItem value="Attract Talent">Attract Talent</SelectItem>
                </SelectContent>
              </Select>
            ) : (
              <div className="mt-2">
                <Badge variant="secondary" className="text-sm px-3 py-1">
                  {strategyData.primaryGoal}
                </Badge>
              </div>
            )}
          </div>

          <Separator />

          <div>
            <Label className="text-base font-medium">Audience Focus</Label>
            {editingSection === 'strategy' ? (
              <Textarea
                value={strategyData.audienceFocus}
                onChange={(e) => setStrategyData(prev => ({ ...prev, audienceFocus: e.target.value }))}
                className="mt-2"
                rows={3}
              />
            ) : (
              <p className="text-sm mt-2 p-3 bg-muted rounded-md">
                {strategyData.audienceFocus}
              </p>
            )}
          </div>

          <Separator />

          <div>
            <Label className="text-base font-medium">Specific Areas of Expertise</Label>
            {editingSection === 'strategy' ? (
              <Textarea
                value={strategyData.expertise}
                onChange={(e) => setStrategyData(prev => ({ ...prev, expertise: e.target.value }))}
                className="mt-2"
                rows={3}
                placeholder="Describe your specific areas of expertise..."
              />
            ) : (
              <p className="text-sm mt-2 p-3 bg-muted rounded-md">
                {strategyData.expertise || 'No expertise areas specified'}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Card 3: Personal Voice & Style */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Personal Voice & Style</span>
            {editingSection !== 'voice' ? (
              <Button variant="outline" size="sm" onClick={() => handleSectionEdit('voice')}>
                <Edit3 className="h-4 w-4 mr-2" />
                Edit
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button size="sm" onClick={() => handleSectionSave('voice')}>
                  <Save className="h-4 w-4 mr-2" />
                  Save
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleSectionCancel('voice')}>
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
              </div>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label className="text-base font-medium">Personal Brand Persona</Label>
                {editingSection === 'voice' ? (
                  <Select value={voiceData.personalBrandPersona} onValueChange={(value) => setVoiceData(prev => ({ ...prev, personalBrandPersona: value }))}>
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="The Seasoned Expert">🏆 The Seasoned Expert</SelectItem>
                      <SelectItem value="The Helpful Guide">🤝 The Helpful Guide</SelectItem>
                      <SelectItem value="The Bold Innovator">⚡ The Bold Innovator</SelectItem>
                      <SelectItem value="The Trusted Peer">👥 The Trusted Peer</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="mt-2 flex items-center gap-2">
                    <Badge variant="secondary" className="px-3 py-1">
                      {voiceData.personalBrandPersona.includes('Seasoned') ? '🏆' :
                        voiceData.personalBrandPersona.includes('Helpful') ? '🤝' :
                          voiceData.personalBrandPersona.includes('Bold') ? '⚡' : '👥'} {voiceData.personalBrandPersona}
                    </Badge>
                  </div>
                )}
              </div>
              <div>
                <Label className="text-base font-medium">Core Tone</Label>
                {editingSection === 'voice' ? (
                  <Select value={voiceData.coreTone} onValueChange={(value) => setVoiceData(prev => ({ ...prev, coreTone: value }))}>
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Confident & Direct">Confident & Direct</SelectItem>
                      <SelectItem value="Friendly & Approachable">Friendly & Approachable</SelectItem>
                      <SelectItem value="Witty & Humorous">Witty & Humorous</SelectItem>
                      <SelectItem value="Formal & Professional">Formal & Professional</SelectItem>
                      <SelectItem value="Casual & Conversational">Casual & Conversational</SelectItem>
                      <SelectItem value="Inspirational & Visionary">Inspirational & Visionary</SelectItem>
                      <SelectItem value="Technical & Precise">Technical & Precise</SelectItem>
                      <SelectItem value="Passionate & Energetic">Passionate & Energetic</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="mt-2">
                    <Badge variant="outline" className="px-3 py-1">
                      {voiceData.coreTone}
                    </Badge>
                  </div>
                )}
              </div>
              <div>
                <Label className="text-base font-medium">Add Hashtags</Label>
                <div className="mt-2 flex items-center space-x-2">
                  {editingSection === 'voice' ? (
                    <Switch
                      checked={voiceData.addHashtags}
                      onCheckedChange={(checked) => setVoiceData(prev => ({ ...prev, addHashtags: checked }))}
                    />
                  ) : (
                    <Switch
                      checked={voiceData.addHashtags}
                      disabled
                    />
                  )}
                  <Label className="text-sm">
                    {voiceData.addHashtags ? 'Automatically add hashtags to posts' : 'No hashtags added to posts'}
                  </Label>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <Label className="text-base font-medium">Average Post Length</Label>
                <div className="mt-2 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Super Short</span>
                    <span className="text-sm font-medium">{getPostLengthLabel(voiceData.postLengthValue)}</span>
                    <span className="text-sm text-muted-foreground">Long</span>
                  </div>
                  {editingSection === 'voice' ? (
                    <Slider
                      value={[voiceData.postLengthValue]}
                      onValueChange={(value) => setVoiceData(prev => ({ ...prev, postLengthValue: value[0] }))}
                      max={3}
                      step={1}
                      className="w-full"
                    />
                  ) : (
                    <Progress value={((voiceData.postLengthValue) / 3) * 100} className="h-2" />
                  )}
                </div>
              </div>
              <div>
                <Label className="text-base font-medium">Emoji Usage</Label>
                <div className="mt-2 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Professional</span>
                    <span className="text-sm font-medium">{getEmojiUsageLabel(voiceData.emojiUsageValue)}</span>
                    <span className="text-sm text-muted-foreground">Frequently</span>
                  </div>
                  {editingSection === 'voice' ? (
                    <Slider
                      value={[voiceData.emojiUsageValue]}
                      onValueChange={(value) => setVoiceData(prev => ({ ...prev, emojiUsageValue: value[0] }))}
                      max={3}
                      step={1}
                      className="w-full"
                    />
                  ) : (
                    <Progress value={((voiceData.emojiUsageValue) / 3) * 100} className="h-2" />
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Card 4: Content Guidelines */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Content Guidelines</span>
            {editingSection !== 'guidelines' ? (
              <Button variant="outline" size="sm" onClick={() => handleSectionEdit('guidelines')}>
                <Edit3 className="h-4 w-4 mr-2" />
                Edit
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button size="sm" onClick={() => handleSectionSave('guidelines')}>
                  <Save className="h-4 w-4 mr-2" />
                  Save
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleSectionCancel('guidelines')}>
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
              </div>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label className="text-base font-medium">Unique POV / "Hot Takes"</Label>
            {editingSection === 'guidelines' ? (
              <Textarea
                value={guidelinesData.uniquePOV}
                onChange={(e) => setGuidelinesData(prev => ({ ...prev, uniquePOV: e.target.value }))}
                className="mt-2"
                rows={3}
              />
            ) : (
              <p className="text-sm mt-2 p-3 bg-muted rounded-md">
                {guidelinesData.uniquePOV}
              </p>
            )}
          </div>

          <Separator />

          <div>
            <Label className="text-base font-medium">Key Personal Stories</Label>
            {editingSection === 'guidelines' ? (
              <Textarea
                value={guidelinesData.personalStories}
                onChange={(e) => setGuidelinesData(prev => ({ ...prev, personalStories: e.target.value }))}
                className="mt-2"
                rows={3}
              />
            ) : (
              <p className="text-sm mt-2 p-3 bg-muted rounded-md">
                {guidelinesData.personalStories}
              </p>
            )}
          </div>

          <Separator />

          <div>
            <Label className="text-base font-medium">Hook Guidelines</Label>
            {editingSection === 'guidelines' ? (
              <Textarea
                value={guidelinesData.hookGuidelines}
                onChange={(e) => setGuidelinesData(prev => ({ ...prev, hookGuidelines: e.target.value }))}
                className="mt-2"
                rows={3}
              />
            ) : (
              <p className="text-sm mt-2 p-3 bg-muted rounded-md">
                {guidelinesData.hookGuidelines}
              </p>
            )}
          </div>

          <Separator />

          <div>
            <Label className="text-base font-medium">Sample Call-to-Action (CTA)</Label>
            {editingSection === 'guidelines' ? (
              <Textarea
                value={guidelinesData.sampleCTA}
                onChange={(e) => setGuidelinesData(prev => ({ ...prev, sampleCTA: e.target.value }))}
                className="mt-2"
                rows={2}
              />
            ) : (
              <blockquote className="mt-2 border-l-2 border-primary pl-4 py-2 bg-muted/50 rounded-r-md">
                <p className="text-sm italic">"{guidelinesData.sampleCTA}"</p>
              </blockquote>
            )}
          </div>

          <Separator />

          <div>
            <Label className="text-base font-medium">Topics / Phrases to Avoid</Label>
            {editingSection === 'guidelines' ? (
              <div className="space-y-2 mt-2">
                {guidelinesData.topicsToAvoid.map((topic, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input
                      value={topic}
                      onChange={(e) => handleTopicToAvoidChange(index, e.target.value)}
                      className="flex-1"
                      placeholder="Topic to avoid"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRemoveTopicToAvoid(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button variant="outline" size="sm" onClick={handleAddTopicToAvoid}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Topic to Avoid
                </Button>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2 mt-2">
                {guidelinesData.topicsToAvoid.map((topic, index) => (
                  <Badge key={index} variant="destructive" className="px-3 py-1 bg-red-100 text-red-800 hover:bg-red-100 hover:text-red-800">
                    {topic}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <Separator />

          <div>
            <Label className="text-base font-medium">Favorite Posts</Label>
            {editingSection === 'guidelines' ? (
              <div className="space-y-2 mt-2">
                {guidelinesData.favPosts.map((post, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Textarea
                      value={post}
                      onChange={(e) => handleFavPostChange(index, e.target.value)}
                      className="flex-1"
                      placeholder="Favorite post example"
                      rows={2}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRemoveFavPost(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button variant="outline" size="sm" onClick={handleAddFavPost}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Favorite Post
                </Button>
              </div>
            ) : (
              <div className="space-y-2 mt-2">
                {guidelinesData.favPosts.map((post, index) => (
                  <div key={index} className="p-3 bg-muted rounded-md">
                    <p className="text-sm">{post}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Delete Profile Button */}
      <div className="flex justify-end">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" size="sm">
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Profile
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                You are about to permanently delete the profile for <strong>{profile.profileName}</strong>.
                All associated data will be lost. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteProfile}
                className="bg-red-600 hover:bg-red-700"
              >
                Yes, delete this profile
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};

export default ProfileDetailsPerson;