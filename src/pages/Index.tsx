
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Leaf, 
  Users, 
  Camera, 
  BookOpen, 
  Trophy, 
  ShoppingBag,
  ArrowRight,
  Star,
  Award,
  Globe
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const Index = () => {
  const { data: stats } = useQuery({
    queryKey: ['home-stats'],
    queryFn: async () => {
      const [
        { count: communitiesCount },
        { count: storiesCount },
        { count: blogsCount },
        { count: challengesCount }
      ] = await Promise.all([
        supabase.from('communities').select('*', { count: 'exact', head: true }),
        supabase.from('stories').select('*', { count: 'exact', head: true }),
        supabase.from('blogs').select('*', { count: 'exact', head: true }),
        supabase.from('challenges').select('*', { count: 'exact', head: true })
      ]);

      return {
        communities: communitiesCount || 0,
        stories: storiesCount || 0,
        blogs: blogsCount || 0,
        challenges: challengesCount || 0
      };
    },
  });

  const features = [
    {
      icon: Users,
      title: 'Green Communities',
      description: 'Join 25+ specialized environmental communities focused on plastic management, tree plantation, and sustainable living.',
      link: '/communities',
      color: 'from-green-500 to-emerald-500'
    },
    {
      icon: Camera,
      title: 'EcoStories',
      description: 'Share your environmental journey through photos and videos. Inspire others with your green initiatives.',
      link: '/stories',
      color: 'from-emerald-500 to-teal-500'
    },
    {
      icon: BookOpen,
      title: 'GreenBlogs',
      description: 'Write and read in-depth articles about sustainability, conservation, and eco-friendly living practices.',
      link: '/blogs',
      color: 'from-teal-500 to-cyan-500'
    },
    {
      icon: Trophy,
      title: 'EcoChallenges',
      description: 'Complete daily environmental challenges, earn Green Points, and climb the eco-warrior leaderboard.',
      link: '/challenges',
      color: 'from-cyan-500 to-blue-500'
    },
    {
      icon: ShoppingBag,
      title: 'GreenMart',
      description: 'Redeem Green Points for eco-friendly products from 25+ verified green shops across India.',
      link: '/marketplace',
      color: 'from-blue-500 to-indigo-500'
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-green-950 dark:via-emerald-950 dark:to-teal-950 py-20">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=\"60\" height=\"60\" viewBox=\"0 0 60 60\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cg fill=\"none\" fill-rule=\"evenodd\"%3E%3Cg fill=\"%2334d399\" fill-opacity=\"0.1\"%3E%3Ccircle cx=\"30\" cy=\"30\" r=\"4\"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-20"></div>
        
        <div className="container mx-auto px-4 text-center relative">
          <div className="max-w-4xl mx-auto">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full mb-8">
              <Leaf className="w-10 h-10 text-white" />
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent leading-tight">
              Green Community
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
              Unite with nature lovers worldwide. Share your eco-journey, complete green challenges, 
              earn rewards, and make a lasting impact on our planet.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <Link to="/communities">
                <Button size="lg" className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-8 py-3 text-lg">
                  Join the Movement
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link to="/challenges">
                <Button size="lg" variant="outline" className="border-green-500 text-green-600 hover:bg-green-50 dark:hover:bg-green-950 px-8 py-3 text-lg">
                  Start Challenges
                </Button>
              </Link>
            </div>

            {/* Stats */}
            {stats && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-2xl mx-auto">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                    {stats.communities}+
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Communities</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                    {stats.stories}+
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">EcoStories</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-teal-600 dark:text-teal-400">
                    {stats.blogs}+
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">GreenBlogs</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-cyan-600 dark:text-cyan-400">
                    {stats.challenges}+
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Challenges</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 text-gray-900 dark:text-gray-100">
              Everything You Need for Your <span className="text-green-600">Green Journey</span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Discover, connect, learn, and grow with our comprehensive eco-platform designed for environmental enthusiasts.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className="group border-green-200 dark:border-green-800 hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
                  <CardHeader className="text-center pb-4">
                    <div className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r ${feature.color}`}>
                      <Icon className="h-8 w-8 text-white" />
                    </div>
                    <CardTitle className="text-xl text-green-800 dark:text-green-200 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                      {feature.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-center space-y-4">
                    <CardDescription className="text-gray-600 dark:text-gray-300 leading-relaxed">
                      {feature.description}
                    </CardDescription>
                    <Link to={feature.link}>
                      <Button variant="outline" className="group-hover:bg-green-50 dark:group-hover:bg-green-950 group-hover:border-green-300 transition-colors">
                        Explore
                        <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Impact Section */}
      <section className="py-20 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 text-gray-900 dark:text-gray-100">
              Your <span className="text-green-600">Green Impact</span> Matters
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Every action counts. Join thousands of eco-warriors making a difference through small daily actions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center p-6 bg-white dark:bg-gray-900 rounded-lg shadow-lg">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full mb-4">
                <Globe className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                Global Community
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Connect with environmental enthusiasts from around the world
              </p>
            </div>

            <div className="text-center p-6 bg-white dark:bg-gray-900 rounded-lg shadow-lg">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-emerald-100 dark:bg-emerald-900 rounded-full mb-4">
                <Award className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                Earn Rewards
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Complete challenges and earn Green Points to redeem eco-products
              </p>
            </div>

            <div className="text-center p-6 bg-white dark:bg-gray-900 rounded-lg shadow-lg">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-teal-100 dark:bg-teal-900 rounded-full mb-4">
                <Star className="w-6 h-6 text-teal-600 dark:text-teal-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                Make Impact
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Turn your environmental actions into measurable positive impact
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-green-600 to-emerald-600">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-4xl font-bold text-white mb-6">
              Ready to Start Your Green Journey?
            </h2>
            <p className="text-xl text-green-100 mb-8">
              Join our community of eco-warriors and start making a difference today. 
              Every small action contributes to a healthier planet.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/communities">
                <Button size="lg" className="bg-white text-green-600 hover:bg-gray-100 px-8 py-3 text-lg">
                  Join Communities
                </Button>
              </Link>
              <Link to="/challenges">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-green-600 px-8 py-3 text-lg">
                  Start Challenges
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
