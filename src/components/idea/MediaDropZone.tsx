
import React from 'react';
import { UploadCloud, X } from 'lucide-react';
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
  onRemoveFile
}) => {
  return (
    <div className="w-full">
      <div 
        className="w-full p-4 bg-muted border-2 border-dashed border-border rounded-md transition-colors hover:bg-background hover:border-accent focus-within:bg-background focus-within:border-accent"
        onDrop={onFileDrop}
        onDragOver={onDragOver}
      >
        <div className="flex flex-col items-center justify-center text-center">
          <UploadCloud className="h-8 w-8 text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground">Add media to your post</p>
        </div>
        <input 
          type="file" 
          multiple 
          onChange={onFileUpload} 
          className="hidden" 
          id="media-upload" 
          accept="image/*,video/*,.pdf,.doc,.docx"
        />
        <label 
          htmlFor="media-upload" 
          className="absolute inset-0 cursor-pointer"
        />
      </div>
      
      {uploadedFiles.length > 0 && (
        <div className="mt-4 space-y-2">
          <h4 className="text-sm font-medium">Uploaded Files:</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {uploadedFiles.map((file, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-muted rounded border">
                <span className="text-sm truncate flex-1">{file.name}</span>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => onRemoveFile(index)}
                  className="ml-2 h-6 w-6 p-0"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MediaDropZone;
