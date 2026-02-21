-- =====================================================
-- COMPREHENSIVE RLS POLICY REWRITE
-- =====================================================
-- Date: 2026-02-14
-- Purpose: Rewrite ALL RLS policies with proper type casting and security
-- This migration consolidates and fixes all RLS policies across the database
-- =====================================================

BEGIN;

-- =====================================================
-- STEP 1: DROP ALL EXISTING POLICIES
-- =====================================================

-- Profiles
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Require authentication for profiles access" ON public.profiles;

-- User Roles
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can manage all roles" ON public.user_roles;

-- Causes
DROP POLICY IF EXISTS "Anyone can view active causes" ON public.causes;
DROP POLICY IF EXISTS "Admins can manage all causes" ON public.causes;

-- Donations
DROP POLICY IF EXISTS "Users can view their own donations" ON public.donations;
DROP POLICY IF EXISTS "Anyone can create donations" ON public.donations;
DROP POLICY IF EXISTS "Authenticated users can create donations" ON public.donations;
DROP POLICY IF EXISTS "Anonymous donations with email" ON public.donations;
DROP POLICY IF EXISTS "Admins can view all donations" ON public.donations;
DROP POLICY IF EXISTS "Require authentication for donations access" ON public.donations;

-- Site Settings
DROP POLICY IF EXISTS "Anyone can view site settings" ON public.site_settings;
DROP POLICY IF EXISTS "Admins can manage site settings" ON public.site_settings;

-- Contact Submissions
DROP POLICY IF EXISTS "Anyone can submit contact form" ON public.contact_submissions;
DROP POLICY IF EXISTS "Anyone can submit contact form with valid data" ON public.contact_submissions;
DROP POLICY IF EXISTS "Admins can view contact submissions" ON public.contact_submissions;
DROP POLICY IF EXISTS "Admins can update contact submissions" ON public.contact_submissions;
DROP POLICY IF EXISTS "Require authentication for contact_submissions" ON public.contact_submissions;

-- Activity Log
DROP POLICY IF EXISTS "Users can view their own activity" ON public.activity_log;
DROP POLICY IF EXISTS "Anyone can create activity log entries" ON public.activity_log;
DROP POLICY IF EXISTS "Authenticated users can create activity log" ON public.activity_log;
DROP POLICY IF EXISTS "Admins can view all activity" ON public.activity_log;

-- Aid Requests
DROP POLICY IF EXISTS "Anyone can submit aid requests" ON public.aid_requests;
DROP POLICY IF EXISTS "Users can view their own aid requests" ON public.aid_requests;
DROP POLICY IF EXISTS "Admins can view all aid requests" ON public.aid_requests;
DROP POLICY IF EXISTS "Admins can update aid requests" ON public.aid_requests;
DROP POLICY IF EXISTS "Admins can delete aid requests" ON public.aid_requests;
DROP POLICY IF EXISTS "Require authentication for aid_requests access" ON public.aid_requests;

-- Newsletter Subscribers
DROP POLICY IF EXISTS "Anyone can subscribe to newsletter" ON public.newsletter_subscribers;
DROP POLICY IF EXISTS "Admins can view all subscribers" ON public.newsletter_subscribers;
DROP POLICY IF EXISTS "Admins can update subscribers" ON public.newsletter_subscribers;
DROP POLICY IF EXISTS "Admins can delete subscribers" ON public.newsletter_subscribers;
DROP POLICY IF EXISTS "Users can unsubscribe by email" ON public.newsletter_subscribers;
DROP POLICY IF EXISTS "Require authentication for newsletter_subscribers" ON public.newsletter_subscribers;

-- Success Stories
DROP POLICY IF EXISTS "Anyone can view published success stories" ON public.success_stories;
DROP POLICY IF EXISTS "Admins can manage all success stories" ON public.success_stories;

-- Treatment Updates
DROP POLICY IF EXISTS "Anyone can view treatment updates for published stories" ON public.treatment_updates;
DROP POLICY IF EXISTS "Admins can manage all treatment updates" ON public.treatment_updates;

