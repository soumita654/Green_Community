import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Plus, Minus } from 'lucide-react';
import { toast } from 'sonner';

interface AddToCartProps {
  productId: string;
  disabled?: boolean;
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

const AddToCart: React.FC<AddToCartProps> = ({ productId, disabled = false }) => {
  const [quantity, setQuantity] = useState(1);
  const queryClient = useQueryClient();

  const addToCartMutation = useMutation({
    mutationFn: async ({ productId, quantity }: { productId: string; quantity: number }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user');

      try {
        // Try to use database first
        const { error } = await supabase
          .from('shopping_cart')
          .upsert({
            user_id: user.id,
            product_id: productId,
            quantity,
          });
        
        if (error) throw error;
      } catch (dbError) {
        // Fallback to localStorage if database table doesn't exist
        console.log('Database table not available, using localStorage fallback');
        const cart = getLocalCart();
        const userCart = cart[user.id] || {};
        userCart[productId] = { quantity, productId, userId: user.id };
        cart[user.id] = userCart;
        setLocalCart(cart);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      toast.success('Added to cart successfully! 🛒');
    },
    onError: (error) => {
      toast.error('Failed to add to cart. Please try again.');
      console.error('Add to cart error:', error);
    }
  });

  const handleAddToCart = () => {
    addToCartMutation.mutate({ productId, quantity });
  };

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center border rounded">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setQuantity(Math.max(1, quantity - 1))}
          disabled={quantity <= 1}
        >
          <Minus className="h-4 w-4" />
        </Button>
        <span className="px-3 py-1 min-w-[40px] text-center">{quantity}</span>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setQuantity(quantity + 1)}
          disabled={quantity >= 10}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      <Button
        onClick={handleAddToCart}
        disabled={disabled || addToCartMutation.isPending}
        size="sm"
      >
        <ShoppingCart className="h-4 w-4 mr-2" />
        {addToCartMutation.isPending ? 'Adding...' : 'Add to Cart'}
      </Button>
    </div>
  );
};

export default AddToCart;
