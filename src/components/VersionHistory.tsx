
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { History } from 'lucide-react';

interface Version {
  id: string;
  version: number;
  text: string;
  createdAt: Date;
  generatedByAI: boolean;
  notes?: string;
}

interface VersionHistoryProps {
  versions: Version[];
  onRestore: (text: string) => void;
}

const VersionHistory: React.FC<VersionHistoryProps> = ({ versions, onRestore }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleRestore = (text: string) => {
    onRestore(text);
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <History className="h-4 w-4" />
          Version History
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Version History</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {versions.map((version) => (
            <Card key={version.id} className="p-4">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                  <Badge variant="outline">v{version.version}</Badge>
                  <span className="text-sm text-gray-500">
                    {version.createdAt.toLocaleDateString()} {version.createdAt.toLocaleTimeString()}
                  </span>
                  {version.generatedByAI && (
                    <Badge className="bg-blue-100 text-blue-800">AI Generated</Badge>
                  )}
                </div>
                <Button 
                  size="sm" 
                  onClick={() => handleRestore(version.text)}
                  className="bg-indigo-600 hover:bg-indigo-700"
                >
                  Restore
                </Button>
              </div>
              <p className="text-sm mb-2">{version.text}</p>
              {version.notes && (
                <p className="text-xs text-gray-500">Notes: {version.notes}</p>
              )}
            </Card>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VersionHistory;
