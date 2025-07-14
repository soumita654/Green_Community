
import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Leaf, TreePine, Flower2, Sprout } from 'lucide-react';
import { toast } from 'sonner';

const EcoConnect = () => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [ecoName, setEcoName] = useState('');
  const [fullName, setFullName] = useState('');

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            eco_name: ecoName,
            full_name: fullName,
          },
        },
      });

      if (error) throw error;
      toast.success('Welcome to the Green Community! Please check your email for verification.');
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
      toast.success('Welcome back, Eco Warrior!');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-green-950 dark:via-emerald-950 dark:to-teal-950 flex items-center justify-center p-4">
      <div className="absolute inset-0 opacity-20" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2334d399' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
      }}></div>
      
      <Card className="w-full max-w-md backdrop-blur-sm bg-white/95 dark:bg-gray-900/95 border-green-200 dark:border-green-800">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-green-500 to-emerald-500">
            <Leaf className="h-8 w-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
            EcoConnect
          </CardTitle>
          <CardDescription className="text-green-700 dark:text-green-300">
            Join the Green Revolution - Connect with Nature Lovers
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="signin" className="flex items-center gap-2">
                <TreePine className="h-4 w-4" />
                Reconnect
              </TabsTrigger>
              <TabsTrigger value="signup" className="flex items-center gap-2">
                <Sprout className="h-4 w-4" />
                Plant Roots
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="signin">
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-green-700 dark:text-green-300">
                    Nature Email
                  </label>
                  <Input
                    type="email"
                    placeholder="your@eco.email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="border-green-300 focus:border-green-500"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-green-700 dark:text-green-300">
                    Green Key
                  </label>
                  <Input
                    type="password"
                    placeholder="Your secret green key"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="border-green-300 focus:border-green-500"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                >
                  {loading ? 'Connecting...' : 'Reconnect to Nature'}
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="signup">
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-green-700 dark:text-green-300">
                    Eco Name
                  </label>
                  <Input
                    type="text"
                    placeholder="EcoWarrior123"
                    value={ecoName}
                    onChange={(e) => setEcoName(e.target.value)}
                    required
                    className="border-green-300 focus:border-green-500"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-green-700 dark:text-green-300">
                    Nature Name
                  </label>
                  <Input
                    type="text"
                    placeholder="Your full name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="border-green-300 focus:border-green-500"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-green-700 dark:text-green-300">
                    Nature Email
                  </label>
                  <Input
                    type="email"
                    placeholder="your@eco.email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="border-green-300 focus:border-green-500"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-green-700 dark:text-green-300">
                    Green Key
                  </label>
                  <Input
                    type="password"
                    placeholder="Create your green key"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="border-green-300 focus:border-green-500"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                >
                  {loading ? 'Planting Roots...' : 'Plant Your Roots'}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
          
          <div className="mt-6 flex items-center justify-center gap-2 text-sm text-green-600 dark:text-green-400">
            <Flower2 className="h-4 w-4" />
            <span>Together we grow stronger</span>
            <Flower2 className="h-4 w-4" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EcoConnect;
