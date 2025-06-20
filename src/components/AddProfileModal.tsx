
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Copy, Check, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AddProfileModalProps {
  children: React.ReactNode;
}

const AddProfileModal: React.FC<AddProfileModalProps> = ({
  children
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  // Tally.so URL for profile onboarding
  const tallyUrl = "https://tally.so/r/w8VjDO";

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

  const handleOpenForm = () => {
    window.open(tallyUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Add New Profile</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Instructional Text */}
          <p className="text-gray-600 leading-relaxed">
            To set up a new profile (e.g., a CEO or Head of Marketing), use the unique onboarding link below. You can complete the form on their behalf or copy the link and send it to them to fill out.
          </p>

          {/* Link Sharing Component */}
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
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleOpenForm} className="bg-indigo-600 hover:bg-indigo-700">
              <span className="mr-2">Open Form</span>
              <ExternalLink className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddProfileModal;
