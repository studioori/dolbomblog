-- Drop the existing check constraint and recreate with both 'free' and 'trial' included
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_plan_tier_check;

ALTER TABLE public.profiles 
ADD CONSTRAINT profiles_plan_tier_check 
CHECK (plan_tier IN ('free', 'trial', 'basic', 'premium'));