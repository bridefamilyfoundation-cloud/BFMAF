-- Migration: Create Content Management Tables
-- Description: Add tables for dynamic content management across the website
-- Created: 2026-01-27

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- 1. PAGE SECTIONS TABLE
-- Stores editable text sections for each page (hero content, CTAs, etc.)
-- ============================================================================
CREATE TABLE IF NOT EXISTS page_sections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  page VARCHAR(50) NOT NULL,
  section_key VARCHAR(100) NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_by UUID REFERENCES auth.users(id),
  UNIQUE(page, section_key)
);

-- Index for faster queries
CREATE INDEX idx_page_sections_page ON page_sections(page);

-- RLS Policies
ALTER TABLE page_sections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view page sections"
  ON page_sections FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage page sections"
  ON page_sections FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
    )
  );

-- ============================================================================
-- 2. TEAM MEMBERS TABLE
-- Manages board members and team
-- ============================================================================
CREATE TABLE IF NOT EXISTS team_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  role VARCHAR(255) NOT NULL,
  bio TEXT,
  image_url TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for ordering
CREATE INDEX idx_team_members_order ON team_members(display_order, is_active);

-- RLS Policies
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view active team members"
  ON team_members FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage team members"
  ON team_members FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
    )
  );

-- ============================================================================
-- 3. VALUES TABLE
-- Organization values displayed on About page
-- ============================================================================
CREATE TABLE IF NOT EXISTS values (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  icon VARCHAR(50) DEFAULT 'Heart',
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for ordering
CREATE INDEX idx_values_order ON values(display_order, is_active);

-- RLS Policies
ALTER TABLE values ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view active values"
  ON values FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage values"
  ON values FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
    )
  );

-- ============================================================================
-- 4. HOW WE HELP ITEMS TABLE
-- How we help section items
-- ============================================================================
CREATE TABLE IF NOT EXISTS how_we_help_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  icon VARCHAR(50) DEFAULT 'Heart',
  color VARCHAR(50),
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for ordering
CREATE INDEX idx_how_we_help_order ON how_we_help_items(display_order, is_active);

-- RLS Policies
ALTER TABLE how_we_help_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view active help items"
  ON how_we_help_items FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage help items"
  ON how_we_help_items FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
    )
  );

-- ============================================================================
-- 5. PROCESS STEPS TABLE
-- Request process steps for How It Works page
-- ============================================================================
CREATE TABLE IF NOT EXISTS process_steps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  step_number INTEGER NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  icon VARCHAR(50) DEFAULT 'CheckCircle',
  page VARCHAR(50) DEFAULT 'how-it-works',
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for ordering
CREATE INDEX idx_process_steps_order ON process_steps(page, display_order, is_active);

-- RLS Policies
ALTER TABLE process_steps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view active process steps"
  ON process_steps FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage process steps"
  ON process_steps FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
    )
  );

-- ============================================================================
-- 6. FAQS TABLE
-- Frequently Asked Questions
-- ============================================================================
CREATE TABLE IF NOT EXISTS faqs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  category VARCHAR(100) DEFAULT 'general',
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for ordering and filtering
CREATE INDEX idx_faqs_category_order ON faqs(category, display_order, is_active);

-- RLS Policies
ALTER TABLE faqs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view active FAQs"
  ON faqs FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage FAQs"
  ON faqs FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
    )
  );

-- ============================================================================
-- 7. SUBMISSION REQUIREMENTS TABLE
-- What to submit for aid requests
-- ============================================================================
CREATE TABLE IF NOT EXISTS submission_requirements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  icon VARCHAR(50) DEFAULT 'FileText',
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for ordering
CREATE INDEX idx_submission_requirements_order ON submission_requirements(display_order, is_active);

-- RLS Policies
ALTER TABLE submission_requirements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view active submission requirements"
  ON submission_requirements FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage submission requirements"
  ON submission_requirements FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
    )
  );

-- ============================================================================
-- SEED DATA
-- Populate tables with existing hardcoded content
-- ============================================================================

-- Seed Team Members
INSERT INTO team_members (name, role, display_order) VALUES
  ('Bro Ezekiel Ekka', 'Chairman', 1),
  ('Bro Emperor Ayuba', 'Secretary', 2),
  ('Bro Joseph Adesida', 'Trustee', 3),
  ('Bro Joseph Anzaku', 'Trustee', 4),
  ('Bro Moses Ayuba', 'Trustee', 5),
  ('Bro Luke A Ekka', 'Media', 6);

