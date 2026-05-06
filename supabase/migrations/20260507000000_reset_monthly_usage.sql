-- Create function to reset monthly usage for all profiles
-- Called by Vercel Cron on the 1st of each month
CREATE OR REPLACE FUNCTION public.reset_monthly_usage()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.profiles
  SET current_usage = 0, updated_at = now()
  WHERE current_usage > 0;
  
  RETURN TRUE;
END;
$$;
