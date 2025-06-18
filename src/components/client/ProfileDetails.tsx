
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit3, Save, X, Linkedin, User } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from "@/components/ui/separator";
import StatusBadge from '../common/StatusBadge';
import EditableField from './EditableField';
import { SubClient } from '../../types/interfaces';

const ProfileDetails: React.FC = () => {
  const { clientId, profileId } = useParams<{ clientId: string; profileId: string }>();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);

  // Mock profile data - in real app, this would come from API
  const [profile, setProfile] = useState<SubClient>({
    id: profileId || '',
    name: profileId === 'company-1' ? 'TechCorp Solutions' : profileId === 'ceo-1' ? 'Sarah Johnson' : 'Michael Chen',
    role: profileId === 'company-1' ? 'Company Account' : profileId === 'ceo-1' ? 'CEO' : 'CTO',
    profileImage: '',
    writingStyle: profileId === 'company-1' 
      ? 'Professional and informative corporate voice' 
      : profileId === 'ceo-1' 
        ? 'Thought leadership, strategic insights' 
        : 'Technical expertise, innovation-focused',
    linkedinConnected: profileId !== 'cto-1',
    linkedinAccountName: profileId === 'company-1' ? 'TechCorp Solutions' : profileId === 'ceo-1' ? 'Sarah Johnson' : '',
    linkedinExpiryDate: profileId === 'company-1' ? 'June 15, 2025' : 'July 20, 2025',
    customInstructions: profileId === 'company-1' 
      ? 'Focus on industry insights and company achievements. Highlight our innovative solutions and client success stories.' 
      : profileId === 'ceo-1' 
        ? 'Share vision, industry trends, and leadership perspectives. Focus on thought leadership and strategic insights.' 
        : 'Technical insights, product development, innovation. Share technical expertise and engineering perspectives.',
    createdAt: { seconds: Date.now() / 1000, nanoseconds: 0 }
  });

  const [formData, setFormData] = useState({
    name: profile.name,
    role: profile.role,
    writingStyle: profile.writingStyle || '',
    customInstructions: profile.customInstructions || '',
    linkedinAccountName: profile.linkedinAccountName || ''
  });

  const handleSave = () => {
    setProfile(prev => ({
      ...prev,
      ...formData
    }));
    setIsEditing(false);
  };

  const handleCancel = () => {
    setFormData({
      name: profile.name,
      role: profile.role,
      writingStyle: profile.writingStyle || '',
      customInstructions: profile.customInstructions || '',
      linkedinAccountName: profile.linkedinAccountName || ''
    });
    setIsEditing(false);
  };

  const getProfileStatus = () => {
    if (profile.linkedinConnected) return 'active';
    return 'onboarding';
  };

  // Mock brand profile data
  const brandProfile = {
    brandPersonality: ['Professional', 'Innovative', 'Trustworthy'],
    brandTone: 'Professional yet approachable',
    emotionsToEvoke: ['Trust', 'Confidence', 'Innovation'],
    coreValues: 'Innovation, Excellence, Integrity, Customer Success',
    brandStory: 'Founded with a vision to transform how businesses leverage technology, we have grown from a small startup to an industry leader.',
    missionStatement: 'To empower businesses through innovative technology solutions that drive growth and success.',
    uniqueSellingProposition: 'We combine cutting-edge technology with personalized service to deliver solutions that truly make a difference.',
    linkedinProfileUrl: `https://linkedin.com/in/${profile.linkedinAccountName?.toLowerCase().replace(' ', '-') || 'profile'}`
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => navigate(`/clients/${clientId}/settings`)}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Settings
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">Profile Details</h1>
          <p className="text-gray-600">Manage profile information and settings</p>
        </div>
      </div>

      {/* Profile Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={profile.profileImage} />
                <AvatarFallback>
                  <User className="h-8 w-8" />
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-xl font-semibold">{profile.name}</h2>
                <Badge variant="outline" className="mt-1">{profile.role}</Badge>
                <div className="mt-2">
                  <StatusBadge status={getProfileStatus()} type="client" />
                </div>
              </div>
            </div>
            {!isEditing ? (
              <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                <Edit3 className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button size="sm" onClick={handleSave}>
                  <Save className="h-4 w-4 mr-2" />
                  Save
                </Button>
                <Button variant="outline" size="sm" onClick={handleCancel}>
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
              </div>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Basic Information */}
          <div>
            <h3 className="font-semibold text-base mb-3">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {!isEditing ? (
                <>
                  <div>
                    <span className="block text-xs font-semibold text-gray-500">Name</span>
                    <span>{profile.name}</span>
                  </div>
                  <div>
                    <span className="block text-xs font-semibold text-gray-500">Role</span>
                    <span>{profile.role}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="block text-xs font-semibold text-gray-500">Writing Style</span>
                    <span>{profile.writingStyle}</span>
                  </div>
                </>
              ) : (
                <>
                  <EditableField
                    label="Name"
                    value={formData.name}
                    onChange={(value) => setFormData(prev => ({ ...prev, name: value }))}
                  />
                  <EditableField
                    label="Role"
                    value={formData.role}
                    onChange={(value) => setFormData(prev => ({ ...prev, role: value }))}
                  />
                  <div className="col-span-2">
                    <EditableField
                      label="Writing Style"
                      value={formData.writingStyle}
                      onChange={(value) => setFormData(prev => ({ ...prev, writingStyle: value }))}
                      type="textarea"
                    />
                  </div>
                </>
              )}
            </div>
          </div>

          <Separator />

          {/* LinkedIn Integration */}
          <div>
            <h3 className="font-semibold text-base mb-3">LinkedIn Integration</h3>
            {profile.linkedinConnected ? (
              <div className="flex items-center gap-3 p-3 bg-secondary rounded-lg">
                <Linkedin className="h-5 w-5 text-[#0A66C2]" />
                <div className="flex-1">
                  <p className="font-medium">Connected as {profile.linkedinAccountName}</p>
                  <p className="text-sm text-gray-600">Expires on {profile.linkedinExpiryDate}</p>
                </div>
                <Button variant="link" className="text-sm">
                  Disconnect
                </Button>
              </div>
            ) : (
              <div className="flex items-center justify-center p-6 bg-secondary rounded-lg">
                <Button>
                  <Linkedin className="h-4 w-4 mr-2" />
                  Connect LinkedIn
                </Button>
              </div>
            )}
            {profile.linkedinConnected && (
              <div className="mt-3">
                <span className="block text-xs font-semibold text-gray-500 mb-1">LinkedIn Profile URL</span>
                <a 
                  href={brandProfile.linkedinProfileUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline text-sm"
                >
                  {brandProfile.linkedinProfileUrl}
                </a>
              </div>
            )}
          </div>

          <Separator />

          {/* Custom Instructions */}
          <div>
            <h3 className="font-semibold text-base mb-3">Custom AI Instructions</h3>
            {!isEditing ? (
              <p className="text-sm leading-relaxed">{profile.customInstructions}</p>
            ) : (
              <EditableField
                label=""
                value={formData.customInstructions}
                onChange={(value) => setFormData(prev => ({ ...prev, customInstructions: value }))}
                type="textarea"
                placeholder="Enter custom AI instructions for this profile..."
              />
            )}
          </div>
        </CardContent>
      </Card>

      {/* Brand Voice & Personality */}
      <Card>
        <CardHeader>
          <CardTitle>Brand Voice & Personality</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <span className="block text-xs font-semibold text-gray-500 mb-2">Brand Personality</span>
              <div className="flex flex-wrap gap-1.5">
                {brandProfile.brandPersonality.map((trait, idx) => (
                  <Badge key={idx} variant="outline">{trait}</Badge>
                ))}
              </div>
            </div>
            <div>
              <span className="block text-xs font-semibold text-gray-500 mb-2">Brand Tone</span>
              <span className="text-sm">{brandProfile.brandTone}</span>
            </div>
            <div className="col-span-2">
              <span className="block text-xs font-semibold text-gray-500 mb-2">Emotions to Evoke</span>
              <div className="flex flex-wrap gap-1.5">
                {brandProfile.emotionsToEvoke.map((emotion, idx) => (
                  <Badge key={idx} variant="secondary">{emotion}</Badge>
                ))}
              </div>
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <div>
              <span className="block text-xs font-semibold text-gray-500 mb-1">Core Values</span>
              <p className="text-sm">{brandProfile.coreValues}</p>
            </div>
            <div>
              <span className="block text-xs font-semibold text-gray-500 mb-1">Brand Story</span>
              <p className="text-sm">{brandProfile.brandStory}</p>
            </div>
            <div>
              <span className="block text-xs font-semibold text-gray-500 mb-1">Mission Statement</span>
              <p className="text-sm">{brandProfile.missionStatement}</p>
            </div>
            <div>
              <span className="block text-xs font-semibold text-gray-500 mb-1">Unique Selling Proposition</span>
              <p className="text-sm">{brandProfile.uniqueSellingProposition}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfileDetails;
