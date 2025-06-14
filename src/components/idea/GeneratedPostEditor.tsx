import React, { useState, useRef, useEffect } from 'react';
import { Copy, Bold, Italic, Underline, List, AlignLeft, Smile, Save, Send, Eye, MessageSquare, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useToast } from '@/hooks/use-toast';
import VersionHistory from '../VersionHistory';
import FloatingToolbar from './FloatingToolbar';
import AIEditToolbar from './AIEditToolbar';
import PostPreviewModal from './PostPreviewModal';

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
  const [toolbarPosition, setToolbarPosition] = useState({
    top: 0,
    left: 0
  });
  const [toolbarVisible, setToolbarVisible] = useState(false);
  const [aiEditToolbarVisible, setAiEditToolbarVisible] = useState(false);
  const [originalPost, setOriginalPost] = useState(generatedPost);
  const [selectedText, setSelectedText] = useState('');
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showChatBox, setShowChatBox] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);
  const {
    toast
  } = useToast();
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
        left: rect.left + rect.width / 2
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
      setToolbarVisible(false);
      setTimeout(() => {
        setAiEditToolbarVisible(true);
      }, 50);
    }
  };

  const handleAIEditApply = (instruction: string) => {
    if (selectedText) {
      toast({
        title: "AI Edit Applied",
        description: `Instruction: "${instruction}" applied to selected text.`
      });
      setAiEditToolbarVisible(false);
    }
  };

  const handleAIEditClose = () => {
    setAiEditToolbarVisible(false);
    if (selectedText) {
      setToolbarVisible(true);
    }
  };

  const getCurrentLine = () => {
    const selection = window.getSelection();
    if (!selection || !editorRef.current) return null;

    const range = selection.getRangeAt(0);
    let node = range.startContainer;
    
    // Find the current line (text node or element)
    while (node && node !== editorRef.current) {
      if (node.nodeType === Node.TEXT_NODE) {
        const textContent = node.textContent || '';
        const offset = range.startOffset;
        const beforeCursor = textContent.substring(0, offset);
        const afterCursor = textContent.substring(offset);
        const lineStart = beforeCursor.lastIndexOf('\n') + 1;
        const lineEnd = afterCursor.indexOf('\n');
        const currentLineText = beforeCursor.substring(lineStart) + afterCursor.substring(0, lineEnd === -1 ? afterCursor.length : lineEnd);
        
        return {
          node,
          text: currentLineText,
          cursorPosition: beforeCursor.length - lineStart,
          fullText: textContent,
          offset,
          lineStart: beforeCursor.lastIndexOf('\n') + 1
        };
      }
      node = node.parentNode;
    }
    return null;
  };

  const insertBulletAtCursor = () => {
    const selection = window.getSelection();
    if (!selection || !editorRef.current) return;

    const range = selection.getRangeAt(0);
    const bulletText = '\n• ';
    
    const textNode = document.createTextNode(bulletText);
    range.deleteContents();
    range.insertNode(textNode);
    
    // Position cursor after the bullet
    range.setStartAfter(textNode);
    range.setEndAfter(textNode);
    selection.removeAllRanges();
    selection.addRange(range);
    
    updateContent();
  };

  const updateContent = () => {
    if (editorRef.current) {
      const newContent = editorRef.current.innerHTML;
      onGeneratedPostChange(newContent);
      checkForChanges(newContent);
    }
  };

  const handleFormat = (format: string) => {
    const selection = window.getSelection();
    if (!selection || !editorRef.current) return;

    if (format === 'insertUnorderedList') {
      insertBulletAtCursor();
      return;
    }

    if (format === 'insertUnorderedList') {
      const range = selection.rangeCount > 0 ? selection.getRangeAt(0) : null;
      let listElement = null;
      if (range) {
        let node = range.startContainer;
        while (node && node !== editorRef.current) {
          if (node.nodeType === Node.ELEMENT_NODE && (node as Element).tagName === 'UL') {
            listElement = node as Element;
            break;
          }
          node = node.parentNode;
        }
      }
      if (listElement) {
        document.execCommand('insertUnorderedList', false);
      } else {
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
      // Handle automatic bullet conversion
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const textContent = editorRef.current.textContent || '';
        
        // Check for * or - at the beginning of lines and convert to bullets
        const lines = textContent.split('\n');
        let modified = false;
        
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];
          if (line.match(/^[\s]*[\*\-]\s/)) {
            lines[i] = line.replace(/^([\s]*)([\*\-]\s)/, '$1• ');
            modified = true;
          }
        }
        
        if (modified) {
          const newContent = lines.join('\n');
          editorRef.current.textContent = newContent;
          
          // Restore cursor position
          const newRange = document.createRange();
          const textNode = editorRef.current.firstChild;
          if (textNode) {
            newRange.setStart(textNode, Math.min(range.startOffset, textNode.textContent?.length || 0));
            newRange.setEnd(textNode, Math.min(range.endOffset, textNode.textContent?.length || 0));
            selection.removeAllRanges();
            selection.addRange(newRange);
          }
        }
      }
      
      const newContent = editorRef.current.innerHTML;
      onGeneratedPostChange(newContent);
      checkForChanges(newContent);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.ctrlKey && event.key === 'c') {
      event.preventDefault();
      handleCopyWithFormatting();
      return;
    }
    if (event.ctrlKey && event.key === 's') {
      event.preventDefault();
      handleSave();
      return;
    }

    const selection = window.getSelection();
    if (!selection || !editorRef.current) return;

    const range = selection.getRangeAt(0);
    const textContent = editorRef.current.textContent || '';
    const cursorPosition = range.startOffset;
    
    // Get current line
    const beforeCursor = textContent.substring(0, cursorPosition);
    const afterCursor = textContent.substring(cursorPosition);
    const lineStart = beforeCursor.lastIndexOf('\n');
    const lineEnd = afterCursor.indexOf('\n');
    const currentLine = beforeCursor.substring(lineStart + 1) + afterCursor.substring(0, lineEnd === -1 ? afterCursor.length : lineEnd);
    const cursorInLine = beforeCursor.length - lineStart - 1;

    // Handle Enter key
    if (event.key === 'Enter') {
      const bulletMatch = currentLine.match(/^(\s*)(•\s)/);
      if (bulletMatch) {
        event.preventDefault();
        const indentation = bulletMatch[1];
        const bulletText = `\n${indentation}• `;
        
        // Insert new bullet line
        const textNode = document.createTextNode(bulletText);
        range.deleteContents();
        range.insertNode(textNode);
        
        // Position cursor after bullet
        range.setStartAfter(textNode);
        range.setEndAfter(textNode);
        selection.removeAllRanges();
        selection.addRange(range);
        
        updateContent();
        return;
      }
    }

    // Handle Backspace key
    if (event.key === 'Backspace') {
      const bulletOnlyMatch = currentLine.match(/^(\s*)(•\s)$/);
      if (bulletOnlyMatch && cursorInLine === currentLine.length) {
        event.preventDefault();
        
        // Remove the bullet and any indentation
        const lineStartPos = beforeCursor.lastIndexOf('\n') + 1;
        const lineEndPos = cursorPosition + (lineEnd === -1 ? afterCursor.length : lineEnd);
        
        const newText = textContent.substring(0, lineStartPos) + textContent.substring(lineEndPos);
        editorRef.current.textContent = newText;
        
        // Position cursor at line start
        const newRange = document.createRange();
        const textNode = editorRef.current.firstChild;
        if (textNode) {
          newRange.setStart(textNode, lineStartPos);
          newRange.setEnd(textNode, lineStartPos);
          selection.removeAllRanges();
          selection.addRange(newRange);
        }
        
        updateContent();
        return;
      }
    }

    // Handle Tab key for indentation
    if (event.key === 'Tab') {
      const bulletMatch = currentLine.match(/^(\s*)(•\s)/);
      if (bulletMatch) {
        event.preventDefault();
        
        const currentIndentation = bulletMatch[1];
        const newIndentation = event.shiftKey 
          ? currentIndentation.substring(2) // Remove 2 spaces
          : currentIndentation + '  '; // Add 2 spaces
        
        const lineStartPos = beforeCursor.lastIndexOf('\n') + 1;
        const newLine = currentLine.replace(/^(\s*)(•\s)/, `${newIndentation}• `);
        const newText = textContent.substring(0, lineStartPos) + newLine + textContent.substring(cursorPosition + (lineEnd === -1 ? afterCursor.length : lineEnd));
        
        editorRef.current.textContent = newText;
        
        // Adjust cursor position
        const indentationDiff = newIndentation.length - currentIndentation.length;
        const newCursorPos = cursorPosition + indentationDiff;
        
        const newRange = document.createRange();
        const textNode = editorRef.current.firstChild;
        if (textNode) {
          newRange.setStart(textNode, newCursorPos);
          newRange.setEnd(textNode, newCursorPos);
          selection.removeAllRanges();
          selection.addRange(newRange);
        }
        
        updateContent();
        return;
      }
    }
  };

  const handleCopyWithFormatting = async () => {
    if (editorRef.current) {
      try {
        const selection = window.getSelection();
        let htmlContent = '';
        let textContent = '';
        if (selection && selection.toString().length > 0) {
          const range = selection.getRangeAt(0);
          const fragment = range.cloneContents();
          const tempDiv = document.createElement('div');
          tempDiv.appendChild(fragment);
          htmlContent = tempDiv.innerHTML;
          textContent = selection.toString();
        } else {
          htmlContent = editorRef.current.innerHTML;
          textContent = editorRef.current.innerText || editorRef.current.textContent || '';
        }
        if (navigator.clipboard && window.ClipboardItem) {
          const clipboardItem = new ClipboardItem({
            'text/html': new Blob([htmlContent], {
              type: 'text/html'
            }),
            'text/plain': new Blob([textContent], {
              type: 'text/plain'
            })
          });
          await navigator.clipboard.write([clipboardItem]);
        } else {
          await navigator.clipboard.writeText(textContent);
        }
      } catch (err) {
        console.error('Failed to copy with formatting, falling back to plain text:', err);
        const selection = window.getSelection();
        const textContent = selection && selection.toString().length > 0 ? selection.toString() : editorRef.current.innerText || editorRef.current.textContent || '';
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
      description: "Your changes have been saved successfully."
    });
  };

  const handlePost = () => {
    toast({
      title: "Post Published",
      description: "Your post has been successfully published to LinkedIn."
    });
  };

  const handlePreview = () => {
    setShowPreviewModal(true);
  };

  const handleRegeneratePost = () => {
    // Simulate AI regenerating the entire post
    toast({
      title: "Regenerating Post",
      description: "AI is generating a new version of your post..."
    });
    // In a real implementation, this would call your AI service
    onRegenerateWithInstructions();
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

  return <div className="space-y-6">
      <FloatingToolbar position={toolbarPosition} onFormat={handleFormat} onAIEdit={handleAIEdit} visible={toolbarVisible} />
      
      <AIEditToolbar position={toolbarPosition} visible={aiEditToolbarVisible} selectedText={selectedText} onClose={handleAIEditClose} onApplyEdit={handleAIEditApply} />
      
      <PostPreviewModal open={showPreviewModal} onOpenChange={setShowPreviewModal} postContent={generatedPost} />
      
      <div className="bg-white rounded-lg border">
        <div className="flex justify-between items-center p-4 border-b">
          {/* Text Editor Toolbar - moved here from below */}
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" onClick={() => handleFormat('bold')} className="h-8 w-8 p-0">
              <Bold className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => handleFormat('italic')} className="h-8 w-8 p-0">
              <Italic className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => handleFormat('underline')} className="h-8 w-8 p-0">
              <Underline className="h-4 w-4" />
            </Button>
            <div className="w-px h-6 bg-gray-300 mx-1" />
            <Button variant="ghost" size="sm" onClick={() => handleFormat('insertUnorderedList')} className="h-8 w-8 p-0">
              <List className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <AlignLeft className="h-4 w-4" />
            </Button>
            <div className="w-px h-6 bg-gray-300 mx-1" />
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <Smile className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-64 p-2">
                <div className="grid grid-cols-5 gap-1">
                  {emojis.map((emoji, index) => <button key={index} onClick={() => insertEmoji(emoji)} className="p-2 hover:bg-gray-100 rounded text-lg">
                      {emoji}
                    </button>)}
                </div>
              </PopoverContent>
            </Popover>
          </div>
          
          <TooltipProvider>
            <div className="flex gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <div>
                    <VersionHistory versions={versionHistory} onRestore={onRestoreVersion} />
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Version History</p>
                </TooltipContent>
              </Tooltip>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="sm" onClick={handlePreview} className="h-8 w-8 p-0">
                    <Eye className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Preview</p>
                </TooltipContent>
              </Tooltip>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="sm" onClick={handleSave} disabled={!hasUnsavedChanges} className={`h-8 w-8 p-0 ${hasUnsavedChanges ? 'bg-blue-50 border-blue-300' : ''}`}>
                    <Save className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Save</p>
                </TooltipContent>
              </Tooltip>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="sm" onClick={handleCopyWithFormatting} className="h-8 w-8 p-0">
                    <Copy className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Copy</p>
                </TooltipContent>
              </Tooltip>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button size="sm" onClick={handlePost} className="h-8 w-8 p-0 bg-indigo-600 hover:bg-indigo-500 text-white">
                    <Send className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Post Now</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </TooltipProvider>
        </div>
        
        <div className="p-4">
          <div ref={editorRef} contentEditable onInput={handleInput} onMouseUp={handleTextSelection} onKeyUp={handleTextSelection} onKeyDown={handleKeyDown} className="min-h-[300px] w-full border-0 focus:outline-none resize-none text-base leading-relaxed" style={{
          whiteSpace: 'pre-wrap'
        }} suppressContentEditableWarning={true} />
          {!generatedPost && <div className="text-gray-400 pointer-events-none absolute">
              AI generated content will appear here...
            </div>}
        </div>

        {/* Chat-like Editing Instructions Section */}
        <div className="border-t bg-gray-50">
          <div className="flex items-center justify-between p-3 border-b border-gray-200">
            <Button variant="ghost" size="sm" onClick={() => setShowChatBox(!showChatBox)} className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800">
              <MessageSquare className="h-4 w-4" />
              {showChatBox ? 'Hide' : 'Show'} editing instructions
            </Button>
            
            <Button variant="ghost" size="sm" onClick={handleRegeneratePost} className="flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50">
              <Sparkles className="h-4 w-4" />
              Regenerate with AI
            </Button>
          </div>
          
          {showChatBox && <div className="p-4 space-y-3">
              <div className="flex gap-3">
                <textarea value={editingInstructions} onChange={e => onEditingInstructionsChange(e.target.value)} className="flex-1 min-h-[80px] border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none bg-white" placeholder="Provide feedback or instructions for the AI to improve the generated content..." />
              </div>
              <div className="flex justify-end">
                <Button onClick={onRegenerateWithInstructions} size="sm" className="bg-indigo-600 hover:bg-indigo-700" disabled={!editingInstructions.trim()}>
                  Send Instructions
                </Button>
              </div>
            </div>}
        </div>
      </div>
    </div>;
};

export default GeneratedPostEditor;
