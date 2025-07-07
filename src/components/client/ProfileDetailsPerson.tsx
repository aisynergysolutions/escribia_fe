import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Linkedin, User, MapPin, Calendar, ExternalLink } from 'lucide-react';
import { getPersonProfile } from '@/context/ProfilesContext';

// Use types directly from ProfilesContext
import type { Profile } from '@/context/ProfilesContext';

const ProfileDetailsPerson: React.FC = () => {
  const { clientId, profileId } = useParams<{ clientId: string; profileId: string }>();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    if (clientId && profileId) {
      getPersonProfile(clientId, profileId).then(setProfile);
    }
  }, [clientId, profileId]);

  if (!profile) return <div>Loading...</div>;

  const { linkedin, contentProfile } = profile;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={() => navigate(`/clients/${clientId}/settings`)}>
          Back to Settings
        </Button>
        <div className="flex items-center gap-4">
          <Avatar className="h-12 w-12">
            <AvatarImage src={linkedin.profileImage} />
            <AvatarFallback>
              <User className="h-6 w-6" />
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl font-semibold">{profile.profileName}</h1>
            <Badge variant="outline" className="mt-1">{profile.role}</Badge>
          </div>
        </div>
      </div>

      {/* Card: Profile Information */}
      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="mb-2">
                <span className="font-medium">Full Name:</span> {profile.profileName}
              </div>
              <div className="mb-2">
                <span className="font-medium">Role:</span> {profile.role}
              </div>
              <div className="mb-2 flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span className="font-medium">Joined:</span> {profile.joinedDate}
              </div>
              <div className="mb-2 flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span className="font-medium">Location:</span> {profile.location}
              </div>
              <div className="mb-2">
                <span className="font-medium">Contact Email:</span> {profile.contactEmail}
              </div>
              <div className="mb-2">
                <span className="font-medium">Content Language:</span> {contentProfile.contentLanguage}
              </div>
            </div>
            <div>
              <div className="mb-2">
                <span className="font-medium">LinkedIn:</span>
                <a
                  href={`https://linkedin.com/in/${linkedin.linkedinName}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline flex items-center gap-1"
                >
                  {linkedin.linkedinAccountName}
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
              <div className="mb-2">
                <span className="font-medium">LinkedIn Connected:</span> {linkedin.linkedinConnected ? 'Yes' : 'No'}
              </div>
              <div className="mb-2">
                <span className="font-medium">LinkedIn Expiry:</span> {linkedin.linkedinExpiryDate || 'N/A'}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Card: Content Profile */}
      <Card>
        <CardHeader>
          <CardTitle>Content Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <span className="font-medium">Custom Instructions:</span>
            <p className="bg-muted rounded-md p-2">{contentProfile.customInstructions}</p>
          </div>
          <div>
            <span className="font-medium">Hook Guidelines:</span>
            <p className="bg-muted rounded-md p-2">{contentProfile.hookGuidelines}</p>
          </div>
          <div>
            <span className="font-medium">Hot Takes:</span>
            <p className="bg-muted rounded-md p-2">{contentProfile.hotTakes}</p>
          </div>
          <div>
            <span className="font-medium">Primary Goal:</span> {contentProfile.primaryGoal}
          </div>
          <div>
            <span className="font-medium">Core Tones:</span> {contentProfile.coreTones}
          </div>
          <div>
            <span className="font-medium">Audience Focus:</span>
            <p className="bg-muted rounded-md p-2">{contentProfile.audienceFocus}</p>
          </div>
          <div>
            <span className="font-medium">Content Persona:</span> {contentProfile.contentPersona}
          </div>
          <div>
            <span className="font-medium">Topics to Avoid:</span>
            <div className="flex flex-wrap gap-2 mt-1">
              {contentProfile.topicsToAvoid.map((topic, idx) => (
                <Badge key={idx} variant="destructive">{topic}</Badge>
              ))}
            </div>
          </div>
          <div>
            <span className="font-medium">Emoji Usage:</span> {contentProfile.emojiUsage}
          </div>
          <div>
            <span className="font-medium">Sample CTA:</span>
            <blockquote className="border-l-4 border-primary pl-4 py-2 bg-muted/50 rounded-r-md">
              <p className="italic">{contentProfile.sampleCTA}</p>
            </blockquote>
          </div>
          <div>
            <span className="font-medium">Expertise:</span> {contentProfile.expertise}
          </div>
          <div>
            <span className="font-medium">Personal Stories:</span>
            <p className="bg-muted rounded-md p-2">{contentProfile.personalStories}</p>
          </div>
          <div>
            <span className="font-medium">Post Length:</span> {contentProfile.postLength}
          </div>
          <div>
            <span className="font-medium">Favorite Posts:</span>
            <ul className="list-disc ml-6">
              {contentProfile.favPosts.map((post, idx) => (
                <li key={idx}>{post}</li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfileDetailsPerson;