
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ShoppingBag, Star, MapPin, Phone, Mail, Search, Leaf } from 'lucide-react';
import { toast } from 'sonner';

const Marketplace = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const { data: profile } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user');
      
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      return data;
    },
  });

  const { data: shops = [], isLoading: shopsLoading } = useQuery({
    queryKey: ['shops', searchTerm, selectedCategory],
    queryFn: async () => {
      let query = supabase
        .from('shops')
        .select('*')
        .order('rating', { ascending: false });

      if (searchTerm) {
        query = query.or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);
      }

      if (selectedCategory !== 'all') {
        query = query.eq('category', selectedCategory);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
  });

  const { data: products = [], isLoading: productsLoading } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          shops (
            name,
            location,
            rating
          )
        `)
        .order('price_in_points', { ascending: true });

      if (error) throw error;
      return data || [];
    },
  });

  const handlePurchase = async (product: any) => {
    if (!profile) {
      toast.error('Please sign in to make purchases');
      return;
    }

    if ((profile.green_points || 0) < product.price_in_points) {
      toast.error('Insufficient Green Points. Complete more challenges!');
      return;
    }

    // In a real app, you'd implement a proper checkout process
    toast.success(`Purchase initiated for ${product.name}! 🌱`);
  };

  const categories = [
    { value: 'all', label: 'All Shops' },
    { value: 'seeds', label: 'Seeds & Saplings' },
    { value: 'fertilizers', label: 'Fertilizers' },
    { value: 'soil', label: 'Soil & Compost' },
    { value: 'gardening', label: 'Gardening Tools' },
  ];

  if (shopsLoading || productsLoading) {
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
          <ShoppingBag className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
          GreenMart
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          Redeem your Green Points for eco-friendly products from trusted green shops across India
        </p>
        {profile && (
          <div className="mt-4 inline-flex items-center gap-2 bg-green-100 dark:bg-green-900 px-4 py-2 rounded-full">
            <Leaf className="w-5 h-5 text-green-600 dark:text-green-400" />
            <span className="font-semibold text-green-800 dark:text-green-200">
              Your Green Points: {profile.green_points || 0}
            </span>
          </div>
        )}
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search shops..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 border-green-300 focus:border-green-500"
          />
        </div>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-4 py-2 border border-green-300 rounded-md focus:border-green-500 focus:outline-none"
        >
          {categories.map((category) => (
            <option key={category.value} value={category.value}>
              {category.label}
            </option>
          ))}
        </select>
      </div>

      {/* Shops Grid */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-green-800 dark:text-green-200 mb-6">
          Featured Green Shops
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {shops.slice(0, 6).map((shop) => (
            <Card key={shop.id} className="border-green-200 dark:border-green-800 hover:shadow-lg transition-shadow">
              {shop.image_url && (
                <div className="h-48 bg-gray-200 dark:bg-gray-800 rounded-t-lg overflow-hidden">
                  <img 
                    src={shop.image_url} 
                    alt={shop.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-green-800 dark:text-green-200">
                      {shop.name}
                    </CardTitle>
                    <div className="flex items-center gap-1 mt-1">
                      <Star className="w-4 h-4 text-yellow-500 fill-current" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {shop.rating}
                      </span>
                    </div>
                  </div>
                  <Badge className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                    {shop.category}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <CardDescription className="text-gray-600 dark:text-gray-300">
                  {shop.description}
                </CardDescription>
                
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                    <MapPin className="w-4 h-4" />
                    {shop.location}
                  </div>
                  {shop.contact_info && typeof shop.contact_info === 'object' && shop.contact_info !== null && (
                    <>
                      {(shop.contact_info as any).phone && (
                        <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                          <Phone className="w-4 h-4" />
                          {(shop.contact_info as any).phone}
                        </div>
                      )}
                      {(shop.contact_info as any).email && (
                        <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                          <Mail className="w-4 h-4" />
                          {(shop.contact_info as any).email}
                        </div>
                      )}
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Products Grid */}
      <div>
        <h2 className="text-2xl font-bold text-green-800 dark:text-green-200 mb-6">
          Available Products
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.slice(0, 12).map((product) => (
            <Card key={product.id} className="border-green-200 dark:border-green-800">
              {product.image_url && (
                <div className="h-40 bg-gray-200 dark:bg-gray-800 rounded-t-lg overflow-hidden">
                  <img 
                    src={product.image_url} 
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-green-800 dark:text-green-200">
                  {product.name}
                </CardTitle>
                <CardDescription className="text-xs">
                  by {product.shops?.name}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-xs text-gray-600 dark:text-gray-300 line-clamp-2">
                  {product.description}
                </p>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 bg-green-100 dark:bg-green-900 px-2 py-1 rounded-full">
                    <Leaf className="w-3 h-3 text-green-600 dark:text-green-400" />
                    <span className="text-xs font-semibold text-green-700 dark:text-green-300">
                      {product.price_in_points} pts
                    </span>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {product.category}
                  </Badge>
                </div>
                
                <Button
                  onClick={() => handlePurchase(product)}
                  size="sm"
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white text-xs"
                  disabled={!profile || (profile.green_points || 0) < product.price_in_points}
                >
                  {!profile ? 'Sign In' : 
                   (profile.green_points || 0) < product.price_in_points ? 'Need More Points' : 
                   'Redeem Points'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Marketplace;
