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
    statusData: any;
    isLoading: boolean;
}

const LinkedInStatusModal: React.FC<LinkedInStatusModalProps> = ({
    isOpen,
    onClose,
    statusData,
    isLoading,
}) => {
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
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Linkedin className="h-5 w-5 text-[#0A66C2]" />
                        LinkedIn Connection Status
                    </DialogTitle>
                    <DialogDescription>
                        Current LinkedIn connection details for this profile
                    </DialogDescription>
                </DialogHeader>

                {isLoading ? (
                    <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0A66C2]"></div>
                        <span className="ml-2">Checking status...</span>
                    </div>
                ) : statusData ? (
                    <div className="space-y-4">
                        {/* Connection Status */}
                        <div className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg">
                            <div className="flex items-center gap-2">
                                {getStatusIcon(statusData.connected || statusData.linkedinConnected)}
                                <span className="font-medium">Connection Status</span>
                            </div>
                            {getStatusBadge(statusData.connected || statusData.linkedinConnected)}
                        </div>

                        {/* Profile Information */}
                        {(statusData.connected || statusData.linkedinConnected) && (
                            <div className="space-y-3">
                                <h4 className="font-medium flex items-center gap-2">
                                    <User className="h-4 w-4" />
                                    Profile Information
                                </h4>

                                <div className="grid grid-cols-1 gap-3 pl-6">
                                    {statusData.linkedinAccountName && (
                                        <div>
                                            <span className="text-sm text-muted-foreground">Account Name:</span>
                                            <p className="font-medium">{statusData.linkedinAccountName}</p>
                                        </div>
                                    )}

                                    {statusData.linkedinProfile?.email && (
                                        <div className="flex items-center gap-2">
                                            <Mail className="h-4 w-4 text-muted-foreground" />
                                            <span className="text-sm">{statusData.linkedinProfile.email}</span>
                                        </div>
                                    )}

                                    {statusData.linkedinProfile?.name && (
                                        <div>
                                            <span className="text-sm text-muted-foreground">Full Name:</span>
                                            <p className="font-medium">{statusData.linkedinProfile.name}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Connection Dates */}
                        {(statusData.connected || statusData.linkedinConnected) && (
                            <div className="space-y-3">
                                <h4 className="font-medium flex items-center gap-2">
                                    <Clock className="h-4 w-4" />
                                    Timeline
                                </h4>

                                <div className="grid grid-cols-1 gap-2 pl-6 text-sm">
                                    {statusData.connectedAt && (
                                        <div>
                                            <span className="text-muted-foreground">Connected:</span>
                                            <span className="ml-2 font-medium">{formatDate(statusData.connectedAt)}</span>
                                        </div>
                                    )}

                                    {statusData.lastUpdated && (
                                        <div>
                                            <span className="text-muted-foreground">Last Updated:</span>
                                            <span className="ml-2 font-medium">{formatDate(statusData.lastUpdated)}</span>
                                        </div>
                                    )}

                                    {statusData.linkedinExpiryDate && (
                                        <div>
                                            <span className="text-muted-foreground">Expires:</span>
                                            <span className="ml-2 font-medium">{formatDate(statusData.linkedinExpiryDate)}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Token Information */}
                        {statusData.linkedinProfile?.linkedinScope && (
                            <div className="space-y-2">
                                <h4 className="font-medium text-sm">Permissions</h4>
                                <div className="pl-4">
                                    <Badge variant="outline" className="text-xs">
                                        {statusData.linkedinProfile.linkedinScope}
                                    </Badge>
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="text-center py-8 text-muted-foreground">
                        No status data available
                    </div>
                )}

                <div className="flex justify-end gap-2 pt-4">
                    <Button variant="outline" onClick={onClose}>
                        Close
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default LinkedInStatusModal;
