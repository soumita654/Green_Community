
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import StoryCard from '@/components/stories/StoryCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Camera, Image, Video, Plus, X } from 'lucide-react';
import { toast } from 'sonner';

const Stories = () => {
  const [isCreating, setIsCreating] = useState(false);
  const [content, setContent] = useState('');
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const { data: stories = [], isLoading, refetch } = useQuery({
    queryKey: ['stories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('stories')
        .select(`
          *,
          profiles (
            eco_name,
            avatar_url
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
  });

  const handleCreateStory = async () => {
    if (!content.trim() && !mediaFile) {
      toast.error('Please add some content or media');
      return;
    }

    setIsUploading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      let mediaUrl = null;
      let mediaType = null;

      if (mediaFile) {
        const fileExt = mediaFile.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `stories/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('media')
          .upload(filePath, mediaFile);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('media')
          .getPublicUrl(filePath);

        mediaUrl = publicUrl;
        mediaType = mediaFile.type;
      }

      const { error } = await supabase
        .from('stories')
        .insert({
          content: content.trim(),
          media_url: mediaUrl,
          media_type: mediaType,
          user_id: user.id,
        });

      if (error) throw error;

      setContent('');
      setMediaFile(null);
      setMediaPreview(null);
      setIsCreating(false);
      refetch();
      toast.success('EcoStory shared! 🌱');
    } catch (error: any) {
      toast.error('Failed to create story');
      console.error(error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        toast.error('File size must be less than 10MB');
        return;
      }
      
      setMediaFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setMediaPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeMedia = () => {
    setMediaFile(null);
    setMediaPreview(null);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto space-y-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-64 bg-gray-200 dark:bg-gray-800 rounded-lg animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full mb-6">
          <Camera className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
          EcoStories
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          Share your green journey, inspire others, and celebrate environmental victories together
        </p>
      </div>

      <div className="max-w-2xl mx-auto space-y-6">
        {/* Create Story Card */}
        <Card className="border-green-200 dark:border-green-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-800 dark:text-green-200">
              <Plus className="w-5 h-5" />
              Share Your EcoStory
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {!isCreating ? (
              <Button
                onClick={() => setIsCreating(true)}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white"
              >
                What's your green story today?
              </Button>
            ) : (
              <div className="space-y-4">
                <Textarea
                  placeholder="Share your eco-friendly moment, green tip, or environmental achievement..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="border-green-300 focus:border-green-500 min-h-24"
                />
                
                {mediaPreview && (
                  <div className="relative">
                    {mediaFile?.type.startsWith('image/') ? (
                      <img 
                        src={mediaPreview} 
                        alt="Preview" 
                        className="w-full h-48 object-cover rounded-lg"
                      />
                    ) : (
                      <video 
                        src={mediaPreview} 
                        className="w-full h-48 object-cover rounded-lg"
                        controls
                      />
                    )}
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={removeMedia}
                      className="absolute top-2 right-2"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                )}
                
                <div className="flex items-center gap-2">
                  <Input
                    type="file"
                    accept="image/*,video/*"
                    onChange={handleFileChange}
                    className="hidden"
                    id="media-upload"
                  />
                  <label htmlFor="media-upload">
                    <Button type="button" variant="outline" size="sm" className="cursor-pointer">
                      <Image className="w-4 h-4 mr-2" />
                      Add Photo/Video
                    </Button>
                  </label>
                  {mediaFile && (
                    <span className="text-sm text-green-600 dark:text-green-400">
                      {mediaFile.name}
                    </span>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={handleCreateStory}
                    disabled={isUploading}
                    className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white"
                  >
                    {isUploading ? 'Sharing...' : 'Share Story'}
                  </Button>
                  <Button
                    onClick={() => {
                      setIsCreating(false);
                      setContent('');
                      setMediaFile(null);
                      setMediaPreview(null);
                    }}
                    variant="outline"
                    disabled={isUploading}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Stories Feed */}
        {stories.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📸</div>
            <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-300 mb-2">
              No stories yet
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              Be the first to share your eco-friendly story!
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {stories.map((story) => (
              <StoryCard key={story.id} story={story} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Stories;
