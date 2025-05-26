
import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { ExternalLink, RefreshCw, Send, Edit3 } from 'lucide-react';

interface LinkedInPost {
  id: string;
  author: {
    name: string;
    title: string;
    profileImage?: string;
  };
  content: string;
  publishedAt: string;
  engagement: {
    likes: number;
    comments: number;
    shares: number;
  };
  url: string;
  relevanceScore: number;
}

interface CommentCardProps {
  post: LinkedInPost;
  aiGeneratedComment: string;
  onRewrite: (guidelines?: string) => void;
  onPost: (comment: string) => void;
}

const CommentCard = ({ post, aiGeneratedComment, onRewrite, onPost }: CommentCardProps) => {
  const [comment, setComment] = useState(aiGeneratedComment);
  const [isEditing, setIsEditing] = useState(false);
  const [guidelines, setGuidelines] = useState('');
  const [showGuidelines, setShowGuidelines] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleRewrite = async () => {
    setIsLoading(true);
    await onRewrite(guidelines || undefined);
    setIsLoading(false);
    setShowGuidelines(false);
    setGuidelines('');
  };

  const handlePost = () => {
    onPost(comment);
  };

  const getRelevanceColor = (score: number) => {
    if (score >= 85) return 'bg-green-100 text-green-800';
    if (score >= 70) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={post.author.profileImage} />
              <AvatarFallback>{post.author.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold text-sm">{post.author.name}</h3>
              <p className="text-xs text-gray-500">{post.author.title}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge className={getRelevanceColor(post.relevanceScore)}>
              {post.relevanceScore}% match
            </Badge>
            <Button variant="ghost" size="sm" asChild>
              <a href={post.url} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4" />
              </a>
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Original Post Content */}
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-sm text-gray-700 line-clamp-4">{post.content}</p>
          <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
            <span>{new Date(post.publishedAt).toLocaleDateString()}</span>
            <div className="flex items-center space-x-4">
              <span>{post.engagement.likes} likes</span>
              <span>{post.engagement.comments} comments</span>
              <span>{post.engagement.shares} shares</span>
            </div>
          </div>
        </div>

        <Separator />

        {/* AI Generated Comment Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-gray-900">AI-Generated Comment</h4>
            <div className="flex items-center space-x-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowGuidelines(!showGuidelines)}
              >
                <Edit3 className="h-4 w-4 mr-1" />
                Customize
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleRewrite}
                disabled={isLoading}
              >
                <RefreshCw className={`h-4 w-4 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
                Rewrite
              </Button>
            </div>
          </div>

          {showGuidelines && (
            <div className="bg-blue-50 rounded-lg p-3 space-y-2">
              <label className="text-xs font-medium text-blue-900">
                Rewrite Guidelines (optional)
              </label>
              <Textarea
                placeholder="e.g., Make it more professional, add a question, mention our expertise..."
                value={guidelines}
                onChange={(e) => setGuidelines(e.target.value)}
                className="text-sm"
                rows={2}
              />
              <div className="flex space-x-2">
                <Button size="sm" onClick={handleRewrite} disabled={isLoading}>
                  Apply Guidelines
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setShowGuidelines(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}

          <Textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="AI-generated comment will appear here..."
            className="min-h-[100px]"
            onFocus={() => setIsEditing(true)}
          />

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-xs text-gray-500">
              <span>{comment.length} characters</span>
              {isEditing && <span>• Edited</span>}
            </div>
            <Button onClick={handlePost} className="bg-blue-600 hover:bg-blue-700">
              <Send className="h-4 w-4 mr-2" />
              Post Comment
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CommentCard;