-- Testimonials
DROP POLICY IF EXISTS "Anyone can view published testimonials" ON public.testimonials;
DROP POLICY IF EXISTS "Admins can manage all testimonials" ON public.testimonials;

-- Content Management Tables
DROP POLICY IF EXISTS "Public can view page sections" ON page_sections;
DROP POLICY IF EXISTS "Admins can manage page sections" ON page_sections;
DROP POLICY IF EXISTS "Public can view active team members" ON team_members;
DROP POLICY IF EXISTS "Admins can manage team members" ON team_members;
DROP POLICY IF EXISTS "Public can view active values" ON values;
DROP POLICY IF EXISTS "Admins can manage values" ON values;
DROP POLICY IF EXISTS "Public can view active help items" ON how_we_help_items;
DROP POLICY IF EXISTS "Admins can manage help items" ON how_we_help_items;
DROP POLICY IF EXISTS "Public can view active process steps" ON process_steps;
DROP POLICY IF EXISTS "Admins can manage process steps" ON process_steps;
DROP POLICY IF EXISTS "Public can view active FAQs" ON faqs;
DROP POLICY IF EXISTS "Admins can manage FAQs" ON faqs;
DROP POLICY IF EXISTS "Public can view active submission requirements" ON submission_requirements;
DROP POLICY IF EXISTS "Admins can manage submission requirements" ON submission_requirements;

-- Storage Policies
DROP POLICY IF EXISTS "Aid request images are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Admins can view all aid request images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload aid request images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete aid request images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update aid request images" ON storage.objects;

-- =====================================================
-- STEP 2: CREATE COMPREHENSIVE RLS POLICIES
-- =====================================================

-- =====================================================
-- PROFILES TABLE
-- =====================================================

-- Users can view their own profile
CREATE POLICY "profiles_select_own"
ON public.profiles FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Users can insert their own profile
CREATE POLICY "profiles_insert_own"
ON public.profiles FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Users can update their own profile
CREATE POLICY "profiles_update_own"
ON public.profiles FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Admins can view all profiles
CREATE POLICY "profiles_select_admin"
ON public.profiles FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Admins can update all profiles
CREATE POLICY "profiles_update_admin"
ON public.profiles FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Admins can delete profiles
CREATE POLICY "profiles_delete_admin"
ON public.profiles FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- =====================================================
-- USER_ROLES TABLE
-- =====================================================

-- Users can view their own roles
CREATE POLICY "user_roles_select_own"
ON public.user_roles FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Admins can view all roles
CREATE POLICY "user_roles_select_admin"
ON public.user_roles FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Admins can insert roles
CREATE POLICY "user_roles_insert_admin"
ON public.user_roles FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- Admins can update roles
CREATE POLICY "user_roles_update_admin"
ON public.user_roles FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Admins can delete roles
CREATE POLICY "user_roles_delete_admin"
ON public.user_roles FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- =====================================================
-- CAUSES TABLE
-- =====================================================

-- Anyone can view active causes
CREATE POLICY "causes_select_public"
ON public.causes FOR SELECT
USING (is_active = true);

-- Admins can view all causes (including inactive)
CREATE POLICY "causes_select_admin"
ON public.causes FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Admins can insert causes
CREATE POLICY "causes_insert_admin"
ON public.causes FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- Admins can update causes
CREATE POLICY "causes_update_admin"
ON public.causes FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Admins can delete causes
CREATE POLICY "causes_delete_admin"
ON public.causes FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- =====================================================
-- DONATIONS TABLE
-- =====================================================

-- Authenticated users can view their own donations
CREATE POLICY "donations_select_own"
ON public.donations FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Admins can view all donations
CREATE POLICY "donations_select_admin"
ON public.donations FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Authenticated users can create donations (linked to their account)
CREATE POLICY "donations_insert_authenticated"
ON public.donations FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id 
  AND amount > 0
);

