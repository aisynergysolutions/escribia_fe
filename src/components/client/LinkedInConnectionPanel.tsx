
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Linkedin } from 'lucide-react';

interface LinkedInConnectionPanelProps {
  // Optionally, accept props such as client info or onChange cb
}

const MOCK_ACCOUNT_NAME = "Acme Corp";
const MOCK_EXPIRY = "June 15, 2025";

const LinkedInConnectionPanel: React.FC<LinkedInConnectionPanelProps> = () => {
  const [connected, setConnected] = useState(false);

  const handleConnect = () => setConnected(true);
  const handleDisconnect = () => setConnected(false);

  return (
    <div className="mt-4">
      {!connected ? (
        <Button onClick={handleConnect} className="w-full" variant="default">
          <Linkedin className="mr-2 h-4 w-4" />
          Connect LinkedIn
        </Button>
      ) : (
        <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-md px-4 py-2">
          <div>
            <div className="flex items-center gap-2 text-green-700 font-medium">
              <Linkedin className="h-4 w-4" />
              Connected to <span className="font-semibold">{MOCK_ACCOUNT_NAME}</span>
            </div>
            <div className="text-xs text-green-800 mt-1">Expires: {MOCK_EXPIRY}</div>
          </div>
          <Button variant="secondary" size="sm" onClick={handleDisconnect}>
            Disconnect
          </Button>
        </div>
      )}
    </div>
  );
};

export default LinkedInConnectionPanel;
