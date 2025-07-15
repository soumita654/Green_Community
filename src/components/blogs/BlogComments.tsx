
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Send } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';

interface BlogCommentsProps {
  blogId: string;
}

const BlogComments: React.FC<BlogCommentsProps> = ({ blogId }) => {
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();

  const { data: profile } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      return data;
    },
  });

  const { data: comments = [] } = useQuery({
    queryKey: ['blog-comments', blogId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('blog_comments')
        .select(`
          *,
          profiles (
            eco_name,
            avatar_url
          )
        `)
        .eq('blog_id', blogId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data || [];
    },
  });

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newComment.trim()) return;
    
    if (!profile) {
      toast.error('Please sign in to comment');
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('blog_comments')
        .insert({
          blog_id: blogId,
          user_id: profile.user_id,
          content: newComment.trim(),
        });

      if (error) throw error;

      setNewComment('');
      
      queryClient.invalidateQueries({ queryKey: ['blog-comments', blogId] });
      queryClient.invalidateQueries({ queryKey: ['blogs'] });
      
      toast.success('Comment added!');
    } catch (error) {
      console.error('Error adding comment:', error);
      toast.error('Failed to add comment');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <h4 className="font-semibold text-green-800 dark:text-green-200">
        Comments ({comments.length})
      </h4>
      
      {/* Comments List */}
      <div className="space-y-4 max-h-60 overflow-y-auto">
        {comments.map((comment) => (
          <div key={comment.id} className="flex gap-3">
            <Avatar className="w-8 h-8">
              <AvatarImage src={comment.profiles?.avatar_url} />
              <AvatarFallback className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 text-xs">
                {comment.profiles?.eco_name?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg px-3 py-2">
                <p className="font-semibold text-sm text-green-800 dark:text-green-200">
                  {comment.profiles?.eco_name || 'Unknown User'}
                </p>
                <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                  {comment.content}
                </p>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 ml-3">
                {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Add Comment Form */}
      {profile ? (
        <form onSubmit={handleSubmitComment} className="flex gap-2">
          <Avatar className="w-8 h-8">
            <AvatarImage src={profile.avatar_url} />
            <AvatarFallback className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 text-xs">
              {profile.eco_name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 flex gap-2">
            <Textarea
              placeholder="Write a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="min-h-[60px] resize-none border-green-300 focus:border-green-500 text-sm"
            />
            <Button
              type="submit"
              size="sm"
              disabled={isSubmitting || !newComment.trim()}
              className="bg-green-500 hover:bg-green-600 text-white px-3"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </form>
      ) : (
        <p className="text-center text-sm text-gray-500 dark:text-gray-400">
          Please sign in to add comments
        </p>
      )}
    </div>
  );
};

export default BlogComments;
