
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Upload, Image, Video, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface MediaUploadProps {
  onMediaUploaded: (url: string, type: 'image' | 'video') => void;
  currentMedia?: { url: string; type: 'image' | 'video' } | null;
  onRemoveMedia?: () => void;
}

const MediaUpload: React.FC<MediaUploadProps> = ({ 
  onMediaUploaded, 
  currentMedia, 
  onRemoveMedia 
}) => {
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB');
      return;
    }

    // Check file type
    const isImage = file.type.startsWith('image/');
    const isVideo = file.type.startsWith('video/');
    
    if (!isImage && !isVideo) {
      toast.error('Please upload an image or video file');
      return;
    }

    setUploading(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `stories/${fileName}`;
      
      const { error: uploadError } = await supabase.storage
        .from('media')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('media')
        .getPublicUrl(filePath);

      onMediaUploaded(publicUrl, isImage ? 'image' : 'video');
      toast.success(`${isImage ? 'Image' : 'Video'} uploaded successfully!`);
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload media. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  if (currentMedia) {
    return (
      <div className="relative inline-block">
        {currentMedia.type === 'image' ? (
          <img 
            src={currentMedia.url} 
            alt="Uploaded media"
            className="w-32 h-32 object-cover rounded-lg"
          />
        ) : (
          <video 
            src={currentMedia.url}
            className="w-32 h-32 object-cover rounded-lg"
            controls={false}
            muted
          />
        )}
        {onRemoveMedia && (
          <Button
            onClick={onRemoveMedia}
            size="sm"
            variant="destructive"
            className="absolute -top-2 -right-2 w-6 h-6 rounded-full p-0"
          >
            <X className="w-3 h-3" />
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="flex gap-2">
      <Input
        type="file"
        accept="image/*,video/*"
        onChange={handleFileUpload}
        disabled={uploading}
        className="hidden"
        id="media-upload"
      />
      <label htmlFor="media-upload">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={uploading}
          className="cursor-pointer"
          asChild
        >
          <span className="flex items-center gap-2">
            {uploading ? (
              <>
                <Upload className="w-4 h-4 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Image className="w-4 h-4" />
                <Video className="w-4 h-4" />
                Add Media
              </>
            )}
          </span>
        </Button>
      </label>
    </div>
  );
};

export default MediaUpload;
