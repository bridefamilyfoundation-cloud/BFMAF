-- Create storage bucket for aid request images
INSERT INTO storage.buckets (id, name, public) VALUES ('aid-request-images', 'aid-request-images', true);

-- Allow anyone to upload images to the bucket
CREATE POLICY "Anyone can upload aid request images"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'aid-request-images');

-- Allow public read access to aid request images
CREATE POLICY "Aid request images are publicly accessible"
ON storage.objects
FOR SELECT
USING (bucket_id = 'aid-request-images');