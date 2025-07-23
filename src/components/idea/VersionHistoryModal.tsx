import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Clock, Eye } from 'lucide-react';

interface Version {
  id: string;
  content: string;
  createdAt: Date;
  title: string;
}

interface VersionHistoryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  versions: Version[];
  onRestore: (versionId: string) => void;
}

const VersionHistoryModal: React.FC<VersionHistoryModalProps> = ({
  open,
  onOpenChange,
  versions,
  onRestore
}) => {
  const [viewingVersion, setViewingVersion] = useState<Version | null>(null);

  const handleRestore = (versionId: string) => {
    onRestore(versionId);
    onOpenChange(false);
  };

  const handleViewFull = (version: Version) => {
    setViewingVersion(version);
  };

  const formatContent = (content: string) => {
    // Convert HTML line breaks to actual line breaks and handle text formatting
    return content
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/p><p>/gi, '\n\n')
      .replace(/<p>/gi, '')
      .replace(/<\/p>/gi, '')
      .replace(/<[^>]*>/g, '') // Remove any remaining HTML tags
      .trim();
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Version History
            </DialogTitle>
            <p className="text-sm text-gray-600 mt-2">
              Versions are automatically saved when you pause editing for a moment
            </p>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            {versions.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No versions available
              </div>
            ) : (
              [...versions].reverse().map((version, index) => (
                <Card key={version.id} className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        Version {versions.length - index}
                      </Badge>
                      <span className="text-sm text-gray-600">
                        {version.title}
                      </span>
                      {index === 0 && (
                        <Badge className="bg-green-100 text-green-800 text-xs">
                          Latest
                        </Badge>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleViewFull(version)}
                        className="flex items-center gap-1"
                      >
                        <Eye className="h-3 w-3" />
                        View Full
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleRestore(version.id)}
                        className="bg-indigo-600 hover:bg-indigo-700"
                      >
                        Restore
                      </Button>
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-md p-3 max-h-32 overflow-y-auto">
                    <pre className="text-sm whitespace-pre-wrap font-sans text-gray-800">
                      {formatContent(version.content) || 'Empty content'}
                    </pre>
                  </div>
                </Card>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Full Version View Modal */}
      <Dialog open={!!viewingVersion} onOpenChange={() => setViewingVersion(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              {viewingVersion?.title || 'Version Details'}
            </DialogTitle>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="outline" className="text-xs">
                {viewingVersion?.createdAt ? new Date(viewingVersion.createdAt).toLocaleString() : 'Unknown date'}
              </Badge>
            </div>
          </DialogHeader>
          <div className="mt-4">
            <div className="bg-gray-50 rounded-md p-6 min-h-[400px]">
              <pre className="text-base whitespace-pre-wrap font-sans text-gray-800 leading-relaxed">
                {viewingVersion ? formatContent(viewingVersion.content) || 'Empty content' : ''}
              </pre>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <Button
                variant="outline"
                onClick={() => setViewingVersion(null)}
              >
                Close
              </Button>
              {viewingVersion && (
                <Button
                  onClick={() => {
                    handleRestore(viewingVersion.id);
                    setViewingVersion(null);
                  }}
                  className="bg-indigo-600 hover:bg-indigo-700"
                >
                  Restore This Version
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default VersionHistoryModal;
