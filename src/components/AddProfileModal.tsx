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
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [profileId, setProfileId] = useState('');
  const [profileName, setProfileName] = useState('');
  const [roleType, setRoleType] = useState<'Company Account' | 'Person' | ''>('');
  const [personRole, setPersonRole] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  // Generate Tally URL based on role, including the "role" parameter
  const tallyUrl =
    roleType === 'Company Account'
      ? `https://tally.so/r/wM2YQg?agency=agency1&client=${clientId}&profile=${profileId}&role=company`
      : roleType === 'Person'
        ? `https://tally.so/r/w8VjDO?agency=agency1&client=${clientId}&profile=${profileId}&role=person`
        : '';

  const handleCopyLink = async () => {
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
    window.open(tallyUrl, '_blank', 'noopener,noreferrer');
  };

  const handleAddProfile = async () => {
    if (!allFieldsFilled) return;
    setIsSubmitting(true);
    try {
      await addProfile(clientId, {
        id: profileId,
        profileName,
        role: roleType === 'Person' ? personRole : 'Company Account',
        status: 'Onboarding',
        onboardingLink: tallyUrl, // <-- use onboardingLink
        createdAt: new Date(),
        clientId,
      });
      setIsOpen(false);
    } catch (err) {
      // Optionally show a toast
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
      setRoleType('');
      setPersonRole('');
    }
  };

  const allFieldsFilled =
    profileName.trim() &&
    roleType &&
    profileId &&
    clientId &&
    (roleType !== 'Person' || personRole.trim());

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
            <Select value={roleType} onValueChange={v => setRoleType(v as 'Company Account' | 'Person')}>
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
          {roleType === 'Person' && (
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
          {roleType && (
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