-- Anonymous users can create donations (with email)
CREATE POLICY "donations_insert_anonymous"
ON public.donations FOR INSERT
TO anon
WITH CHECK (
  user_id IS NULL 
  AND donor_email IS NOT NULL 
  AND amount > 0
);

-- Admins can update donations
CREATE POLICY "donations_update_admin"
ON public.donations FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Admins can delete donations
CREATE POLICY "donations_delete_admin"
ON public.donations FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- =====================================================
-- SITE_SETTINGS TABLE
-- =====================================================

-- Anyone can view site settings
CREATE POLICY "site_settings_select_public"
ON public.site_settings FOR SELECT
USING (true);

-- Admins can insert site settings
CREATE POLICY "site_settings_insert_admin"
ON public.site_settings FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- Admins can update site settings
CREATE POLICY "site_settings_update_admin"
ON public.site_settings FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Admins can delete site settings
CREATE POLICY "site_settings_delete_admin"
ON public.site_settings FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- =====================================================
-- CONTACT_SUBMISSIONS TABLE
-- =====================================================

-- Anyone can submit contact form (with validation)
CREATE POLICY "contact_submissions_insert_public"
ON public.contact_submissions FOR INSERT
WITH CHECK (
  name IS NOT NULL 
  AND email IS NOT NULL 
  AND message IS NOT NULL
);

-- Admins can view all contact submissions
CREATE POLICY "contact_submissions_select_admin"
ON public.contact_submissions FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Admins can update contact submissions (mark as read)
CREATE POLICY "contact_submissions_update_admin"
ON public.contact_submissions FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Admins can delete contact submissions
CREATE POLICY "contact_submissions_delete_admin"
ON public.contact_submissions FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- =====================================================
-- ACTIVITY_LOG TABLE
-- =====================================================

-- Authenticated users can view their own activity
CREATE POLICY "activity_log_select_own"
ON public.activity_log FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Admins can view all activity
CREATE POLICY "activity_log_select_admin"
ON public.activity_log FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Authenticated users can create activity log entries
CREATE POLICY "activity_log_insert_authenticated"
ON public.activity_log FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Admins can delete activity log entries
CREATE POLICY "activity_log_delete_admin"
ON public.activity_log FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- =====================================================
-- AID_REQUESTS TABLE
-- =====================================================

-- Anyone can submit aid requests (with validation)
CREATE POLICY "aid_requests_insert_public"
ON public.aid_requests FOR INSERT
WITH CHECK (
  contact_name IS NOT NULL 
  AND contact_email IS NOT NULL 
  AND title IS NOT NULL 
  AND description IS NOT NULL
);

-- Users can view their own aid requests
CREATE POLICY "aid_requests_select_own"
ON public.aid_requests FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Admins can view all aid requests
CREATE POLICY "aid_requests_select_admin"
ON public.aid_requests FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Admins can update aid requests (approve/reject)
CREATE POLICY "aid_requests_update_admin"
ON public.aid_requests FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Admins can delete aid requests
CREATE POLICY "aid_requests_delete_admin"
ON public.aid_requests FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- =====================================================
-- NEWSLETTER_SUBSCRIBERS TABLE
-- =====================================================

-- Anyone can subscribe to newsletter
CREATE POLICY "newsletter_subscribers_insert_public"
ON public.newsletter_subscribers FOR INSERT
WITH CHECK (email IS NOT NULL);

-- Admins can view all subscribers
CREATE POLICY "newsletter_subscribers_select_admin"
ON public.newsletter_subscribers FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Admins can update subscribers
CREATE POLICY "newsletter_subscribers_update_admin"
ON public.newsletter_subscribers FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Admins can delete subscribers
CREATE POLICY "newsletter_subscribers_delete_admin"
ON public.newsletter_subscribers FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Users can unsubscribe themselves (set is_active = false)
CREATE POLICY "newsletter_subscribers_unsubscribe_public"
ON public.newsletter_subscribers FOR UPDATE
USING (true)
WITH CHECK (is_active = false);

