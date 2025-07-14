
import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Leaf, TreePine, Flower2, Sprout, Recycle, Globe, Heart } from 'lucide-react';
import { toast } from 'sonner';

const EcoConnect = () => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [ecoName, setEcoName] = useState('');
  const [fullName, setFullName] = useState('');

  const ecoGreetings = [
    "🌱 Welcome, Earth Guardian!",
    "🌍 Join the Green Revolution!",
    "🌿 Your Planet Needs You!",
    "♻️ Together for Tomorrow!",
    "🌳 Plant Seeds of Change!",
  ];

  const [currentGreeting, setCurrentGreeting] = useState(0);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setCurrentGreeting((prev) => (prev + 1) % ecoGreetings.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const redirectUrl = `${window.location.origin}/`;
      
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            eco_name: ecoName || `EcoWarrior${Math.floor(Math.random() * 1000)}`,
            full_name: fullName,
          },
        },
      });

      if (error) throw error;
      toast.success('🌱 Welcome to the Green Community! Check your email to verify your account.');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      toast.success('🌿 Welcome back, Eco Warrior!');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-green-950 dark:via-emerald-950 dark:to-teal-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-20 animate-bounce">
          <Leaf className="w-8 h-8 text-green-600" />
        </div>
        <div className="absolute top-40 right-32 animate-pulse">
          <TreePine className="w-12 h-12 text-emerald-600" />
        </div>
        <div className="absolute bottom-32 left-40 animate-bounce delay-1000">
          <Flower2 className="w-10 h-10 text-teal-600" />
        </div>
        <div className="absolute bottom-20 right-20 animate-pulse delay-500">
          <Recycle className="w-8 h-8 text-green-700" />
        </div>
        <div className="absolute top-1/2 left-10 animate-bounce delay-700">
          <Globe className="w-6 h-6 text-emerald-700" />
        </div>
      </div>

      {/* Floating particles effect */}
      <div className="absolute inset-0 opacity-20" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2334d399' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
      }}></div>
      
      <Card className="w-full max-w-lg backdrop-blur-lg bg-white/95 dark:bg-gray-900/95 border-green-200 dark:border-green-800 shadow-2xl">
        <CardHeader className="text-center relative">
          {/* Animated greeting */}
          <div className="absolute -top-16 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-2 rounded-full text-sm font-medium animate-pulse">
            {ecoGreetings[currentGreeting]}
          </div>
          
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-r from-green-500 to-emerald-500 shadow-lg">
            <div className="flex items-center gap-1">
              <Leaf className="h-6 w-6 text-white animate-pulse" />
              <Heart className="h-4 w-4 text-white animate-bounce" />
            </div>
          </div>
          
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
            EcoConnect
          </CardTitle>
          <CardDescription className="text-green-700 dark:text-green-300 text-lg">
            Where Every Action Counts for Our Planet 🌍
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8 bg-green-50 dark:bg-green-950">
              <TabsTrigger value="signin" className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-emerald-500 data-[state=active]:text-white">
                <TreePine className="h-4 w-4" />
                Reconnect
              </TabsTrigger>
              <TabsTrigger value="signup" className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-emerald-500 data-[state=active]:text-white">
                <Sprout className="h-4 w-4" />
                Join Mission
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="signin">
              <form onSubmit={handleSignIn} className="space-y-5">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-green-700 dark:text-green-300 flex items-center gap-2">
                    <Globe className="w-4 h-4" />
                    Green Email
                  </label>
                  <Input
                    type="email"
                    placeholder="your.eco@planet.earth"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="border-2 border-green-300 focus:border-green-500 rounded-xl h-12 bg-green-50/50 dark:bg-green-950/50"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-green-700 dark:text-green-300 flex items-center gap-2">
                    <Leaf className="w-4 h-4" />
                    Nature's Password
                  </label>
                  <Input
                    type="password"
                    placeholder="Your secret green code"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="border-2 border-green-300 focus:border-green-500 rounded-xl h-12 bg-green-50/50 dark:bg-green-950/50"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Connecting...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <TreePine className="w-5 h-5" />
                      Reconnect to Nature
                    </div>
                  )}
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="signup">
              <form onSubmit={handleSignUp} className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-green-700 dark:text-green-300 flex items-center gap-2">
                      <Sprout className="w-4 h-4" />
                      Eco Handle
                    </label>
                    <Input
                      type="text"
                      placeholder="GreenWarrior"
                      value={ecoName}
                      onChange={(e) => setEcoName(e.target.value)}
                      className="border-2 border-green-300 focus:border-green-500 rounded-xl h-12 bg-green-50/50 dark:bg-green-950/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-green-700 dark:text-green-300 flex items-center gap-2">
                      <Heart className="w-4 h-4" />
                      Real Name
                    </label>
                    <Input
                      type="text"
                      placeholder="Your name"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="border-2 border-green-300 focus:border-green-500 rounded-xl h-12 bg-green-50/50 dark:bg-green-950/50"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-green-700 dark:text-green-300 flex items-center gap-2">
                    <Globe className="w-4 h-4" />
                    Planet Email
                  </label>
                  <Input
                    type="email"
                    placeholder="your.mission@earth.org"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="border-2 border-green-300 focus:border-green-500 rounded-xl h-12 bg-green-50/50 dark:bg-green-950/50"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-green-700 dark:text-green-300 flex items-center gap-2">
                    <Leaf className="w-4 h-4" />
                    Secret Green Code
                  </label>
                  <Input
                    type="password"
                    placeholder="Create your mission password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="border-2 border-green-300 focus:border-green-500 rounded-xl h-12 bg-green-50/50 dark:bg-green-950/50"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Joining Mission...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Sprout className="w-5 h-5" />
                      Join the Green Mission
                    </div>
                  )}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
          
          <div className="mt-8 flex items-center justify-center gap-3 text-sm text-green-600 dark:text-green-400">
            <Flower2 className="h-4 w-4 animate-pulse" />
            <span className="font-medium">Every step counts for our planet</span>
            <Flower2 className="h-4 w-4 animate-pulse" />
          </div>

          <div className="mt-4 text-center">
            <div className="flex items-center justify-center gap-2 text-xs text-green-500 dark:text-green-400">
              <Recycle className="w-3 h-3" />
              <span>Together we can make a difference</span>
              <Globe className="w-3 h-3" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EcoConnect;
