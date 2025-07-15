import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Clock, Package, Truck, MapPin } from 'lucide-react';

interface OrderTrackingProps {
  status: string;
  createdAt: string;
  updatedAt: string;
  shippingAddress?: any;
}

const OrderTracking: React.FC<OrderTrackingProps> = ({ 
  status, 
  createdAt, 
  updatedAt, 
  shippingAddress 
}) => {
  const getStatusSteps = () => {
    const steps = [
      { key: 'pending', label: 'Order Placed', icon: Clock },
      { key: 'confirmed', label: 'Confirmed', icon: CheckCircle },
      { key: 'processing', label: 'Processing', icon: Package },
      { key: 'shipped', label: 'Shipped', icon: Truck },
      { key: 'delivered', label: 'Delivered', icon: CheckCircle }
    ];

    const statusOrder = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];
    const currentIndex = statusOrder.indexOf(status);

    return steps.map((step, index) => ({
      ...step,
      completed: index <= currentIndex,
      current: index === currentIndex
    }));
  };

  const steps = getStatusSteps();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          Order Tracking
        </CardTitle>
        <CardDescription>
          Track your order progress
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status Timeline */}
        <div className="relative">
          <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>
          <div className="space-y-4">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={step.key} className="relative flex items-center gap-3">
                  <div className={`relative z-10 flex h-8 w-8 items-center justify-center rounded-full ${
                    step.completed 
                      ? 'bg-green-500 text-white' 
                      : 'bg-gray-200 text-gray-400'
                  }`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <p className={`font-medium ${
                      step.completed ? 'text-green-700' : 'text-gray-500'
                    }`}>
                      {step.label}
                    </p>
                    {step.current && (
                      <Badge variant="secondary" className="mt-1">
                        Current Status
                      </Badge>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Shipping Address */}
        {shippingAddress && (
          <div className="mt-6 p-3 bg-gray-50 rounded-lg">
            <h4 className="font-medium flex items-center gap-2 mb-2">
              <MapPin className="h-4 w-4" />
              Delivery Address
            </h4>
            <div className="text-sm text-gray-600">
              <p className="font-medium">{shippingAddress.fullName}</p>
              <p>{shippingAddress.address}</p>
              <p>{shippingAddress.city}, {shippingAddress.state} {shippingAddress.pincode}</p>
              <p>{shippingAddress.phone}</p>
            </div>
          </div>
        )}

        {/* Estimated Delivery */}
        {status === 'shipped' && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm font-medium text-blue-800">
              🚚 Your order is on its way!
            </p>
            <p className="text-sm text-blue-600 mt-1">
              Estimated delivery: 2-3 business days
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default OrderTracking;
