import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Copy, Check, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface OnboardingStatusModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clientName: string;
  onboardingLink?: string; // <-- Add this
}

const OnboardingStatusModal: React.FC<OnboardingStatusModalProps> = ({
  open,
  onOpenChange,
  clientName,
  onboardingLink, // <-- Add this
  onDeleteClient
}) => {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  // Mock Tally.so URL - in production this would be dynamic per client
  const tallyUrl = onboardingLink || "https://tally.so/r/wkXKad?agency=your-agency-id";

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(tallyUrl);
      setCopied(true);
      toast({
        title: "Link Copied!",
        description: "The onboarding link has been copied to your clipboard."
      });

      // Reset the copied state after 2 seconds
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast({
        title: "Copy Failed",
        description: "Unable to copy link. Please try selecting and copying manually.",
        variant: "destructive"
      });
    }
  };

  const handleDeleteConfirm = () => {
    onDeleteClient();
    onOpenChange(false);
    toast({
      title: "Client Deleted",
      description: `${clientName} has been removed and onboarding access canceled.`
    });
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
              <strong>{clientName}</strong> hasn't completed their onboarding form yet. 
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

          {/* Action Buttons */}
          <div className="flex justify-between pt-4 border-t">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Client
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Client</AlertDialogTitle>
                  <AlertDialogDescription>
                    Access to the onboarding form will be canceled. Are you sure you want to delete {clientName}?
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDeleteConfirm} className="bg-red-600 hover:bg-red-700">
                    Delete Client
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <Button onClick={() => onOpenChange(false)}>
              Ok
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OnboardingStatusModal;