-- Seed Values
INSERT INTO values (title, description, icon, display_order) VALUES
  ('Compassion', 'Reaching out with love to believers facing overwhelming medical conditions.', 'Heart', 1),
  ('Family', 'The Bride of Christ is one family - when one member suffers, we all suffer together.', 'Users', 2),
  ('Support', 'Providing prayers, visits, calls, and financial/medical assistance.', 'Target', 3),
  ('Faith', 'Grounded in Biblical principles and the love of Christ for His Church.', 'Award', 4);

-- Seed How We Help Items
INSERT INTO how_we_help_items (title, description, icon, color, display_order) VALUES
  ('Prayers', 'We intercede for our brothers and sisters in their time of need, lifting them up before the Lord.', 'BookOpen', 'bg-blue-500/10 text-blue-600', 1),
  ('Visits', 'Where and when possible, we visit to show love, support, and the presence of the body of Christ.', 'Users', 'bg-green-500/10 text-green-600', 2),
  ('Calls', 'Reaching out to admonish and encourage during difficult times, reminding them they are not alone.', 'Phone', 'bg-purple-500/10 text-purple-600', 3),
  ('Financial & Medical Aid', 'Providing tangible assistance for medical expenses when conditions are beyond the local church to handle.', 'Heart', 'bg-orange-500/10 text-orange-600', 4);

-- Seed Process Steps
INSERT INTO process_steps (step_number, title, description, icon, display_order) VALUES
  (1, 'Submit Your Request', 'Fill out our assistance request form with patient details including name, age, local church, medical condition, and upload up to 5 photographs.', 'Camera', 1),
  (2, 'Provide Documentation', 'Submit your complete medical history from onset to current status, along with a detailed breakdown of the financial implications.', 'FileText', 2),
  (3, 'Admin Review', 'Our team reviews your submission, verifies the information with your local church or medical providers, and assesses how we can best provide support.', 'ClipboardCheck', 3),
  (4, 'Case Approval', 'Once approved, your case is published on our platform where the Bride of Christ family worldwide can see and support you.', 'CheckCircle', 4),
  (5, 'Receive Support', 'Receive prayers, encouragement, visits (where possible), and financial assistance from believers worldwide.', 'HandHeart', 5);

-- Seed Submission Requirements
INSERT INTO submission_requirements (title, description, icon, display_order) VALUES
  ('Photographs', 'Clear photographs of the patient and their current condition (up to 5 images).', 'Camera', 1),
  ('Medical History', 'Complete medical history from onset to current status, including diagnosis and treatment plans.', 'FileText', 2),
  ('Financial Breakdown', 'Detailed breakdown of medical costs including treatment, ongoing care, and any support already received.', 'DollarSign', 3);

-- Seed FAQs
INSERT INTO faqs (question, answer, category, display_order) VALUES
  ('What is the purpose of BFMAF?', 'Bride Family Medical Aid Foundation (BFMAF) is a compassionate platform to reach out to severely traumatized believers who are in despair due to prolonged or acute medical conditions that are overwhelming to the individual, family, and local church. We connect them with the support of the global body of Christ.', 'general', 1),
  ('Who is eligible for assistance?', 'We help believers, brothers and sisters facing medical conditions that are beyond what their local church can handle alone. This includes prolonged illnesses, acute conditions, and medical emergencies requiring significant financial support.', 'general', 2),
  ('How long does the review process take?', 'Our team typically reviews submissions within 3-5 business days. Urgent cases may be expedited based on the severity of the condition.', 'requests', 3),
  ('Can I submit a request on behalf of someone else?', 'Yes, you can submit a request on behalf of a family member or fellow believer. Please ensure you have their consent and accurate information about their condition.', 'requests', 4),
  ('How are funds distributed?', 'Donations go to our General Fund which supports all verified cases. 70% goes directly to medical assistance, 15% to support services (visits, calls, encouragement), 10% to platform operations, and 5% to emergency reserves.', 'donations', 5),
  ('What payment methods are accepted?', 'We accept card payments (via Paystack) and bank transfers in Nigerian Naira (₦). For bank transfers, you''ll need to upload proof of payment which our team will verify.', 'donations', 6),
  ('How can I track my donation''s impact?', 'All verified cases are published on our Active Cases page with updates. You can see the progress of fundraising and how the Bride of Christ family is coming together to help.', 'donations', 7),
  ('Is my donation tax-deductible?', 'Please consult with your local tax advisor regarding the deductibility of charitable donations in your jurisdiction.', 'donations', 8);

