-- Add region column to profiles table
ALTER TABLE public.profiles
ADD COLUMN region text DEFAULT '';

-- Create index for region column
CREATE INDEX IF NOT EXISTS idx_profiles_region ON public.profiles(region);