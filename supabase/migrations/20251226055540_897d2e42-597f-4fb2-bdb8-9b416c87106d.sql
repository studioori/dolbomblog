-- Add max_image_count column to profiles table with default value 5
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS max_image_count INTEGER NOT NULL DEFAULT 5;