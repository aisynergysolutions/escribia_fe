
import React from 'react';
import { X, Edit2, Edit, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MediaFile } from './MediaUploadModal';

interface MediaPreviewProps {
  mediaFiles: MediaFile[];
  onRemove: () => void;
  onEdit: () => void;
  viewMode: 'mobile' | 'desktop';
  isUploading?: boolean;
  isRemoving?: boolean;
  isLoadingInitial?: boolean;
}

const MediaPreview: React.FC<MediaPreviewProps> = ({
  mediaFiles,
  onRemove,
  onEdit,
  viewMode,
  isUploading = false,
  isRemoving = false,
  isLoadingInitial = false
}) => {
  if (mediaFiles.length === 0) return null;

  const firstImage = mediaFiles[0];
  const remainingImages = mediaFiles.slice(1, 4);
  const extraCount = Math.max(0, mediaFiles.length - 4);

  // Determine layout based on first image orientation
  const isVerticalLayout = firstImage.isVertical;

  // Use the same centering approach as EditorContainer
  const maxWidthClass = viewMode === 'mobile' ? 'max-w-[320px]' : 'max-w-[552px]';

  return (
    <div className={`${maxWidthClass} mx-auto mt-4`}>
      {/* Header with controls */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-gray-600">
          {isLoadingInitial ? 'Loading images...' :
            isUploading ? 'Uploading...' :
              `${mediaFiles.length} image${mediaFiles.length > 1 ? 's' : ''}`}
        </span>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={onEdit}
            className="h-6 w-6 p-0"
            disabled={isUploading || isRemoving || isLoadingInitial}
          >
            {isUploading || isLoadingInitial ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <Edit className="h-3 w-3" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onRemove}
            className="h-6 w-6 p-0"
            disabled={isUploading || isRemoving || isLoadingInitial}
          >
            {isRemoving ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <X className="h-3 w-3" />
            )}
          </Button>
        </div>
      </div>

      {/* Media Grid */}
      <div className="border rounded-lg overflow-hidden bg-gray-50 relative">
        {/* Loading overlay */}
        {(isUploading || isRemoving || isLoadingInitial) && (
          <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10">
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
              <span className="text-sm text-gray-600">
                {isLoadingInitial ? 'Loading images...' :
                  isUploading ? 'Uploading images...' :
                    'Removing images...'}
              </span>
            </div>
          </div>
        )}

        {isVerticalLayout ? (
          /* Vertical Layout: Main image on left, others on right */
          <div className="flex h-64">
            {/* Main Image */}
            <div className="flex-1">
              <img
                src={firstImage.url}
                alt="Main image"
                className="w-full h-full object-cover"
              />
            </div>

            {/* Side Images */}
            {remainingImages.length > 0 && (
              <div className="w-32 flex flex-col">
                {remainingImages.map((image, index) => (
                  <div
                    key={image.id}
                    className={`relative flex-1 ${index < remainingImages.length - 1 ? 'border-b border-white' : ''}`}
                  >
                    <img
                      src={image.url}
                      alt={`Image ${index + 2}`}
                      className="w-full h-full object-cover"
                    />

                    {/* Extra count overlay on last image */}
                    {index === remainingImages.length - 1 && extraCount > 0 && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                        <span className="text-white font-semibold text-lg">
                          +{extraCount}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* Horizontal Layout: Main image on top, others below */
          <div className="space-y-0">
            {/* Main Image */}
            <div className="h-48">
              <img
                src={firstImage.url}
                alt="Main image"
                className="w-full h-full object-cover"
              />
            </div>

            {/* Bottom Images */}
            {remainingImages.length > 0 && (
              <div className="flex h-16">
                {remainingImages.map((image, index) => (
                  <div
                    key={image.id}
                    className={`relative flex-1 ${index < remainingImages.length - 1 ? 'border-r border-white' : ''}`}
                  >
                    <img
                      src={image.url}
                      alt={`Image ${index + 2}`}
                      className="w-full h-full object-cover"
                    />

                    {/* Extra count overlay on last image */}
                    {index === remainingImages.length - 1 && extraCount > 0 && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                        <span className="text-white font-semibold text-sm">
                          +{extraCount}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MediaPreview;
