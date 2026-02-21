-- =====================================================
-- Add image_url field to success_stories table
-- =====================================================
-- Date: 2026-02-14
-- Purpose: Add image support for success stories
-- =====================================================

-- Add image_url column to success_stories table
ALTER TABLE public.success_stories 
ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Add comment to document the field
COMMENT ON COLUMN public.success_stories.image_url IS 'URL to patient/story image displayed on frontend';
