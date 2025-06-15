
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Linkedin } from "lucide-react";

interface LinkedInConnectionPanelProps {
  style?: React.CSSProperties;
}

const MOCK_ACCOUNT_NAME = "Acme Corp";
const MOCK_EXPIRY = "June 15, 2025";

const LinkedInConnectionPanel: React.FC<LinkedInConnectionPanelProps> = ({
  style,
}) => {
  const [connected, setConnected] = useState(false);

  // Color variables for background and hover/focus
  const baseClass =
    "flex items-center justify-between bg-secondary/70 hover:bg-secondary/90 focus-within:ring-2 focus-within:ring-blue-400 transition rounded-lg px-6 py-3 outline-none";
  // px-6 and py-3 for 24x12 spacing

  return (
    <div
      style={style}
      tabIndex={0}
      className={baseClass}
      aria-label={connected ? "LinkedIn connected" : "LinkedIn not connected"}
    >
      <div className="flex items-center gap-2">
        <Linkedin className="h-5 w-5 text-[#0A66C2]" />
        <span className="font-medium text-base mr-3">LinkedIn</span>
        {!connected ? (
          <Button
            onClick={() => setConnected(true)}
            type="button"
            variant="secondary"
            className="ml-2"
          >
            <Linkedin className="mr-1 h-4 w-4" />
            Connect LinkedIn
          </Button>
        ) : (
          <span>
            <span className="font-semibold">{MOCK_ACCOUNT_NAME}</span>
            <span className="ml-2 text-muted-foreground text-xs">
              Expires on {MOCK_EXPIRY}
            </span>
            <button
              className="ml-4 text-xs text-blue-700 underline underline-offset-2 hover:text-blue-900"
              onClick={() => setConnected(false)}
              type="button"
            >
              Reconnect
            </button>
          </span>
        )}
      </div>
    </div>
  );
};

export default LinkedInConnectionPanel;

