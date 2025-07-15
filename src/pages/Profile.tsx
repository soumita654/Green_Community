import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  User, 
  Mail, 
  MapPin, 
  Calendar, 
  Leaf, 
  Trophy, 
  Users, 
  Camera, 
  BookOpen,
  Edit3,
  Save,
  X,
  Award,
  Target,
  Heart,
  TrendingUp
} from 'lucide-react';
import { toast } from 'sonner';

const Profile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState({
    eco_name: '',
    bio: '',
    location: ''
  });

  const queryClient = useQueryClient();

  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user');
      
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      return { ...data, email: user.email };
    },
  });

  const { data: userStats } = useQuery({
    queryKey: ['user-stats'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user');
      
      // Get user's story count
      const { data: stories } = await supabase
        .from('stories')
        .select('id')
        .eq('user_id', user.id);
      
      // Get user's blog count
      const { data: blogs } = await supabase
        .from('blogs')
        .select('id')
        .eq('user_id', user.id);
      
      // Get user's community memberships (using correct table name)
      const { data: memberships } = await supabase
        .from('community_memberships')
        .select('id')
        .eq('user_id', user.id);
      
      // Mock challenge participations since table doesn't exist yet
      const challenges = 0;
      
      return {
        stories: stories?.length || 0,
        blogs: blogs?.length || 0,
        communities: memberships?.length || 0,
        challenges: challenges
      };
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (updatedData: any) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user');
      
      const { data, error } = await supabase
        .from('profiles')
        .update(updatedData)
        .eq('user_id', user.id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      setIsEditing(false);
      toast.success('Profile updated successfully! 🌱');
    },
    onError: (error) => {
      toast.error('Failed to update profile. Please try again.');
      console.error('Profile update error:', error);
    }
  });

  const handleEditToggle = () => {
    if (isEditing) {
      setIsEditing(false);
      setEditedProfile({
        eco_name: profile?.eco_name || '',
        bio: profile?.bio || '',
        location: profile?.location || ''
      });
    } else {
      setIsEditing(true);
      setEditedProfile({
        eco_name: profile?.eco_name || '',
        bio: profile?.bio || '',
        location: profile?.location || ''
      });
    }
  };

  const handleSave = () => {
    updateProfileMutation.mutate(editedProfile);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const achievements = [
    { name: 'Eco Warrior', description: 'Completed 5+ challenges', icon: Trophy, earned: (userStats?.challenges || 0) >= 5 },
    { name: 'Storyteller', description: 'Shared 3+ eco stories', icon: Camera, earned: (userStats?.stories || 0) >= 3 },
    { name: 'Community Leader', description: 'Joined 2+ communities', icon: Users, earned: (userStats?.communities || 0) >= 2 },
    { name: 'Green Blogger', description: 'Published 2+ blogs', icon: BookOpen, earned: (userStats?.blogs || 0) >= 2 },
    { name: 'Point Collector', description: 'Earned 500+ green points', icon: Leaf, earned: (profile?.green_points || 0) >= 500 },
    { name: 'Sustainability Advocate', description: 'Active for 30+ days', icon: Award, earned: true }, // This would need proper date calculation
  ];

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="h-64 bg-gray-200 dark:bg-gray-800 rounded-lg animate-pulse"></div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200">Profile not found</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Please try refreshing the page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Profile Header */}
        <Card className="border-green-200 dark:border-green-800">
          <CardHeader className="relative">
            <div className="absolute top-4 right-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleEditToggle}
                className="text-green-600 hover:text-green-700 hover:bg-green-100 dark:text-green-400 dark:hover:text-green-300 dark:hover:bg-green-900"
              >
                {isEditing ? <X className="h-4 w-4" /> : <Edit3 className="h-4 w-4" />}
              </Button>
            </div>
            
            <div className="flex items-start gap-6">
              <Avatar className="h-24 w-24">
                <AvatarImage src={profile.avatar_url} />
                <AvatarFallback className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 text-2xl">
                  {profile.eco_name?.charAt(0) || 'E'}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 space-y-4">
                {isEditing ? (
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="eco_name">Eco Name</Label>
                      <Input
                        id="eco_name"
                        value={editedProfile.eco_name}
                        onChange={(e) => setEditedProfile({...editedProfile, eco_name: e.target.value})}
                        className="border-green-300 focus:border-green-500"
                      />
                    </div>
                    <div>
                      <Label htmlFor="bio">Bio</Label>
                      <Textarea
                        id="bio"
                        value={editedProfile.bio}
                        onChange={(e) => setEditedProfile({...editedProfile, bio: e.target.value})}
                        className="border-green-300 focus:border-green-500"
                        placeholder="Tell us about your eco journey..."
                      />
                    </div>
                    <div>
                      <Label htmlFor="location">Location</Label>
                      <Input
                        id="location"
                        value={editedProfile.location}
                        onChange={(e) => setEditedProfile({...editedProfile, location: e.target.value})}
                        className="border-green-300 focus:border-green-500"
                        placeholder="City, Country"
                      />
                    </div>
                    <Button 
                      onClick={handleSave}
                      className="bg-green-600 hover:bg-green-700 text-white"
                      disabled={updateProfileMutation.isPending}
                    >
                      <Save className="h-4 w-4 mr-2" />
                      {updateProfileMutation.isPending ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div>
                      <h1 className="text-2xl font-bold text-green-800 dark:text-green-200">
                        {profile.eco_name || 'Eco Warrior'}
                      </h1>
                      <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mt-1">
                        <div className="flex items-center gap-1">
                          <Mail className="h-4 w-4" />
                          {profile.email}
                        </div>
                        {profile.location && (
                          <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {profile.location}
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          Joined {formatDate(profile.created_at)}
                        </div>
                      </div>
                    </div>
                    
                    {profile.bio && (
                      <p className="text-gray-700 dark:text-gray-300">{profile.bio}</p>
                    )}
                    
                    <div className="flex items-center gap-2 bg-green-100 dark:bg-green-900 px-3 py-2 rounded-full w-fit">
                      <Leaf className="h-5 w-5 text-green-600 dark:text-green-400" />
                      <span className="font-semibold text-green-700 dark:text-green-300">
                        {profile.green_points || 0} Green Points
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-green-200 dark:border-green-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-green-700 dark:text-green-300 flex items-center gap-2">
                <Camera className="h-4 w-4" />
                Eco Stories
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-800 dark:text-green-200">
                {userStats?.stories || 0}
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400">Stories shared</p>
            </CardContent>
          </Card>

          <Card className="border-green-200 dark:border-green-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-green-700 dark:text-green-300 flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                Green Blogs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-800 dark:text-green-200">
                {userStats?.blogs || 0}
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400">Blogs published</p>
            </CardContent>
          </Card>

          <Card className="border-green-200 dark:border-green-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-green-700 dark:text-green-300 flex items-center gap-2">
                <Users className="h-4 w-4" />
                Communities
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-800 dark:text-green-200">
                {userStats?.communities || 0}
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400">Communities joined</p>
            </CardContent>
          </Card>

          <Card className="border-green-200 dark:border-green-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-green-700 dark:text-green-300 flex items-center gap-2">
                <Trophy className="h-4 w-4" />
                Challenges
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-800 dark:text-green-200">
                {userStats?.challenges || 0}
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400">Challenges completed</p>
            </CardContent>
          </Card>
        </div>

        {/* Achievements */}
        <Card className="border-green-200 dark:border-green-800">
          <CardHeader>
            <CardTitle className="text-green-800 dark:text-green-200 flex items-center gap-2">
              <Award className="h-5 w-5" />
              Achievements
            </CardTitle>
            <CardDescription>
              Your eco-friendly milestones and accomplishments
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {achievements.map((achievement, index) => {
                const Icon = achievement.icon;
                return (
                  <div 
                    key={index}
                    className={`p-4 rounded-lg border-2 ${
                      achievement.earned
                        ? 'border-green-300 bg-green-50 dark:border-green-700 dark:bg-green-900/20'
                        : 'border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/20'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-full ${
                        achievement.earned
                          ? 'bg-green-100 text-green-600 dark:bg-green-800 dark:text-green-400'
                          : 'bg-gray-100 text-gray-400 dark:bg-gray-700 dark:text-gray-500'
                      }`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div>
                        <h3 className={`font-semibold ${
                          achievement.earned
                            ? 'text-green-800 dark:text-green-200'
                            : 'text-gray-600 dark:text-gray-400'
                        }`}>
                          {achievement.name}
                        </h3>
                        <p className={`text-sm ${
                          achievement.earned
                            ? 'text-green-600 dark:text-green-400'
                            : 'text-gray-500 dark:text-gray-500'
                        }`}>
                          {achievement.description}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Activity Summary */}
        <Card className="border-green-200 dark:border-green-800">
          <CardHeader>
            <CardTitle className="text-green-800 dark:text-green-200 flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Activity Summary
            </CardTitle>
            <CardDescription>
              Your impact on the Green Community
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 dark:bg-green-800 rounded-full">
                    <Target className="h-4 w-4 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="font-semibold text-green-800 dark:text-green-200">Environmental Impact</p>
                    <p className="text-sm text-green-600 dark:text-green-400">
                      {(userStats?.stories || 0) + (userStats?.blogs || 0) + (userStats?.challenges || 0) > 0 
                        ? "Making a difference, one action at a time" 
                        : "Ready to start your eco journey"}
                    </p>
                  </div>
                </div>
                <Badge className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                  {(userStats?.stories || 0) + (userStats?.blogs || 0) + (userStats?.challenges || 0) > 0 ? 'Active' : 'Getting Started'}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-800 rounded-full">
                    <Heart className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="font-semibold text-blue-800 dark:text-blue-200">Community Engagement</p>
                    <p className="text-sm text-blue-600 dark:text-blue-400">
                      {(userStats?.communities || 0) > 0 
                        ? "Inspiring others through your actions"
                        : "Join communities to connect with like-minded people"}
                    </p>
                  </div>
                </div>
                <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                  {(userStats?.communities || 0) > 0 ? 'Growing' : 'New'}
                </Badge>
              </div>
              
              {/* Quick Actions */}
              <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-lg">
                <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-3">Quick Actions</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <Link to="/stories">
                    <Button variant="outline" size="sm" className="flex items-center gap-2 border-green-300 hover:border-green-500 w-full">
                      <Camera className="h-4 w-4" />
                      Share Story
                    </Button>
                  </Link>
                  <Link to="/create-blog">
                    <Button variant="outline" size="sm" className="flex items-center gap-2 border-blue-300 hover:border-blue-500 w-full">
                      <BookOpen className="h-4 w-4" />
                      Write Blog
                    </Button>
                  </Link>
                  <Link to="/communities">
                    <Button variant="outline" size="sm" className="flex items-center gap-2 border-purple-300 hover:border-purple-500 w-full">
                      <Users className="h-4 w-4" />
                      Join Community
                    </Button>
                  </Link>
                  <Link to="/challenges">
                    <Button variant="outline" size="sm" className="flex items-center gap-2 border-orange-300 hover:border-orange-500 w-full">
                      <Trophy className="h-4 w-4" />
                      Take Challenge
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Profile;
