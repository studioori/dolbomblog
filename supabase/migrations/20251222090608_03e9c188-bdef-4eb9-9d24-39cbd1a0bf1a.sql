-- Create generated_posts table for 24h temporary storage
CREATE TABLE public.generated_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  content TEXT NOT NULL,
  image_paths TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.generated_posts ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access (anyone can view recent posts)
CREATE POLICY "Anyone can view generated posts" 
ON public.generated_posts 
FOR SELECT 
USING (true);

-- Create policy for public insert (anyone can create posts)
CREATE POLICY "Anyone can create posts" 
ON public.generated_posts 
FOR INSERT 
WITH CHECK (true);

-- Create policy for public delete (for cleanup function)
CREATE POLICY "Anyone can delete posts" 
ON public.generated_posts 
FOR DELETE 
USING (true);

-- Create index for faster cleanup queries
CREATE INDEX idx_generated_posts_created_at ON public.generated_posts(created_at);

-- Enable realtime for this table
ALTER PUBLICATION supabase_realtime ADD TABLE public.generated_posts;