import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Copy, Check, Trash2, Loader2, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useProfiles } from '@/context/ProfilesContext';
import { useParams } from 'react-router-dom';

interface OnboardingProfileModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profileName: string;
  onboardingLink?: string;
  onDeleteProfile: () => Promise<void>;
}

const OnboardingProfileModal: React.FC<OnboardingProfileModalProps> = ({
  open,
  onOpenChange,
  profileName,
  onboardingLink,
  onDeleteProfile,
}) => {
  const [copied, setCopied] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();
  const { clientId } = useParams<{ clientId: string }>();
  const { deleteProfile } = useProfiles();

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(onboardingLink || '');
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

  const handleDelete = async () => {
    if (!clientId || !onDeleteProfile) return;
    setIsDeleting(true);
    try {
      await deleteProfile(clientId, onboardingLink?.split('profile=')[1]?.split('&')[0] || ''); // or pass profileId as a prop for reliability
      await onDeleteProfile();
      onOpenChange(false);
      toast({
        title: "Profile Deleted",
        description: `${profileName} has been removed and onboarding access canceled.`
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to delete profile.",
        variant: "destructive"
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Onboarding Pending</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          {/* Status Message */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm text-yellow-800 leading-relaxed">
              <strong>{profileName}</strong> hasn't completed their onboarding form yet.
              As soon as we receive their responses, you'll be able to start generating
              personalized content for them.
            </p>
          </div>
          {/* Onboarding Link */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Onboarding Link
            </label>
            <p className="text-xs text-gray-500 mb-2">
              Share this link with your client to complete their onboarding
            </p>
            <div className="relative">
              <Input
                value={onboardingLink || ''}
                readOnly
                className="pr-32 bg-gray-50 border-gray-200 text-gray-700 cursor-default"
              />
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={handleCopyLink}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 h-7 px-3"
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
          </div>

          {/* Refresh Notice */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-xs text-blue-700 leading-relaxed">
              Think the form has already been completed?{' '}
              <button
                onClick={handleRefresh}
                className="inline-flex items-center text-blue-800 hover:text-blue-900 font-medium underline underline-offset-2 hover:no-underline transition-all duration-200"
              >
                <RefreshCw className="h-3 w-3 mr-1" />
                Click here to refresh the page
              </button>
              {' '}and check for updates.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between pt-4 border-t">
            <Button
              variant="destructive"
              size="sm"
              disabled={isDeleting}
              onClick={handleDelete}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete Profile"
              )}
            </Button>
            <Button onClick={() => onOpenChange(false)} disabled={isDeleting}>
              Ok
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OnboardingProfileModal;
