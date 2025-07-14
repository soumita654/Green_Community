
-- Create enum for community categories
CREATE TYPE community_category AS ENUM (
  'plastic_management',
  'tree_plantation', 
  'natural_awareness',
  'waste_reduction',
  'sustainable_living',
  'eco_innovation',
  'wildlife_conservation',
  'water_conservation',
  'renewable_energy',
  'organic_farming',
  'climate_action',
  'biodiversity',
  'green_transport',
  'eco_education',
  'sustainable_fashion',
  'green_building',
  'food_sustainability',
  'ocean_cleanup',
  'air_quality',
  'zero_waste',
  'permaculture',
  'forest_conservation',
  'green_technology',
  'environmental_justice',
  'carbon_footprint'
);

-- Create challenges table
CREATE TABLE public.challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  points INTEGER NOT NULL DEFAULT 10,
  category TEXT NOT NULL,
  difficulty TEXT NOT NULL DEFAULT 'beginner',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create challenge completions table
CREATE TABLE public.challenge_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  challenge_id UUID REFERENCES public.challenges(id) ON DELETE CASCADE NOT NULL,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  proof_image_url TEXT,
  notes TEXT,
  UNIQUE(user_id, challenge_id)
);

-- Create shops table
CREATE TABLE public.shops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  location TEXT NOT NULL,
  category TEXT NOT NULL,
  contact_info JSONB,
  rating DECIMAL(3,2) DEFAULT 4.5,
  image_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create products table
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id UUID REFERENCES public.shops(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  price_in_points INTEGER NOT NULL,
  category TEXT NOT NULL,
  image_url TEXT,
  stock_quantity INTEGER DEFAULT 100,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create orders table
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  total_points INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  shipping_address JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenge_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for challenges
CREATE POLICY "Challenges are viewable by everyone" ON public.challenges
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can complete challenges" ON public.challenge_completions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their challenge completions" ON public.challenge_completions
  FOR SELECT USING (auth.uid() = user_id OR true);

-- Create RLS policies for shops and products
CREATE POLICY "Shops are viewable by everyone" ON public.shops
  FOR SELECT USING (true);

CREATE POLICY "Products are viewable by everyone" ON public.products
  FOR SELECT USING (true);

-- Create RLS policies for orders
CREATE POLICY "Users can create their own orders" ON public.orders
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own orders" ON public.orders
  FOR SELECT USING (auth.uid() = user_id);

-- Create trigger for updating challenge completions to award points
CREATE OR REPLACE FUNCTION public.award_points_for_challenge()
RETURNS TRIGGER AS $$
BEGIN
  -- Update user's green points when they complete a challenge
  UPDATE public.profiles 
  SET green_points = green_points + (
    SELECT points FROM public.challenges WHERE id = NEW.challenge_id
  )
  WHERE user_id = NEW.user_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER award_points_trigger
  AFTER INSERT ON public.challenge_completions
  FOR EACH ROW EXECUTE FUNCTION public.award_points_for_challenge();

-- Insert sample challenges
INSERT INTO public.challenges (title, description, points, category, difficulty) VALUES
('Plant a Tree', 'Plant a tree in your local area and upload a photo', 50, 'tree_plantation', 'beginner'),
('Plastic-Free Day', 'Go an entire day without using single-use plastic', 30, 'plastic_management', 'intermediate'),
('Create Compost', 'Start a compost bin at home using organic waste', 40, 'waste_reduction', 'beginner'),
('Solar Panel Installation', 'Install solar panels or visit a solar farm', 100, 'renewable_energy', 'advanced'),
('Grow Organic Vegetables', 'Start an organic vegetable garden', 60, 'organic_farming', 'intermediate'),
('Beach Cleanup', 'Organize or participate in a beach cleanup drive', 70, 'ocean_cleanup', 'intermediate'),
('Water Conservation', 'Install water-saving devices in your home', 45, 'water_conservation', 'beginner'),
('Bike to Work Week', 'Use bicycle for commuting for a whole week', 35, 'green_transport', 'beginner'),
('Zero Waste Challenge', 'Produce zero waste for 24 hours', 55, 'zero_waste', 'advanced'),
('Wildlife Photography', 'Document local wildlife and share your photos', 25, 'wildlife_conservation', 'beginner'),
('Eco-Friendly Fashion', 'Buy only sustainable clothing for a month', 40, 'sustainable_fashion', 'intermediate'),
('Green Building Tour', 'Visit and document green building practices', 30, 'green_building', 'beginner'),
('Local Food Challenge', 'Eat only locally sourced food for a week', 45, 'food_sustainability', 'intermediate'),
('Air Quality Monitoring', 'Monitor and report local air quality', 35, 'air_quality', 'beginner'),
('Permaculture Garden', 'Design and implement a permaculture system', 80, 'permaculture', 'advanced'),
('Forest Conservation', 'Participate in forest conservation activities', 65, 'forest_conservation', 'intermediate'),
('Green Tech Innovation', 'Create or use green technology solutions', 90, 'green_technology', 'advanced'),
('Climate Action Rally', 'Organize or attend climate action events', 50, 'climate_action', 'intermediate'),
('Biodiversity Survey', 'Conduct a local biodiversity assessment', 55, 'biodiversity', 'intermediate'),
('Environmental Justice', 'Advocate for environmental justice in your community', 60, 'environmental_justice', 'advanced'),
('Carbon Footprint Tracking', 'Track and reduce your carbon footprint for a month', 40, 'carbon_footprint', 'intermediate'),
('Sustainable Living Workshop', 'Attend or organize sustainable living workshops', 35, 'sustainable_living', 'beginner'),
('Eco Innovation Project', 'Develop an innovative environmental solution', 100, 'eco_innovation', 'advanced'),
('Environmental Education', 'Teach others about environmental conservation', 45, 'eco_education', 'intermediate'),
('Natural Awareness Walk', 'Lead a nature awareness walk in your community', 30, 'natural_awareness', 'beginner');

-- Insert sample shops
INSERT INTO public.shops (name, description, location, category, contact_info, image_url) VALUES
('GreenSeeds Mumbai', 'Premium organic seeds and saplings', 'Mumbai, Maharashtra', 'seeds', '{"phone": "+91-9876543210", "email": "mumbai@greenseeds.com"}', 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400'),
('EcoFarm Delhi', 'Organic fertilizers and soil amendments', 'Delhi, NCR', 'fertilizers', '{"phone": "+91-9876543211", "email": "delhi@ecofarm.com"}', 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400'),
('Nature''s Bounty Bangalore', 'Complete gardening solutions', 'Bangalore, Karnataka', 'gardening', '{"phone": "+91-9876543212", "email": "bangalore@naturesbounty.com"}', 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400'),
('Green Thumb Chennai', 'Specialty seeds and garden tools', 'Chennai, Tamil Nadu', 'seeds', '{"phone": "+91-9876543213", "email": "chennai@greenthumb.com"}', 'https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?w=400'),
('Organic Soil Pune', 'Premium potting soil and compost', 'Pune, Maharashtra', 'soil', '{"phone": "+91-9876543214", "email": "pune@organicsoil.com"}', 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400'),
('EcoGrow Hyderabad', 'Sustainable farming supplies', 'Hyderabad, Telangana', 'fertilizers', '{"phone": "+91-9876543215", "email": "hyderabad@ecogrow.com"}', 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400'),
('Plant Paradise Kolkata', 'Exotic plants and seeds', 'Kolkata, West Bengal', 'seeds', '{"phone": "+91-9876543216", "email": "kolkata@plantparadise.com"}', 'https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?w=400'),
('Green Gardens Ahmedabad', 'Complete garden center', 'Ahmedabad, Gujarat', 'gardening', '{"phone": "+91-9876543217", "email": "ahmedabad@greengardens.com"}', 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400'),
('Eco Solutions Jaipur', 'Organic farming solutions', 'Jaipur, Rajasthan', 'fertilizers', '{"phone": "+91-9876543218", "email": "jaipur@ecosolutions.com"}', 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400'),
('Nature Store Lucknow', 'Seeds and gardening supplies', 'Lucknow, Uttar Pradesh', 'seeds', '{"phone": "+91-9876543219", "email": "lucknow@naturestore.com"}', 'https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?w=400'),
('Green Life Chandigarh', 'Sustainable living products', 'Chandigarh, Punjab', 'gardening', '{"phone": "+91-9876543220", "email": "chandigarh@greenlife.com"}', 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400'),
('Eco Mart Bhopal', 'Eco-friendly garden supplies', 'Bhopal, Madhya Pradesh', 'soil', '{"phone": "+91-9876543221", "email": "bhopal@ecomart.com"}', 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400'),
('Organic World Kochi', 'Premium organic products', 'Kochi, Kerala', 'fertilizers', '{"phone": "+91-9876543222", "email": "kochi@organicworld.com"}', 'https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?w=400'),
('Plant Zone Guwahati', 'Northeast specialty plants', 'Guwahati, Assam', 'seeds', '{"phone": "+91-9876543223", "email": "guwahati@plantzone.com"}', 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400'),
('Green Valley Dehradun', 'Hill station gardening experts', 'Dehradun, Uttarakhand', 'gardening', '{"phone": "+91-9876543224", "email": "dehradun@greenvalley.com"}', 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400'),
('Eco Farm Indore', 'Sustainable agriculture supplies', 'Indore, Madhya Pradesh', 'fertilizers', '{"phone": "+91-9876543225", "email": "indore@ecofarm.com"}', 'https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?w=400'),
('Nature''s Gift Nagpur', 'Complete gardening solutions', 'Nagpur, Maharashtra', 'soil', '{"phone": "+91-9876543226", "email": "nagpur@naturesgift.com"}', 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400'),
('Green Thumb Vadodara', 'Garden center and nursery', 'Vadodara, Gujarat', 'seeds', '{"phone": "+91-9876543227", "email": "vadodara@greenthumb.com"}', 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400'),
('Eco Garden Coimbatore', 'South Indian gardening specialists', 'Coimbatore, Tamil Nadu', 'gardening', '{"phone": "+91-9876543228", "email": "coimbatore@ecogarden.com"}', 'https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?w=400'),
('Plant World Visakhapatnam', 'Coastal gardening solutions', 'Visakhapatnam, Andhra Pradesh', 'fertilizers', '{"phone": "+91-9876543229", "email": "vizag@plantworld.com"}', 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400'),
('Green Haven Mangalore', 'Tropical plants and supplies', 'Mangalore, Karnataka', 'seeds', '{"phone": "+91-9876543230", "email": "mangalore@greenhaven.com"}', 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400'),
('Organic Hub Thiruvananthapuram', 'Kerala organic specialists', 'Thiruvananthapuram, Kerala', 'soil', '{"phone": "+91-9876543231", "email": "tvm@organichub.com"}', 'https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?w=400'),
('Nature Care Patna', 'Bihar gardening solutions', 'Patna, Bihar', 'gardening', '{"phone": "+91-9876543232", "email": "patna@naturecare.com"}', 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400'),
('Eco Store Raipur', 'Central India garden center', 'Raipur, Chhattisgarh', 'fertilizers', '{"phone": "+91-9876543233", "email": "raipur@ecostore.com"}', 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400'),
('Green Paradise Ranchi', 'Jharkhand specialty plants', 'Ranchi, Jharkhand', 'seeds', '{"phone": "+91-9876543234", "email": "ranchi@greenparadise.com"}', 'https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?w=400');

-- Insert sample products
INSERT INTO public.products (shop_id, name, description, price_in_points, category, image_url) VALUES
((SELECT id FROM public.shops WHERE name = 'GreenSeeds Mumbai'), 'Tomato Seeds Pack', 'Organic heirloom tomato seeds', 25, 'vegetable_seeds', 'https://images.unsplash.com/photo-1592841200221-21e2deb27c46?w=300'),
((SELECT id FROM public.shops WHERE name = 'GreenSeeds Mumbai'), 'Herb Garden Kit', 'Complete herb garden starter kit', 75, 'seed_kits', 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=300'),
((SELECT id FROM public.shops WHERE name = 'EcoFarm Delhi'), 'Organic Compost', 'Premium organic compost fertilizer', 40, 'fertilizers', 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=300'),
((SELECT id FROM public.shops WHERE name = 'EcoFarm Delhi'), 'Bio NPK Fertilizer', 'Organic NPK fertilizer blend', 60, 'fertilizers', 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=300'),
((SELECT id FROM public.shops WHERE name = 'Nature''s Bounty Bangalore'), 'Potting Soil Mix', 'Premium potting soil for containers', 35, 'soil', 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=300'),
((SELECT id FROM public.shops WHERE name = 'Nature''s Bounty Bangalore'), 'Garden Tool Set', 'Complete gardening tool kit', 150, 'tools', 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=300'),
((SELECT id FROM public.shops WHERE name = 'Green Thumb Chennai'), 'Chili Seeds Variety', 'Assorted chili pepper seeds', 30, 'vegetable_seeds', 'https://images.unsplash.com/photo-1583453904187-b5c2e45b7b20?w=300'),
((SELECT id FROM public.shops WHERE name = 'Green Thumb Chennai'), 'Flower Seeds Mix', 'Colorful flower seeds collection', 20, 'flower_seeds', 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=300'),
((SELECT id FROM public.shops WHERE name = 'Organic Soil Pune'), 'Vermicompost', 'Premium worm castings fertilizer', 45, 'fertilizers', 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=300'),
((SELECT id FROM public.shops WHERE name = 'Organic Soil Pune'), 'Coco Peat Blocks', 'Compressed coconut coir blocks', 25, 'soil', 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=300');

-- Create triggers for updated_at columns
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_challenges_updated_at BEFORE UPDATE ON public.challenges
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_shops_updated_at BEFORE UPDATE ON public.shops
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