-- =====================================================
-- SUCCESS_STORIES TABLE
-- =====================================================

-- Anyone can view published success stories
CREATE POLICY "success_stories_select_public"
ON public.success_stories FOR SELECT
USING (is_published = true);

-- Admins can view all success stories
CREATE POLICY "success_stories_select_admin"
ON public.success_stories FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Admins can insert success stories
CREATE POLICY "success_stories_insert_admin"
ON public.success_stories FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- Admins can update success stories
CREATE POLICY "success_stories_update_admin"
ON public.success_stories FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Admins can delete success stories
CREATE POLICY "success_stories_delete_admin"
ON public.success_stories FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- =====================================================
-- TREATMENT_UPDATES TABLE
-- =====================================================

-- Anyone can view treatment updates for published stories
CREATE POLICY "treatment_updates_select_public"
ON public.treatment_updates FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.success_stories 
    WHERE id = treatment_updates.story_id 
    AND is_published = true
  )
);

-- Admins can view all treatment updates
CREATE POLICY "treatment_updates_select_admin"
ON public.treatment_updates FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Admins can insert treatment updates
CREATE POLICY "treatment_updates_insert_admin"
ON public.treatment_updates FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- Admins can update treatment updates
CREATE POLICY "treatment_updates_update_admin"
ON public.treatment_updates FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Admins can delete treatment updates
CREATE POLICY "treatment_updates_delete_admin"
ON public.treatment_updates FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- =====================================================
-- TESTIMONIALS TABLE
-- =====================================================

-- Anyone can view published testimonials
CREATE POLICY "testimonials_select_public"
ON public.testimonials FOR SELECT
USING (is_published = true);

-- Admins can view all testimonials
CREATE POLICY "testimonials_select_admin"
ON public.testimonials FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Admins can insert testimonials
CREATE POLICY "testimonials_insert_admin"
ON public.testimonials FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- Admins can update testimonials
CREATE POLICY "testimonials_update_admin"
ON public.testimonials FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Admins can delete testimonials
CREATE POLICY "testimonials_delete_admin"
ON public.testimonials FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- =====================================================
-- PAGE_SECTIONS TABLE
-- =====================================================

-- Anyone can view page sections
CREATE POLICY "page_sections_select_public"
ON page_sections FOR SELECT
USING (true);

-- Admins can insert page sections
CREATE POLICY "page_sections_insert_admin"
ON page_sections FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- Admins can update page sections
CREATE POLICY "page_sections_update_admin"
ON page_sections FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Admins can delete page sections
CREATE POLICY "page_sections_delete_admin"
ON page_sections FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- =====================================================
-- TEAM_MEMBERS TABLE
-- =====================================================

-- Anyone can view active team members
CREATE POLICY "team_members_select_public"
ON team_members FOR SELECT
USING (is_active = true);

-- Admins can view all team members
CREATE POLICY "team_members_select_admin"
ON team_members FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Admins can insert team members
CREATE POLICY "team_members_insert_admin"
ON team_members FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- Admins can update team members
CREATE POLICY "team_members_update_admin"
ON team_members FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Admins can delete team members
CREATE POLICY "team_members_delete_admin"
ON team_members FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- =====================================================
-- VALUES TABLE
-- =====================================================

-- Anyone can view active values
CREATE POLICY "values_select_public"
ON values FOR SELECT
USING (is_active = true);

-- Admins can view all values
CREATE POLICY "values_select_admin"
ON values FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Admins can insert values
CREATE POLICY "values_insert_admin"
ON values FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- Admins can update values
CREATE POLICY "values_update_admin"
ON values FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Admins can delete values
CREATE POLICY "values_delete_admin"
ON values FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- =====================================================
-- HOW_WE_HELP_ITEMS TABLE
-- =====================================================

-- Anyone can view active help items
CREATE POLICY "how_we_help_items_select_public"
ON how_we_help_items FOR SELECT
USING (is_active = true);

