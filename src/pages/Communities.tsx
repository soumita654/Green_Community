
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Users } from 'lucide-react';
import CommunityCard from '@/components/communities/CommunityCard';
import CreateCommunity from '@/components/communities/CreateCommunity';
import { Database } from '@/integrations/supabase/types';

type CommunityCategory = Database['public']['Enums']['community_category'];

const Communities = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<CommunityCategory | ''>('');

  const { data: communities = [], isLoading } = useQuery({
    queryKey: ['communities', searchTerm, selectedCategory],
    queryFn: async () => {
      let query = supabase
        .from('communities')
        .select('*')
        .order('member_count', { ascending: false });

      if (searchTerm) {
        query = query.or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);
      }

      if (selectedCategory) {
        query = query.eq('category', selectedCategory);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
  });

  const categories: { value: CommunityCategory | '', label: string }[] = [
    { value: '', label: 'All Categories' },
    { value: 'plastic_management', label: 'Plastic Management' },
    { value: 'tree_plantation', label: 'Tree Plantation' },
    { value: 'natural_awareness', label: 'Natural Awareness' },
    { value: 'waste_reduction', label: 'Waste Reduction' },
    { value: 'sustainable_living', label: 'Sustainable Living' },
    { value: 'eco_innovation', label: 'Eco Innovation' },
    { value: 'wildlife_conservation', label: 'Wildlife Conservation' },
    { value: 'water_conservation', label: 'Water Conservation' },
    { value: 'renewable_energy', label: 'Renewable Energy' },
    { value: 'organic_farming', label: 'Organic Farming' },
  ];

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
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div className="mb-6 md:mb-0">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full mb-4">
            <Users className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
            Green Communities
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Join like-minded eco-warriors making a difference
          </p>
        </div>
        <CreateCommunity />
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search communities..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 border-green-300 focus:border-green-500"
          />
        </div>
      </div>

      {/* Category Filters */}
      <div className="flex flex-wrap gap-2 mb-8">
        {categories.slice(0, 8).map((category) => (
          <Badge
            key={category.value}
            variant={selectedCategory === category.value ? 'default' : 'outline'}
            className={`cursor-pointer transition-colors ${
              selectedCategory === category.value 
                ? 'bg-green-500 text-white' 
                : 'border-green-300 text-green-700 hover:bg-green-50 dark:border-green-700 dark:text-green-300'
            }`}
            onClick={() => setSelectedCategory(category.value)}
          >
            {category.label}
          </Badge>
        ))}
      </div>

      {/* Communities Grid */}
      {communities.length === 0 ? (
        <div className="text-center py-12">
          <Users className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2">
            No communities found
          </h3>
          <p className="text-gray-500 dark:text-gray-500">
            {searchTerm || selectedCategory 
              ? 'Try adjusting your search filters' 
              : 'Be the first to create a community!'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {communities.map((community) => (
            <CommunityCard key={community.id} community={community} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Communities;
