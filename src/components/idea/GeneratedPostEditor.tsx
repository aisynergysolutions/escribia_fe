
import React, { useState, useRef, useEffect } from 'react';
import { Copy, Bold, Italic, Underline, List, AlignLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import VersionHistory from '../VersionHistory';
import FloatingToolbar from './FloatingToolbar';

interface GeneratedPostEditorProps {
  generatedPost: string;
  onGeneratedPostChange: (value: string) => void;
  editingInstructions: string;
  onEditingInstructionsChange: (value: string) => void;
  onCopyText: () => void;
  onRegenerateWithInstructions: () => void;
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
  versionHistory,
  onRestoreVersion
}) => {
  const [toolbarPosition, setToolbarPosition] = useState({ top: 0, left: 0 });
  const [toolbarVisible, setToolbarVisible] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);

  const handleTextSelection = () => {
    const selection = window.getSelection();
    if (selection && selection.toString().length > 0) {
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      
      setToolbarPosition({
        top: rect.top + window.scrollY,
        left: rect.left + (rect.width / 2) - 50
      });
      setToolbarVisible(true);
    } else {
      setToolbarVisible(false);
    }
  };

  const handleFormat = (format: string) => {
    document.execCommand(format, false);
    if (editorRef.current) {
      onGeneratedPostChange(editorRef.current.innerHTML);
    }
  };

  const handleInput = () => {
    if (editorRef.current) {
      onGeneratedPostChange(editorRef.current.innerHTML);
    }
  };

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== generatedPost) {
      editorRef.current.innerHTML = generatedPost;
    }
  }, [generatedPost]);

  useEffect(() => {
    const handleClickOutside = () => {
      const selection = window.getSelection();
      if (!selection || selection.toString().length === 0) {
        setToolbarVisible(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  return (
    <>
      {/* Render FloatingToolbar at the top level to avoid layout interference */}
      <FloatingToolbar
        position={toolbarPosition}
        onFormat={handleFormat}
        visible={toolbarVisible}
      />
      
      <div className="space-y-6">
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
              className="h-8 w-8 p-0"
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
            >
              <AlignLeft className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="p-4">
            <div
              ref={editorRef}
              contentEditable
              onInput={handleInput}
              onMouseUp={handleTextSelection}
              onKeyUp={handleTextSelection}
              className="min-h-[300px] w-full border-0 focus:outline-none resize-none text-base leading-relaxed"
              style={{ whiteSpace: 'pre-wrap' }}
              suppressContentEditableWarning={true}
            />
            {!generatedPost && (
              <div className="text-gray-400 pointer-events-none absolute">
                AI generated content will appear here...
              </div>
            )}
          </div>
        </div>
        
        <div className="bg-white rounded-lg border">
          <div className="p-4 border-b">
            <h3 className="text-xl font-semibold">Editing Instructions</h3>
          </div>
          <div className="p-4">
            <textarea 
              value={editingInstructions} 
              onChange={e => onEditingInstructionsChange(e.target.value)} 
              className="min-h-[100px] w-full border rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500" 
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
    </>
  );
};

export default GeneratedPostEditor;
