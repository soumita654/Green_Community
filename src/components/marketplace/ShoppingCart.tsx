import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ShoppingCart, Plus, Minus, Trash2, CreditCard, Coins } from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface CartItem {
  id: string;
  product_id: string;
  quantity: number;
  products: {
    id: string;
    name: string;
    price_in_points: number;
    category: string;
    image_url: string | null;
    description: string;
    shops: {
      name: string;
      location: string;
    };
  };
}

interface ShoppingCartProps {
  onCheckout?: () => void;
}

// Local storage cart management (temporary fallback)
const getLocalCart = () => {
  try {
    const cart = localStorage.getItem('shopping_cart');
    return cart ? JSON.parse(cart) : {};
  } catch {
    return {};
  }
};

const setLocalCart = (cart: any) => {
  try {
    localStorage.setItem('shopping_cart', JSON.stringify(cart));
  } catch (error) {
    console.error('Failed to save cart to localStorage:', error);
  }
};

const ShoppingCartComponent: React.FC<ShoppingCartProps> = ({ onCheckout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: cartItems = [], isLoading } = useQuery({
    queryKey: ['cart'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user');

      try {
        // Try to use database first
        const { data, error } = await supabase
          .from('shopping_cart')
          .select(`
            *,
            products (
              id,
              name,
              price_in_points,
              category,
              image_url,
              description,
              shops (
                name,
                location
              )
            )
          `)
          .eq('user_id', user.id);

        if (error) throw error;
        return data as CartItem[];
      } catch (dbError) {
        // Fallback to localStorage if database table doesn't exist
        console.log('Database table not available, using localStorage fallback');
        const cart = getLocalCart();
        const userCart = cart[user.id] || {};
        
        // Get product details for cart items
        const productIds = Object.keys(userCart);
        if (productIds.length === 0) return [];
        
        const { data: products, error: productsError } = await supabase
          .from('products')
          .select(`
            id,
            name,
            price_in_points,
            category,
            image_url,
            description,
            shops (
              name,
              location
            )
          `)
          .in('id', productIds);

        if (productsError) throw productsError;

        // Map localStorage cart items to CartItem format
        const cartItemsFromLocal: CartItem[] = products?.map(product => ({
          id: `local_${product.id}`,
          product_id: product.id,
          quantity: userCart[product.id].quantity,
          products: product
        })) || [];

        return cartItemsFromLocal;
      }
    },
  });

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

  const updateCartMutation = useMutation({
    mutationFn: async ({ productId, quantity }: { productId: string; quantity: number }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user');

      try {
        // Try to use database first
        if (quantity <= 0) {
          const { error } = await supabase
            .from('shopping_cart')
            .delete()
            .eq('user_id', user.id)
            .eq('product_id', productId);
          
          if (error) throw error;
        } else {
          const { error } = await supabase
            .from('shopping_cart')
            .upsert({
              user_id: user.id,
              product_id: productId,
              quantity,
            });
          
          if (error) throw error;
        }
      } catch (dbError) {
        // Fallback to localStorage if database table doesn't exist
        console.log('Database table not available, using localStorage fallback');
        const cart = getLocalCart();
        const userCart = cart[user.id] || {};
        
        if (quantity <= 0) {
          delete userCart[productId];
        } else {
          userCart[productId] = { quantity, productId, userId: user.id };
        }
        
        cart[user.id] = userCart;
        setLocalCart(cart);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });

  const removeFromCartMutation = useMutation({
    mutationFn: async (productId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user');

      try {
        // Try to use database first
        const { error } = await supabase
          .from('shopping_cart')
          .delete()
          .eq('user_id', user.id)
          .eq('product_id', productId);
        
        if (error) throw error;
      } catch (dbError) {
        // Fallback to localStorage if database table doesn't exist
        console.log('Database table not available, using localStorage fallback');
        const cart = getLocalCart();
        const userCart = cart[user.id] || {};
        delete userCart[productId];
        cart[user.id] = userCart;
        setLocalCart(cart);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      toast.success('Item removed from cart');
    },
  });

  const totalPoints = cartItems.reduce((sum, item) => 
    sum + (item.products.price_in_points * item.quantity), 0
  );

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const updateQuantity = (productId: string, newQuantity: number) => {
    updateCartMutation.mutate({ productId, quantity: newQuantity });
  };

  const removeItem = (productId: string) => {
    removeFromCartMutation.mutate(productId);
  };

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    if (!profile || (profile.green_points || 0) < totalPoints) {
      toast.error('Insufficient Green Points. Complete more challenges!');
      return;
    }

    onCheckout?.();
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="relative">
          <ShoppingCart className="h-4 w-4" />
          {totalItems > 0 && (
            <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs">
              {totalItems}
            </Badge>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Shopping Cart ({totalItems} items)
          </DialogTitle>
        </DialogHeader>
        
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
          </div>
        ) : cartItems.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            Your cart is empty
          </div>
        ) : (
          <div className="space-y-4">
            {cartItems.map((item) => (
              <Card key={item.id} className="p-4">
                <div className="flex items-center gap-4">
                  <img 
                    src={item.products.image_url || '/placeholder.svg'} 
                    alt={item.products.name}
                    className="w-16 h-16 object-cover rounded"
                  />
                  <div className="flex-1">
                    <h4 className="font-medium">{item.products.name}</h4>
                    <p className="text-sm text-gray-600">{item.products.shops.name}</p>
                    <p className="text-sm text-gray-500">{item.products.category}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Coins className="h-4 w-4 text-green-600" />
                      <span className="text-green-600 font-semibold">
                        {item.products.price_in_points} points each
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="w-8 text-center">{item.quantity}</span>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => removeItem(item.product_id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
            
            <Separator />
            
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold">Total:</span>
                <div className="flex items-center gap-2">
                  <Coins className="h-5 w-5 text-green-600" />
                  <span className="text-lg font-bold text-green-600">
                    {totalPoints} points
                  </span>
                </div>
              </div>
              
              {profile && (
                <div className="flex justify-between items-center text-sm text-gray-600">
                  <span>Your Green Points:</span>
                  <span>{profile.green_points || 0} points</span>
                </div>
              )}
              
              <Button 
                className="w-full" 
                onClick={handleCheckout}
                disabled={cartItems.length === 0 || !profile || (profile.green_points || 0) < totalPoints}
              >
                <CreditCard className="h-4 w-4 mr-2" />
                Proceed to Checkout
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ShoppingCartComponent;
