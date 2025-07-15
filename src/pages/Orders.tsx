import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Package, MapPin, Calendar, Coins, Eye, Truck } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { format } from 'date-fns';

interface Order {
  id: string;
  total_amount: number;
  total_points_used: number;
  status: string;
  shipping_address: any;
  notes: string | null;
  created_at: string;
  updated_at: string;
  order_items: {
    id: string;
    quantity: number;
    price_per_item: number;
    points_per_item: number;
    products: {
      id: string;
      name: string;
      category: string;
      image_url: string | null;
      shops: {
        name: string;
        location: string;
      };
    };
  }[];
  payments: {
    id: string;
    payment_method: string;
    amount: number;
    points_used: number;
    status: string;
    transaction_id: string | null;
  }[];
}

const Orders: React.FC = () => {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['orders'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user');

      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            *,
            products (
              id,
              name,
              category,
              image_url,
              shops (
                name,
                location
              )
            )
          ),
          payments (
            id,
            payment_method,
            amount,
            points_used,
            status,
            transaction_id
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Order[];
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'processing': return 'bg-orange-100 text-orange-800';
      case 'shipped': return 'bg-purple-100 text-purple-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'shipped': return <Truck className="h-4 w-4" />;
      case 'delivered': return <Package className="h-4 w-4" />;
      default: return <Package className="h-4 w-4" />;
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-2 mb-6">
        <Package className="h-6 w-6 text-green-600" />
        <h1 className="text-2xl font-bold">My Orders</h1>
      </div>

      {orders.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Package className="h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-500 text-center">
              No orders yet. Start shopping to see your orders here!
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Card key={order.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">Order #{order.id.slice(-8)}</CardTitle>
                    <CardDescription className="flex items-center gap-2 mt-1">
                      <Calendar className="h-4 w-4" />
                      {format(new Date(order.created_at), 'PPP')}
                    </CardDescription>
                  </div>
                  <Badge className={`${getStatusColor(order.status)} capitalize`}>
                    {getStatusIcon(order.status)}
                    <span className="ml-1">{order.status}</span>
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Order Items Preview */}
                  <div>
                    <h4 className="font-medium mb-2">Items ({order.order_items.length})</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                      {order.order_items.slice(0, 3).map((item) => (
                        <div key={item.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                          <img 
                            src={item.products.image_url || '/placeholder.svg'} 
                            alt={item.products.name}
                            className="w-10 h-10 object-cover rounded"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">{item.products.name}</p>
                            <p className="text-xs text-gray-600">Qty: {item.quantity}</p>
                          </div>
                        </div>
                      ))}
                      {order.order_items.length > 3 && (
                        <div className="flex items-center justify-center p-2 bg-gray-50 rounded text-sm text-gray-600">
                          +{order.order_items.length - 3} more
                        </div>
                      )}
                    </div>
                  </div>

                  <Separator />

                  {/* Order Summary */}
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <Coins className="h-4 w-4 text-green-600" />
                        <span className="font-medium text-green-600">
                          {order.total_points_used} points
                        </span>
                      </div>
                      {order.shipping_address && (
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <MapPin className="h-4 w-4" />
                          <span>{order.shipping_address.city}, {order.shipping_address.state}</span>
                        </div>
                      )}
                    </div>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" onClick={() => setSelectedOrder(order)}>
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>Order Details - #{order.id.slice(-8)}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-6">
                          {/* Order Status */}
                          <div>
                            <h4 className="font-medium mb-2">Status</h4>
                            <Badge className={`${getStatusColor(order.status)} capitalize`}>
                              {getStatusIcon(order.status)}
                              <span className="ml-1">{order.status}</span>
                            </Badge>
                          </div>

                          {/* Order Items */}
                          <div>
                            <h4 className="font-medium mb-2">Items</h4>
                            <div className="space-y-2">
                              {order.order_items.map((item) => (
                                <div key={item.id} className="flex items-center gap-3 p-3 border rounded">
                                  <img 
                                    src={item.products.image_url || '/placeholder.svg'} 
                                    alt={item.products.name}
                                    className="w-16 h-16 object-cover rounded"
                                  />
                                  <div className="flex-1">
                                    <h5 className="font-medium">{item.products.name}</h5>
                                    <p className="text-sm text-gray-600">{item.products.shops.name}</p>
                                    <p className="text-sm text-gray-500">{item.products.category}</p>
                                  </div>
                                  <div className="text-right">
                                    <p className="text-sm">Qty: {item.quantity}</p>
                                    <div className="flex items-center gap-1">
                                      <Coins className="h-3 w-3 text-green-600" />
                                      <span className="text-sm text-green-600">
                                        {item.points_per_item * item.quantity}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Shipping Address */}
                          {order.shipping_address && (
                            <div>
                              <h4 className="font-medium mb-2">Shipping Address</h4>
                              <div className="p-3 bg-gray-50 rounded">
                                <p className="font-medium">{order.shipping_address.fullName}</p>
                                <p className="text-sm text-gray-600">{order.shipping_address.phone}</p>
                                <p className="text-sm text-gray-600">{order.shipping_address.email}</p>
                                <p className="text-sm text-gray-600 mt-2">
                                  {order.shipping_address.address}<br />
                                  {order.shipping_address.city}, {order.shipping_address.state} {order.shipping_address.pincode}
                                </p>
                              </div>
                            </div>
                          )}

                          {/* Payment Information */}
                          {order.payments.length > 0 && (
                            <div>
                              <h4 className="font-medium mb-2">Payment Information</h4>
                              {order.payments.map((payment) => (
                                <div key={payment.id} className="p-3 bg-gray-50 rounded">
                                  <div className="flex justify-between items-center">
                                    <span className="capitalize">{payment.payment_method.replace('_', ' ')}</span>
                                    <Badge className={payment.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                                      {payment.status}
                                    </Badge>
                                  </div>
                                  <div className="flex items-center gap-1 mt-1">
                                    <Coins className="h-4 w-4 text-green-600" />
                                    <span className="text-green-600 font-medium">
                                      {payment.points_used} points
                                    </span>
                                  </div>
                                  {payment.transaction_id && (
                                    <p className="text-sm text-gray-600 mt-1">
                                      Transaction ID: {payment.transaction_id}
                                    </p>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Order Notes */}
                          {order.notes && (
                            <div>
                              <h4 className="font-medium mb-2">Order Notes</h4>
                              <p className="text-sm text-gray-600 p-3 bg-gray-50 rounded">
                                {order.notes}
                              </p>
                            </div>
                          )}

                          {/* Order Total */}
                          <div className="border-t pt-4">
                            <div className="flex justify-between items-center font-bold">
                              <span>Total:</span>
                              <div className="flex items-center gap-1">
                                <Coins className="h-5 w-5 text-green-600" />
                                <span className="text-green-600">{order.total_points_used} points</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Orders;