-- Seed Page Sections (Homepage)
INSERT INTO page_sections (page, section_key, content) VALUES
  ('home', 'hero_badge', 'Only Believe'),
  ('home', 'hero_title', 'Helping Believers <span class="text-gradient-primary">Overcome</span> Medical Crises'),
  ('home', 'hero_subtitle', 'We provide prayer, support, and financial aid to Christians facing overwhelming medical conditions.'),
  ('home', 'how_we_help_title', 'How We <span class="text-gradient-primary">Help</span>'),
  ('home', 'how_we_help_description', 'The Bride of Christ as a Family reaches out for assistance in the following ways:'),
  ('home', 'current_cases_title', 'Current <span class="text-gradient-primary">Cases</span>'),
  ('home', 'current_cases_description', 'These are believers who need our support. Every donation, no matter the size, brings us closer to helping them.'),
  ('home', 'cta_title', 'Need Medical Assistance?'),
  ('home', 'cta_description', 'If you or someone you know is facing overwhelming medical conditions, the Bride of Christ family is here to help. Submit your request today.'),
  ('home', 'what_to_submit_title', 'What to <span class="text-gradient-primary">Submit</span>'),
  ('home', 'what_to_submit_description', 'Individuals that need assistance should submit the following:');

-- Seed Page Sections (About)
INSERT INTO page_sections (page, section_key, content) VALUES
  ('about', 'hero_title', 'About <span class="text-gradient-primary">BFMAF</span>'),
  ('about', 'hero_description', 'Bride Family Medical Aid Foundation (BFMAF) is a platform borne out of compassion to reach out to the severely traumatized believers, brothers and sisters who are in despair due to prolonged or acute conditions that is overwhelming to the individual, family and local church — conditions beyond the local church to handle. Hence the need for the Bride of Christ as a Family to reach out for assistance!'),
  ('about', 'mission_title', 'Our Mission'),
  ('about', 'mission_description_1', 'To be a bridge of compassion connecting the body of Christ worldwide, ensuring that no believer faces overwhelming medical conditions alone. We believe that as the Bride of Christ, we are called to bear one another''s burdens.'),
  ('about', 'mission_description_2', 'Our mission is to identify, verify, and support believers who are facing medical emergencies and prolonged conditions that exceed the capacity of their local church to address.');

-- Seed Page Sections (How It Works)
INSERT INTO page_sections (page, section_key, content) VALUES
  ('how-it-works', 'hero_title', 'How It <span class="text-gradient-primary">Works</span>'),
  ('how-it-works', 'hero_description', 'Learn how the Bride Family Medical Aid Foundation connects believers in need with the support of the body of Christ worldwide.'),
  ('how-it-works', 'purpose_title', 'Why <span class="text-gradient-primary">BFMAF</span> Exists'),
  ('how-it-works', 'purpose_description', 'When medical conditions exceed what a local church can handle, the Bride of Christ as a Family reaches out for assistance. We believe that as the body of Christ, when one member suffers, we all suffer together—and when one is honored, we all rejoice.');

-- ============================================================================
-- FUNCTIONS
-- Helper functions for content management
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_page_sections_updated_at BEFORE UPDATE ON page_sections
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_team_members_updated_at BEFORE UPDATE ON team_members
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_values_updated_at BEFORE UPDATE ON values
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_how_we_help_items_updated_at BEFORE UPDATE ON how_we_help_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_process_steps_updated_at BEFORE UPDATE ON process_steps
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_faqs_updated_at BEFORE UPDATE ON faqs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_submission_requirements_updated_at BEFORE UPDATE ON submission_requirements
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- COMMENTS
-- Add helpful comments to tables
-- ============================================================================

COMMENT ON TABLE page_sections IS 'Stores editable text sections for each page (hero content, CTAs, etc.)';
COMMENT ON TABLE team_members IS 'Board members and team information';
COMMENT ON TABLE values IS 'Organization values displayed on About page';
COMMENT ON TABLE how_we_help_items IS 'How we help section items';
COMMENT ON TABLE process_steps IS 'Request process steps for How It Works page';
COMMENT ON TABLE faqs IS 'Frequently Asked Questions';
COMMENT ON TABLE submission_requirements IS 'What to submit for aid requests';
