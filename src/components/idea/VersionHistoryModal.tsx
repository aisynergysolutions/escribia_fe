
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Clock } from 'lucide-react';

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
  const handleRestore = (versionId: string) => {
    onRestore(versionId);
    onOpenChange(false);
  };

  return (
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
            [...versions].map((version, index) => (
              <Card key={version.id} className="p-4">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      Version {index + 1}
                    </Badge>
                    <span className="text-sm text-gray-600">
                      {version.title}
                    </span>
                    {index === versions.length - 1 && (
                      <Badge className="bg-green-100 text-green-800 text-xs">
                        Latest
                      </Badge>
                    )}
                  </div>
                  <Button 
                    size="sm" 
                    onClick={() => handleRestore(version.id)}
                    className="bg-indigo-600 hover:bg-indigo-700"
                  >
                    Restore
                  </Button>
                </div>
                <div className="bg-gray-50 rounded-md p-3 max-h-32 overflow-y-auto">
                  <div 
                    className="text-sm prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ __html: version.content || 'Empty content' }}
                  />
                </div>
              </Card>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VersionHistoryModal;
