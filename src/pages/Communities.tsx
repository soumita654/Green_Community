
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { CommunityCard } from '@/components/communities/CommunityCard';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Plus, Search } from 'lucide-react';
import { Constants } from '@/integrations/supabase/types';

const Communities = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const { data: communities = [], isLoading } = useQuery({
    queryKey: ['communities'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('communities')
        .select('*')
        .order('member_count', { ascending: false });

      if (error) throw error;
      return data || [];
    },
  });

  const filteredCommunities = communities.filter(community => {
    const matchesSearch = community.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         community.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || community.category === selectedCategory as typeof community.category;
    return matchesSearch && matchesCategory;
  });

  const categoryLabels: Record<string, string> = {
    all: 'All Categories',
    plastic_management: 'Plastic Management',
    tree_plantation: 'Tree Plantation',
    natural_awareness: 'Natural Awareness',
    waste_reduction: 'Waste Reduction',
    sustainable_living: 'Sustainable Living',
    eco_innovation: 'Eco Innovation',
    wildlife_conservation: 'Wildlife Conservation',
    water_conservation: 'Water Conservation',
    renewable_energy: 'Renewable Energy',
    organic_farming: 'Organic Farming',
    climate_action: 'Climate Action',
    biodiversity: 'Biodiversity',
    green_transport: 'Green Transport',
    eco_education: 'Eco Education',
    sustainable_fashion: 'Sustainable Fashion',
    green_building: 'Green Building',
    food_sustainability: 'Food Sustainability',
    ocean_cleanup: 'Ocean Cleanup',  
    air_quality: 'Air Quality',
    zero_waste: 'Zero Waste',
    permaculture: 'Permaculture',
    forest_conservation: 'Forest Conservation',
    green_technology: 'Green Technology',
    environmental_justice: 'Environmental Justice',
    carbon_footprint: 'Carbon Footprint'
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
        <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
          EcoCommunities
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          Join like-minded eco-warriors in communities focused on environmental conservation and sustainable living
        </p>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search communities..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-full md:w-64">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {Constants.public.Enums.community_category.map((category) => (
              <SelectItem key={category} value={category}>
                {categoryLabels[category]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white">
          <Plus className="w-4 h-4 mr-2" />
          Create Community
        </Button>
      </div>

      {/* Communities Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCommunities.map((community) => (
          <CommunityCard key={community.id} community={community} />
        ))}
      </div>

      {filteredCommunities.length === 0 && !isLoading && (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400 text-lg">
            No communities found matching your criteria.
          </p>
        </div>
      )}
    </div>
  );
};

export default Communities;
