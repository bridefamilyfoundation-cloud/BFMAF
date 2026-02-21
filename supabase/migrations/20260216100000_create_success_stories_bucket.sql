-- =====================================================
-- Create success-stories storage bucket
-- =====================================================
-- Date: 2026-02-16
-- Purpose: Create storage bucket for success story images
-- =====================================================

-- Create the storage bucket for success stories (PUBLIC bucket)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'success-stories', 
  'success-stories', 
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

-- Drop existing policies if they exist (to allow re-running migration)
DROP POLICY IF EXISTS "Public can view success story images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload success story images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update success story images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete success story images" ON storage.objects;

-- Allow ANYONE to view images (public read access)
CREATE POLICY "Public can view success story images"
ON storage.objects FOR SELECT
USING (bucket_id = 'success-stories');

-- Allow authenticated users to upload images
CREATE POLICY "Authenticated users can upload success story images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'success-stories' AND
  auth.uid() IS NOT NULL
);

-- Allow authenticated users to update their uploads
CREATE POLICY "Authenticated users can update success story images"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'success-stories' AND
  auth.uid() IS NOT NULL
);

-- Allow authenticated users to delete images
CREATE POLICY "Authenticated users can delete success story images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'success-stories' AND
  auth.uid() IS NOT NULL
);
