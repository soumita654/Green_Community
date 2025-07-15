
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Users } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

const CreateCommunity = () => {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const queryClient = useQueryClient();

  const { data: profile } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      return data;
    },
  });

  const categories = [
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
    { value: 'climate_action', label: 'Climate Action' },
    { value: 'biodiversity', label: 'Biodiversity' },
    { value: 'green_transport', label: 'Green Transport' },
    { value: 'eco_education', label: 'Eco Education' },
    { value: 'sustainable_fashion', label: 'Sustainable Fashion' },
    { value: 'green_building', label: 'Green Building' },
    { value: 'food_sustainability', label: 'Food Sustainability' },
    { value: 'ocean_cleanup', label: 'Ocean Cleanup' },
    { value: 'air_quality', label: 'Air Quality' },
    { value: 'zero_waste', label: 'Zero Waste' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!profile) {
      toast.error('Please sign in to create a community');
      return;
    }

    if (!name.trim() || !description.trim() || !category) {
      toast.error('Please fill in all fields');
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('communities')
        .insert({
          name: name.trim(),
          description: description.trim(),
          category: category as any,
          created_by: profile.user_id,
        });

      if (error) throw error;

      // Reset form
      setName('');
      setDescription('');
      setCategory('');
      setOpen(false);
      
      // Refresh communities
      queryClient.invalidateQueries({ queryKey: ['communities'] });
      
      toast.success('Community created successfully! 🌱');
    } catch (error) {
      console.error('Error creating community:', error);
      toast.error('Failed to create community. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!profile) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white">
          <Plus className="w-4 h-4 mr-2" />
          Create Community
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-green-800 dark:text-green-200">
            <Users className="w-5 h-5" />
            Create New Community
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Community Name
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter community name"
              className="border-green-300 focus:border-green-500"
              maxLength={100}
            />
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Description
            </label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your community's purpose and goals"
              className="min-h-[80px] border-green-300 focus:border-green-500"
              maxLength={500}
            />
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Category
            </label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="border-green-300 focus:border-green-500">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !name.trim() || !description.trim() || !category}
              className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white"
            >
              {isSubmitting ? 'Creating...' : 'Create'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateCommunity;
