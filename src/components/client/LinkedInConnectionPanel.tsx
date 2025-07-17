import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Linkedin, Loader2, AlertCircle } from "lucide-react";
import { useLinkedin } from "@/context/LinkedinContext";
import { LinkedInInfo } from "@/context/ProfilesContext";
import LinkedInStatusModal from "./LinkedInStatusModal";
import { useAuth } from "@/context/AuthContext";

interface LinkedInConnectionPanelProps {
  style?: React.CSSProperties;
  linkedinInfo: LinkedInInfo;
  profileId: string;
  clientId: string;
  agencyId?: string; // Keep this optional for backward compatibility
}

const LinkedInConnectionPanel: React.FC<LinkedInConnectionPanelProps> = ({
  style,
  linkedinInfo,
  profileId,
  clientId,
  agencyId: propAgencyId, // Rename the prop to avoid confusion
}) => {
  const { currentUser } = useAuth();
  const { isConnecting, isCheckingStatus, isDisconnecting, connectLinkedIn, checkLinkedInStatus, disconnectLinkedIn, refreshProfile } = useLinkedin();
  const [error, setError] = useState<string | null>(null);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [statusData, setStatusData] = useState<any>(null);

  // Use the real agency ID from currentUser, fallback to prop if provided
  const agencyId = currentUser?.uid || propAgencyId;

  const handleConnectClick = async () => {
    if (!agencyId) {
      setError('No agency ID available. Please ensure you are signed in.');
      return;
    }

    try {
      setError(null);
      await connectLinkedIn(profileId, agencyId, clientId);
    } catch (error) {
      console.error('Failed to connect LinkedIn:', error);
      setError('Failed to initiate LinkedIn connection. Please try again.');
    }
  };

  const handleCheckStatus = async () => {
    if (!agencyId) {
      setError('No agency ID available. Please ensure you are signed in.');
      return;
    }

    try {
      setError(null);
      const status = await checkLinkedInStatus(profileId, agencyId, clientId);
      console.log('LinkedIn status:', status);
      setStatusData(status);
      setIsStatusModalOpen(true);
    } catch (error) {
      console.error('Failed to check LinkedIn status:', error);
      setError('Failed to check LinkedIn status. Please try again.');
    }
  };

  const handleDisconnect = async () => {
    if (!agencyId) {
      setError('No agency ID available. Please ensure you are signed in.');
      return;
    }

    try {
      setError(null);
      await disconnectLinkedIn(profileId, agencyId, clientId);
    } catch (error) {
      console.error('Failed to disconnect LinkedIn:', error);
      setError('Failed to disconnect LinkedIn. Please try again.');
    }
  };

  const handleRefreshProfile = async () => {
    if (!agencyId) {
      setError('No agency ID available. Please ensure you are signed in.');
      return;
    }

    try {
      setError(null);
      await refreshProfile(clientId, agencyId);
    } catch (error) {
      console.error('Failed to refresh profile:', error);
      setError('Failed to refresh profile. Please try again.');
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

  // Show error if no agency ID is available
  if (!agencyId) {
    return (
      <div
        style={style}
        className="bg-red-50 border border-red-200 rounded-lg px-6 py-4"
        aria-label="LinkedIn connection error"
      >
        <div className="flex items-center gap-2 text-red-600">
          <AlertCircle className="h-4 w-4" />
          <span className="text-sm">No agency ID available. Please ensure you are signed in.</span>
        </div>
      </div>
    );
  }

  if (linkedinInfo.linkedinConnected) {
    // Connected state - show full LinkedIn info
    return (
      <>
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
          <div className="flex items-center gap-4">
            <button
              className="text-xs text-blue-700 underline underline-offset-2 hover:text-blue-900"
              onClick={handleConnectClick}
              type="button"
              disabled={isConnecting}
            >
              {isConnecting ? 'Reconnecting...' : 'Reconnect'}
            </button>
            <button
              className="text-xs text-gray-600 underline underline-offset-2 hover:text-gray-800"
              onClick={handleCheckStatus}
              type="button"
              disabled={isCheckingStatus}
            >
              {isCheckingStatus ? 'Checking...' : 'Check Status'}
            </button>
            <button
              className="text-xs text-red-600 underline underline-offset-2 hover:text-red-800"
              onClick={handleDisconnect}
              type="button"
              disabled={isDisconnecting}
            >
              {isDisconnecting ? 'Disconnecting...' : 'Disconnect'}
            </button>
          </div>
        </div>

        {/* Status Modal - moved here for connected state */}
        <LinkedInStatusModal
          isOpen={isStatusModalOpen}
          onClose={() => setIsStatusModalOpen(false)}
          statusData={statusData}
          isLoading={isCheckingStatus}
        />
      </>
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
            onClick={handleRefreshProfile}
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

