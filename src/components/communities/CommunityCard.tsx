
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, Calendar, Leaf } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

interface Community {
  id: string;
  name: string;
  description: string;
  category: string;
  member_count: number;
  cover_image_url?: string;
  icon_url?: string;
  created_at: string;
}

interface CommunityCardProps {
  community: Community;
}

const CommunityCard = ({ community }: CommunityCardProps) => {
  const queryClient = useQueryClient();

  const { data: membership } = useQuery({
    queryKey: ['membership', community.id],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      
      const { data } = await supabase
        .from('community_memberships')
        .select('*')
        .eq('community_id', community.id)
        .eq('user_id', user.id)
        .maybeSingle();
      
      return data;
    },
  });

  const joinMutation = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('community_memberships')
        .insert({
          community_id: community.id,
          user_id: user.id,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['membership', community.id] });
      toast.success(`Joined ${community.name}! 🌱`);
    },
    onError: (error) => {
      toast.error('Failed to join community');
      console.error(error);
    },
  });

  const leaveMutation = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('community_memberships')
        .delete()
        .eq('community_id', community.id)
        .eq('user_id', user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['membership', community.id] });
      toast.success(`Left ${community.name}`);
    },
    onError: (error) => {
      toast.error('Failed to leave community');
      console.error(error);
    },
  });

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      plastic_management: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
      tree_plantation: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
      natural_awareness: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300',
      waste_reduction: 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300',
      renewable_energy: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
      water_conservation: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900 dark:text-cyan-300',
      wildlife_conservation: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
    };
    return colors[category] || 'bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300';
  };

  const formatCategoryName = (category: string) => {
    return category.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 border-green-200 dark:border-green-800 overflow-hidden">
      {community.cover_image_url && (
        <div className="h-32 bg-gradient-to-r from-green-400 to-emerald-400 relative overflow-hidden">
          <img 
            src={community.cover_image_url} 
            alt={community.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute inset-0 bg-black/20"></div>
        </div>
      )}
      
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg text-green-800 dark:text-green-200 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
              {community.name}
            </CardTitle>
            <Badge className={getCategoryColor(community.category)}>
              {formatCategoryName(community.category)}
            </Badge>
          </div>
          {community.icon_url ? (
            <img src={community.icon_url} alt="" className="w-8 h-8 rounded-full" />
          ) : (
            <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
              <Leaf className="w-4 h-4 text-green-600 dark:text-green-400" />
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <CardDescription className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
          {community.description}
        </CardDescription>
        
        <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            <span>{community.member_count || 0} members</span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            <span>{new Date(community.created_at).toLocaleDateString()}</span>
          </div>
        </div>
        
        <Button
          onClick={() => membership ? leaveMutation.mutate() : joinMutation.mutate()}
          disabled={joinMutation.isPending || leaveMutation.isPending}
          className={`w-full ${
            membership 
              ? 'bg-red-500 hover:bg-red-600 text-white' 
              : 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white'
          }`}
        >
          {membership ? 'Leave Community' : 'Join Community'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default CommunityCard;
