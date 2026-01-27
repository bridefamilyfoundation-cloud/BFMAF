-- Create success_stories table for managing featured cases
CREATE TABLE public.success_stories (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    patient_name TEXT NOT NULL,
    condition TEXT NOT NULL,
    treatment TEXT NOT NULL,
    location TEXT,
    status TEXT NOT NULL DEFAULT 'ongoing',
    story_content TEXT NOT NULL,
    featured_quote TEXT,
    is_featured BOOLEAN NOT NULL DEFAULT false,
    is_published BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create treatment_updates table for timeline entries
CREATE TABLE public.treatment_updates (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    story_id UUID NOT NULL REFERENCES public.success_stories(id) ON DELETE CASCADE,
    update_date TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create testimonials table
CREATE TABLE public.testimonials (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    story_id UUID REFERENCES public.success_stories(id) ON DELETE CASCADE,
    quote TEXT NOT NULL,
    author_name TEXT NOT NULL,
    author_role TEXT NOT NULL,
    is_published BOOLEAN NOT NULL DEFAULT true,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.success_stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.treatment_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;

-- RLS policies for success_stories
CREATE POLICY "Anyone can view published success stories"
ON public.success_stories
FOR SELECT
USING (is_published = true);

CREATE POLICY "Admins can manage all success stories"
ON public.success_stories
FOR ALL
USING (has_role(auth.uid(), 'admin'));

-- RLS policies for treatment_updates
CREATE POLICY "Anyone can view treatment updates for published stories"
ON public.treatment_updates
FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.success_stories 
        WHERE id = treatment_updates.story_id AND is_published = true
    )
);

CREATE POLICY "Admins can manage all treatment updates"
ON public.treatment_updates
FOR ALL
USING (has_role(auth.uid(), 'admin'));

-- RLS policies for testimonials
CREATE POLICY "Anyone can view published testimonials"
ON public.testimonials
FOR SELECT
USING (is_published = true);

CREATE POLICY "Admins can manage all testimonials"
ON public.testimonials
FOR ALL
USING (has_role(auth.uid(), 'admin'));

-- Create trigger for updated_at on success_stories
CREATE TRIGGER update_success_stories_updated_at
BEFORE UPDATE ON public.success_stories
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();