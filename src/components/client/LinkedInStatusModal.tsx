import React from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Linkedin, CheckCircle, XCircle, Clock, User, Mail } from 'lucide-react';

interface LinkedInStatusModalProps {
    isOpen: boolean;
    onClose: () => void;
    statusData: {
        connected?: boolean;
        linkedinConnected?: boolean;
        linkedin_account_name?: string;
        linkedinAccountName?: string;
        connected_scopes?: string;
        expires_at?: string;
        linkedin_profile?: {
            email?: string;
            email_verified?: boolean;
            name?: string;
            locale?: string | { language: string; country: string };
            picture?: string;
        };
        // Company status fields
        company_info?: {
            organization_id?: string;
            organization_urn?: string;
            company_name?: string;
            linkedin_url?: string;
            connected_scopes?: string;
            expires_at?: string;
        };
        message?: string;
        connectedAt?: string;
        updatedAt?: string;
        linkedinExpiryDate?: string;
    } | null;
    isLoading: boolean;
}

const LinkedInStatusModal: React.FC<LinkedInStatusModalProps> = ({
    isOpen,
    onClose,
    statusData,
    isLoading,
}) => {
    // Debug logging
    React.useEffect(() => {
        if (isOpen) {
            console.log('Modal opened with statusData:', statusData);
            console.log('isLoading:', isLoading);
        }
    }, [isOpen, statusData, isLoading]);

    const formatDate = (dateString: string | null) => {
        if (!dateString) return 'N/A';
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
        } catch {
            return dateString;
        }
    };

    const getStatusIcon = (connected: boolean) => {
        return connected ? (
            <CheckCircle className="h-5 w-5 text-green-500" />
        ) : (
            <XCircle className="h-5 w-5 text-red-500" />
        );
    };

    const getStatusBadge = (connected: boolean) => {
        return (
            <Badge variant={connected ? "default" : "destructive"} className="ml-2">
                {connected ? 'Connected' : 'Not Connected'}
            </Badge>
        );
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px] max-h-[90vh] flex flex-col">
                <DialogHeader className="flex-shrink-0">
                    <DialogTitle className="flex items-center gap-2">
                        <Linkedin className="h-5 w-5 text-[#0A66C2]" />
                        LinkedIn Connection Status
                    </DialogTitle>
                    <DialogDescription>
                        Current LinkedIn connection details for this profile
                    </DialogDescription>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto min-h-0">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0A66C2]"></div>
                            <span className="ml-2">Checking status...</span>
                        </div>
                    ) : statusData ? (
                        <div className="space-y-4 pr-2">
                            {/* Debug Information - Remove this in production */}
                            <details className="text-xs text-gray-500 border rounded p-2">
                                <summary className="cursor-pointer">Debug Info (Click to expand)</summary>
                                <div className="mt-2 max-h-40 overflow-y-auto bg-gray-50 rounded p-2">
                                    <pre className="whitespace-pre-wrap text-xs">{JSON.stringify(statusData, null, 2)}</pre>
                                </div>
                            </details>

                            {/* Connection Status */}
                            <div className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg">
                                <div className="flex items-center gap-2">
                                    {getStatusIcon(statusData.connected || statusData.linkedinConnected)}
                                    <span className="font-medium">Connection Status</span>
                                </div>
                                {getStatusBadge(statusData.connected || statusData.linkedinConnected)}
                            </div>

                            {/* LinkedIn Account Name */}
                            {(statusData.linkedin_account_name || statusData.linkedinAccountName) && (
                                <div className="space-y-3">
                                    <h4 className="font-medium flex items-center gap-2">
                                        <User className="h-4 w-4" />
                                        Account Information
                                    </h4>

                                    <div className="grid grid-cols-1 gap-3 pl-6">
                                        <div>
                                            <span className="text-sm text-muted-foreground">LinkedIn Account Name:</span>
                                            <p className="font-medium">{statusData.linkedin_account_name || statusData.linkedinAccountName}</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Connected Scopes */}
                            {statusData.connected_scopes && (
                                <div className="space-y-3">
                                    <h4 className="font-medium text-sm">Connected Scopes</h4>
                                    <div className="pl-4 flex flex-wrap gap-1">
                                        {statusData.connected_scopes.split(',').map((scope, index) => (
                                            <Badge key={index} variant="outline" className="text-xs">
                                                {scope.trim()}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* LinkedIn Profile Information */}
                            {statusData.linkedin_profile && (
                                <div className="space-y-3">
                                    <h4 className="font-medium flex items-center gap-2">
                                        <User className="h-4 w-4" />
                                        Profile Details
                                    </h4>

                                    <div className="grid grid-cols-1 gap-3 pl-6">
                                        {statusData.linkedin_profile.email && (
                                            <div className="flex items-center gap-2">
                                                <Mail className="h-4 w-4 text-muted-foreground" />
                                                <div>
                                                    <span className="text-sm text-muted-foreground">Email:</span>
                                                    <p className="text-sm font-medium">{statusData.linkedin_profile.email}</p>
                                                </div>
                                            </div>
                                        )}

                                        {statusData.linkedin_profile.email_verified !== undefined && (
                                            <div>
                                                <span className="text-sm text-muted-foreground">Email Verified:</span>
                                                <Badge variant={statusData.linkedin_profile.email_verified ? "default" : "destructive"} className="ml-2 text-xs">
                                                    {statusData.linkedin_profile.email_verified ? 'Yes' : 'No'}
                                                </Badge>
                                            </div>
                                        )}

                                        {statusData.linkedin_profile.name && (
                                            <div>
                                                <span className="text-sm text-muted-foreground">Full Name:</span>
                                                <p className="font-medium">{statusData.linkedin_profile.name}</p>
                                            </div>
                                        )}

                                        {statusData.linkedin_profile.locale && (
                                            <div>
                                                <span className="text-sm text-muted-foreground">Locale:</span>
                                                <p className="text-sm">
                                                    {typeof statusData.linkedin_profile.locale === 'object'
                                                        ? `${statusData.linkedin_profile.locale.language}-${statusData.linkedin_profile.locale.country}`
                                                        : statusData.linkedin_profile.locale}
                                                </p>
                                            </div>
                                        )}

                                        {statusData.linkedin_profile.picture && (
                                            <div>
                                                <span className="text-sm text-muted-foreground">Profile Picture:</span>
                                                <div className="mt-2 flex items-center gap-3">
                                                    <img
                                                        src={statusData.linkedin_profile.picture}
                                                        alt="LinkedIn Profile"
                                                        className="w-12 h-12 rounded-full object-cover"
                                                    />
                                                    <a
                                                        href={statusData.linkedin_profile.picture}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-xs text-blue-600 hover:underline"
                                                    >
                                                        View Full Size
                                                    </a>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Company Information - for LinkedIn Company connections */}
                            {statusData.company_info && (
                                <div className="space-y-3">
                                    <h4 className="font-medium flex items-center gap-2">
                                        <Linkedin className="h-4 w-4" />
                                        Company Details
                                    </h4>

                                    <div className="grid grid-cols-1 gap-3 pl-6">
                                        {statusData.company_info.company_name && (
                                            <div>
                                                <span className="text-sm text-muted-foreground">Company Name:</span>
                                                <p className="font-medium">{statusData.company_info.company_name}</p>
                                            </div>
                                        )}

                                        {statusData.company_info.organization_id && (
                                            <div>
                                                <span className="text-sm text-muted-foreground">Organization ID:</span>
                                                <p className="text-sm font-mono">{statusData.company_info.organization_id}</p>
                                            </div>
                                        )}

                                        {statusData.company_info.organization_urn && (
                                            <div>
                                                <span className="text-sm text-muted-foreground">Organization URN:</span>
                                                <p className="text-sm font-mono break-all">{statusData.company_info.organization_urn}</p>
                                            </div>
                                        )}

                                        {statusData.company_info.linkedin_url && (
                                            <div>
                                                <span className="text-sm text-muted-foreground">LinkedIn URL:</span>
                                                <a
                                                    href={statusData.company_info.linkedin_url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="block text-blue-600 hover:underline break-all"
                                                >
                                                    {statusData.company_info.linkedin_url}
                                                </a>
                                            </div>
                                        )}

                                        {statusData.company_info.connected_scopes && (
                                            <div>
                                                <span className="text-sm text-muted-foreground">Connected Scopes:</span>
                                                <div className="mt-1 flex flex-wrap gap-1">
                                                    {statusData.company_info.connected_scopes.split(',').map((scope, index) => (
                                                        <Badge key={index} variant="outline" className="text-xs">
                                                            {scope.trim()}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {statusData.company_info.expires_at && (
                                            <div>
                                                <span className="text-sm text-muted-foreground">Company Access Expires:</span>
                                                <p className="text-sm font-medium">{formatDate(statusData.company_info.expires_at)}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Connection Timeline */}
                            {(statusData.expires_at || statusData.connectedAt || statusData.updatedAt || statusData.linkedinExpiryDate) && (
                                <div className="space-y-3">
                                    <h4 className="font-medium flex items-center gap-2">
                                        <Clock className="h-4 w-4" />
                                        Timeline
                                    </h4>

                                    <div className="grid grid-cols-1 gap-2 pl-6 text-sm">
                                        {statusData.expires_at && (
                                            <div>
                                                <span className="text-muted-foreground">Connexion expiration:</span>
                                                <span className="ml-2 font-medium">{formatDate(statusData.expires_at)}</span>
                                            </div>
                                        )}

                                        {statusData.connectedAt && (
                                            <div>
                                                <span className="text-muted-foreground">Connected:</span>
                                                <span className="ml-2 font-medium">{formatDate(statusData.connectedAt)}</span>
                                            </div>
                                        )}

                                        {statusData.updatedAt && (
                                            <div>
                                                <span className="text-muted-foreground">Last Updated:</span>
                                                <span className="ml-2 font-medium">{formatDate(statusData.updatedAt)}</span>
                                            </div>
                                        )}

                                        {statusData.linkedinExpiryDate && (
                                            <div>
                                                <span className="text-muted-foreground">Legacy Expiry:</span>
                                                <span className="ml-2 font-medium">{formatDate(statusData.linkedinExpiryDate)}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Message from API */}
                            {statusData.message && (
                                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                                    <p className="text-sm text-green-800">{statusData.message}</p>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-muted-foreground">
                            No status data available
                        </div>
                    )}
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t flex-shrink-0">
                    <Button variant="outline" onClick={onClose}>
                        Close
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default LinkedInStatusModal;
