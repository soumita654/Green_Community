
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ShoppingBag, Star, MapPin, Phone, Mail, Search, Leaf } from 'lucide-react';
import { toast } from 'sonner';
import ShoppingCartComponent from '@/components/marketplace/ShoppingCart';
import Checkout from '@/components/marketplace/Checkout';
import AddToCart from '@/components/marketplace/AddToCart';

const Marketplace = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

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
      try {
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
        if (error) {
          console.warn('Database error, using mock data:', error);
          // Return filtered mock data
          let filteredShops = mockShops;
          if (searchTerm) {
            filteredShops = filteredShops.filter(shop => 
              shop.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
              shop.description.toLowerCase().includes(searchTerm.toLowerCase())
            );
          }
          if (selectedCategory !== 'all') {
            filteredShops = filteredShops.filter(shop => shop.category === selectedCategory);
          }
          return filteredShops;
        }
        
        // Combine database data with mock data
        const combinedData = [...(data || []), ...mockShops];
        let filteredData = combinedData;
        
        if (searchTerm) {
          filteredData = filteredData.filter(shop => 
            shop.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            shop.description.toLowerCase().includes(searchTerm.toLowerCase())
          );
        }
        if (selectedCategory !== 'all') {
          filteredData = filteredData.filter(shop => shop.category === selectedCategory);
        }
        
        return filteredData;
      } catch (error) {
        console.warn('Database connection error, using mock data:', error);
        // Return filtered mock data
        let filteredShops = mockShops;
        if (searchTerm) {
          filteredShops = filteredShops.filter(shop => 
            shop.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            shop.description.toLowerCase().includes(searchTerm.toLowerCase())
          );
        }
        if (selectedCategory !== 'all') {
          filteredShops = filteredShops.filter(shop => shop.category === selectedCategory);
        }
        return filteredShops;
      }
    },
  });

  const { data: products = [], isLoading: productsLoading } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      try {
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

        if (error) {
          console.warn('Database error, using mock data:', error);
          return mockProducts;
        }
        
        // Combine database data with mock data
        return [...(data || []), ...mockProducts];
      } catch (error) {
        console.warn('Database connection error, using mock data:', error);
        return mockProducts;
      }
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

    // Quick purchase functionality - can be enhanced later
    toast.success(`${product.name} added to cart! 🌱`);
  };

  const handleCheckout = () => {
    setIsCheckoutOpen(true);
  };

  const categories = [
    { value: 'all', label: 'All Shops' },
    { value: 'seeds', label: 'Seeds & Saplings' },
    { value: 'fertilizers', label: 'Fertilizers' },
    { value: 'soil', label: 'Soil & Compost' },
    { value: 'gardening', label: 'Gardening Tools' },
  ];

  // Mock data for new Indian shops with tree-related products
  const mockShops = [
    {
      id: 'shop1',
      name: 'Tree Nursery Kolkata',
      description: 'Specializes in native Indian tree saplings and forest plants',
      category: 'seeds',
      location: 'Salt Lake, Kolkata, West Bengal',
      rating: 4.8,
      contact_info: { phone: '+91-9876543301', email: 'info@treenurserykolkata.com' },
      image_url: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b'
    },
    {
      id: 'shop2',
      name: 'Seed Bank Mumbai',
      description: 'Largest collection of indigenous seeds and rare plant varieties',
      category: 'seeds',
      location: 'Andheri, Mumbai, Maharashtra',
      rating: 4.9,
      contact_info: { phone: '+91-9876543302', email: 'contact@seedbankmumbai.com' },
      image_url: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae'
    },
    {
      id: 'shop3',
      name: 'Organic Soil Solutions Delhi',
      description: 'Premium organic soil mixes and composting solutions',
      category: 'soil',
      location: 'Karol Bagh, New Delhi',
      rating: 4.6,
      contact_info: { phone: '+91-9876543303', email: 'hello@organicsoildelhi.com' },
      image_url: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b'
    },
    {
      id: 'shop4',
      name: 'Forest Saplings Bangalore',
      description: 'Native Karnataka tree saplings and forest restoration plants',
      category: 'seeds',
      location: 'Whitefield, Bangalore, Karnataka',
      rating: 4.7,
      contact_info: { phone: '+91-9876543304', email: 'info@forestsaplingsbgr.com' },
      image_url: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e'
    },
    {
      id: 'shop5',
      name: 'BioFertilizer Chennai',
      description: 'Organic fertilizers and plant nutrition specialists',
      category: 'fertilizers',
      location: 'Anna Nagar, Chennai, Tamil Nadu',
      rating: 4.5,
      contact_info: { phone: '+91-9876543305', email: 'support@biofertilizerchennai.com' },
      image_url: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b'
    },
    {
      id: 'shop6',
      name: 'Garden Tools Hyderabad',
      description: 'Professional gardening tools and tree care equipment',
      category: 'gardening',
      location: 'Banjara Hills, Hyderabad, Telangana',
      rating: 4.4,
      contact_info: { phone: '+91-9876543306', email: 'sales@gardentoolshyd.com' },
      image_url: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae'
    }
  ];

  const mockProducts = [
    // Tree Nursery Kolkata products
    {
      id: 'prod1',
      name: 'Mango Tree Sapling',
      description: 'Alphonso mango tree sapling, grafted variety',
      category: 'seeds',
      price_in_points: 150,
      image_url: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176',
      shops: { name: 'Tree Nursery Kolkata', location: 'Kolkata', rating: 4.8 }
    },
    {
      id: 'prod2',
      name: 'Neem Tree Sapling',
      description: 'Traditional neem tree for natural pest control',
      category: 'seeds',
      price_in_points: 80,
      image_url: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e',
      shops: { name: 'Tree Nursery Kolkata', location: 'Kolkata', rating: 4.8 }
    },
    {
      id: 'prod3',
      name: 'Banyan Tree Sapling',
      description: 'Sacred banyan tree for landscaping',
      category: 'seeds',
      price_in_points: 120,
      image_url: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176',
      shops: { name: 'Tree Nursery Kolkata', location: 'Kolkata', rating: 4.8 }
    },
    {
      id: 'prod4',
      name: 'Rare Orchid Seeds',
      description: 'Exotic orchid seeds collection',
      category: 'seeds',
      price_in_points: 300,
      image_url: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae',
      shops: { name: 'Seed Bank Mumbai', location: 'Mumbai', rating: 4.9 }
    },
    {
      id: 'prod5',
      name: 'Indigenous Vegetable Seeds',
      description: 'Traditional Indian vegetable seed mix',
      category: 'seeds',
      price_in_points: 45,
      image_url: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae',
      shops: { name: 'Seed Bank Mumbai', location: 'Mumbai', rating: 4.9 }
    },
    {
      id: 'prod6',
      name: 'Premium Tree Planting Mix',
      description: 'Specially formulated soil for tree planting',
      category: 'soil',
      price_in_points: 60,
      image_url: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b',
      shops: { name: 'Organic Soil Solutions Delhi', location: 'Delhi', rating: 4.6 }
    },
    {
      id: 'prod7',
      name: 'Eucalyptus Sapling',
      description: 'Fast-growing eucalyptus tree',
      category: 'seeds',
      price_in_points: 70,
      image_url: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176',
      shops: { name: 'Forest Saplings Bangalore', location: 'Bangalore', rating: 4.7 }
    },
    {
      id: 'prod8',
      name: 'Sandalwood Sapling',
      description: 'Premium sandalwood tree sapling',
      category: 'seeds',
      price_in_points: 500,
      image_url: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e',
      shops: { name: 'Forest Saplings Bangalore', location: 'Bangalore', rating: 4.7 }
    },
    {
      id: 'prod9',
      name: 'Cow Dung Compost',
      description: 'Traditional cow dung fertilizer',
      category: 'fertilizers',
      price_in_points: 30,
      image_url: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae',
      shops: { name: 'BioFertilizer Chennai', location: 'Chennai', rating: 4.5 }
    },
    {
      id: 'prod10',
      name: 'Tree Pruning Shears',
      description: 'Professional tree pruning scissors',
      category: 'gardening',
      price_in_points: 120,
      image_url: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b',
      shops: { name: 'Garden Tools Hyderabad', location: 'Hyderabad', rating: 4.4 }
    },
    {
      id: 'prod11',
      name: 'Jackfruit Tree Sapling',
      description: 'Large jackfruit tree for tropical gardens',
      category: 'seeds',
      price_in_points: 200,
      image_url: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e',
      shops: { name: 'Tree Nursery Kolkata', location: 'Kolkata', rating: 4.8 }
    },
    {
      id: 'prod12',
      name: 'Teak Tree Sapling',
      description: 'High-quality teak tree for timber',
      category: 'seeds',
      price_in_points: 250,
      image_url: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176',
      shops: { name: 'Forest Saplings Bangalore', location: 'Bangalore', rating: 4.7 }
    }
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
        <div className="flex justify-between items-start mb-6">
          <div></div>
          <div className="flex items-center gap-2">
            <ShoppingCartComponent onCheckout={handleCheckout} />
            {profile && (
              <div className="flex items-center gap-2 px-3 py-1 bg-green-100 dark:bg-green-900 rounded-full">
                <Leaf className="w-4 h-4 text-green-600 dark:text-green-400" />
                <span className="text-sm font-semibold text-green-700 dark:text-green-300">
                  {profile.green_points || 0} pts
                </span>
              </div>
            )}
          </div>
        </div>
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full mb-6">
          <ShoppingBag className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
          GreenMart
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          Redeem your Green Points for eco-friendly products from trusted green shops across India
        </p>
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
                
                <AddToCart 
                  productId={product.id} 
                  disabled={!profile || (profile.green_points || 0) < product.price_in_points}
                />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
      
      {/* Checkout Modal */}
      <Checkout isOpen={isCheckoutOpen} onClose={() => setIsCheckoutOpen(false)} />
    </div>
  );
};

export default Marketplace;
