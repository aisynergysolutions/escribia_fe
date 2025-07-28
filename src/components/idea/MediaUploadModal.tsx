
import React, { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Upload, X, GripVertical, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export interface MediaFile {
  id: string;
  file: File;
  url: string;
  isVertical: boolean;
}

interface MediaUploadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUploadMedia: (files: MediaFile[]) => Promise<void>;
  editingMedia?: MediaFile[];
}

const MediaUploadModal: React.FC<MediaUploadModalProps> = ({
  open,
  onOpenChange,
  onUploadMedia,
  editingMedia = []
}) => {
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>(editingMedia);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Sync local state with editingMedia prop when modal opens or editingMedia changes
  useEffect(() => {
    if (open) {
      setMediaFiles(editingMedia);
      setIsProcessing(false); // Reset processing state when modal opens
    }
  }, [open, editingMedia]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const newFiles = Array.from(files).slice(0, 14 - mediaFiles.length);

    newFiles.forEach(file => {
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid file type",
          description: "Only image files are allowed.",
          variant: "destructive"
        });
        return;
      }

      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        const isVertical = img.height > img.width;
        const mediaFile: MediaFile = {
          id: `media-${Date.now()}-${Math.random()}`,
          file,
          url,
          isVertical
        };

        setMediaFiles(prev => [...prev, mediaFile]);
      };
      img.src = url;
    });

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveFile = (id: string) => {
    setMediaFiles(prev => {
      const fileToRemove = prev.find(f => f.id === id);
      if (fileToRemove) {
        URL.revokeObjectURL(fileToRemove.url);
      }
      return prev.filter(f => f.id !== id);
    });
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (event: React.DragEvent, index: number) => {
    event.preventDefault();

    if (draggedIndex === null || draggedIndex === index) return;

    const newFiles = [...mediaFiles];
    const draggedFile = newFiles[draggedIndex];
    newFiles.splice(draggedIndex, 1);
    newFiles.splice(index, 0, draggedFile);

    setMediaFiles(newFiles);
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const handleDone = async () => {
    setIsProcessing(true);
    try {
      await onUploadMedia(mediaFiles);
      onOpenChange(false);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancel = () => {
    // Cleanup URLs for new files
    mediaFiles.forEach(file => {
      if (!editingMedia.find(f => f.id === file.id)) {
        URL.revokeObjectURL(file.url);
      }
    });
    setMediaFiles(editingMedia);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Add media to your post</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-4">
          {/* Upload Area */}
          <div
            className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="h-8 w-8 mx-auto mb-4 text-gray-400" />
            <p className="text-sm text-gray-600 mb-2">
              Click to upload images or drag and drop
            </p>
            <p className="text-xs text-gray-500">
              Up to {14 - mediaFiles.length} more images allowed
            </p>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
              disabled={mediaFiles.length >= 14}
            />
          </div>

          {/* Media Grid */}
          {mediaFiles.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Uploaded Images ({mediaFiles.length}/14)</h4>
              <div className="grid grid-cols-2 gap-3">
                {mediaFiles.map((mediaFile, index) => (
                  <div
                    key={mediaFile.id}
                    className="relative group border rounded-lg overflow-hidden cursor-move"
                    draggable
                    onDragStart={() => handleDragStart(index)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDragEnd={handleDragEnd}
                  >
                    <img
                      src={mediaFile.url}
                      alt={`Upload ${index + 1}`}
                      className="w-full h-24 object-cover"
                    />

                    {/* Drag Handle */}
                    <div className="absolute top-2 left-2 bg-black/50 rounded p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <GripVertical className="h-3 w-3 text-white" />
                    </div>

                    {/* Remove Button */}
                    <button
                      onClick={() => handleRemoveFile(mediaFile.id)}
                      className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 transition-colors"
                    >
                      <X className="h-3 w-3" />
                    </button>

                    {/* Index Badge */}
                    <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-1.5 py-0.5 rounded">
                      {index + 1}
                    </div>
                  </div>
                ))}
              </div>

              <p className="text-xs text-gray-500">
                Drag images to reorder them. The first image determines the layout.
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={isProcessing}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDone}
            disabled={mediaFiles.length === 0 || isProcessing}
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Processing...
              </>
            ) : (
              'Done'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default MediaUploadModal;
