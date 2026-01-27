-- Remove duplicate INSERT policy for storage
DROP POLICY IF EXISTS "Anyone can upload aid request images" ON storage.objects;