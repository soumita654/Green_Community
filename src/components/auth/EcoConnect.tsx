
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Leaf, TreePine, Sparkles, Mail, Lock, User, Eye, EyeOff, Globe } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const EcoConnect = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    ecoName: '',
    fullName: '',
  });

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            eco_name: formData.ecoName,
            full_name: formData.fullName,
          },
        },
      });

      if (error) throw error;

      if (data.user && !data.user.email_confirmed_at) {
        toast.success('Welcome to EcoConnect! Please check your email to verify your account. 🌱');
      } else {
        toast.success('Account created successfully! Welcome to the green community! 🌿');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to create account');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (error) throw error;
      toast.success('Welcome back, Eco Warrior! 🌱');
    } catch (error: any) {
      toast.error(error.message || 'Failed to sign in');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = async (provider: 'google' | 'github') => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: window.location.origin,
        },
      });

      if (error) throw error;
    } catch (error: any) {
      toast.error(`Failed to sign in with ${provider}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-gray-900 dark:via-green-900/20 dark:to-emerald-900/20 flex items-center justify-center p-4">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 text-green-200 dark:text-green-800 animate-bounce">
          <Leaf className="w-8 h-8 animate-pulse" />
        </div>
        <div className="absolute top-40 right-20 text-emerald-200 dark:text-emerald-800 animate-bounce delay-1000">
          <TreePine className="w-12 h-12 animate-pulse" />
        </div>
        <div className="absolute bottom-32 left-20 text-teal-200 dark:text-teal-800 animate-bounce delay-500">
          <Sparkles className="w-6 h-6 animate-pulse" />
        </div>
        <div className="absolute bottom-20 right-16 text-green-200 dark:text-green-800 animate-bounce delay-700">
          <Leaf className="w-10 h-10 animate-pulse" />
        </div>
        <div className="absolute top-1/2 left-1/4 text-emerald-100 dark:text-emerald-900 animate-ping">
          <div className="w-4 h-4 bg-current rounded-full opacity-20"></div>
        </div>
        <div className="absolute top-1/3 right-1/3 text-green-100 dark:text-green-900 animate-ping delay-300">
          <div className="w-3 h-3 bg-current rounded-full opacity-20"></div>
        </div>
      </div>

      <Card className="w-full max-w-md relative backdrop-blur-sm bg-white/90 dark:bg-gray-900/90 border-green-200 dark:border-green-800 shadow-2xl">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center animate-pulse">
            <Globe className="w-10 h-10 text-white animate-spin" />
          </div>
          <div>
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              EcoConnect
            </CardTitle>
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              Join the green revolution and make a difference! 🌱
            </p>
          </div>
        </CardHeader>

        <CardContent>
          <Tabs defaultValue="signin" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 bg-green-50 dark:bg-green-900/20">
              <TabsTrigger 
                value="signin" 
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-emerald-500 data-[state=active]:text-white"
              >
                Sign In
              </TabsTrigger>
              <TabsTrigger 
                value="signup"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-emerald-500 data-[state=active]:text-white"
              >
                Join Us
              </TabsTrigger>
            </TabsList>

            <TabsContent value="signin">
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-green-500 w-4 h-4" />
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="your.email@example.com"
                      className="pl-10 border-green-300 focus:border-green-500 focus:ring-green-500"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-green-500 w-4 h-4" />
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder="Enter your password"
                      className="pl-10 pr-10 border-green-300 focus:border-green-500 focus:ring-green-500"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-green-500"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white py-3 transition-all duration-300 transform hover:scale-105"
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Signing In...
                    </div>
                  ) : (
                    'Sign In to EcoConnect'
                  )}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Eco Name
                    </label>
                    <div className="relative">
                      <Leaf className="absolute left-3 top-1/2 transform -translate-y-1/2 text-green-500 w-4 h-4" />
                      <Input
                        value={formData.ecoName}
                        onChange={(e) => setFormData({ ...formData, ecoName: e.target.value })}
                        placeholder="GreenWarrior"
                        className="pl-10 border-green-300 focus:border-green-500 focus:ring-green-500"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Full Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-green-500 w-4 h-4" />
                      <Input
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        placeholder="Your Name"
                        className="pl-10 border-green-300 focus:border-green-500 focus:ring-green-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-green-500 w-4 h-4" />
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="your.email@example.com"
                      className="pl-10 border-green-300 focus:border-green-500 focus:ring-green-500"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-green-500 w-4 h-4" />
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder="Create a strong password"
                      className="pl-10 pr-10 border-green-300 focus:border-green-500 focus:ring-green-500"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-green-500"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white py-3 transition-all duration-300 transform hover:scale-105"
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Creating Account...
                    </div>
                  ) : (
                    '🌱 Join the Green Movement'
                  )}
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          <div className="mt-6">
            <div className="relative flex items-center justify-center">
              <span className="px-4 text-sm text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-900">
                or continue with
              </span>
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-green-200 dark:border-green-800"></div>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleSocialLogin('google')}
                className="border-green-300 text-green-700 hover:bg-green-50 dark:border-green-700 dark:text-green-300 dark:hover:bg-green-900/20"
              >
                <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Google
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => handleSocialLogin('github')}
                className="border-green-300 text-green-700 hover:bg-green-50 dark:border-green-700 dark:text-green-300 dark:hover:bg-green-900/20"
              >
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
                GitHub
              </Button>
            </div>
          </div>

          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              By joining EcoConnect, you agree to help make our planet greener! 🌍
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EcoConnect;
