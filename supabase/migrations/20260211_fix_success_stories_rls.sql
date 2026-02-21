-- Fix for success_stories RLS policies type error
-- This script drops the existing policies and recreates them with proper type casting

-- Drop existing policies
DROP POLICY IF EXISTS "Admins can manage all success stories" ON public.success_stories;
DROP POLICY IF EXISTS "Admins can manage all treatment updates" ON public.treatment_updates;
DROP POLICY IF EXISTS "Admins can manage all testimonials" ON public.testimonials;

-- Recreate policies with proper type casting
CREATE POLICY "Admins can manage all success stories"
ON public.success_stories
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can manage all treatment updates"
ON public.treatment_updates
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can manage all testimonials"
ON public.testimonials
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));
