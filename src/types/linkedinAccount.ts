
export interface LinkedInAccount {
  id: string;
  clientId: string;
  accountName: string;
  accountType: 'company' | 'executive' | 'department' | 'other';
  linkedinProfileUrl: string;
  linkedinUserId?: string;
  isConnected: boolean;
  connectionStatus: 'connected' | 'expired' | 'disconnected' | 'pending';
  connectionExpiresAt?: { seconds: number; nanoseconds: number };
  
  // Account-specific overrides (inherit from client if not set)
  displayName: string;
  profileImage?: string;
  writingStyle?: string;
  brandPersonality?: string[];
  brandTone?: string;
  customInstructions?: string;
  
  // Metadata
  createdAt: { seconds: number; nanoseconds: number };
  updatedAt: { seconds: number; nanoseconds: number };
  lastUsedAt?: { seconds: number; nanoseconds: number };
  
  // Analytics
  totalPosts: number;
  lastPostAt?: { seconds: number; nanoseconds: number };
}
