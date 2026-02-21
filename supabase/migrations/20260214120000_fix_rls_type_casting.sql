-- =====================================================
-- Migration: Fix RLS Type Casting Error
-- =====================================================
-- Date: 2026-02-14
-- Purpose: Fix "operator does not exist: text = app_role" error
-- Issue: RLS policies comparing text 'admin' with app_role enum without casting
-- =====================================================

-- Drop all problematic policies
DROP POLICY IF EXISTS "Admins can manage page sections" ON page_sections;
DROP POLICY IF EXISTS "Admins can manage team members" ON team_members;
DROP POLICY IF EXISTS "Admins can manage values" ON values;
DROP POLICY IF EXISTS "Admins can manage help items" ON how_we_help_items;
DROP POLICY IF EXISTS "Admins can manage process steps" ON process_steps;
DROP POLICY IF EXISTS "Admins can manage FAQs" ON faqs;
DROP POLICY IF EXISTS "Admins can manage submission requirements" ON submission_requirements;

-- Recreate policies with proper type casting (::app_role)

CREATE POLICY "Admins can manage page sections"
  ON page_sections FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'::app_role
    )
  );

CREATE POLICY "Admins can manage team members"
  ON team_members FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'::app_role
    )
  );

CREATE POLICY "Admins can manage values"
  ON values FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'::app_role
    )
  );

CREATE POLICY "Admins can manage help items"
  ON how_we_help_items FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'::app_role
    )
  );

CREATE POLICY "Admins can manage process steps"
  ON process_steps FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'::app_role
    )
  );

CREATE POLICY "Admins can manage FAQs"
  ON faqs FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'::app_role
    )
  );

CREATE POLICY "Admins can manage submission requirements"
  ON submission_requirements FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'::app_role
    )
  );

-- =====================================================
-- Verification
-- =====================================================

-- Check that all policies are now correct
SELECT 
  tablename,
  policyname,
  CASE 
    WHEN qual LIKE '%::app_role%' THEN '✅ Fixed'
    ELSE '❌ Still broken'
  END as status
FROM pg_policies
WHERE tablename IN (
  'page_sections', 'team_members', 'values', 
  'how_we_help_items', 'process_steps', 'faqs', 
  'submission_requirements'
)
AND policyname LIKE '%Admin%'
ORDER BY tablename;
