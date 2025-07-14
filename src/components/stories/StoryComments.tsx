
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MessageCircle, Send } from 'lucide-react';
import { toast } from 'sonner';

interface StoryCommentsProps {
  storyId: string;
  commentsCount: number;
}

const StoryComments = ({ storyId, commentsCount }: StoryCommentsProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [newComment, setNewComment] = useState('');
  const queryClient = useQueryClient();

  const { data: comments = [] } = useQuery({
    queryKey: ['story-comments', storyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('story_comments')
        .select(`
          *,
          profiles (
            eco_name,
            avatar_url
          )
        `)
        .eq('story_id', storyId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: isOpen,
  });

  const commentMutation = useMutation({
    mutationFn: async (content: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('story_comments')
        .insert({
          story_id: storyId,
          user_id: user.id,
          content: content.trim(),
        });

      if (error) throw error;
    },
    onSuccess: () => {
      setNewComment('');
      queryClient.invalidateQueries({ queryKey: ['story-comments', storyId] });
      queryClient.invalidateQueries({ queryKey: ['stories'] });
      toast.success('Comment added! 💬');
    },
    onError: () => {
      toast.error('Failed to add comment');
    },
  });

  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    commentMutation.mutate(newComment);
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 text-gray-500 hover:text-green-600"
      >
        <MessageCircle className="w-4 h-4" />
        <span>{commentsCount}</span>
      </Button>

      {isOpen && (
        <div className="mt-4 space-y-4 border-t border-green-100 dark:border-green-800 pt-4">
          <form onSubmit={handleSubmitComment} className="space-y-3">
            <Textarea
              placeholder="Write a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="border-green-300 focus:border-green-500 min-h-20"
            />
            <Button
              type="submit"
              disabled={!newComment.trim() || commentMutation.isPending}
              size="sm"
              className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
            >
              <Send className="w-4 h-4 mr-2" />
              {commentMutation.isPending ? 'Posting...' : 'Post Comment'}
            </Button>
          </form>

          <div className="space-y-3 max-h-60 overflow-y-auto">
            {comments.map((comment) => (
              <div key={comment.id} className="flex gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={comment.profiles?.avatar_url} />
                  <AvatarFallback className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 text-xs">
                    {comment.profiles?.eco_name?.charAt(0) || 'E'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-sm text-green-800 dark:text-green-200">
                      {comment.profiles?.eco_name}
                    </p>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {formatTimeAgo(comment.created_at)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    {comment.content}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default StoryComments;
