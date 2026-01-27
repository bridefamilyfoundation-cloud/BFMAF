-- Make the aid-request-images bucket private
UPDATE storage.buckets 
SET public = false 
WHERE id = 'aid-request-images';

-- Drop the old public access policy
DROP POLICY IF EXISTS "Aid request images are publicly accessible" ON storage.objects;

-- Create RLS policies for secure image access

-- Admins can view all images
CREATE POLICY "Admins can view all aid request images"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'aid-request-images' 
  AND public.has_role(auth.uid(), 'admin')
);

-- Authenticated users can upload images (for aid request submissions)
CREATE POLICY "Authenticated users can upload aid request images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'aid-request-images' 
  AND auth.uid() IS NOT NULL
);

-- Admins can delete images
CREATE POLICY "Admins can delete aid request images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'aid-request-images' 
  AND public.has_role(auth.uid(), 'admin')
);

-- Admins can update images
CREATE POLICY "Admins can update aid request images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'aid-request-images' 
  AND public.has_role(auth.uid(), 'admin')
);