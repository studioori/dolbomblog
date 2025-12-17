-- Create storage bucket for daily photos (public for temporary access)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'daily-photos',
  'daily-photos',
  true,
  5242880, -- 5MB limit per file
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/heic']
);

-- Allow anyone to upload to daily-photos bucket (temporary photos)
CREATE POLICY "Allow public upload to daily-photos"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'daily-photos');

-- Allow anyone to read from daily-photos bucket
CREATE POLICY "Allow public read from daily-photos"
ON storage.objects FOR SELECT
USING (bucket_id = 'daily-photos');

-- Allow anyone to delete from daily-photos bucket
CREATE POLICY "Allow public delete from daily-photos"
ON storage.objects FOR DELETE
USING (bucket_id = 'daily-photos');