# Nature Verse Connect - Enhanced E-commerce System

## Overview

Nature Verse Connect is an eco-friendly community platform that now includes a comprehensive e-commerce system for green products. Users can earn Green Points through eco-challenges and use them to purchase sustainable products from verified green shops.

## New Features Added

### 🛒 E-commerce System

#### Shopping Cart
- Add products to cart with quantity selection
- View cart items with product details
- Update quantities or remove items
- Real-time cart total calculation
- Green Points balance checking

#### Checkout Process
- Comprehensive checkout form with shipping address
- Multiple payment method support (Green Points, UPI, Cards, Digital Wallets)
- Order confirmation and processing
- Automatic Green Points deduction

#### Order Management
- Complete order history view
- Order tracking with status updates
- Detailed order information including items, shipping, and payment
- Order status progression (Pending → Confirmed → Processing → Shipped → Delivered)

#### Payment System
- Primary payment method: Green Points (eco-friendly)
- Alternative payment methods: UPI, Credit/Debit Cards, Digital Wallets
- Secure payment processing with transaction IDs
- Payment status tracking

### 🏪 Shop Management

#### Product Management
- Add, edit, and delete products
- Product categorization
- Green Points pricing system
- Image upload support
- Inventory tracking

#### Shop Analytics
- Sales dashboard with key metrics
- Order tracking and statistics
- Top products analysis
- Revenue and points earned tracking
- Monthly performance reports

### 🗄️ Database Schema

#### New Tables Added:

1. **orders**
   - Order management with user details
   - Shipping address and order notes
   - Status tracking and timestamps

2. **order_items**
   - Individual order line items
   - Product quantities and pricing
   - Links orders to products

3. **payments**
   - Payment method tracking
   - Transaction IDs and status
   - Points and amount tracking

4. **shopping_cart**
   - Persistent cart storage
   - User-specific cart management
   - Product quantity tracking

### 🔐 Security Features

- Row Level Security (RLS) enabled on all tables
- User-specific data access policies
- Secure payment processing
- Protected routes and operations

## File Structure

```
src/
├── components/
│   └── marketplace/
│       ├── AddToCart.tsx          # Add to cart functionality
│       ├── Checkout.tsx           # Checkout process component
│       ├── OrderTracking.tsx      # Order status tracking
│       ├── PaymentMethods.tsx     # Payment processing
│       └── ShoppingCart.tsx       # Cart management
├── pages/
│   ├── Orders.tsx                 # Order history page
│   ├── ProductManagement.tsx      # Shop owner product management
│   └── ShopAnalytics.tsx          # Shop analytics dashboard
└── supabase/
    └── migrations/
        └── 20250715050000_create_orders_and_payments.sql
```

## Usage Guide

### For Customers:

1. **Browse Products**: Visit the marketplace to see available eco-friendly products
2. **Add to Cart**: Select products and add them to your cart
3. **Checkout**: Complete the purchase using Green Points or other payment methods
4. **Track Orders**: View order history and track delivery status

### For Shop Owners:

1. **Manage Products**: Add and update product listings
2. **Track Sales**: Monitor orders and revenue through the analytics dashboard
3. **Process Orders**: Update order status as they progress

### Green Points System:

- Earn points by completing eco-challenges
- Use points to purchase products (1 point = eco-friendly currency)
- Points are automatically deducted on successful purchases
- View remaining points balance in the marketplace

## Technical Implementation

### Frontend Components:
- React with TypeScript
- Shadcn/ui components for consistent design
- React Query for data fetching and caching
- React Hook Form for form management
- Responsive design with Tailwind CSS

### Backend Integration:
- Supabase for database and authentication
- Real-time data synchronization
- Row Level Security for data protection
- Automated database triggers for timestamps

### Payment Integration:
- Green Points as primary eco-friendly payment method
- Prepared for integration with Indian payment gateways (UPI, Cards, Wallets)
- Secure transaction processing
- Payment status tracking

## Installation and Setup

1. **Database Migration**: Run the provided SQL migration to create the new tables
2. **Environment Setup**: Ensure Supabase is properly configured
3. **Dependencies**: All required packages are already included in package.json
4. **Development**: Run `npm run dev` to start the development server

## Future Enhancements

- Real payment gateway integration
- Inventory management system
- Shop owner verification process
- Advanced analytics and reporting
- Mobile app support
- Multi-language support
- Carbon footprint tracking for purchases

## Green Impact

This e-commerce system promotes sustainable living by:
- Incentivizing eco-friendly purchases through Green Points
- Supporting local green businesses
- Encouraging sustainable product choices
- Reducing environmental impact through conscious consumption

## Support

For technical support or feature requests, please refer to the project documentation or contact the development team.

---

*Building a sustainable future, one purchase at a time! 🌱*
