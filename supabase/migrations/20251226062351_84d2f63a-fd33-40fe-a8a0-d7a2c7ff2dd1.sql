-- Add style_config JSONB column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS style_config JSONB DEFAULT '{
  "tone": "warm",
  "emojiFrequency": "moderate",
  "requiredKeywords": [],
  "forbiddenWords": [],
  "customPrompt": ""
}'::jsonb;