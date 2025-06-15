
import React from 'react';
import { CloudUpload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MediaDropZoneProps {
  uploadedFiles: File[];
  onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onFileDrop: (event: React.DragEvent<HTMLDivElement>) => void;
  onDragOver: (event: React.DragEvent<HTMLDivElement>) => void;
  onRemoveFile: (index: number) => void;
}

const MediaDropZone: React.FC<MediaDropZoneProps> = ({
  uploadedFiles,
  onFileUpload,
  onFileDrop,
  onDragOver,
  onRemoveFile,
}) => {
  const handleContainerClick = () => {
    document.getElementById('file-upload-dropzone')?.click();
  };

  return (
    <div className="space-y-4">
      <div
        className="p-4 bg-secondary border-2 border-dashed border-border rounded-md text-center cursor-pointer transition-colors hover:bg-background hover:border-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        onDrop={onFileDrop}
        onDragOver={onDragOver}
        onClick={handleContainerClick}
        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && handleContainerClick()}
        tabIndex={0}
        role="button"
        aria-label="Upload media"
      >
        <div className="flex flex-col items-center justify-center">
          <CloudUpload className="h-8 w-8 text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground">Add media to your post</p>
        </div>
        <input
          type="file"
          multiple
          onChange={onFileUpload}
          className="hidden"
          id="file-upload-dropzone"
        />
      </div>

      {uploadedFiles.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-medium text-sm">Uploaded Files:</h4>
          {uploadedFiles.map((file, index) => (
            <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded dark:bg-gray-800">
              <span className="text-sm truncate mr-2">{file.name}</span>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onRemoveFile(index)}>
                <X className="h-4 w-4" />
                <span className="sr-only">Remove file</span>
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MediaDropZone;
