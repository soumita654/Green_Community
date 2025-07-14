
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import CommunityCard from '@/components/communities/CommunityCard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, Plus, Users } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const Communities = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const { data: communities = [], isLoading } = useQuery({
    queryKey: ['communities', searchTerm, selectedCategory],
    queryFn: async () => {
      let query = supabase
        .from('communities')
        .select('*')
        .order('member_count', { ascending: false });

      if (searchTerm) {
        query = query.ilike('name', `%${searchTerm}%`);
      }

      if (selectedCategory !== 'all') {
        query = query.eq('category', selectedCategory);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
  });

  const categories = [
    { value: 'all', label: 'All Communities' },
    { value: 'plastic_management', label: 'Plastic Management' },
    { value: 'tree_plantation', label: 'Tree Plantation' },
    { value: 'natural_awareness', label: 'Natural Awareness' },
    { value: 'waste_reduction', label: 'Waste Reduction' },
    { value: 'sustainable_living', label: 'Sustainable Living' },
    { value: 'renewable_energy', label: 'Renewable Energy' },
    { value: 'water_conservation', label: 'Water Conservation' },
    { value: 'wildlife_conservation', label: 'Wildlife Conservation' },
    { value: 'organic_farming', label: 'Organic Farming' },
    { value: 'climate_action', label: 'Climate Action' },
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
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full mb-6">
          <Users className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
          Green Communities
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          Join like-minded eco-warriors in communities dedicated to environmental conservation and sustainable living
        </p>
      </div>

      {/* Search and Filter */}
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
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-full md:w-48 border-green-300 focus:border-green-500">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((category) => (
              <SelectItem key={category.value} value={category.value}>
                {category.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="text-center p-6 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 rounded-lg">
          <div className="text-3xl font-bold text-green-600 dark:text-green-400">
            {communities.length}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Active Communities
          </div>
        </div>
        <div className="text-center p-6 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950 dark:to-teal-950 rounded-lg">
          <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
            {communities.reduce((acc, comm) => acc + (comm.member_count || 0), 0)}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Total Members
          </div>
        </div>
        <div className="text-center p-6 bg-gradient-to-r from-teal-50 to-cyan-50 dark:from-teal-950 dark:to-cyan-950 rounded-lg">
          <div className="text-3xl font-bold text-teal-600 dark:text-teal-400">
            {new Set(communities.map(c => c.category)).size}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Categories
          </div>
        </div>
      </div>

      {/* Communities Grid */}
      {communities.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🌱</div>
          <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-300 mb-2">
            No communities found
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            Try adjusting your search or filter criteria
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
