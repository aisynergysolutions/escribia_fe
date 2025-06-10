import React, { useState, useRef, useEffect } from 'react';
import { Copy, Bold, Italic, Underline, List, AlignLeft, Smile, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useToast } from '@/hooks/use-toast';
import VersionHistory from '../VersionHistory';
import FloatingToolbar from './FloatingToolbar';
import AIEditToolbar from './AIEditToolbar';

interface GeneratedPostEditorProps {
  generatedPost: string;
  onGeneratedPostChange: (value: string) => void;
  editingInstructions: string;
  onEditingInstructionsChange: (value: string) => void;
  onCopyText: () => void;
  onRegenerateWithInstructions: () => void;
  onSave: () => void;
  hasUnsavedChanges: boolean;
  onUnsavedChangesChange: (hasChanges: boolean) => void;
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
  onSave,
  hasUnsavedChanges,
  onUnsavedChangesChange,
  versionHistory,
  onRestoreVersion
}) => {
  const [toolbarPosition, setToolbarPosition] = useState({ top: 0, left: 0 });
  const [toolbarVisible, setToolbarVisible] = useState(false);
  const [aiEditToolbarVisible, setAiEditToolbarVisible] = useState(false);
  const [originalPost, setOriginalPost] = useState(generatedPost);
  const [selectedText, setSelectedText] = useState('');
  const editorRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const emojis = ['😀', '😊', '😍', '🤔', '👍', '👎', '❤️', '🔥', '💡', '🎉', '🚀', '💯', '✨', '🌟', '📈', '💼', '🎯', '💪', '🙌', '👏'];

  const handleTextSelection = () => {
    const selection = window.getSelection();
    if (selection && selection.toString().length > 0) {
      const selectedText = selection.toString();
      setSelectedText(selectedText);
      
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      
      setToolbarPosition({
        top: rect.top + window.scrollY,
        left: rect.left + (rect.width / 2)
      });
      setToolbarVisible(true);
      setAiEditToolbarVisible(false);
    } else {
      setToolbarVisible(false);
      setAiEditToolbarVisible(false);
      setSelectedText('');
    }
  };

  const handleAIEdit = () => {
    if (selectedText) {
      // Keep the same position but switch toolbars
      setToolbarVisible(false);
      // Small delay to ensure smooth transition
      setTimeout(() => {
        setAiEditToolbarVisible(true);
      }, 50);
    }
  };

  const handleAIEditApply = (instruction: string) => {
    if (selectedText) {
      toast({
        title: "AI Edit Applied",
        description: `Instruction: "${instruction}" applied to selected text.`,
      });
      
      // In a real implementation, this would call an AI API to edit the selected text
      // For now, we'll just show the toast and close the toolbar
      setAiEditToolbarVisible(false);
    }
  };

  const handleAIEditClose = () => {
    setAiEditToolbarVisible(false);
    // Optionally show the main toolbar again if text is still selected
    if (selectedText) {
      setToolbarVisible(true);
    }
  };

  const handleFormat = (format: string) => {
    const selection = window.getSelection();
    if (!selection || !editorRef.current) return;

    if (format === 'insertUnorderedList') {
      // Check if we're already in a list
      const range = selection.rangeCount > 0 ? selection.getRangeAt(0) : null;
      let listElement = null;
      
      if (range) {
        let node = range.startContainer;
        // Traverse up to find if we're inside a list
        while (node && node !== editorRef.current) {
          if (node.nodeType === Node.ELEMENT_NODE && (node as Element).tagName === 'UL') {
            listElement = node as Element;
            break;
          }
          node = node.parentNode;
        }
      }

      if (listElement) {
        // We're in a list, remove it
        document.execCommand('insertUnorderedList', false);
      } else {
        // We're not in a list, create one
        document.execCommand('insertUnorderedList', false);
      }
    } else {
      document.execCommand(format, false);
    }
    
    if (editorRef.current) {
      const newContent = editorRef.current.innerHTML;
      onGeneratedPostChange(newContent);
      checkForChanges(newContent);
    }
  };

  const handleInput = () => {
    if (editorRef.current) {
      const newContent = editorRef.current.innerHTML;
      onGeneratedPostChange(newContent);
      checkForChanges(newContent);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    // Handle Ctrl+C to copy with formatting
    if (event.ctrlKey && event.key === 'c') {
      event.preventDefault();
      handleCopyWithFormatting();
    }
    // Handle Ctrl+S to save
    if (event.ctrlKey && event.key === 's') {
      event.preventDefault();
      handleSave();
    }
  };

  const handleCopyWithFormatting = async () => {
    if (editorRef.current) {
      try {
        const selection = window.getSelection();
        let htmlContent = '';
        let textContent = '';
        
        if (selection && selection.toString().length > 0) {
          // Copy selected content
          const range = selection.getRangeAt(0);
          const fragment = range.cloneContents();
          const tempDiv = document.createElement('div');
          tempDiv.appendChild(fragment);
          htmlContent = tempDiv.innerHTML;
          textContent = selection.toString();
        } else {
          // Copy all content
          htmlContent = editorRef.current.innerHTML;
          textContent = editorRef.current.innerText || editorRef.current.textContent || '';
        }
        
        if (navigator.clipboard && window.ClipboardItem) {
          const clipboardItem = new ClipboardItem({
            'text/html': new Blob([htmlContent], { type: 'text/html' }),
            'text/plain': new Blob([textContent], { type: 'text/plain' })
          });
          await navigator.clipboard.write([clipboardItem]);
        } else {
          // Fallback for browsers that don't support ClipboardItem
          await navigator.clipboard.writeText(textContent);
        }
      } catch (err) {
        console.error('Failed to copy with formatting, falling back to plain text:', err);
        // Fallback to plain text
        const selection = window.getSelection();
        const textContent = selection && selection.toString().length > 0 
          ? selection.toString() 
          : editorRef.current.innerText || editorRef.current.textContent || '';
        await navigator.clipboard.writeText(textContent);
      }
    }
  };

  const insertEmoji = (emoji: string) => {
    if (editorRef.current) {
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        range.deleteContents();
        const textNode = document.createTextNode(emoji);
        range.insertNode(textNode);
        range.setStartAfter(textNode);
        range.setEndAfter(textNode);
        selection.removeAllRanges();
        selection.addRange(range);
      } else {
        // If no selection, append at the end
        editorRef.current.appendChild(document.createTextNode(emoji));
      }
      const newContent = editorRef.current.innerHTML;
      onGeneratedPostChange(newContent);
      checkForChanges(newContent);
    }
  };

  const checkForChanges = (currentContent: string) => {
    const hasChanges = currentContent !== originalPost;
    onUnsavedChangesChange(hasChanges);
  };

  const handleSave = () => {
    onSave();
    setOriginalPost(generatedPost);
    onUnsavedChangesChange(false);
    toast({
      title: "Saved",
      description: "Your changes have been saved successfully.",
    });
  };

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== generatedPost) {
      editorRef.current.innerHTML = generatedPost;
    }
  }, [generatedPost]);

  useEffect(() => {
    setOriginalPost(generatedPost);
  }, []);

  useEffect(() => {
    const handleClickOutside = () => {
      const selection = window.getSelection();
      if (!selection || selection.toString().length === 0) {
        setToolbarVisible(false);
        setAiEditToolbarVisible(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  return (
    <div className="space-y-6">
      <FloatingToolbar
        position={toolbarPosition}
        onFormat={handleFormat}
        onAIEdit={handleAIEdit}
        visible={toolbarVisible}
      />
      
      <AIEditToolbar
        position={toolbarPosition}
        visible={aiEditToolbarVisible}
        selectedText={selectedText}
        onClose={handleAIEditClose}
        onApplyEdit={handleAIEditApply}
      />
      
      <div className="bg-white rounded-lg border">
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-xl font-semibold">Generated Post</h3>
          <div className="flex gap-2">
            <VersionHistory versions={versionHistory} onRestore={onRestoreVersion} />
            <Button
              variant="outline"
              size="sm"
              onClick={handleSave}
              disabled={!hasUnsavedChanges}
              className={hasUnsavedChanges ? 'bg-blue-50 border-blue-300' : ''}
            >
              <Save className="h-4 w-4 mr-2" />
              Save
            </Button>
            <Button variant="outline" size="sm" onClick={handleCopyWithFormatting}>
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
            className="h-8 w-8 p-0"
          >
            <AlignLeft className="h-4 w-4" />
          </Button>
          <div className="w-px h-6 bg-gray-300 mx-1" />
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
              >
                <Smile className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64 p-2">
              <div className="grid grid-cols-5 gap-1">
                {emojis.map((emoji, index) => (
                  <button
                    key={index}
                    onClick={() => insertEmoji(emoji)}
                    className="p-2 hover:bg-gray-100 rounded text-lg"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </PopoverContent>
          </Popover>
        </div>
        
        <div className="p-4">
          <div
            ref={editorRef}
            contentEditable
            onInput={handleInput}
            onMouseUp={handleTextSelection}
            onKeyUp={handleTextSelection}
            onKeyDown={handleKeyDown}
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
  );
};

export default GeneratedPostEditor;
