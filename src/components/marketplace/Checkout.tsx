import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CreditCard, MapPin, Phone, Mail, User, Coins, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';

interface CheckoutProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ShippingAddress {
  fullName: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
}

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

const clearLocalCart = (userId: string) => {
  try {
    const cart = getLocalCart();
    delete cart[userId];
    setLocalCart(cart);
  } catch (error) {
    console.error('Failed to clear cart from localStorage:', error);
  }
};

const Checkout: React.FC<CheckoutProps> = ({ isOpen, onClose }) => {
  const [paymentMethod, setPaymentMethod] = useState('green_points');
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const queryClient = useQueryClient();

  const { register, handleSubmit, formState: { errors } } = useForm<ShippingAddress>();

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

  const createOrderMutation = useMutation({
    mutationFn: async ({ shippingAddress, notes }: { shippingAddress: ShippingAddress; notes?: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user');

      const totalPoints = cartItems.reduce((sum, item) => 
        sum + (item.products.price_in_points * item.quantity), 0
      );

      // For now, we'll just simulate the order creation and handle the cart clearing
      // In a real scenario with the database tables, this would create actual order records
      
      // Simulate successful order creation
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update user's green points
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          green_points: (profile?.green_points || 0) - totalPoints
        })
        .eq('user_id', user.id);

      if (profileError) throw profileError;

      // Clear cart - try database first, then localStorage
      try {
        const { error: clearCartError } = await supabase
          .from('shopping_cart')
          .delete()
          .eq('user_id', user.id);

        if (clearCartError) throw clearCartError;
      } catch (dbError) {
        // Clear localStorage cart if database table doesn't exist
        clearLocalCart(user.id);
      }

      return { id: `order_${Date.now()}`, status: 'confirmed' };
    },
    onSuccess: () => {
      setOrderSuccess(true);
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast.success('Order placed successfully! 🌱');
    },
    onError: (error) => {
      toast.error('Failed to place order. Please try again.');
      console.error('Order error:', error);
    }
  });

  const totalPoints = cartItems.reduce((sum, item) => 
    sum + (item.products.price_in_points * item.quantity), 0
  );

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const onSubmit = async (data: ShippingAddress) => {
    setIsProcessing(true);
    try {
      await createOrderMutation.mutateAsync({ shippingAddress: data });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    setOrderSuccess(false);
    onClose();
  };

  if (orderSuccess) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="max-w-md">
          <div className="text-center py-8">
            <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-green-600 mb-2">Order Confirmed!</h2>
            <p className="text-gray-600 mb-4">
              Your order has been placed successfully. You'll receive a confirmation email shortly.
            </p>
            <Button onClick={handleClose} className="w-full">
              Continue Shopping
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Checkout
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Shipping Address */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Shipping Address
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="fullName">Full Name</Label>
                      <Input
                        id="fullName"
                        {...register('fullName', { required: 'Full name is required' })}
                        placeholder="John Doe"
                      />
                      {errors.fullName && (
                        <p className="text-red-500 text-sm mt-1">{errors.fullName.message}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        {...register('phone', { required: 'Phone number is required' })}
                        placeholder="+91 9876543210"
                      />
                      {errors.phone && (
                        <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>
                      )}
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      {...register('email', { required: 'Email is required' })}
                      placeholder="john@example.com"
                    />
                    {errors.email && (
                      <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="address">Address</Label>
                    <Textarea
                      id="address"
                      {...register('address', { required: 'Address is required' })}
                      placeholder="Street address, apartment, etc."
                    />
                    {errors.address && (
                      <p className="text-red-500 text-sm mt-1">{errors.address.message}</p>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        {...register('city', { required: 'City is required' })}
                        placeholder="Mumbai"
                      />
                      {errors.city && (
                        <p className="text-red-500 text-sm mt-1">{errors.city.message}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="state">State</Label>
                      <Input
                        id="state"
                        {...register('state', { required: 'State is required' })}
                        placeholder="Maharashtra"
                      />
                      {errors.state && (
                        <p className="text-red-500 text-sm mt-1">{errors.state.message}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="pincode">Pincode</Label>
                      <Input
                        id="pincode"
                        {...register('pincode', { required: 'Pincode is required' })}
                        placeholder="400001"
                      />
                      {errors.pincode && (
                        <p className="text-red-500 text-sm mt-1">{errors.pincode.message}</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Order Summary */}
              <Card>
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    {cartItems.map((item) => (
                      <div key={item.id} className="flex justify-between items-center">
                        <div className="flex-1">
                          <p className="font-medium">{item.products.name}</p>
                          <p className="text-sm text-gray-600">
                            {item.products.shops.name} • Qty: {item.quantity}
                          </p>
                        </div>
                        <div className="flex items-center gap-1">
                          <Coins className="h-4 w-4 text-green-600" />
                          <span className="text-green-600">
                            {item.products.price_in_points * item.quantity}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span>Total Items:</span>
                      <span>{totalItems}</span>
                    </div>
                    <div className="flex justify-between items-center font-bold">
                      <span>Total Points:</span>
                      <div className="flex items-center gap-1">
                        <Coins className="h-4 w-4 text-green-600" />
                        <span className="text-green-600">{totalPoints}</span>
                      </div>
                    </div>
                    {profile && (
                      <div className="flex justify-between items-center text-sm text-gray-600">
                        <span>Your Green Points:</span>
                        <span>{profile.green_points || 0}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Payment Method */}
            <Card>
              <CardHeader>
                <CardTitle>Payment Method</CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="green_points" id="green_points" />
                    <Label htmlFor="green_points" className="flex items-center gap-2">
                      <Coins className="h-4 w-4 text-green-600" />
                      Green Points
                      <Badge variant="secondary">Eco-Friendly</Badge>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 opacity-50">
                    <RadioGroupItem value="upi" id="upi" disabled />
                    <Label htmlFor="upi">UPI (Coming Soon)</Label>
                  </div>
                  <div className="flex items-center space-x-2 opacity-50">
                    <RadioGroupItem value="card" id="card" disabled />
                    <Label htmlFor="card">Credit/Debit Card (Coming Soon)</Label>
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>

            {/* Order Notes */}
            <Card>
              <CardHeader>
                <CardTitle>Order Notes (Optional)</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Any special instructions for your order..."
                  {...register('notes' as any)}
                />
              </CardContent>
            </Card>

            {/* Place Order Button */}
            <div className="flex gap-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={onClose}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="flex-1"
                disabled={isProcessing || !profile || (profile.green_points || 0) < totalPoints}
              >
                {isProcessing ? 'Processing...' : 'Place Order'}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default Checkout;
