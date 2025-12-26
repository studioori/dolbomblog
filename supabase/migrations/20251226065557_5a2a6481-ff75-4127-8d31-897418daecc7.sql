-- Add new columns for advanced style configuration
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS style_reference_text TEXT,
ADD COLUMN IF NOT EXISTS intro_greeting TEXT,
ADD COLUMN IF NOT EXISTS outro_signature TEXT,
ADD COLUMN IF NOT EXISTS sentence_length TEXT DEFAULT 'short';