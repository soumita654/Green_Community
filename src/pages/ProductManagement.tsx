import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Edit, Trash2, Package, Coins, Image } from 'lucide-react';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';

interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  price_in_points: number;
  image_url: string | null;
  shop_id: string;
  created_at: string;
  updated_at: string;
}

interface ProductFormData {
  name: string;
  description: string;
  category: string;
  price_in_points: number;
  image_url: string;
}

const ProductManagement: React.FC = () => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const queryClient = useQueryClient();

  const { register, handleSubmit, reset, formState: { errors } } = useForm<ProductFormData>();

  // Get current user's shop
  const { data: userShop } = useQuery({
    queryKey: ['user-shop'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user');

      // For demo purposes, we'll assume the user has a shop
      // In a real app, you'd have a shop_owners table or similar
      const { data, error } = await supabase
        .from('shops')
        .select('*')
        .limit(1)
        .single();

      if (error) throw error;
      return data;
    },
  });

  // Get products for the shop
  const { data: products = [], isLoading } = useQuery({
    queryKey: ['shop-products', userShop?.id],
    queryFn: async () => {
      if (!userShop?.id) return [];

      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('shop_id', userShop.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Product[];
    },
    enabled: !!userShop?.id,
  });

  // Add/Update product mutation
  const saveProductMutation = useMutation({
    mutationFn: async ({ productData, isEdit }: { productData: ProductFormData; isEdit: boolean }) => {
      if (!userShop?.id) throw new Error('No shop found');

      const payload = {
        ...productData,
        shop_id: userShop.id,
      };

      if (isEdit && editingProduct) {
        const { error } = await supabase
          .from('products')
          .update(payload)
          .eq('id', editingProduct.id);
        
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('products')
          .insert([payload]);
        
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shop-products'] });
      toast.success(editingProduct ? 'Product updated!' : 'Product added!');
      setIsAddDialogOpen(false);
      setEditingProduct(null);
      reset();
    },
    onError: (error) => {
      toast.error('Failed to save product');
      console.error('Save product error:', error);
    }
  });

  // Delete product mutation
  const deleteProductMutation = useMutation({
    mutationFn: async (productId: string) => {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shop-products'] });
      toast.success('Product deleted!');
    },
    onError: (error) => {
      toast.error('Failed to delete product');
      console.error('Delete product error:', error);
    }
  });

  const onSubmit = (data: ProductFormData) => {
    saveProductMutation.mutate({ productData: data, isEdit: !!editingProduct });
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    reset({
      name: product.name,
      description: product.description,
      category: product.category,
      price_in_points: product.price_in_points,
      image_url: product.image_url || '',
    });
    setIsAddDialogOpen(true);
  };

  const handleDelete = (productId: string) => {
    if (confirm('Are you sure you want to delete this product?')) {
      deleteProductMutation.mutate(productId);
    }
  };

  const categories = [
    'Organic Food',
    'Sustainable Products',
    'Eco-friendly Products',
    'Health & Wellness',
    'Sustainable Fashion',
    'Handicrafts',
    'Seeds & Saplings',
    'Fertilizers',
    'Soil & Compost',
    'Gardening Tools'
  ];

  if (!userShop) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Package className="h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-500 text-center">
              You need to be a shop owner to manage products.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Product Management</h1>
          <p className="text-gray-600">Manage your shop's products</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              setEditingProduct(null);
              reset();
            }}>
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Product Name</Label>
                  <Input
                    id="name"
                    {...register('name', { required: 'Product name is required' })}
                    placeholder="Organic Vegetables"
                  />
                  {errors.name && (
                    <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="category">Category</Label>
                  <select
                    id="category"
                    {...register('category', { required: 'Category is required' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="">Select category</option>
                    {categories.map((category) => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                  {errors.category && (
                    <p className="text-red-500 text-sm mt-1">{errors.category.message}</p>
                  )}
                </div>
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  {...register('description', { required: 'Description is required' })}
                  placeholder="Fresh organic vegetables from local farms..."
                />
                {errors.description && (
                  <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="price_in_points">Price (Green Points)</Label>
                  <Input
                    id="price_in_points"
                    type="number"
                    {...register('price_in_points', { 
                      required: 'Price is required',
                      min: { value: 1, message: 'Price must be at least 1 point' }
                    })}
                    placeholder="50"
                  />
                  {errors.price_in_points && (
                    <p className="text-red-500 text-sm mt-1">{errors.price_in_points.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="image_url">Image URL</Label>
                  <Input
                    id="image_url"
                    {...register('image_url')}
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
              </div>
              <div className="flex gap-4">
                <Button type="submit" disabled={saveProductMutation.isPending}>
                  {saveProductMutation.isPending ? 'Saving...' : 'Save Product'}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsAddDialogOpen(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Shop Info */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>{userShop.name}</CardTitle>
          <CardDescription>
            {userShop.location} • {userShop.category}
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Products Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-64 bg-gray-200 rounded-lg animate-pulse"></div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Package className="h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-500 text-center">
              No products yet. Add your first product to get started!
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <Card key={product.id}>
              {product.image_url && (
                <div className="h-48 bg-gray-200 rounded-t-lg overflow-hidden">
                  <img 
                    src={product.image_url} 
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">{product.name}</CardTitle>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{product.category}</Badge>
                  <div className="flex items-center gap-1">
                    <Coins className="h-4 w-4 text-green-600" />
                    <span className="text-green-600 font-semibold">
                      {product.price_in_points} pts
                    </span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                  {product.description}
                </p>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleEdit(product)}
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleDelete(product.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductManagement;
