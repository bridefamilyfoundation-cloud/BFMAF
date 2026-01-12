-- Create a table for aid requests (cases submitted by users for admin approval)
CREATE TABLE public.aid_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'General',
  goal_amount NUMERIC NOT NULL DEFAULT 0,
  contact_name TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  contact_phone TEXT,
  location TEXT,
  urgency TEXT NOT NULL DEFAULT 'medium',
  image_urls TEXT[] DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'pending',
  admin_notes TEXT,
  reviewed_by UUID,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.aid_requests ENABLE ROW LEVEL SECURITY;

-- Users can submit aid requests
CREATE POLICY "Anyone can submit aid requests"
ON public.aid_requests
FOR INSERT
WITH CHECK (
  contact_name IS NOT NULL AND 
  contact_email IS NOT NULL AND 
  title IS NOT NULL AND 
  description IS NOT NULL
);

-- Users can view their own aid requests
CREATE POLICY "Users can view their own aid requests"
ON public.aid_requests
FOR SELECT
USING (auth.uid() = user_id);

-- Admins can view all aid requests
CREATE POLICY "Admins can view all aid requests"
ON public.aid_requests
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Admins can update aid requests (approve/reject)
CREATE POLICY "Admins can update aid requests"
ON public.aid_requests
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Admins can delete aid requests
CREATE POLICY "Admins can delete aid requests"
ON public.aid_requests
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_aid_requests_updated_at
BEFORE UPDATE ON public.aid_requests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();