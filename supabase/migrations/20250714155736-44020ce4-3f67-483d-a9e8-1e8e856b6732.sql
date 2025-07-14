
-- Create challenges table
CREATE TABLE public.challenges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  difficulty TEXT NOT NULL CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  points INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create challenge_completions table
CREATE TABLE public.challenge_completions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  challenge_id UUID NOT NULL REFERENCES public.challenges(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  proof_image_url TEXT,
  notes TEXT,
  completed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(challenge_id, user_id)
);

-- Enable RLS on challenges
ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;

-- Enable RLS on challenge_completions
ALTER TABLE public.challenge_completions ENABLE ROW LEVEL SECURITY;

-- Challenges are viewable by everyone
CREATE POLICY "Challenges are viewable by everyone" 
  ON public.challenges 
  FOR SELECT 
  USING (true);

-- Challenge completions are viewable by everyone
CREATE POLICY "Challenge completions are viewable by everyone" 
  ON public.challenge_completions 
  FOR SELECT 
  USING (true);

-- Users can create their own challenge completions
CREATE POLICY "Users can create their own challenge completions" 
  ON public.challenge_completions 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own challenge completions
CREATE POLICY "Users can update their own challenge completions" 
  ON public.challenge_completions 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Users can delete their own challenge completions
CREATE POLICY "Users can delete their own challenge completions" 
  ON public.challenge_completions 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Create trigger to update green points when challenge is completed
CREATE OR REPLACE FUNCTION public.update_green_points_on_challenge_completion()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Add points when challenge is completed
    UPDATE public.profiles 
    SET green_points = COALESCE(green_points, 0) + (
      SELECT points FROM public.challenges WHERE id = NEW.challenge_id
    )
    WHERE user_id = NEW.user_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    -- Subtract points when challenge completion is deleted
    UPDATE public.profiles 
    SET green_points = COALESCE(green_points, 0) - (
      SELECT points FROM public.challenges WHERE id = OLD.challenge_id
    )
    WHERE user_id = OLD.user_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

-- Create trigger
CREATE TRIGGER trigger_update_green_points_on_challenge_completion
  AFTER INSERT OR DELETE ON public.challenge_completions
  FOR EACH ROW EXECUTE FUNCTION public.update_green_points_on_challenge_completion();

-- Add updated_at triggers
CREATE TRIGGER update_challenges_updated_at
  BEFORE UPDATE ON public.challenges
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_challenge_completions_updated_at
  BEFORE UPDATE ON public.challenge_completions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert some sample challenges
INSERT INTO public.challenges (title, description, category, difficulty, points) VALUES
('Plant a Tree', 'Plant a tree in your local area and share a photo', 'tree_plantation', 'beginner', 50),
('Reduce Plastic Usage', 'Go plastic-free for a day and document your experience', 'plastic_management', 'intermediate', 75),
('Solar Panel Installation', 'Install solar panels in your home or community', 'renewable_energy', 'advanced', 200),
('Community Garden', 'Start or join a community garden project', 'organic_farming', 'intermediate', 100),
('Beach Cleanup', 'Organize or participate in a beach cleanup activity', 'waste_reduction', 'beginner', 60),
('Water Conservation', 'Implement water-saving techniques at home', 'water_conservation', 'beginner', 40),
('Wildlife Protection', 'Create a wildlife-friendly space in your area', 'wildlife_conservation', 'intermediate', 80),
('Green Transport', 'Use only eco-friendly transport for a week', 'green_transport', 'intermediate', 90),
('Zero Waste Week', 'Live zero waste for an entire week', 'zero_waste', 'advanced', 150),
('Organic Food Challenge', 'Eat only organic food for a month', 'organic_farming', 'advanced', 120),
('Energy Audit', 'Conduct an energy audit of your home', 'renewable_energy', 'beginner', 45),
('Composting Setup', 'Start composting at home or in your community', 'waste_reduction', 'beginner', 55),
('Air Quality Monitor', 'Monitor and improve air quality in your area', 'air_quality', 'intermediate', 85),
('Sustainable Fashion', 'Buy only sustainable clothing for 3 months', 'sustainable_fashion', 'advanced', 110),
('Green Building', 'Implement green building practices in a project', 'green_building', 'advanced', 180),
('Climate Action Campaign', 'Start a local climate action campaign', 'climate_action', 'advanced', 250),
('Biodiversity Survey', 'Conduct a biodiversity survey in your area', 'biodiversity', 'intermediate', 95),
('Ocean Cleanup', 'Participate in ocean cleanup initiatives', 'ocean_cleanup', 'intermediate', 105),
('Permaculture Garden', 'Design and create a permaculture garden', 'permaculture', 'advanced', 170),
('Forest Conservation', 'Join forest conservation efforts', 'forest_conservation', 'intermediate', 115),
('Green Technology Demo', 'Demonstrate green technology in your community', 'green_technology', 'advanced', 160),
('Environmental Justice', 'Advocate for environmental justice in your area', 'environmental_justice', 'advanced', 190),
('Carbon Footprint Reduction', 'Reduce your carbon footprint by 50%', 'carbon_footprint', 'advanced', 140),
('Eco Education Workshop', 'Organize an environmental education workshop', 'eco_education', 'intermediate', 88),
('Food Sustainability', 'Implement sustainable food practices', 'food_sustainability', 'intermediate', 92);
