
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, BookOpen, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import BlogCard from '@/components/blogs/BlogCard';

const Blogs = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState('');

  const { data: blogs = [], isLoading } = useQuery({
    queryKey: ['blogs', searchTerm, selectedTag],
    queryFn: async () => {
      let query = supabase
        .from('blogs')
        .select(`
          *,
          profiles (
            eco_name,
            avatar_url
          )
        `)
        .eq('published', true)
        .order('created_at', { ascending: false });

      if (searchTerm) {
        query = query.or(`title.ilike.%${searchTerm}%,content.ilike.%${searchTerm}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      
      let filteredData = data || [];
      
      if (selectedTag) {
        filteredData = filteredData.filter(blog => 
          blog.tags && blog.tags.includes(selectedTag)
        );
      }
      
      return filteredData;
    },
  });

  const { data: allTags = [] } = useQuery({
    queryKey: ['blog-tags'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('blogs')
        .select('tags')
        .eq('published', true);

      if (error) throw error;
      
      const tagsSet = new Set<string>();
      data?.forEach(blog => {
        if (blog.tags) {
          blog.tags.forEach((tag: string) => tagsSet.add(tag));
        }
      });
      
      return Array.from(tagsSet).slice(0, 10);
    },
  });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-80 bg-gray-200 dark:bg-gray-800 rounded-lg animate-pulse"></div>
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
          <BookOpen className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
          EcoBlogs
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          Discover inspiring stories, tips, and insights from the green community
        </p>
        <Link to="/create-blog">
          <Button className="mt-6 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white">
            <Plus className="w-4 h-4 mr-2" />
            Write a Blog
          </Button>
        </Link>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search blogs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 border-green-300 focus:border-green-500"
          />
        </div>
      </div>

      {/* Tags */}
      {allTags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-8">
          <Badge
            variant={selectedTag === '' ? 'default' : 'outline'}
            className={`cursor-pointer ${
              selectedTag === '' 
                ? 'bg-green-500 text-white' 
                : 'border-green-300 text-green-700 hover:bg-green-50 dark:border-green-700 dark:text-green-300'
            }`}
            onClick={() => setSelectedTag('')}
          >
            All
          </Badge>
          {allTags.map((tag) => (
            <Badge
              key={tag}
              variant={selectedTag === tag ? 'default' : 'outline'}
              className={`cursor-pointer ${
                selectedTag === tag 
                  ? 'bg-green-500 text-white' 
                  : 'border-green-300 text-green-700 hover:bg-green-50 dark:border-green-700 dark:text-green-300'
              }`}
              onClick={() => setSelectedTag(tag)}
            >
              {tag}
            </Badge>
          ))}
        </div>
      )}

      {/* Blogs Grid */}
      {blogs.length === 0 ? (
        <div className="text-center py-12">
          <BookOpen className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2">
            No blogs found
          </h3>
          <p className="text-gray-500 dark:text-gray-500">
            {searchTerm || selectedTag 
              ? 'Try adjusting your search filters' 
              : 'Be the first to write a blog post!'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {blogs.map((blog) => (
            <BlogCard key={blog.id} blog={blog} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Blogs;
