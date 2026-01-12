-- Fix overly permissive INSERT policies by adding proper constraints

-- Drop and recreate donations insert policy - require either authenticated user or valid email
DROP POLICY "Anyone can create donations" ON public.donations;
CREATE POLICY "Authenticated users can create donations"
    ON public.donations FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Anonymous donations with email"
    ON public.donations FOR INSERT
    TO anon
    WITH CHECK (user_id IS NULL AND donor_email IS NOT NULL);

-- Drop and recreate contact submissions insert policy - require name and email
DROP POLICY "Anyone can submit contact form" ON public.contact_submissions;
CREATE POLICY "Anyone can submit contact form with valid data"
    ON public.contact_submissions FOR INSERT
    WITH CHECK (name IS NOT NULL AND email IS NOT NULL AND message IS NOT NULL);

-- Drop and recreate activity log insert policy - only authenticated users
DROP POLICY "Anyone can create activity log entries" ON public.activity_log;
CREATE POLICY "Authenticated users can create activity log"
    ON public.activity_log FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id OR user_id IS NULL);