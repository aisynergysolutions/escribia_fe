import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid'; // <-- Add this import
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Copy, Check, ExternalLink, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Client } from '../types';
import { useClients } from '../context/ClientsContext';
import { useAuth } from '@/context/AuthContext';

interface AddClientModalProps {
  onAddClient: (client: Client) => void;
  children: React.ReactNode;
}

const AddClientModal: React.FC<AddClientModalProps> = ({
  onAddClient,
  children
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [clientName, setClientName] = useState('');
  const [copied, setCopied] = useState(false);
  const [clientId, setClientId] = useState<string>(''); // <-- Add this state
  const [isSubmitting, setIsSubmitting] = useState(false); // Add this state
  const { toast } = useToast();
  const { addClient } = useClients();
  const { currentUser } = useAuth();

  // Build Tally.so URL dynamically
  const tallyUrl = `https://tally.so/r/wkXKad?agency=${currentUser?.uid || 'error'}&client=${clientId || 'error'}`;

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

  const handleAddClient = async () => {
    if (!clientName.trim()) {
      toast({
        title: "Missing Name",
        description: "Please enter a client name.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true); // Start spinner
    try {
      await addClient({
        id: clientId,
        clientName: clientName.trim(),
        onboarding_link: tallyUrl,
      });
      toast({
        title: "Client Added Successfully!",
        description: `${clientName} has been added with onboarding status. Share the link to complete setup.`
      });

      setClientName('');
      setIsOpen(false);
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to add client.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false); // Stop spinner
    }
  };

  const handleCancel = () => {
    setClientName('');
    setIsOpen(false);
  };

  // Generate a new UUID when modal opens
  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (open) {
      setClientId(uuidv4());
    } else {
      setClientId('');
      setClientName('');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Add New Client</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Instructional Text */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800 leading-relaxed">
              <strong>How it works:</strong> First, enter your client's name and click "Add New Client" to create their profile. 
              Then, share the onboarding link with your client so they can provide detailed information about their company, 
              brand, and preferences. Once they complete the onboarding form, you'll be able to start generating personalized 
              content for them.
            </p>
          </div>

          {/* Client Name Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Client Name *
            </label>
            <Input
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              placeholder="Enter client or company name"
              className="w-full"
            />
          </div>

          {/* Link Sharing Component */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Client Onboarding Link
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
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleOpenForm}
              className="w-full mt-2"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Preview Onboarding Form
            </Button>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={handleCancel} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button 
              onClick={handleAddClient}
              className="bg-indigo-600 hover:bg-indigo-700"
              disabled={!clientName.trim() || isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Adding...
                </>
              ) : (
                "Add New Client"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddClientModal;
