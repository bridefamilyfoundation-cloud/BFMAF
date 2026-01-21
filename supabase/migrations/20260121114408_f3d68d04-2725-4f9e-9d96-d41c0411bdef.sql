-- Drop the overly permissive policy and create a more secure one
DROP POLICY IF EXISTS "Users can unsubscribe by email" ON public.newsletter_subscribers;

-- Create a public unsubscribe endpoint that only allows setting is_active to false
-- This will be handled via edge function with proper validation instead