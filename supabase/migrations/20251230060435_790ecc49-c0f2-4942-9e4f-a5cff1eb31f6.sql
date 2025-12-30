-- Add subscription_expires_at column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN subscription_expires_at TIMESTAMP WITH TIME ZONE;

-- Create coupons table
CREATE TABLE public.coupons (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  duration_months INTEGER NOT NULL,
  is_used BOOLEAN NOT NULL DEFAULT false,
  used_by UUID REFERENCES public.profiles(id),
  used_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES public.profiles(id)
);

-- Enable Row Level Security
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;

-- Admins can view all coupons
CREATE POLICY "Admins can view all coupons"
ON public.coupons
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Admins can create coupons
CREATE POLICY "Admins can create coupons"
ON public.coupons
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Admins can update coupons
CREATE POLICY "Admins can update coupons"
ON public.coupons
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Users can view unused coupons by code (for redemption check)
CREATE POLICY "Users can check coupon by code"
ON public.coupons
FOR SELECT
USING (auth.uid() IS NOT NULL);

-- Create index for faster code lookup
CREATE INDEX idx_coupons_code ON public.coupons(code);
CREATE INDEX idx_coupons_is_used ON public.coupons(is_used);