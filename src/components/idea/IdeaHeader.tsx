
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import EditableTitle from '../EditableTitle';

interface IdeaHeaderProps {
  clientId: string;
  title: string;
  onTitleChange: (title: string) => void;
  isNewPost: boolean;
  hasUnsavedChanges: boolean;
  onSave: () => void;
}

const IdeaHeader: React.FC<IdeaHeaderProps> = ({
  clientId,
  title,
  onTitleChange,
  isNewPost,
  hasUnsavedChanges,
  onSave
}) => {
  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-3">
        <Link to={`/clients/${clientId}`}>
          <Button variant="outline" size="icon" className="rounded-full">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        {isNewPost ? (
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={title}
              onChange={e => onTitleChange(e.target.value)}
              placeholder="Enter idea title..."
              className="text-2xl font-bold bg-transparent border-b-2 border-gray-300 focus:border-indigo-500 outline-none"
              autoFocus
            />
            {hasUnsavedChanges && (
              <Button onClick={onSave} className="bg-indigo-600 hover:bg-indigo-700" size="sm">
                Save
              </Button>
            )}
          </div>
        ) : (
          <EditableTitle title={title} onSave={onTitleChange} className="text-2xl font-bold" />
        )}
      </div>
    </div>
  );
};

export default IdeaHeader;
