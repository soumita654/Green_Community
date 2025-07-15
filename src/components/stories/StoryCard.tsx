
import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Heart, MessageCircle, Share2, MoreHorizontal } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import StoryComments from './StoryComments';

interface StoryCardProps {
  story: {
    id: string;
    content: string;
    media_url?: string;
    media_type?: string;
    likes_count: number;
    comments_count: number;
    created_at: string;
    profiles: {
      eco_name: string;
      avatar_url?: string;
    };
    communities?: {
      name: string;
      category: string;
    };
  };
}

const StoryCard: React.FC<StoryCardProps> = ({ story }) => {
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
    queryKey: ['story-like', story.id, profile?.user_id],
    queryFn: async () => {
      if (!profile) return false;
      
      const { data } = await supabase
        .from('story_likes')
        .select('id')
        .eq('story_id', story.id)
        .eq('user_id', profile.user_id)
        .single();
      
      return !!data;
    },
    enabled: !!profile,
  });

  const handleLike = async () => {
    if (!profile) {
      toast.error('Please sign in to like stories');
      return;
    }

    setIsLiking(true);

    try {
      if (isLiked) {
        const { error } = await supabase
          .from('story_likes')
          .delete()
          .eq('story_id', story.id)
          .eq('user_id', profile.user_id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('story_likes')
          .insert({
            story_id: story.id,
            user_id: profile.user_id,
          });

        if (error) throw error;
      }

      // Refresh queries
      queryClient.invalidateQueries({ queryKey: ['stories'] });
      queryClient.invalidateQueries({ queryKey: ['story-like', story.id, profile.user_id] });
    } catch (error) {
      console.error('Error toggling like:', error);
      toast.error('Failed to update like. Please try again.');
    } finally {
      setIsLiking(false);
    }
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: `${story.profiles.eco_name}'s Eco Story`,
          text: story.content.substring(0, 100) + '...',
          url: window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast.success('Story link copied to clipboard!');
      }
    } catch (error) {
      console.error('Error sharing:', error);
      toast.error('Failed to share story');
    }
  };

  return (
    <Card className="border-green-200 dark:border-green-800">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="w-12 h-12">
              <AvatarImage src={story.profiles.avatar_url} />
              <AvatarFallback className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                {story.profiles.eco_name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold text-green-800 dark:text-green-200">
                {story.profiles.eco_name}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {formatDistanceToNow(new Date(story.created_at), { addSuffix: true })}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {story.communities && (
              <Badge variant="outline" className="text-xs border-green-300 text-green-700 dark:border-green-700 dark:text-green-300">
                {story.communities.name}
              </Badge>
            )}
            <Button variant="ghost" size="sm">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
          {story.content}
        </p>
        
        {story.media_url && (
          <div className="rounded-lg overflow-hidden">
            {story.media_type === 'image' ? (
              <img 
                src={story.media_url} 
                alt="Story media"
                className="w-full max-h-96 object-cover"
              />
            ) : story.media_type === 'video' ? (
              <video 
                src={story.media_url}
                controls
                className="w-full max-h-96 object-cover"
              >
                Your browser does not support the video tag.
              </video>
            ) : null}
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
              {story.likes_count}
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowComments(!showComments)}
              className="flex items-center gap-2 text-gray-500 hover:text-green-600"
            >
              <MessageCircle className="w-4 h-4" />
              {story.comments_count}
            </Button>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleShare}
            className="flex items-center gap-2 text-gray-500 hover:text-blue-600"
          >
            <Share2 className="w-4 h-4" />
            Share
          </Button>
        </div>
        
        {showComments && (
          <div className="pt-4 border-t border-green-100 dark:border-green-800">
            <StoryComments storyId={story.id} />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default StoryCard;
