-- Fix SECURITY DEFINER views by recreating with security_invoker=on

-- Drop and recreate admin_dashboard_stats with security_invoker
DROP VIEW IF EXISTS admin_dashboard_stats;
CREATE VIEW admin_dashboard_stats
WITH (security_invoker=on) AS
SELECT
    (SELECT COUNT(*) FROM public.donations) as total_donations_count,
    (SELECT COALESCE(SUM(amount), 0) FROM public.donations WHERE status = 'completed') as total_donations_amount,
    (SELECT COUNT(DISTINCT COALESCE(user_id::text, donor_email)) FROM public.donations) as unique_donors,
    (SELECT COUNT(*) FROM public.causes WHERE is_active = true) as active_causes,
    (SELECT COUNT(*) FROM public.aid_requests WHERE status = 'pending') as pending_aid_requests,
    (SELECT COUNT(*) FROM public.contact_submissions WHERE is_read = false) as unread_messages,
    (SELECT COUNT(*) FROM public.profiles WHERE is_approved = false) as pending_users,
    (SELECT COUNT(*) FROM public.newsletter_subscribers WHERE is_active = true) as active_subscribers;

GRANT SELECT ON admin_dashboard_stats TO authenticated;
COMMENT ON VIEW admin_dashboard_stats IS 'Aggregated statistics for admin dashboard';

-- Drop and recreate recent_activity with security_invoker
DROP VIEW IF EXISTS recent_activity;
CREATE VIEW recent_activity
WITH (security_invoker=on) AS
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

GRANT SELECT ON recent_activity TO authenticated;
COMMENT ON VIEW recent_activity IS 'Recent activity across the platform for admin monitoring';