
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Trophy, Star, Award, Leaf, Calendar, Target, Users } from 'lucide-react';
import { toast } from 'sonner';

const Challenges = () => {
  const [selectedChallenge, setSelectedChallenge] = useState<any>(null);
  const [proofImage, setProofImage] = useState<File | null>(null);
  const [notes, setNotes] = useState('');
  const queryClient = useQueryClient();

  const { data: challenges = [], isLoading } = useQuery({
    queryKey: ['challenges'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('challenges')
        .select('*')
        .order('points', { ascending: false });

      if (error) throw error;
      return data || [];
    },
  });

  const { data: completions = [] } = useQuery({
    queryKey: ['challenge-completions'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('challenge_completions')
        .select('challenge_id')
        .eq('user_id', user.id);

      if (error) throw error;
      return data?.map(c => c.challenge_id) || [];
    },
  });

  const { data: leaderboard = [] } = useQuery({
    queryKey: ['leaderboard'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('eco_name, green_points, avatar_url')
        .order('green_points', { ascending: false })
        .limit(10);

      if (error) throw error;
      return data || [];
    },
  });

  const completeMutation = useMutation({
    mutationFn: async ({ challengeId, proofUrl }: { challengeId: string; proofUrl?: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('challenge_completions')
        .insert({
          challenge_id: challengeId,
          user_id: user.id,
          proof_image_url: proofUrl,
          notes,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['challenge-completions'] });
      queryClient.invalidateQueries({ queryKey: ['leaderboard'] });
      setSelectedChallenge(null);
      setProofImage(null);
      setNotes('');
      toast.success('Challenge completed! Green points awarded! 🌱');
    },
    onError: (error) => {
      toast.error('Failed to complete challenge');
      console.error(error);
    },
  });

  const handleCompleteChallenge = async () => {
    if (!selectedChallenge) return;

    let proofUrl = null;
    
    if (proofImage) {
      try {
        const fileExt = proofImage.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `challenge-proofs/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('media')
          .upload(filePath, proofImage);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('media')
          .getPublicUrl(filePath);

        proofUrl = publicUrl;
      } catch (error) {
        toast.error('Failed to upload proof image');
        return;
      }
    }

    completeMutation.mutate({ 
      challengeId: selectedChallenge.id, 
      proofUrl 
    });
  };

  const getDifficultyColor = (difficulty: string) => {
    const colors = {
      beginner: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
      intermediate: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
      advanced: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
    };
    return colors[difficulty as keyof typeof colors] || colors.beginner;
  };

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, any> = {
      tree_plantation: '🌳',
      plastic_management: '♻️',
      waste_reduction: '🗑️',
      renewable_energy: '⚡',
      water_conservation: '💧',
      organic_farming: '🌱',
      climate_action: '🌍',
      wildlife_conservation: '🦋',
      sustainable_living: '🏡',
      green_transport: '🚲',
    };
    return icons[category] || '🌿';
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
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
          <Trophy className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
          EcoChallenges
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          Take on environmental challenges, earn Green Points, and make a positive impact on our planet
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Challenges List */}
        <div className="lg:col-span-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {challenges.map((challenge) => {
              const isCompleted = completions.includes(challenge.id);
              return (
                <Card 
                  key={challenge.id} 
                  className={`border-green-200 dark:border-green-800 transition-all duration-300 ${
                    isCompleted 
                      ? 'bg-green-50 dark:bg-green-950 border-green-300 dark:border-green-700' 
                      : 'hover:shadow-lg hover:border-green-300'
                  }`}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">
                            {getCategoryIcon(challenge.category)}
                          </span>
                          <Badge className={getDifficultyColor(challenge.difficulty)}>
                            {challenge.difficulty}
                          </Badge>
                        </div>
                        <CardTitle className="text-green-800 dark:text-green-200">
                          {challenge.title}
                        </CardTitle>
                      </div>
                      <div className="flex items-center gap-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                        <Star className="w-4 h-4" />
                        {challenge.points}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <CardDescription className="text-gray-600 dark:text-gray-300">
                      {challenge.description}
                    </CardDescription>
                    
                    {isCompleted ? (
                      <div className="flex items-center gap-2 text-green-600 dark:text-green-400 font-semibold">
                        <Award className="w-5 h-5" />
                        Challenge Completed!
                      </div>
                    ) : (
                      <Button
                        onClick={() => setSelectedChallenge(challenge)}
                        className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white"
                      >
                        Accept Challenge
                      </Button>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Leaderboard Sidebar */}
        <div className="space-y-6">
          <Card className="border-green-200 dark:border-green-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-800 dark:text-green-200">
                <Trophy className="w-5 h-5" />
                Eco Leaderboard
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {leaderboard.map((user, index) => (
                <div key={user.eco_name} className="flex items-center gap-3 p-2 rounded-lg bg-green-50 dark:bg-green-950">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    index === 0 ? 'bg-yellow-500 text-white' :
                    index === 1 ? 'bg-gray-400 text-white' :
                    index === 2 ? 'bg-orange-500 text-white' :
                    'bg-green-500 text-white'
                  }`}>
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-sm text-green-800 dark:text-green-200">
                      {user.eco_name}
                    </p>
                    <p className="text-xs text-green-600 dark:text-green-400">
                      {user.green_points || 0} points
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Challenge Completion Modal */}
      {selectedChallenge && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-green-800 dark:text-green-200">
                Complete Challenge
              </CardTitle>
              <CardDescription>
                {selectedChallenge.title}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-green-700 dark:text-green-300 mb-2 block">
                  Upload Proof (Optional)
                </label>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setProofImage(e.target.files?.[0] || null)}
                  className="border-green-300 focus:border-green-500"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium text-green-700 dark:text-green-300 mb-2 block">
                  Notes (Optional)
                </label>
                <Textarea
                  placeholder="Share details about how you completed this challenge..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="border-green-300 focus:border-green-500"
                />
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handleCompleteChallenge}
                  disabled={completeMutation.isPending}
                  className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white"
                >
                  {completeMutation.isPending ? 'Completing...' : 'Complete Challenge'}
                </Button>
                <Button
                  onClick={() => setSelectedChallenge(null)}
                  variant="outline"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Challenges;
