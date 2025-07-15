
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Leaf, Send } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import MediaUpload from './MediaUpload';

const ShareStory = () => {
  const [content, setContent] = useState('');
  const [selectedCommunity, setSelectedCommunity] = useState<string>('');
  const [media, setMedia] = useState<{ url: string; type: 'image' | 'video' } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const queryClient = useQueryClient();

  const { data: profile } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user');
      
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      return data;
    },
  });

  const { data: communities = [] } = useQuery({
    queryKey: ['communities'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('communities')
        .select('*')
        .order('member_count', { ascending: false });

      if (error) throw error;
      return data || [];
    },
  });

  const handleMediaUpload = (url: string, type: 'image' | 'video') => {
    setMedia({ url, type });
  };

  const handleRemoveMedia = () => {
    setMedia(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim()) {
      toast.error('Please write something to share!');
      return;
    }

    if (!profile) {
      toast.error('Please sign in to share your story');
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('stories')
        .insert({
          content: content.trim(),
          user_id: profile.user_id,
          community_id: selectedCommunity || null,
          media_url: media?.url || null,
          media_type: media?.type || null,
        });

      if (error) throw error;

      setContent('');
      setSelectedCommunity('');
      setMedia(null);
      
      // Refresh stories
      queryClient.invalidateQueries({ queryKey: ['stories'] });
      
      toast.success('Your story has been shared! 🌱');
    } catch (error) {
      console.error('Error sharing story:', error);
      toast.error('Failed to share story. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!profile) {
    return (
      <Card className="border-green-200 dark:border-green-800">
        <CardContent className="pt-6">
          <p className="text-center text-gray-500 dark:text-gray-400">
            Please sign in to share your eco-story
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-green-200 dark:border-green-800">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-green-800 dark:text-green-200">
          <Leaf className="w-5 h-5" />
          Share Your Eco Story
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Textarea
            placeholder="What's your green story today? Share your eco-friendly journey, tips, or achievements..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-[100px] border-green-300 focus:border-green-500"
          />
          
          <div className="flex flex-col sm:flex-row gap-4 items-start">
            <div className="flex-1">
              <Select value={selectedCommunity} onValueChange={setSelectedCommunity}>
                <SelectTrigger className="border-green-300 focus:border-green-500">
                  <SelectValue placeholder="Select a community (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">No community</SelectItem>
                  {communities.map((community) => (
                    <SelectItem key={community.id} value={community.id}>
                      {community.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <MediaUpload
              onMediaUploaded={handleMediaUpload}
              currentMedia={media}
              onRemoveMedia={handleRemoveMedia}
            />
          </div>
          
          <Button
            type="submit"
            disabled={isSubmitting || !content.trim()}
            className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white"
          >
            <Send className="w-4 h-4 mr-2" />
            {isSubmitting ? 'Sharing...' : 'Share Story'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default ShareStory;
