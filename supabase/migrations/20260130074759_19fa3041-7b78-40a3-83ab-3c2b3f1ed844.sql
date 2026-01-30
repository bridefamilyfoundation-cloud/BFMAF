-- ============================================================================
-- COMPREHENSIVE BACKEND UPDATE FOR LIVE DATA FEED
-- Created: 2026-01-30
-- Purpose: Ensure all tables have proper RLS policies for live data access
--          and add missing indexes for performance
-- ============================================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- 1. UPDATE PROFILES TABLE - Ensure all admins can view all profiles
-- ============================================================================

-- Drop existing restrictive policy if exists
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;

-- Create comprehensive admin view policy
CREATE POLICY "Admins can view all profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.user_roles
        WHERE user_roles.user_id = auth.uid()
        AND user_roles.role = 'admin'
    )
);

-- Ensure admins can delete profiles if needed
DROP POLICY IF EXISTS "Admins can delete profiles" ON public.profiles;
CREATE POLICY "Admins can delete profiles"
ON public.profiles
FOR DELETE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.user_roles
        WHERE user_roles.user_id = auth.uid()
        AND user_roles.role = 'admin'
    )
);

-- ============================================================================
-- 2. UPDATE DONATIONS TABLE - Ensure admins can manage all donations
-- ============================================================================

-- Allow admins to update donations (for corrections)
DROP POLICY IF EXISTS "Admins can update donations" ON public.donations;
CREATE POLICY "Admins can update donations"
ON public.donations
FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.user_roles
        WHERE user_roles.user_id = auth.uid()
        AND user_roles.role = 'admin'
    )
);

-- Allow admins to delete donations if needed
DROP POLICY IF EXISTS "Admins can delete donations" ON public.donations;
CREATE POLICY "Admins can delete donations"
ON public.donations
FOR DELETE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.user_roles
        WHERE user_roles.user_id = auth.uid()
        AND user_roles.role = 'admin'
    )
);

-- ============================================================================
-- 3. UPDATE CAUSES TABLE - Ensure admins can view inactive causes
-- ============================================================================

-- Drop the restrictive public policy
DROP POLICY IF EXISTS "Anyone can view active causes" ON public.causes;

-- Create new policy that allows public to view active, admins to view all
CREATE POLICY "Public can view active causes"
ON public.causes
FOR SELECT
USING (is_active = true OR (
    EXISTS (
        SELECT 1 FROM public.user_roles
        WHERE user_roles.user_id = auth.uid()
        AND user_roles.role = 'admin'
    )
));

-- ============================================================================
-- 4. UPDATE CONTACT SUBMISSIONS - Allow admins to delete
-- ============================================================================

DROP POLICY IF EXISTS "Admins can delete contact submissions" ON public.contact_submissions;
CREATE POLICY "Admins can delete contact submissions"
ON public.contact_submissions
FOR DELETE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.user_roles
        WHERE user_roles.user_id = auth.uid()
        AND user_roles.role = 'admin'
    )
);

-- ============================================================================
-- 5. ADD PERFORMANCE INDEXES
-- ============================================================================

-- Profiles indexes
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_is_approved ON public.profiles(is_approved);
CREATE INDEX IF NOT EXISTS idx_profiles_created_at ON public.profiles(created_at DESC);

-- User roles indexes
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON public.user_roles(role);

