
import React, { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Upload, X, GripVertical, Loader2, Eye, Delete, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export interface MediaFile {
  id: string;
  file: File;
  url: string;
  isVertical: boolean;
  type: 'image' | 'video';
  duration?: number; // For videos, in seconds
  thumbnail?: string; // Thumbnail URL for videos
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
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Sync local state with editingMedia prop when modal opens or editingMedia changes
  useEffect(() => {
    if (open) {
      setMediaFiles(editingMedia);
      setIsProcessing(false); // Reset processing state when modal opens
      setPreviewImage(null); // Reset preview state when modal opens
    }
  }, [open, editingMedia]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const firstFile = files[0];
    const isVideo = firstFile.type.startsWith('video/');
    const isImage = firstFile.type.startsWith('image/');

    // Check if user is trying to mix video and images
    if (mediaFiles.length > 0) {
      const hasVideo = mediaFiles.some(f => f.type === 'video');
      const hasImages = mediaFiles.some(f => f.type === 'image');

      if ((hasVideo && isImage) || (hasImages && isVideo)) {
        toast({
          title: "Mixed media not allowed",
          description: "You can upload either 1 video OR up to 14 images, not both.",
          variant: "destructive"
        });
        return;
      }
    }

    if (isVideo) {
      // Only allow one video
      if (mediaFiles.length > 0) {
        toast({
          title: "Only one video allowed",
          description: "You can upload only one video per post.",
          variant: "destructive"
        });
        return;
      }

      const url = URL.createObjectURL(firstFile);
      const video = document.createElement('video');
      video.onloadedmetadata = () => {
        const isVertical = video.videoHeight > video.videoWidth;
        const mediaFile: MediaFile = {
          id: `media-${Date.now()}-${Math.random()}`,
          file: firstFile,
          url,
          isVertical,
          type: 'video',
          duration: video.duration
        };

        setMediaFiles([mediaFile]); // Replace any existing files
      };
      video.src = url;
    } else if (isImage) {
      // Handle multiple images (up to 14 total)
      const newFiles = Array.from(files).slice(0, 14 - mediaFiles.length);

      newFiles.forEach(file => {
        if (!file.type.startsWith('image/')) {
          toast({
            title: "Invalid file type",
            description: "Upload either images or videos.",
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
            isVertical,
            type: 'image'
          };

          setMediaFiles(prev => [...prev, mediaFile]);
        };
        img.src = url;
      });
    } else {
      toast({
        title: "Invalid file type",
        description: "Only image and video files are allowed.",
        variant: "destructive"
      });
      return;
    }

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

  const handlePreviewImage = (url: string) => {
    setPreviewImage(url);
  };

  const handleClosePreview = () => {
    setPreviewImage(null);
  };

  // Handle keyboard shortcuts for preview modal
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && previewImage) {
        handleClosePreview();
      }
    };

    if (previewImage) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [previewImage]);

  const handleApply = async () => {
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
              Click to upload images/videos or drag and drop
            </p>
            <p className="text-xs text-gray-500">
              {mediaFiles.length === 0
                ? "Upload 1 video OR up to 14 images"
                : mediaFiles[0]?.type === 'video'
                  ? "1 video uploaded"
                  : `Up to ${14 - mediaFiles.length} more images allowed`
              }
            </p>
            <input
              ref={fileInputRef}
              type="file"
              multiple={mediaFiles.length === 0 || (mediaFiles[0]?.type === 'image')}
              accept="image/*,video/*"
              onChange={handleFileSelect}
              className="hidden"
              disabled={mediaFiles.length >= 14 || (mediaFiles.length > 0 && mediaFiles[0]?.type === 'video')}
            />
          </div>

          {/* Media Grid */}
          {mediaFiles.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium text-sm">
                {mediaFiles[0]?.type === 'video'
                  ? `Uploaded Video (${mediaFiles.length}/1)`
                  : `Uploaded Images (${mediaFiles.length}/14)`
                }
              </h4>
              <div className={mediaFiles[0]?.type === 'video' ? "space-y-3" : "grid grid-cols-2 gap-3"}>
                {mediaFiles.map((mediaFile, index) => (
                  <div
                    key={mediaFile.id}
                    className={`relative group border rounded-lg overflow-hidden ${mediaFiles[0]?.type === 'video' ? 'w-full' : 'cursor-move'
                      }`}
                    draggable={mediaFile.type === 'image'}
                    onDragStart={() => mediaFile.type === 'image' && handleDragStart(index)}
                    onDragOver={(e) => mediaFile.type === 'image' && handleDragOver(e, index)}
                    onDragEnd={() => mediaFile.type === 'image' && handleDragEnd()}
                  >
                    {mediaFile.type === 'video' ? (
                      <video
                        src={mediaFile.url}
                        className="w-full h-48 object-cover"
                        muted
                        preload="metadata"
                      />
                    ) : (
                      <img
                        src={mediaFile.url}
                        alt={`Upload ${index + 1}`}
                        className="w-full h-24 object-cover"
                      />
                    )}

                    {/* Drag Handle - only for images */}
                    {mediaFile.type === 'image' && (
                      <div className="absolute top-2 left-2 bg-black/50 rounded p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <GripVertical className="h-3 w-3 text-white" />
                      </div>
                    )}

                    {/* Preview Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePreviewImage(mediaFile.url);
                      }}
                      className={`absolute ${mediaFile.type === 'image' ? 'top-2 left-8' : 'top-2 left-2'} bg-black/50 hover:bg-black/70 rounded p-1 opacity-0 group-hover:opacity-100 transition-opacity`}
                    >
                      <Eye className="h-3 w-3 text-white" />
                    </button>

                    {/* Remove Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveFile(mediaFile.id);
                      }}
                      className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 transition-colors"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>

                    {/* Index Badge - only for images, duration for videos */}
                    {mediaFile.type === 'video' ? (
                      mediaFile.duration && (
                        <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-1.5 py-0.5 rounded">
                          {Math.floor(mediaFile.duration / 60)}:{String(Math.floor(mediaFile.duration % 60)).padStart(2, '0')}
                        </div>
                      )
                    ) : (
                      <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-1.5 py-0.5 rounded">
                        {index + 1}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <p className="text-xs text-gray-500">
                {mediaFiles[0]?.type === 'video'
                  ? "Video preview - click the eye icon to view full screen."
                  : "Drag images to reorder them. The first image determines the layout."
                }
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
            onClick={handleApply}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Processing...
              </>
            ) : (
              'Apply'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>

      {/* Image/Video Preview Modal */}
      {previewImage && (
        <Dialog open={!!previewImage} onOpenChange={handleClosePreview}>
          <DialogContent className="max-w-4xl max-h-[90vh] p-0">
            <div className="relative bg-black rounded-lg overflow-hidden">
              {/* Determine if preview is video or image based on file extension or media type */}
              {previewImage.includes('.mp4') || previewImage.includes('.mov') || previewImage.includes('.webm') ||
                mediaFiles.find(f => f.url === previewImage)?.type === 'video' ? (
                <video
                  src={previewImage}
                  controls
                  className="w-full h-auto max-h-[85vh] object-contain"
                  autoPlay
                />
              ) : (
                <img
                  src={previewImage}
                  alt="Preview"
                  className="w-full h-auto max-h-[85vh] object-contain"
                />
              )}
              <button
                onClick={handleClosePreview}
                className="absolute top-4 right-4 bg-white/20 hover:bg-white/30 text-white rounded-full p-2 transition-colors backdrop-blur-sm"
                title="Close preview (Esc)"
              >
                <X className="h-4 w-4" />
              </button>
              <div className="absolute bottom-4 left-4 bg-black/50 text-white text-sm px-3 py-1 rounded backdrop-blur-sm">
                {mediaFiles.find(f => f.url === previewImage)?.type === 'video' ? 'Video preview' : 'Full size preview'}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </Dialog>
  );
};

export default MediaUploadModal;
