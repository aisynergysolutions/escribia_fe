
import React from 'react';
import { Upload, X } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface AssetsCardProps {
  uploadedFiles: File[];
  onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onFileDrop: (event: React.DragEvent<HTMLDivElement>) => void;
  onDragOver: (event: React.DragEvent<HTMLDivElement>) => void;
  onRemoveFile: (index: number) => void;
}

const AssetsCard: React.FC<AssetsCardProps> = ({
  uploadedFiles,
  onFileUpload,
  onFileDrop,
  onDragOver,
  onRemoveFile
}) => {
  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-4">Assets</h2>
      
      <div 
        className="border-2 border-dashed rounded-lg p-6 text-center" 
        onDrop={onFileDrop} 
        onDragOver={onDragOver}
      >
        <Upload className="h-10 w-10 mx-auto text-gray-400 mb-2" />
        <p className="mb-2">Drag and drop files here or click to upload</p>
        <p className="text-sm text-gray-500 mb-4">Images, PDFs, and other documents</p>
        <input 
          type="file" 
          multiple 
          onChange={onFileUpload} 
          className="hidden" 
          id="file-upload" 
        />
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => document.getElementById('file-upload')?.click()}
        >
          Select Files
        </Button>
      </div>
      
      {uploadedFiles.length > 0 && (
        <div className="mt-4 space-y-2">
          <h4 className="font-medium">Uploaded Files:</h4>
          {uploadedFiles.map((file, index) => (
            <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
              <span className="text-sm truncate">{file.name}</span>
              <Button variant="outline" size="sm" onClick={() => onRemoveFile(index)}>
                <X className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};

export default AssetsCard;
