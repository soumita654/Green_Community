import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  TrendingUp, 
  Package, 
  ShoppingCart, 
  Users, 
  DollarSign,
  Calendar,
  Star
} from 'lucide-react';

interface OrderSummary {
  total_orders: number;
  total_revenue: number;
  total_points_earned: number;
  pending_orders: number;
  completed_orders: number;
}

const ShopAnalytics: React.FC = () => {
  // Get current user's shop
  const { data: userShop } = useQuery({
    queryKey: ['user-shop'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user');

      // For demo purposes, we'll assume the user has a shop
      const { data, error } = await supabase
        .from('shops')
        .select('*')
        .limit(1)
        .single();

      if (error) throw error;
      return data;
    },
  });

  // Get shop analytics
  const { data: analytics, isLoading } = useQuery({
    queryKey: ['shop-analytics', userShop?.id],
    queryFn: async () => {
      if (!userShop?.id) return null;

      // Get recent orders for this shop's products
      const { data: orders, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            *,
            products (
              shop_id
            )
          )
        `)
        .eq('order_items.products.shop_id', userShop.id)
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

      if (error) throw error;

      // Calculate analytics
      const analytics = {
        total_orders: orders?.length || 0,
        total_revenue: 0,
        total_points_earned: orders?.reduce((sum, order) => sum + (order.total_points_used || 0), 0) || 0,
        pending_orders: orders?.filter(order => order.status === 'pending').length || 0,
        completed_orders: orders?.filter(order => order.status === 'delivered').length || 0,
      };

      return analytics;
    },
    enabled: !!userShop?.id,
  });

  // Get top products
  const { data: topProducts = [] } = useQuery({
    queryKey: ['top-products', userShop?.id],
    queryFn: async () => {
      if (!userShop?.id) return [];

      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('shop_id', userShop.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      return data || [];
    },
    enabled: !!userShop?.id,
  });

  // Get recent orders
  const { data: recentOrders = [] } = useQuery({
    queryKey: ['recent-orders', userShop?.id],
    queryFn: async () => {
      if (!userShop?.id) return [];

      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            *,
            products (
              name,
              shop_id
            )
          )
        `)
        .eq('order_items.products.shop_id', userShop.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      return data || [];
    },
    enabled: !!userShop?.id,
  });

  if (!userShop) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <TrendingUp className="h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-500 text-center">
              You need to be a shop owner to view analytics.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">Shop Analytics</h1>
        <p className="text-gray-600">Track your shop's performance and sales</p>
      </div>

      {/* Shop Info */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            {userShop.name}
          </CardTitle>
          <CardDescription>
            {userShop.location} • {userShop.category}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 text-yellow-500 fill-current" />
              <span className="text-sm font-medium">{userShop.rating || 'N/A'}</span>
            </div>
            <Badge variant="outline">{userShop.category}</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Analytics Cards */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 rounded-lg animate-pulse"></div>
          ))}
        </div>
      ) : analytics ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.total_orders}</div>
              <p className="text-xs text-muted-foreground">Last 30 days</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Points Earned</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{analytics.total_points_earned}</div>
              <p className="text-xs text-muted-foreground">Green Points</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{analytics.pending_orders}</div>
              <p className="text-xs text-muted-foreground">Need attention</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed Orders</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{analytics.completed_orders}</div>
              <p className="text-xs text-muted-foreground">Delivered</p>
            </CardContent>
          </Card>
        </div>
      ) : null}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <Card>
          <CardHeader>
            <CardTitle>Top Products</CardTitle>
            <CardDescription>Your most popular items</CardDescription>
          </CardHeader>
          <CardContent>
            {topProducts.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No products yet</p>
            ) : (
              <div className="space-y-4">
                {topProducts.map((product) => (
                  <div key={product.id} className="flex items-center gap-3">
                    <img 
                      src={product.image_url || '/placeholder.svg'} 
                      alt={product.name}
                      className="w-12 h-12 object-cover rounded"
                    />
                    <div className="flex-1">
                      <h4 className="font-medium">{product.name}</h4>
                      <p className="text-sm text-gray-600">{product.category}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-green-600">
                        {product.price_in_points} pts
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Orders */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
            <CardDescription>Latest customer orders</CardDescription>
          </CardHeader>
          <CardContent>
            {recentOrders.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No orders yet</p>
            ) : (
              <div className="space-y-4">
                {recentOrders.slice(0, 5).map((order) => (
                  <div key={order.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Order #{order.id.slice(-8)}</p>
                      <p className="text-sm text-gray-600">
                        {new Date(order.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge className={
                        order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                        order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-blue-100 text-blue-800'
                      }>
                        {order.status}
                      </Badge>
                      <p className="text-sm text-green-600 mt-1">
                        {order.total_points_used} pts
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Monthly Performance */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Monthly Performance
          </CardTitle>
          <CardDescription>
            Your shop's performance over the last 30 days
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {analytics?.total_orders || 0}
              </div>
              <p className="text-sm text-green-700">Total Orders</p>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {analytics?.total_points_earned || 0}
              </div>
              <p className="text-sm text-blue-700">Points Earned</p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {((analytics?.completed_orders || 0) / (analytics?.total_orders || 1) * 100).toFixed(1)}%
              </div>
              <p className="text-sm text-purple-700">Completion Rate</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ShopAnalytics;