-- Admins can view all help items
CREATE POLICY "how_we_help_items_select_admin"
ON how_we_help_items FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Admins can insert help items
CREATE POLICY "how_we_help_items_insert_admin"
ON how_we_help_items FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- Admins can update help items
CREATE POLICY "how_we_help_items_update_admin"
ON how_we_help_items FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Admins can delete help items
CREATE POLICY "how_we_help_items_delete_admin"
ON how_we_help_items FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- =====================================================
-- PROCESS_STEPS TABLE
-- =====================================================

-- Anyone can view active process steps
CREATE POLICY "process_steps_select_public"
ON process_steps FOR SELECT
USING (is_active = true);

-- Admins can view all process steps
CREATE POLICY "process_steps_select_admin"
ON process_steps FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Admins can insert process steps
CREATE POLICY "process_steps_insert_admin"
ON process_steps FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- Admins can update process steps
CREATE POLICY "process_steps_update_admin"
ON process_steps FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Admins can delete process steps
CREATE POLICY "process_steps_delete_admin"
ON process_steps FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- =====================================================
-- FAQS TABLE
-- =====================================================

-- Anyone can view active FAQs
CREATE POLICY "faqs_select_public"
ON faqs FOR SELECT
USING (is_active = true);

-- Admins can view all FAQs
CREATE POLICY "faqs_select_admin"
ON faqs FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Admins can insert FAQs
CREATE POLICY "faqs_insert_admin"
ON faqs FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- Admins can update FAQs
CREATE POLICY "faqs_update_admin"
ON faqs FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Admins can delete FAQs
CREATE POLICY "faqs_delete_admin"
ON faqs FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- =====================================================
-- SUBMISSION_REQUIREMENTS TABLE
-- =====================================================

-- Anyone can view active submission requirements
CREATE POLICY "submission_requirements_select_public"
ON submission_requirements FOR SELECT
USING (is_active = true);

-- Admins can view all submission requirements
CREATE POLICY "submission_requirements_select_admin"
ON submission_requirements FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Admins can insert submission requirements
CREATE POLICY "submission_requirements_insert_admin"
ON submission_requirements FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- Admins can update submission requirements
CREATE POLICY "submission_requirements_update_admin"
ON submission_requirements FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Admins can delete submission requirements
CREATE POLICY "submission_requirements_delete_admin"
ON submission_requirements FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- =====================================================
-- STORAGE POLICIES (aid-request-images bucket)
-- =====================================================

-- Admins can view all images
CREATE POLICY "storage_aid_images_select_admin"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'aid-request-images' 
  AND public.has_role(auth.uid(), 'admin'::app_role)
);

-- Authenticated users can upload images
CREATE POLICY "storage_aid_images_insert_authenticated"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'aid-request-images' 
  AND auth.uid() IS NOT NULL
);

-- Admins can update images
CREATE POLICY "storage_aid_images_update_admin"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'aid-request-images' 
  AND public.has_role(auth.uid(), 'admin'::app_role)
);

-- Admins can delete images
CREATE POLICY "storage_aid_images_delete_admin"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'aid-request-images' 
  AND public.has_role(auth.uid(), 'admin'::app_role)
);

COMMIT;

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Count policies per table
SELECT 
  schemaname,
  tablename,
  COUNT(*) as policy_count
FROM pg_policies
WHERE schemaname = 'public'
GROUP BY schemaname, tablename
ORDER BY tablename;

-- Verify all policies use proper type casting
SELECT 
  tablename,
  policyname,
  CASE 
    WHEN qual LIKE '%::app_role%' OR qual NOT LIKE '%has_role%' THEN '✅ OK'
    ELSE '❌ Missing ::app_role cast'
  END as type_casting_status
FROM pg_policies
WHERE schemaname = 'public'
AND qual LIKE '%has_role%'
ORDER BY tablename, policyname;

-- =====================================================
-- END OF MIGRATION
-- =====================================================
