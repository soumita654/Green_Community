
import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Heart, Calendar } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import StoryComments from './StoryComments';
import ShareStory from './ShareStory';

interface Story {
  id: string;
  content: string;
  media_url?: string;
  media_type?: string;
  likes_count: number;
  comments_count: number;
  created_at: string;
  user_id: string;
  profiles: {
    eco_name: string;
    avatar_url?: string;
  };
}

interface StoryCardProps {
  story: Story;
}

const StoryCard = ({ story }: StoryCardProps) => {
  const queryClient = useQueryClient();

  const { data: hasLiked } = useQuery({
    queryKey: ['story-like', story.id],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;
      
      const { data } = await supabase
        .from('story_likes')
        .select('id')
        .eq('story_id', story.id)
        .eq('user_id', user.id)
        .maybeSingle();
      
      return !!data;
    },
  });

  const likeMutation = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      if (hasLiked) {
        const { error } = await supabase
          .from('story_likes')
          .delete()
          .eq('story_id', story.id)
          .eq('user_id', user.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('story_likes')
          .insert({ story_id: story.id, user_id: user.id });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['story-like', story.id] });
      queryClient.invalidateQueries({ queryKey: ['stories'] });
    },
  });

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
    <Card className="w-full max-w-md mx-auto border-green-200 dark:border-green-800">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={story.profiles.avatar_url} />
            <AvatarFallback className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
              {story.profiles.eco_name?.charAt(0) || 'E'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <p className="font-semibold text-green-800 dark:text-green-200">
              {story.profiles.eco_name}
            </p>
            <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
              <Calendar className="w-3 h-3" />
              {formatTimeAgo(story.created_at)}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {story.content && (
          <p className="text-gray-800 dark:text-gray-200 leading-relaxed">
            {story.content}
          </p>
        )}

        {story.media_url && (
          <div className="rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
            {story.media_type?.startsWith('image/') ? (
              <img
                src={story.media_url}
                alt="Story media"
                className="w-full h-auto max-h-96 object-cover"
              />
            ) : story.media_type?.startsWith('video/') ? (
              <video
                src={story.media_url}
                controls
                className="w-full h-auto max-h-96 object-cover"
              />
            ) : null}
          </div>
        )}

        <div className="flex items-center justify-between pt-2 border-t border-green-100 dark:border-green-800">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => likeMutation.mutate()}
            className={`flex items-center gap-2 ${
              hasLiked 
                ? 'text-red-500 hover:text-red-600' 
                : 'text-gray-500 hover:text-red-500'
            }`}
          >
            <Heart className={`w-4 h-4 ${hasLiked ? 'fill-current' : ''}`} />
            <span>{story.likes_count}</span>
          </Button>

          <StoryComments storyId={story.id} commentsCount={story.comments_count} />

          <ShareStory storyId={story.id} content={story.content} />
        </div>
      </CardContent>
    </Card>
  );
};

export default StoryCard;
