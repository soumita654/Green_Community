
import React from 'react';
import { Button } from '@/components/ui/button';
import { Share, Copy, Twitter, Facebook, Link2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';

interface ShareStoryProps {
  storyId: string;
  content: string;
}

const ShareStory = ({ storyId, content }: ShareStoryProps) => {
  const storyUrl = `${window.location.origin}/stories/${storyId}`;
  const shareText = content.length > 100 ? content.substring(0, 100) + '...' : content;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(storyUrl);
      toast.success('Link copied to clipboard! 📋');
    } catch (error) {
      toast.error('Failed to copy link');
    }
  };

  const handleTwitterShare = () => {
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(storyUrl)}`;
    window.open(twitterUrl, '_blank', 'width=550,height=420');
  };

  const handleFacebookShare = () => {
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(storyUrl)}`;
    window.open(facebookUrl, '_blank', 'width=550,height=420');
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'EcoStories',
          text: shareText,
          url: storyUrl,
        });
      } catch (error) {
        console.log('Share cancelled');
      }
    } else {
      handleCopyLink();
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="flex items-center gap-2 text-gray-500 hover:text-blue-600"
        >
          <Share className="w-4 h-4" />
          Share
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={handleNativeShare} className="flex items-center gap-2">
          <Share className="w-4 h-4" />
          Share Story
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleCopyLink} className="flex items-center gap-2">
          <Copy className="w-4 h-4" />
          Copy Link
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleTwitterShare} className="flex items-center gap-2">
          <Twitter className="w-4 h-4" />
          Share on X
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleFacebookShare} className="flex items-center gap-2">
          <Facebook className="w-4 h-4" />
          Share on Facebook
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ShareStory;
