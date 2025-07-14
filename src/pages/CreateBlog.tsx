
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { PenTool, Plus, X, Image as ImageIcon } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

const CreateBlog = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [coverImagePreview, setCoverImagePreview] = useState<string | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim().toLowerCase()]);
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleCoverImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error('Image size must be less than 5MB');
        return;
      }
      
      setCoverImage(file);
      
      const reader = new FileReader();
      reader.onload = (e) => {
        setCoverImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const calculateReadTime = (text: string) => {
    const wordsPerMinute = 200;
    const wordCount = text.split(' ').length;
    return Math.ceil(wordCount / wordsPerMinute);
  };

  const handlePublish = async (published: boolean = true) => {
    if (!title.trim() || !content.trim()) {
      toast.error('Please fill in title and content');
      return;
    }

    setIsPublishing(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      let coverImageUrl = null;

      if (coverImage) {
        const fileExt = coverImage.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `blog-covers/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('media')
          .upload(filePath, coverImage);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('media')
          .getPublicUrl(filePath);

        coverImageUrl = publicUrl;
      }

      const blogData = {
        title: title.trim(),
        excerpt: excerpt.trim() || content.substring(0, 200) + '...',
        content: content.trim(),
        tags: tags.length > 0 ? tags : null,
        cover_image_url: coverImageUrl,
        user_id: user.id,
        published,
        published_at: published ? new Date().toISOString() : null,
        read_time: calculateReadTime(content),
      };

      const { error } = await supabase
        .from('blogs')
        .insert(blogData);

      if (error) throw error;

      toast.success(published ? 'Blog published successfully! 📝' : 'Blog saved as draft! 💾');
      navigate('/blogs');
    } catch (error: any) {
      toast.error('Failed to save blog');
      console.error(error);
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full mb-6">
            <PenTool className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold mb-4 bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
            Write Your Green Blog
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Share your environmental insights and inspire others
          </p>
        </div>

        <Card className="border-green-200 dark:border-green-800">
          <CardHeader>
            <CardTitle className="text-green-800 dark:text-green-200">
              Create New Blog Post
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Title */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-green-700 dark:text-green-300">
                Title *
              </label>
              <Input
                placeholder="Enter your blog title..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="border-green-300 focus:border-green-500 text-lg"
              />
            </div>

            {/* Excerpt */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-green-700 dark:text-green-300">
                Excerpt (Optional)
              </label>
              <Textarea
                placeholder="Brief description of your blog post..."
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                className="border-green-300 focus:border-green-500 min-h-20"
              />
            </div>

            {/* Cover Image */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-green-700 dark:text-green-300">
                Cover Image (Optional)
              </label>
              {coverImagePreview ? (
                <div className="relative">
                  <img 
                    src={coverImagePreview} 
                    alt="Cover preview" 
                    className="w-full h-48 object-cover rounded-lg"
                  />
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => {
                      setCoverImage(null);
                      setCoverImagePreview(null);
                    }}
                    className="absolute top-2 right-2"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <div>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleCoverImageChange}
                    className="hidden"
                    id="cover-image-upload"
                  />
                  <label htmlFor="cover-image-upload">
                    <Button type="button" variant="outline" className="cursor-pointer">
                      <ImageIcon className="w-4 h-4 mr-2" />
                      Add Cover Image
                    </Button>
                  </label>
                </div>
              )}
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-green-700 dark:text-green-300">
                Tags
              </label>
              <div className="flex gap-2 mb-2">
                <Input
                  placeholder="Add a tag..."
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                  className="border-green-300 focus:border-green-500"
                />
                <Button
                  type="button"
                  onClick={handleAddTag}
                  variant="outline"
                  size="sm"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                    {tag}
                    <X 
                      className="w-3 h-3 cursor-pointer" 
                      onClick={() => removeTag(tag)}
                    />
                  </Badge>
                ))}
              </div>
            </div>

            {/* Content */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-green-700 dark:text-green-300">
                Content *
              </label>
              <Textarea
                placeholder="Write your blog content here... Share your environmental insights, tips, or experiences!"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="border-green-300 focus:border-green-500 min-h-80"
              />
              <p className="text-sm text-gray-500">
                Estimated read time: {calculateReadTime(content)} minute{calculateReadTime(content) !== 1 ? 's' : ''}
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Button
                onClick={() => handlePublish(true)}
                disabled={isPublishing}
                className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
              >
                {isPublishing ? 'Publishing...' : 'Publish Blog'}
              </Button>
              <Button
                onClick={() => handlePublish(false)}
                disabled={isPublishing}
                variant="outline"
              >
                Save as Draft
              </Button>
              <Button
                onClick={() => navigate('/blogs')}
                variant="ghost"
                disabled={isPublishing}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CreateBlog;
