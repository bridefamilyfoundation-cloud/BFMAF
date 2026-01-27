-- Add admin response field to contact_submissions
ALTER TABLE public.contact_submissions 
ADD COLUMN admin_response TEXT,
ADD COLUMN responded_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN responded_by UUID;