-- Causes indexes
CREATE INDEX IF NOT EXISTS idx_causes_is_active ON public.causes(is_active);
CREATE INDEX IF NOT EXISTS idx_causes_created_at ON public.causes(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_causes_category ON public.causes(category);

-- Donations indexes
CREATE INDEX IF NOT EXISTS idx_donations_user_id ON public.donations(user_id);
CREATE INDEX IF NOT EXISTS idx_donations_cause_id ON public.donations(cause_id);
CREATE INDEX IF NOT EXISTS idx_donations_created_at ON public.donations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_donations_status ON public.donations(status);

-- Aid requests indexes
CREATE INDEX IF NOT EXISTS idx_aid_requests_status ON public.aid_requests(status);
CREATE INDEX IF NOT EXISTS idx_aid_requests_user_id ON public.aid_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_aid_requests_created_at ON public.aid_requests(created_at DESC);

-- Contact submissions indexes
CREATE INDEX IF NOT EXISTS idx_contact_submissions_is_read ON public.contact_submissions(is_read);
CREATE INDEX IF NOT EXISTS idx_contact_submissions_created_at ON public.contact_submissions(created_at DESC);

-- Site settings indexes
CREATE INDEX IF NOT EXISTS idx_site_settings_key ON public.site_settings(key);

-- Success stories indexes
CREATE INDEX IF NOT EXISTS idx_success_stories_is_published ON public.success_stories(is_published);
CREATE INDEX IF NOT EXISTS idx_success_stories_is_featured ON public.success_stories(is_featured);
CREATE INDEX IF NOT EXISTS idx_success_stories_created_at ON public.success_stories(created_at DESC);

-- Treatment updates indexes
CREATE INDEX IF NOT EXISTS idx_treatment_updates_story_id ON public.treatment_updates(story_id);
CREATE INDEX IF NOT EXISTS idx_treatment_updates_sort_order ON public.treatment_updates(sort_order);

-- Testimonials indexes
CREATE INDEX IF NOT EXISTS idx_testimonials_story_id ON public.testimonials(story_id);
CREATE INDEX IF NOT EXISTS idx_testimonials_is_published ON public.testimonials(is_published);

-- Activity log indexes
CREATE INDEX IF NOT EXISTS idx_activity_log_user_id ON public.activity_log(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_created_at ON public.activity_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_log_action ON public.activity_log(action);

-- ============================================================================
-- 6. CREATE HELPER VIEWS FOR ADMIN DASHBOARD
-- ============================================================================

-- View for dashboard statistics
CREATE OR REPLACE VIEW admin_dashboard_stats AS
SELECT
    (SELECT COUNT(*) FROM public.donations) as total_donations_count,
    (SELECT COALESCE(SUM(amount), 0) FROM public.donations WHERE status = 'completed') as total_donations_amount,
    (SELECT COUNT(DISTINCT COALESCE(user_id::text, donor_email)) FROM public.donations) as unique_donors,
    (SELECT COUNT(*) FROM public.causes WHERE is_active = true) as active_causes,
    (SELECT COUNT(*) FROM public.aid_requests WHERE status = 'pending') as pending_aid_requests,
    (SELECT COUNT(*) FROM public.contact_submissions WHERE is_read = false) as unread_messages,
    (SELECT COUNT(*) FROM public.profiles WHERE is_approved = false) as pending_users,
    (SELECT COUNT(*) FROM public.newsletter_subscribers WHERE is_active = true) as active_subscribers;

-- Grant access to authenticated users (admins will check via RLS)
GRANT SELECT ON admin_dashboard_stats TO authenticated;

-- View for recent activity
CREATE OR REPLACE VIEW recent_activity AS
SELECT
    'donation' as activity_type,
    d.id,
    COALESCE(p.first_name || ' ' || p.last_name, d.donor_name, 'Anonymous') as actor,
    'donated ₦' || d.amount::text as action,
    c.title as target,
    d.created_at
FROM public.donations d
LEFT JOIN public.profiles p ON d.user_id = p.user_id
LEFT JOIN public.causes c ON d.cause_id = c.id
WHERE d.created_at > NOW() - INTERVAL '30 days'

UNION ALL

SELECT
    'aid_request' as activity_type,
    ar.id,
    ar.contact_name as actor,
    'submitted aid request' as action,
    ar.title as target,
    ar.created_at
FROM public.aid_requests ar
WHERE ar.created_at > NOW() - INTERVAL '30 days'

UNION ALL

SELECT
    'contact' as activity_type,
    cs.id,
    cs.name as actor,
    'sent contact message' as action,
    COALESCE(cs.subject, 'No subject') as target,
    cs.created_at
FROM public.contact_submissions cs
WHERE cs.created_at > NOW() - INTERVAL '30 days'

ORDER BY created_at DESC
LIMIT 50;

-- Grant access to authenticated users
GRANT SELECT ON recent_activity TO authenticated;

-- ============================================================================
-- 7. ADD REALTIME PUBLICATION FOR LIVE UPDATES
-- ============================================================================

-- Enable realtime for key tables (requires Supabase realtime to be enabled)
ALTER PUBLICATION supabase_realtime ADD TABLE public.donations;
ALTER PUBLICATION supabase_realtime ADD TABLE public.causes;
ALTER PUBLICATION supabase_realtime ADD TABLE public.aid_requests;
ALTER PUBLICATION supabase_realtime ADD TABLE public.contact_submissions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
ALTER PUBLICATION supabase_realtime ADD TABLE public.success_stories;

-- ============================================================================
-- 8. CREATE FUNCTION TO GET USER FULL DETAILS
-- ============================================================================

CREATE OR REPLACE FUNCTION get_user_full_details(user_uuid UUID)
RETURNS TABLE (
    user_id UUID,
    email TEXT,
    first_name TEXT,
    last_name TEXT,
    phone TEXT,
    address TEXT,
    avatar_url TEXT,
    is_approved BOOLEAN,
    approved_at TIMESTAMP WITH TIME ZONE,
    role TEXT,
    created_at TIMESTAMP WITH TIME ZONE
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.user_id,
        p.email,
        p.first_name,
        p.last_name,
        p.phone,
        p.address,
        p.avatar_url,
        p.is_approved,
        p.approved_at,
        COALESCE(ur.role::text, 'user') as role,
        p.created_at
    FROM public.profiles p
    LEFT JOIN public.user_roles ur ON p.user_id = ur.user_id
    WHERE p.user_id = user_uuid;
END;
$$;

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION get_user_full_details(UUID) TO authenticated;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON VIEW admin_dashboard_stats IS 'Aggregated statistics for admin dashboard';
COMMENT ON VIEW recent_activity IS 'Recent activity across the platform for admin monitoring';
COMMENT ON FUNCTION get_user_full_details IS 'Get complete user details including profile and role information';