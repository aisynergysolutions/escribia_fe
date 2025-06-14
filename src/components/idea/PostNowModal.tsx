
import React from 'react';
import { Send } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface PostNowModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  postContent: string;
  onPost: () => void;
}

const PostNowModal: React.FC<PostNowModalProps> = ({
  open,
  onOpenChange,
  postContent,
  onPost
}) => {
  const handlePost = () => {
    onPost();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Send className="h-5 w-5" />
            Post to LinkedIn
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Post Preview */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Post Preview</h3>
            <div className="bg-white rounded-lg border shadow-sm">
              <div className="p-4 border-b">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gray-300"></div>
                  <div>
                    <div className="font-semibold text-gray-900">Your Name</div>
                    <div className="text-sm text-gray-500">Publishing now...</div>
                  </div>
                </div>
              </div>
              <div className="p-4">
                <div 
                  className="text-sm leading-relaxed text-gray-900"
                  dangerouslySetInnerHTML={{ __html: postContent }}
                />
              </div>
              
              {/* Simulated engagement */}
              <div className="px-4 pb-4">
                <div className="flex justify-between pt-3 border-t border-gray-200">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <div className="flex -space-x-1">
                      <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center text-xs text-white">👍</div>
                      <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-xs text-white">❤️</div>
                    </div>
                    <span>Ready to publish</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Confirmation */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-blue-800 text-sm">
              <strong>Ready to publish:</strong> Your post will be immediately published to your LinkedIn profile. 
              Make sure you've reviewed the content above.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handlePost}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            <Send className="w-4 h-4 mr-2" />
            Post Now
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PostNowModal;
