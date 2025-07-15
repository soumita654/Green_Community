
import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Heart, MessageCircle, Share2, Clock, Eye } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import BlogComments from './BlogComments';

interface BlogCardProps {
  blog: {
    id: string;
    title: string;
    content: string;
    excerpt?: string;
    cover_image_url?: string;
    tags?: string[];
    likes_count: number;
    comments_count: number;
    read_time?: number;
    created_at: string;
    profiles: {
      eco_name: string;
      avatar_url?: string;
    };
  };
}

const BlogCard: React.FC<BlogCardProps> = ({ blog }) => {
  const [showFullBlog, setShowFullBlog] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
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

  const { data: isLiked = false } = useQuery({
    queryKey: ['blog-like', blog.id, profile?.user_id],
    queryFn: async () => {
      if (!profile) return false;
      
      const { data } = await supabase
        .from('blog_likes')
        .select('id')
        .eq('blog_id', blog.id)
        .eq('user_id', profile.user_id)
        .single();
      
      return !!data;
    },
    enabled: !!profile,
  });

  const handleLike = async () => {
    if (!profile) {
      toast.error('Please sign in to like blogs');
      return;
    }

    setIsLiking(true);

    try {
      if (isLiked) {
        const { error } = await supabase
          .from('blog_likes')
          .delete()
          .eq('blog_id', blog.id)
          .eq('user_id', profile.user_id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('blog_likes')
          .insert({
            blog_id: blog.id,
            user_id: profile.user_id,
          });

        if (error) throw error;
      }

      queryClient.invalidateQueries({ queryKey: ['blogs'] });
      queryClient.invalidateQueries({ queryKey: ['blog-like', blog.id, profile.user_id] });
    } catch (error) {
      console.error('Error toggling like:', error);
      toast.error('Failed to update like');
    } finally {
      setIsLiking(false);
    }
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: blog.title,
          text: blog.excerpt || blog.content.substring(0, 100) + '...',
          url: window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast.success('Blog link copied to clipboard!');
      }
    } catch (error) {
      toast.error('Failed to share blog');
    }
  };

  return (
    <>
      <Card className="border-green-200 dark:border-green-800 hover:shadow-lg transition-shadow">
        {blog.cover_image_url && (
          <div className="h-48 overflow-hidden">
            <img 
              src={blog.cover_image_url} 
              alt={blog.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}
        
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3 mb-3">
            <Avatar className="w-10 h-10">
              <AvatarImage src={blog.profiles.avatar_url} />
              <AvatarFallback className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                {blog.profiles.eco_name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-medium text-green-800 dark:text-green-200">
                {blog.profiles.eco_name}
              </h3>
              <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                <span>{formatDistanceToNow(new Date(blog.created_at), { addSuffix: true })}</span>
                {blog.read_time && (
                  <>
                    <span>•</span>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {blog.read_time} min read
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
          
          <h2 className="text-xl font-bold text-gray-900 dark:text-white line-clamp-2">
            {blog.title}
          </h2>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <p className="text-gray-600 dark:text-gray-300 line-clamp-3">
            {blog.excerpt || blog.content.substring(0, 150) + '...'}
          </p>
          
          {blog.tags && blog.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {blog.tags.slice(0, 3).map((tag, index) => (
                <Badge key={index} variant="outline" className="text-xs border-green-300 text-green-700 dark:border-green-700 dark:text-green-300">
                  {tag}
                </Badge>
              ))}
              {blog.tags.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{blog.tags.length - 3} more
                </Badge>
              )}
            </div>
          )}
          
          <div className="flex items-center justify-between pt-2 border-t border-green-100 dark:border-green-800">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLike}
                disabled={isLiking}
                className={`flex items-center gap-2 ${
                  isLiked 
                    ? 'text-red-500 hover:text-red-600' 
                    : 'text-gray-500 hover:text-red-500'
                }`}
              >
                <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
                {blog.likes_count}
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowComments(!showComments)}
                className="flex items-center gap-2 text-gray-500 hover:text-green-600"
              >
                <MessageCircle className="w-4 h-4" />
                {blog.comments_count}
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={handleShare}
                className="flex items-center gap-2 text-gray-500 hover:text-blue-600"
              >
                <Share2 className="w-4 h-4" />
              </Button>
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFullBlog(true)}
              className="flex items-center gap-2 border-green-300 text-green-700 hover:bg-green-50 dark:border-green-700 dark:text-green-300 dark:hover:bg-green-900"
            >
              <Eye className="w-4 h-4" />
              Read Full
            </Button>
          </div>
          
          {showComments && (
            <div className="pt-4 border-t border-green-100 dark:border-green-800">
              <BlogComments blogId={blog.id} />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Full Blog Dialog */}
      <Dialog open={showFullBlog} onOpenChange={setShowFullBlog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-green-800 dark:text-green-200">
              {blog.title}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <Avatar className="w-12 h-12">
                <AvatarImage src={blog.profiles.avatar_url} />
                <AvatarFallback className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                  {blog.profiles.eco_name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold text-green-800 dark:text-green-200">
                  {blog.profiles.eco_name}
                </h3>
                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                  <span>{formatDistanceToNow(new Date(blog.created_at), { addSuffix: true })}</span>
                  {blog.read_time && (
                    <>
                      <span>•</span>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {blog.read_time} min read
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {blog.cover_image_url && (
              <img 
                src={blog.cover_image_url} 
                alt={blog.title}
                className="w-full max-h-64 object-cover rounded-lg"
              />
            )}
            
            <div className="prose prose-green max-w-none dark:prose-invert">
              {blog.content.split('\n').map((paragraph, index) => (
                <p key={index} className="mb-4 text-gray-700 dark:text-gray-300 leading-relaxed">
                  {paragraph}
                </p>
              ))}
            </div>
            
            {blog.tags && blog.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-4 border-t border-green-100 dark:border-green-800">
                {blog.tags.map((tag, index) => (
                  <Badge key={index} variant="outline" className="border-green-300 text-green-700 dark:border-green-700 dark:text-green-300">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
            
            <div className="pt-4 border-t border-green-100 dark:border-green-800">
              <BlogComments blogId={blog.id} />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default BlogCard;
