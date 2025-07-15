
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { PenTool, Save, Eye, Upload, X, Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

const CreateBlog = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [currentTag, setCurrentTag] = useState('');
  const [coverImage, setCoverImage] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDraft, setIsDraft] = useState(true);
  
  const queryClient = useQueryClient();
  const navigate = useNavigate();

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

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    setIsUploading(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('blog-covers')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('blog-covers')
        .getPublicUrl(fileName);

      setCoverImage(publicUrl);
      toast.success('Cover image uploaded successfully!');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload image. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleAddTag = () => {
    if (currentTag.trim() && !tags.includes(currentTag.trim()) && tags.length < 5) {
      setTags([...tags, currentTag.trim()]);
      setCurrentTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const calculateReadTime = (text: string) => {
    const wordsPerMinute = 200;
    const words = text.split(/\s+/).length;
    return Math.max(1, Math.ceil(words / wordsPerMinute));
  };

  const handleSubmit = async (publish: boolean = false) => {
    if (!profile) {
      toast.error('Please sign in to create a blog');
      return;
    }

    if (!title.trim() || !content.trim()) {
      toast.error('Please fill in title and content');
      return;
    }

    setIsSubmitting(true);

    try {
      const blogData = {
        title: title.trim(),
        content: content.trim(),
        excerpt: excerpt.trim() || content.trim().substring(0, 200) + '...',
        tags: tags.length > 0 ? tags : null,
        cover_image_url: coverImage || null,
        read_time: calculateReadTime(content),
        published: publish,
        published_at: publish ? new Date().toISOString() : null,
        user_id: profile.user_id,
      };

      const { error } = await supabase
        .from('blogs')
        .insert(blogData);

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ['blogs'] });
      
      toast.success(publish ? 'Blog published successfully! 🌱' : 'Draft saved successfully!');
      navigate('/blogs');
    } catch (error) {
      console.error('Error saving blog:', error);
      toast.error('Failed to save blog. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!profile) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-2xl mx-auto">
          <CardContent className="pt-6">
            <p className="text-center text-gray-500 dark:text-gray-400">
              Please sign in to create a blog post
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full mb-4">
            <PenTool className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
            Create New Blog
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Share your eco-friendly knowledge and inspire others
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Editor */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-green-200 dark:border-green-800">
              <CardHeader>
                <CardTitle className="text-green-800 dark:text-green-200">
                  Blog Content
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Title *
                  </label>
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter your blog title"
                    className="border-green-300 focus:border-green-500"
                    maxLength={100}
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Excerpt (Optional)
                  </label>
                  <Textarea
                    value={excerpt}
                    onChange={(e) => setExcerpt(e.target.value)}
                    placeholder="Brief description of your blog (will be auto-generated if left empty)"
                    className="min-h-[80px] border-green-300 focus:border-green-500"
                    maxLength={300}
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Content *
                  </label>
                  <Textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Write your blog content here..."
                    className="min-h-[400px] border-green-300 focus:border-green-500"
                  />
                  {content && (
                    <p className="text-xs text-gray-500 mt-1">
                      ~{calculateReadTime(content)} min read • {content.split(/\s+/).length} words
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Cover Image */}
            <Card className="border-green-200 dark:border-green-800">
              <CardHeader>
                <CardTitle className="text-green-800 dark:text-green-200 text-lg">
                  Cover Image
                </CardTitle>
              </CardHeader>
              <CardContent>
                {coverImage ? (
                  <div className="relative">
                    <img 
                      src={coverImage} 
                      alt="Cover"
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <Button
                      onClick={() => setCoverImage('')}
                      size="sm"
                      variant="destructive"
                      className="absolute top-2 right-2 w-6 h-6 rounded-full p-0"
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                ) : (
                  <div>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={isUploading}
                      className="hidden"
                      id="cover-upload"
                    />
                    <label htmlFor="cover-upload">
                      <Button
                        type="button"
                        variant="outline"
                        disabled={isUploading}
                        className="w-full cursor-pointer border-green-300 text-green-700 hover:bg-green-50 dark:border-green-700 dark:text-green-300"
                        asChild
                      >
                        <span className="flex items-center gap-2">
                          <Upload className="w-4 h-4" />
                          {isUploading ? 'Uploading...' : 'Upload Cover'}
                        </span>
                      </Button>
                    </label>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Tags */}
            <Card className="border-green-200 dark:border-green-800">
              <CardHeader>
                <CardTitle className="text-green-800 dark:text-green-200 text-lg">
                  Tags
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex gap-2">
                  <Input
                    value={currentTag}
                    onChange={(e) => setCurrentTag(e.target.value)}
                    placeholder="Add a tag"
                    className="border-green-300 focus:border-green-500"
                    maxLength={20}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                  />
                  <Button
                    onClick={handleAddTag}
                    size="sm"
                    disabled={!currentTag.trim() || tags.length >= 5}
                    className="bg-green-500 hover:bg-green-600 text-white"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag, index) => (
                      <Badge
                        key={index}
                        variant="outline"
                        className="border-green-300 text-green-700 dark:border-green-700 dark:text-green-300"
                      >
                        {tag}
                        <button
                          onClick={() => handleRemoveTag(tag)}
                          className="ml-2 text-red-500 hover:text-red-700"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
                
                <p className="text-xs text-gray-500">
                  {tags.length}/5 tags added
                </p>
              </CardContent>
            </Card>

            {/* Actions */}
            <Card className="border-green-200 dark:border-green-800">
              <CardContent className="pt-6 space-y-3">
                <Button
                  onClick={() => handleSubmit(false)}
                  disabled={isSubmitting || !title.trim() || !content.trim()}
                  variant="outline"
                  className="w-full border-green-300 text-green-700 hover:bg-green-50 dark:border-green-700 dark:text-green-300"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {isSubmitting ? 'Saving...' : 'Save Draft'}
                </Button>
                
                <Button
                  onClick={() => handleSubmit(true)}
                  disabled={isSubmitting || !title.trim() || !content.trim()}
                  size="lg"
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  {isSubmitting ? 'Publishing...' : 'Publish Blog'}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateBlog;
