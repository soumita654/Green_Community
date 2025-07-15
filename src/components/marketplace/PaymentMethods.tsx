import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CreditCard, Smartphone, Wallet, Coins, Lock, CheckCircle } from 'lucide-react';

interface PaymentMethodsProps {
  totalAmount: number;
  totalPoints: number;
  userPoints: number;
  selectedMethod: string;
  onMethodChange: (method: string) => void;
  onPaymentComplete: (paymentData: any) => void;
}

const PaymentMethods: React.FC<PaymentMethodsProps> = ({
  totalAmount,
  totalPoints,
  userPoints,
  selectedMethod,
  onMethodChange,
  onPaymentComplete
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentData, setPaymentData] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    upiId: '',
    walletProvider: ''
  });

  const paymentMethods = [
    {
      id: 'green_points',
      name: 'Green Points',
      icon: Coins,
      description: 'Use your earned Green Points',
      available: userPoints >= totalPoints,
      primary: true,
      color: 'text-green-600'
    },
    {
      id: 'upi',
      name: 'UPI',
      icon: Smartphone,
      description: 'Pay with UPI ID',
      available: true,
      primary: false,
      color: 'text-blue-600'
    },
    {
      id: 'card',
      name: 'Credit/Debit Card',
      icon: CreditCard,
      description: 'Visa, MasterCard, etc.',
      available: true,
      primary: false,
      color: 'text-purple-600'
    },
    {
      id: 'wallet',
      name: 'Digital Wallet',
      icon: Wallet,
      description: 'PayTM, PhonePe, GPay',
      available: true,
      primary: false,
      color: 'text-orange-600'
    }
  ];

  const handlePayment = async () => {
    setIsProcessing(true);
    
    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const paymentResult = {
        method: selectedMethod,
        amount: totalAmount,
        points: totalPoints,
        transactionId: `TXN_${Date.now()}`,
        status: 'completed',
        timestamp: new Date().toISOString()
      };
      
      onPaymentComplete(paymentResult);
    } catch (error) {
      console.error('Payment failed:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const renderPaymentForm = () => {
    switch (selectedMethod) {
      case 'green_points':
        return (
          <div className="space-y-4">
            <div className="p-4 bg-green-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Coins className="h-5 w-5 text-green-600" />
                <span className="font-medium text-green-800">Green Points Payment</span>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Total Points Required:</span>
                  <span className="font-semibold">{totalPoints}</span>
                </div>
                <div className="flex justify-between">
                  <span>Your Available Points:</span>
                  <span className="font-semibold">{userPoints}</span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span>Remaining Points:</span>
                  <span className="font-semibold text-green-600">
                    {userPoints - totalPoints}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span>Eco-friendly payment method</span>
            </div>
          </div>
        );
      
      case 'upi':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="upiId">UPI ID</Label>
              <Input
                id="upiId"
                placeholder="yourname@paytm"
                value={paymentData.upiId}
                onChange={(e) => setPaymentData({...paymentData, upiId: e.target.value})}
              />
            </div>
            <div className="text-sm text-gray-600">
              <p>Amount: ₹{totalAmount}</p>
            </div>
          </div>
        );
      
      case 'card':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="cardNumber">Card Number</Label>
              <Input
                id="cardNumber"
                placeholder="1234 5678 9012 3456"
                value={paymentData.cardNumber}
                onChange={(e) => setPaymentData({...paymentData, cardNumber: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="expiryDate">Expiry Date</Label>
                <Input
                  id="expiryDate"
                  placeholder="MM/YY"
                  value={paymentData.expiryDate}
                  onChange={(e) => setPaymentData({...paymentData, expiryDate: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="cvv">CVV</Label>
                <Input
                  id="cvv"
                  placeholder="123"
                  value={paymentData.cvv}
                  onChange={(e) => setPaymentData({...paymentData, cvv: e.target.value})}
                />
              </div>
            </div>
            <div className="text-sm text-gray-600">
              <p>Amount: ₹{totalAmount}</p>
            </div>
          </div>
        );
      
      case 'wallet':
        return (
          <div className="space-y-4">
            <div>
              <Label>Select Wallet Provider</Label>
              <RadioGroup 
                value={paymentData.walletProvider} 
                onValueChange={(value) => setPaymentData({...paymentData, walletProvider: value})}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="paytm" id="paytm" />
                  <Label htmlFor="paytm">PayTM</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="phonepe" id="phonepe" />
                  <Label htmlFor="phonepe">PhonePe</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="gpay" id="gpay" />
                  <Label htmlFor="gpay">Google Pay</Label>
                </div>
              </RadioGroup>
            </div>
            <div className="text-sm text-gray-600">
              <p>Amount: ₹{totalAmount}</p>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Payment Methods
        </CardTitle>
        <CardDescription>
          Choose your preferred payment method
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Payment Method Selection */}
        <RadioGroup value={selectedMethod} onValueChange={onMethodChange}>
          <div className="space-y-3">
            {paymentMethods.map((method) => {
              const Icon = method.icon;
              return (
                <div key={method.id} className="flex items-center space-x-2">
                  <RadioGroupItem 
                    value={method.id} 
                    id={method.id}
                    disabled={!method.available}
                  />
                  <Label 
                    htmlFor={method.id} 
                    className={`flex items-center gap-3 flex-1 cursor-pointer p-3 rounded-lg border ${
                      selectedMethod === method.id 
                        ? 'border-green-500 bg-green-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    } ${!method.available ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <Icon className={`h-5 w-5 ${method.color}`} />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{method.name}</span>
                        {method.primary && (
                          <Badge variant="secondary" className="bg-green-100 text-green-800">
                            Recommended
                          </Badge>
                        )}
                        {!method.available && (
                          <Badge variant="destructive">
                            Insufficient Points
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">{method.description}</p>
                    </div>
                  </Label>
                </div>
              );
            })}
          </div>
        </RadioGroup>

        {/* Payment Form */}
        {renderPaymentForm()}

        {/* Security Info */}
        <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
          <Lock className="h-4 w-4" />
          <span>Your payment information is secure and encrypted</span>
        </div>

        {/* Pay Button */}
        <Button
          onClick={handlePayment}
          disabled={isProcessing || !selectedMethod}
          className="w-full"
          size="lg"
        >
          {isProcessing ? 'Processing...' : `Pay ${selectedMethod === 'green_points' ? `${totalPoints} Points` : `₹${totalAmount}`}`}
        </Button>
      </CardContent>
    </Card>
  );
};

export default PaymentMethods;
