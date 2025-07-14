
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { BookOpen, Calendar, Clock, User, Heart, MessageCircle, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';

const Blogs = () => {
  const { data: blogs = [], isLoading } = useQuery({
    queryKey: ['blogs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('blogs')
        .select(`
          *,
          profiles (
            eco_name,
            avatar_url
          )
        `)
        .eq('published', true)
        .order('published_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getReadingTime = (content: string) => {
    const wordsPerMinute = 200;
    const wordCount = content.split(' ').length;
    return Math.ceil(wordCount / wordsPerMinute);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-96 bg-gray-200 dark:bg-gray-800 rounded-lg animate-pulse"></div>
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
          GreenBlogs
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          Discover in-depth articles about sustainability, environmental conservation, and green living from our community
        </p>
        <Link to="/create-blog">
          <Button className="mt-6 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white">
            <Plus className="w-4 h-4 mr-2" />
            Write a Blog
          </Button>
        </Link>
      </div>

      {/* Featured Blog */}
      {blogs.length > 0 && (
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-green-800 dark:text-green-200 mb-6">
            Featured Article
          </h2>
          <Card className="border-green-200 dark:border-green-800 overflow-hidden">
            {blogs[0].cover_image_url && (
              <div className="h-64 md:h-80 bg-gray-200 dark:bg-gray-800 overflow-hidden">
                <img 
                  src={blogs[0].cover_image_url} 
                  alt={blogs[0].title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <CardHeader className="pb-4">
              <div className="flex flex-wrap gap-2 mb-3">
                {blogs[0].tags?.map((tag) => (
                  <Badge key={tag} className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                    {tag}
                  </Badge>
                ))}
              </div>
              <CardTitle className="text-2xl text-green-800 dark:text-green-200 mb-2">
                {blogs[0].title}
              </CardTitle>
              <CardDescription className="text-base">
                {blogs[0].excerpt}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={blogs[0].profiles?.avatar_url} />
                    <AvatarFallback className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                      {blogs[0].profiles?.eco_name?.charAt(0) || 'A'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="text-sm">
                    <p className="font-semibold text-green-800 dark:text-green-200">
                      {blogs[0].profiles?.eco_name}
                    </p>
                    <div className="flex items-center gap-3 text-gray-500 dark:text-gray-400">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(blogs[0].published_at)}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {getReadingTime(blogs[0].content)} min read
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                  <div className="flex items-center gap-1">
                    <Heart className="w-4 h-4" />
                    {blogs[0].likes_count || 0}
                  </div>
                  <div className="flex items-center gap-1">
                    <MessageCircle className="w-4 h-4" />
                    {blogs[0].comments_count || 0}
                  </div>
                </div>
              </div>
              
              <Link to={`/blogs/${blogs[0].id}`}>
                <Button className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white">
                  Read Full Article
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Blog Grid */}
      <div>
        <h2 className="text-2xl font-bold text-green-800 dark:text-green-200 mb-6">
          Latest Articles
        </h2>
        {blogs.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📝</div>
            <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-300 mb-2">
              No blogs published yet
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              Be the first to share your environmental insights!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {blogs.slice(1).map((blog) => (
              <Card key={blog.id} className="border-green-200 dark:border-green-800 hover:shadow-lg transition-shadow">
                {blog.cover_image_url && (
                  <div className="h-48 bg-gray-200 dark:bg-gray-800 rounded-t-lg overflow-hidden">
                    <img 
                      src={blog.cover_image_url} 
                      alt={blog.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <CardHeader className="pb-2">
                  <div className="flex flex-wrap gap-1 mb-2">
                    {blog.tags?.slice(0, 2).map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  <CardTitle className="text-lg text-green-800 dark:text-green-200 line-clamp-2">
                    {blog.title}
                  </CardTitle>
                  <CardDescription className="line-clamp-2">
                    {blog.excerpt}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={blog.profiles?.avatar_url} />
                      <AvatarFallback className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 text-xs">
                        {blog.profiles?.eco_name?.charAt(0) || 'A'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      <p className="font-semibold">{blog.profiles?.eco_name}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {formatDate(blog.published_at)}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {getReadingTime(blog.content)} min
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                      <div className="flex items-center gap-1">
                        <Heart className="w-3 h-3" />
                        {blog.likes_count || 0}
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageCircle className="w-3 h-3" />
                        {blog.comments_count || 0}
                      </div>
                    </div>
                    
                    <Link to={`/blogs/${blog.id}`}>
                      <Button size="sm" variant="outline" className="text-xs">
                        Read More
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Blogs;
