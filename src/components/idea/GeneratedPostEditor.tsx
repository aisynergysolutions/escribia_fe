
import React, { useRef, useEffect } from 'react';
import { Copy, Bold, Italic, Underline, List, AlignLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import VersionHistory from '../VersionHistory';
import FloatingToolbar from './FloatingToolbar';

interface GeneratedPostEditorProps {
  generatedPost: string;
  onGeneratedPostChange: (value: string) => void;
  editingInstructions: string;
  onEditingInstructionsChange: (value: string) => void;
  onCopyText: () => void;
  onRegenerateWithInstructions: () => void;
  onFormatText: (format: string) => void;
  versionHistory: Array<{
    id: string;
    version: number;
    text: string;
    createdAt: Date;
    generatedByAI: boolean;
    notes: string;
  }>;
  onRestoreVersion: (text: string) => void;
}

const GeneratedPostEditor: React.FC<GeneratedPostEditorProps> = ({
  generatedPost,
  onGeneratedPostChange,
  editingInstructions,
  onEditingInstructionsChange,
  onCopyText,
  onRegenerateWithInstructions,
  onFormatText,
  versionHistory,
  onRestoreVersion
}) => {
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== generatedPost) {
      editorRef.current.innerHTML = generatedPost;
    }
  }, [generatedPost]);

  const handleContentChange = () => {
    if (editorRef.current) {
      onGeneratedPostChange(editorRef.current.innerHTML);
    }
  };

  const handleFormat = (format: string) => {
    document.execCommand(format, false, '');
    handleContentChange();
  };

  const handleComment = () => {
    // Placeholder for comment functionality
    console.log('Add comment functionality here');
  };

  const handleToolbarFormat = (format: string) => {
    handleFormat(format);
  };

  return (
    <div className="space-y-6">
      <FloatingToolbar onFormat={handleToolbarFormat} onComment={handleComment} />
      
      <div className="bg-white rounded-lg border">
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-xl font-semibold">Generated Post</h3>
          <div className="flex gap-2">
            <VersionHistory versions={versionHistory} onRestore={onRestoreVersion} />
            <Button variant="outline" size="sm" onClick={onCopyText}>
              <Copy className="h-4 w-4 mr-2" />
              Copy
            </Button>
          </div>
        </div>
        
        {/* Text Editor Toolbar */}
        <div className="border-b p-2 flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleFormat('bold')}
            className="h-8 w-8 p-0"
          >
            <Bold className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleFormat('italic')}
            className="h-8 w-8 p-0"
          >
            <Italic className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleFormat('underline')}
            className="h-8 w-8 p-0"
          >
            <Underline className="h-4 w-4" />
          </Button>
          <div className="w-px h-6 bg-gray-300 mx-1" />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleFormat('insertUnorderedList')}
            className="h-8 w-8 p-0"
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleFormat('justifyLeft')}
            className="h-8 w-8 p-0"
          >
            <AlignLeft className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="p-4">
          <div
            ref={editorRef}
            contentEditable
            suppressContentEditableWarning={true}
            onInput={handleContentChange}
            className="min-h-[300px] w-full border-0 focus:outline-none resize-none text-base leading-relaxed"
            style={{ 
              border: 'none',
              outline: 'none'
            }}
            dangerouslySetInnerHTML={{ __html: generatedPost || 'AI generated content will appear here...' }}
          />
        </div>
      </div>
      
      <div className="bg-white rounded-lg border">
        <div className="p-4 border-b">
          <h3 className="text-xl font-semibold">Editing Instructions</h3>
        </div>
        <div className="p-4">
          <Textarea 
            value={editingInstructions} 
            onChange={e => onEditingInstructionsChange(e.target.value)} 
            className="min-h-[100px] w-full" 
            placeholder="Provide feedback or instructions for the AI to improve the generated content..." 
          />
        </div>
        <div className="p-4 pt-0">
          <Button onClick={onRegenerateWithInstructions} className="w-full bg-indigo-600 hover:bg-indigo-700">
            Regenerate with Instructions
          </Button>
        </div>
      </div>
    </div>
  );
};

export default GeneratedPostEditor;
