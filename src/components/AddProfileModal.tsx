import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Copy, Check, ExternalLink, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useParams } from 'react-router-dom';
import { useProfiles } from '@/context/ProfilesContext';
import { useAuth } from '@/context/AuthContext';

interface AddProfileModalProps {
  children: React.ReactNode;
  clientId?: string; // Pass clientId from parent if needed
}

const AddProfileModal: React.FC<AddProfileModalProps> = ({
  children,
  clientId: clientIdProp = ''
}) => {
  const { clientId } = useParams<{ clientId: string }>();
  const { addProfile } = useProfiles();
  const { currentUser } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [profileId, setProfileId] = useState('');
  const [profileName, setProfileName] = useState('');
  const [profileType, setprofileType] = useState<'Company Account' | 'Person' | ''>('');
  const [personRole, setPersonRole] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  // Get the current agency ID from the authenticated user
  const agencyId = currentUser?.uid;

  // Generate Tally URL based on role, including the "role" parameter
  const tallyUrl = agencyId ? (
    profileType === 'Company Account'
      ? `https://tally.so/r/wM2YQg?agency=${agencyId}&client=${clientId}&profile=${profileId}&role=company&client_name=${encodeURIComponent(profileName || 'Could not find profile name')}`
      : profileType === 'Person'
        ? `https://tally.so/r/w8VjDO?agency=${agencyId}&client=${clientId}&profile=${profileId}&role=person&client_name=${encodeURIComponent(profileName || 'Could not find profile name')}`
        : ''
  ) : '';

  const handleCopyLink = async () => {
    if (!tallyUrl) {
      toast({
        title: "Error",
        description: "No onboarding link available. Please ensure you're signed in and have selected a profile type.",
        variant: "destructive"
      });
      return;
    }

    try {
      await navigator.clipboard.writeText(tallyUrl);
      setCopied(true);
      toast({
        title: "Link Copied!",
        description: "The onboarding link has been copied to your clipboard."
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast({
        title: "Copy Failed",
        description: "Unable to copy link. Please try selecting and copying manually.",
        variant: "destructive"
      });
    }
  };

  const handleOpenForm = () => {
    if (!tallyUrl) {
      toast({
        title: "Error",
        description: "No onboarding link available. Please ensure you're signed in and have selected a profile type.",
        variant: "destructive"
      });
      return;
    }
    window.open(tallyUrl, '_blank', 'noopener,noreferrer');
  };

  const handleAddProfile = async () => {
    if (!allFieldsFilled) return;

    if (!agencyId) {
      toast({
        title: "Error",
        description: "No agency ID available. Please ensure you're signed in.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await addProfile(clientId, {
        id: profileId,
        profileName,
        role: profileType === 'Person' ? personRole : 'Company Account',
        profileType: profileType === 'Person' ? 'Person' : 'Company',
        status: 'Onboarding',
        onboardingLink: tallyUrl,
        createdAt: new Date(),
        clientId,
      });

      toast({
        title: "Profile Added",
        description: `Profile "${profileName}" has been created successfully.`
      });

      setIsOpen(false);
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to add profile. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Generate a new UUID when modal opens
  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (open) {
      setProfileId(uuidv4());
      setProfileName('');
      setprofileType('');
      setPersonRole('');
    }
  };

  const allFieldsFilled =
    profileName.trim() &&
    profileType &&
    profileId &&
    clientId &&
    agencyId &&
    (profileType !== 'Person' || personRole.trim());

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Add New Profile</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          {!agencyId && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-800">
                <strong>Error:</strong> No agency ID available. Please ensure you're signed in.
              </p>
            </div>
          )}

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800 leading-relaxed">
              <strong>How it works:</strong> Create a profile and then connect it to a LinkedIn account to start posting on their behalf. Send your client the link below to help us understand their personality and preferences before onboarding, whether it is a Company profile or an Individual.
            </p>
          </div>

          {/* Profile Name Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Profile Name *
            </label>
            <Input
              value={profileName}
              onChange={e => setProfileName(e.target.value)}
              placeholder="Enter profile name"
              className="w-full"
            />
          </div>

          {/* Role Dropdown */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Role *
            </label>
            <Select value={profileType} onValueChange={v => setprofileType(v as 'Company Account' | 'Person')}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select role type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Company Account">Company Account</SelectItem>
                <SelectItem value="Person">Person</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Person Role Input */}
          {profileType === 'Person' && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Person Role
              </label>
              <Input
                value={personRole}
                onChange={e => setPersonRole(e.target.value)}
                placeholder="CEO, COO, etc..."
                className="w-full"
              />
            </div>
          )}

          {/* Link Sharing Component */}
          {profileType && agencyId && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Profile Onboarding Link
              </label>
              <div className="relative">
                <Input
                  value={tallyUrl}
                  readOnly
                  className="pr-32 bg-gray-50 border-gray-200 text-gray-700 cursor-default"
                />
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={handleCopyLink}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 h-7 px-3"
                  disabled={!tallyUrl}
                >
                  {copied ? (
                    <>
                      <Check className="h-3 w-3 mr-1" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="h-3 w-3 mr-1" />
                      Copy Link
                    </>
                  )}
                </Button>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleOpenForm}
                className="w-full mt-2"
                disabled={!tallyUrl}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Preview Onboarding Form
              </Button>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleAddProfile}
              className="bg-indigo-600 hover:bg-indigo-700"
              disabled={!allFieldsFilled || isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Adding...
                </>
              ) : (
                "Add Profile"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddProfileModal;
