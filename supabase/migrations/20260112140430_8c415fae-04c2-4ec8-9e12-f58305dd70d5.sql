-- Add is_approved column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN is_approved boolean NOT NULL DEFAULT false;

-- Add approved_at timestamp
ALTER TABLE public.profiles 
ADD COLUMN approved_at timestamp with time zone;

-- Add approved_by to track who approved the user
ALTER TABLE public.profiles 
ADD COLUMN approved_by uuid;