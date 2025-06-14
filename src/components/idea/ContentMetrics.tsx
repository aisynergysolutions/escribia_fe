
import React from 'react';
import { AlertCircle, CheckCircle } from 'lucide-react';

interface ContentMetricsProps {
  content: string;
  isTruncated: boolean;
  truncatedLength: number;
}

const ContentMetrics: React.FC<ContentMetricsProps> = ({
  content,
  isTruncated,
  truncatedLength
}) => {
  const getPlainText = (html: string) => {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    return tempDiv.textContent || tempDiv.innerText || '';
  };

  const plainText = getPlainText(content);
  const totalLength = plainText.length;
  const lineCount = plainText.split('\n').length;

  const getCharacterStatus = () => {
    if (totalLength <= 200) return { color: 'text-green-600', icon: CheckCircle };
    if (totalLength <= 300) return { color: 'text-yellow-600', icon: AlertCircle };
    return { color: 'text-red-600', icon: AlertCircle };
  };

  const getLineStatus = () => {
    if (lineCount <= 3) return { color: 'text-green-600', icon: CheckCircle };
    return { color: 'text-yellow-600', icon: AlertCircle };
  };

  const charStatus = getCharacterStatus();
  const lineStatus = getLineStatus();

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 space-y-2">
      <h4 className="text-sm font-medium text-gray-900">Content Metrics</h4>
      
      <div className="space-y-2 text-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <charStatus.icon className={`w-4 h-4 ${charStatus.color}`} />
            <span>Characters</span>
          </div>
          <span className={charStatus.color}>
            {totalLength} {totalLength > 200 && '(over limit)'}
          </span>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <lineStatus.icon className={`w-4 h-4 ${lineStatus.color}`} />
            <span>Lines</span>
          </div>
          <span className={lineStatus.color}>
            {lineCount} {lineCount > 3 && '(over limit)'}
          </span>
        </div>
        
        {isTruncated && (
          <div className="pt-2 border-t border-gray-300">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Visible characters</span>
              <span className="text-blue-600">{truncatedLength}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Hidden characters</span>
              <span className="text-orange-600">{totalLength - truncatedLength}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContentMetrics;
