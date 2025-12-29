-- Change default plan_tier from 'free' to 'trial' for new users
ALTER TABLE public.profiles 
ALTER COLUMN plan_tier SET DEFAULT 'trial';