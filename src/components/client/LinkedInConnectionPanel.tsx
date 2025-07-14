import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Linkedin, Loader2, AlertCircle } from "lucide-react";
import { useLinkedin } from "@/context/LinkedinContext";
import { LinkedInInfo } from "@/context/ProfilesContext";

interface LinkedInConnectionPanelProps {
  style?: React.CSSProperties;
  linkedinInfo: LinkedInInfo;
  profileId: string;
  clientId: string;
  agencyId?: string;
}

const LinkedInConnectionPanel: React.FC<LinkedInConnectionPanelProps> = ({
  style,
  linkedinInfo,
  profileId,
  clientId,
  agencyId = "agency1",
}) => {
  const { isConnecting, connectLinkedIn, refreshProfile } = useLinkedin();
  const [error, setError] = useState<string | null>(null);

  const handleConnectClick = async () => {
    try {
      setError(null);
      await connectLinkedIn(profileId, agencyId, clientId);
    } catch (error) {
      console.error('Failed to connect LinkedIn:', error);
      setError('Failed to initiate LinkedIn connection. Please try again.');
    }
  };

  const formatExpiryDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString();
    } catch {
      return dateString;
    }
  };

  if (linkedinInfo.linkedinConnected) {
    // Connected state - show full LinkedIn info
    return (
      <div
        style={style}
        className="flex items-center justify-between bg-secondary/70 hover:bg-secondary/90 focus-within:ring-2 focus-within:ring-blue-400 transition rounded-lg px-6 py-3 outline-none"
        tabIndex={0}
        aria-label="LinkedIn connected"
      >
        <div className="flex items-center gap-2">
          <Linkedin className="h-5 w-5 text-[#0A66C2]" />
          <span className="font-medium text-base mr-3">LinkedIn</span>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="font-semibold">
              {linkedinInfo.linkedinAccountName || linkedinInfo.linkedinProfile?.name || 'Connected'}
            </span>
          </div>
          <div className="text-xs text-muted-foreground space-x-2">
            <span>Expires {formatExpiryDate(linkedinInfo.linkedinExpiryDate)}</span>
            {linkedinInfo.connectedAt && (
              <span>• Connected {formatExpiryDate(linkedinInfo.connectedAt)}</span>
            )}
            {linkedinInfo.linkedinProfile?.email && (
              <span>• {linkedinInfo.linkedinProfile.email}</span>
            )}
          </div>
        </div>
        <button
          className="text-xs text-blue-700 underline underline-offset-2 hover:text-blue-900"
          onClick={handleConnectClick}
          type="button"
          disabled={isConnecting}
        >
          {isConnecting ? 'Reconnecting...' : 'Reconnect'}
        </button>
      </div>
    );
  }

  // Not connected state - centered layout
  return (
    <div
      style={style}
      className="bg-secondary/70 hover:bg-secondary/90 transition rounded-lg px-6 py-4"
      aria-label="LinkedIn not connected"
    >
      <div className="flex flex-col items-center space-y-3">
        <Button
          onClick={handleConnectClick}
          type="button"
          disabled={isConnecting}
          className="flex items-center gap-2 bg-[#0A66C2] hover:bg-[#004182] text-white border-0"
        >
          {isConnecting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Linkedin className="h-4 w-4" />
          )}
          {isConnecting ? 'Connecting...' : 'Connect LinkedIn'}
        </Button>
        
        {error && (
          <div className="flex items-center gap-1 text-xs text-red-600">
            <AlertCircle className="h-3 w-3" />
            {error}
          </div>
        )}
        
        <p className="text-xs text-muted-foreground text-center">
          Already connected? 
          <button 
            onClick={() => refreshProfile(clientId)}
            className="ml-1 text-blue-600 hover:text-blue-800 underline"
            type="button"
          >
            Click here
          </button>
          {' '}to refresh.
        </p>
      </div>
    </div>
  );
};

export default LinkedInConnectionPanel;

