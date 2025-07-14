
-- Create shops table
CREATE TABLE public.shops (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  location TEXT NOT NULL,
  rating DECIMAL(2,1) DEFAULT 0.0,
  contact_info JSONB,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create products table
CREATE TABLE public.products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  shop_id UUID NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  price_in_points INTEGER NOT NULL DEFAULT 0,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on shops
ALTER TABLE public.shops ENABLE ROW LEVEL SECURITY;

-- Enable RLS on products
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Shops are viewable by everyone
CREATE POLICY "Shops are viewable by everyone" 
  ON public.shops 
  FOR SELECT 
  USING (true);

-- Products are viewable by everyone
CREATE POLICY "Products are viewable by everyone" 
  ON public.products 
  FOR SELECT 
  USING (true);

-- Add updated_at triggers
CREATE TRIGGER update_shops_updated_at
  BEFORE UPDATE ON public.shops
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample shops
INSERT INTO public.shops (name, description, category, location, rating, contact_info, image_url) VALUES
('GreenSeed Nursery', 'Premium organic seeds and saplings for sustainable gardening', 'seeds', 'Mumbai, Maharashtra', 4.8, '{"phone": "+91-9876543210", "email": "contact@greenseed.com"}', null),
('EcoFert Solutions', 'Organic fertilizers and soil amendments', 'fertilizers', 'Bangalore, Karnataka', 4.6, '{"phone": "+91-8765432109", "email": "info@ecofert.com"}', null),
('Terra Compost', 'High-quality compost and organic soil', 'soil', 'Pune, Maharashtra', 4.7, '{"phone": "+91-7654321098", "email": "sales@terracompost.com"}', null),
('Garden Tools Pro', 'Eco-friendly gardening tools and equipment', 'gardening', 'Delhi, Delhi', 4.5, '{"phone": "+91-6543210987", "email": "support@gardentools.com"}', null),
('Organic Haven', 'Complete organic farming solutions', 'seeds', 'Chennai, Tamil Nadu', 4.9, '{"phone": "+91-5432109876", "email": "help@organichaven.com"}', null),
('BioGrow Fertilizers', 'Natural and sustainable plant nutrition', 'fertilizers', 'Hyderabad, Telangana', 4.4, '{"phone": "+91-4321098765", "email": "contact@biogrow.com"}', null);

-- Insert sample products
INSERT INTO public.products (shop_id, name, description, category, price_in_points, image_url) VALUES
((SELECT id FROM public.shops WHERE name = 'GreenSeed Nursery'), 'Tomato Seeds (Heirloom)', 'Organic heirloom tomato seeds for home gardening', 'seeds', 25, null),
((SELECT id FROM public.shops WHERE name = 'GreenSeed Nursery'), 'Basil Saplings', 'Fresh basil saplings ready for transplanting', 'seeds', 35, null),
((SELECT id FROM public.shops WHERE name = 'GreenSeed Nursery'), 'Sunflower Seeds', 'Giant sunflower seeds for beautiful blooms', 'seeds', 20, null),
((SELECT id FROM public.shops WHERE name = 'EcoFert Solutions'), 'Organic Compost', '100% organic compost for healthy plant growth', 'fertilizers', 45, null),
((SELECT id FROM public.shops WHERE name = 'EcoFert Solutions'), 'Neem Cake Fertilizer', 'Natural neem cake for pest control and nutrition', 'fertilizers', 40, null),
((SELECT id FROM public.shops WHERE name = 'Terra Compost'), 'Premium Potting Soil', 'Nutrient-rich potting mix for containers', 'soil', 30, null),
((SELECT id FROM public.shops WHERE name = 'Terra Compost'), 'Vermicompost', 'High-quality worm compost for plants', 'soil', 35, null),
((SELECT id FROM public.shops WHERE name = 'Garden Tools Pro'), 'Bamboo Hand Trowel', 'Eco-friendly bamboo gardening trowel', 'gardening', 50, null),
((SELECT id FROM public.shops WHERE name = 'Garden Tools Pro'), 'Coconut Coir Pots', 'Biodegradable planting pots from coconut fiber', 'gardening', 25, null),
((SELECT id FROM public.shops WHERE name = 'Organic Haven'), 'Herb Garden Kit', 'Complete kit for growing herbs at home', 'seeds', 75, null),
((SELECT id FROM public.shops WHERE name = 'Organic Haven'), 'Microgreen Seeds Mix', 'Assorted microgreen seeds for nutrition', 'seeds', 30, null),
((SELECT id FROM public.shops WHERE name = 'BioGrow Fertilizers'), 'Seaweed Extract', 'Natural seaweed fertilizer for all plants', 'fertilizers', 55, null);
