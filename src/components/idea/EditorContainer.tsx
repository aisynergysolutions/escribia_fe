
import React from 'react';
import EditorMetrics from './EditorMetrics';

interface EditorContainerProps {
  editorRef: React.RefObject<HTMLDivElement>;
  generatedPost: string;
  onInput: () => void;
  onMouseUp: () => void;
  onKeyUp: () => void;
  onKeyDown: (event: React.KeyboardEvent) => void;
  charCount: number;
  lineCount: number;
  showTruncation: boolean;
  cutoffLineTop: number;
}

const EditorContainer: React.FC<EditorContainerProps> = ({
  editorRef,
  generatedPost,
  onInput,
  onMouseUp,
  onKeyUp,
  onKeyDown,
  charCount,
  lineCount,
  showTruncation,
  cutoffLineTop
}) => {
  return (
    <div className="p-4 bg-gray-50">
      <div 
        className="linkedin-safe mx-auto bg-white focus-within:outline focus-within:outline-1 focus-within:outline-indigo-600/25 rounded-lg transition-all duration-200 max-w-full sm:max-w-[552px]"
      >
        <div className="relative" style={{ paddingTop: '24px', paddingLeft: '24px', paddingRight: '24px', paddingBottom: '45px' }}>
          <div 
            ref={editorRef} 
            contentEditable 
            onInput={onInput} 
            onMouseUp={onMouseUp} 
            onKeyUp={onKeyUp} 
            onKeyDown={onKeyDown} 
            className="min-h-[200px] w-full border-0 focus:outline-none resize-none linkedin-typography" 
            style={{
              fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen-Sans, Ubuntu, Cantarell, "Helvetica Neue", sans-serif',
              fontSize: '14px',
              lineHeight: '1.5',
              color: '#000000',
              whiteSpace: 'pre-wrap',
              wordWrap: 'break-word'
            }}
            suppressContentEditableWarning={true} 
          />
          
          {!generatedPost && (
            <div className="text-gray-400 pointer-events-none absolute top-6 left-6">
              AI generated content will appear here...
            </div>
          )}
          
          <EditorMetrics 
            charCount={charCount}
            lineCount={lineCount}
            showTruncation={showTruncation}
            cutoffLineTop={cutoffLineTop}
          />
        </div>
      </div>
    </div>
  );
};

export default EditorContainer;
