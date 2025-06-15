
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';

export interface CommentReply {
  id: string;
  author: string;
  text: string;
  createdAt: Date;
}

export interface CommentThread {
  id: string;
  selectionText: string;
  replies: CommentReply[];
  resolved: boolean;
}

interface CommentsPanelProps {
  comments: CommentThread[];
  onAddReply: (threadId: string, replyText: string) => void;
  onResolve: (threadId: string) => void;
}

const CommentsPanel: React.FC<CommentsPanelProps> = ({ comments, onAddReply, onResolve }) => {
  const [replyingTo, setReplyingTo] = React.useState<string | null>(null);
  const [replyText, setReplyText] = React.useState("");
  const { toast } = useToast();

  const handleReplySubmit = (threadId: string) => {
    if (replyText.trim()) {
      onAddReply(threadId, replyText);
      setReplyText("");
      setReplyingTo(null);
      toast({ title: "Reply posted." });
    }
  };

  const handleResolveClick = (threadId: string) => {
    onResolve(threadId);
    toast({ title: "Thread resolved." });
  };
  
  const activeComments = comments.filter(c => !c.resolved);

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle>Comments</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col min-h-0">
        <Tabs defaultValue="internal" className="flex-1 flex flex-col">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="internal">Internal ({activeComments.length})</TabsTrigger>
            <TabsTrigger value="external">External</TabsTrigger>
          </TabsList>
          <TabsContent value="internal" className="flex-1 mt-4">
            <ScrollArea className="h-full pr-3">
              <div className="space-y-4">
                {activeComments.length === 0 && <p className="text-sm text-muted-foreground p-4 text-center">No active comments. Select text in the editor to add one.</p>}
                {activeComments.map(thread => (
                  <Card key={thread.id} className="bg-slate-50">
                    <CardHeader className="p-4">
                      <blockquote className="border-l-2 pl-3 italic text-sm text-muted-foreground">"{thread.selectionText}"</blockquote>
                    </CardHeader>
                    <CardContent className="p-4 pt-0 space-y-3">
                      {thread.replies.map(reply => (
                        <div key={reply.id}>
                          <p className="text-sm font-semibold">{reply.author} <span className="text-xs text-muted-foreground font-normal">{new Date(reply.createdAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</span></p>
                          <p className="text-sm whitespace-pre-wrap">{reply.text}</p>
                        </div>
                      ))}
                      {replyingTo === thread.id ? (
                        <div className="pt-2">
                          <Textarea placeholder="Write a reply..." value={replyText} onChange={(e) => setReplyText(e.target.value)} autoFocus/>
                          <div className="flex justify-end gap-2 mt-2">
                             <Button variant="ghost" size="sm" onClick={() => setReplyingTo(null)}>Cancel</Button>
                             <Button size="sm" onClick={() => handleReplySubmit(thread.id)} disabled={!replyText.trim()}>Reply</Button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex justify-end gap-2 mt-2 border-t pt-3">
                           <Button variant="ghost" size="sm" onClick={() => setReplyingTo(thread.id)}>Reply</Button>
                           <Button variant="outline" size="sm" onClick={() => handleResolveClick(thread.id)}>Resolve</Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>
          <TabsContent value="external">
            <p className="text-sm text-muted-foreground p-4 text-center">External comments are not yet available.</p>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default CommentsPanel;
