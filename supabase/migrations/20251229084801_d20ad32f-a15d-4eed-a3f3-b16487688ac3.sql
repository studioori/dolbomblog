-- Change default monthly_limit for new users from 10 to 15
ALTER TABLE public.profiles 
ALTER COLUMN monthly_limit SET DEFAULT 15;