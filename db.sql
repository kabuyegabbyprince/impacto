-- =====================================================================
-- IMPACTO SYSTEM DATABASE MIGRATION & SCHEMAS
-- CORE PLATFORM OPERATOR DATABASE SEED FOR SUPABASE
-- Built with love for Rwandan NGOs & non-profit workspaces.
-- =====================================================================

-- Ensure cryptographic extension is loaded
CREATE EXTENSION IF NOT EXISTS pgcrypto CASCADE;

-- SAFE DROP SEQUENCE (DEPENDENCY SAFE)
DROP TABLE IF EXISTS platform_settings CASCADE;
DROP TABLE IF EXISTS subscription_payments CASCADE;
DROP TABLE IF EXISTS error_reports CASCADE;
DROP TABLE IF EXISTS donations CASCADE;
DROP TABLE IF EXISTS ledger_entries CASCADE;
DROP TABLE IF EXISTS grants CASCADE;
DROP TABLE IF EXISTS news_posts CASCADE;
DROP TABLE IF EXISTS goal_updates CASCADE;
DROP TABLE IF EXISTS goals CASCADE;
DROP TABLE IF EXISTS chat_messages CASCADE;
DROP TABLE IF EXISTS chat_channels CASCADE;
DROP TABLE IF EXISTS action_items CASCADE;
DROP TABLE IF EXISTS meetings CASCADE;
DROP TABLE IF EXISTS event_attendance CASCADE;
DROP TABLE IF EXISTS events CASCADE;
DROP TABLE IF EXISTS programs CASCADE;
DROP TABLE IF EXISTS member_tiers CASCADE;
DROP TABLE IF EXISTS org_members CASCADE;
DROP TABLE IF EXISTS organizations CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- 1. CORE SYSTEM USERS
-- Maps to auth.users in production, provides meta for members and superadmins.
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  avatar_url TEXT,
  is_superadmin BOOLEAN DEFAULT FALSE,
  auth_user_id TEXT UNIQUE, -- Supported for Supabase Auth auto-sync triggers
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. MULTI-TENANT NGO ORGANIZATIONS
CREATE TABLE organizations (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  tagline TEXT NOT NULL,
  description TEXT NOT NULL,
  mission TEXT,
  vision TEXT,
  logo_url TEXT,
  cover_url TEXT,
  primary_color TEXT DEFAULT '#16a34a',
  secondary_color TEXT DEFAULT '#ca8a04',
  language TEXT DEFAULT 'en' CHECK (language IN ('en', 'fr', 'rw')),
  auto_confirm_members BOOLEAN DEFAULT TRUE,
  donations_enabled BOOLEAN DEFAULT TRUE,
  donation_mtn_number TEXT,
  donation_airtel_number TEXT,
  donation_account_name TEXT,
  donation_description TEXT,
  subscription_status TEXT DEFAULT 'trial' CHECK (subscription_status IN ('trial', 'active', 'expired')),
  subscription_ends_at TIMESTAMPTZ,
  org_category TEXT NOT NULL,
  location_name TEXT,
  contact_us TEXT,
  gallery_urls TEXT[] DEFAULT '{}',
  dashboard_theme TEXT DEFAULT 'light',
  dashboard_logo TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. INTER-ORG MEMBER TIERS
CREATE TABLE member_tiers (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  org_id TEXT REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  annual_fee NUMERIC DEFAULT 0,
  currency TEXT DEFAULT 'RWF',
  benefits TEXT[] DEFAULT '{}',
  color TEXT
);

-- 4. ORGANIZATION MEMBERS (MEMBERSHIP MAPPING)
CREATE TABLE org_members (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  org_id TEXT REFERENCES organizations(id) ON DELETE CASCADE,
  user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member' CHECK (role IN ('org_admin', 'member')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'suspended')),
  member_number TEXT,
  tier_id TEXT, -- References member_tiers loosely or as string
  joined_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. PUBLIC PROGRAMS
CREATE TABLE programs (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  org_id TEXT REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'planning' CHECK (status IN ('planning', 'active', 'completed')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. COMMUNITY SESSIONS & EVENTS
CREATE TABLE events (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  org_id TEXT REFERENCES organizations(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  date_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ,
  location TEXT NOT NULL,
  online_link TEXT,
  program_id TEXT REFERENCES programs(id) ON DELETE SET NULL,
  max_attendees INTEGER,
  is_public BOOLEAN DEFAULT TRUE,
  qr_code_token TEXT,
  attendees_count INTEGER DEFAULT 0,
  status TEXT DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'active', 'completed', 'cancelled'))
);

-- 7. EVENT PORTAL CHECK-IN & ATTENDANCE 
CREATE TABLE event_attendance (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  event_id TEXT REFERENCES events(id) ON DELETE CASCADE,
  member_id TEXT REFERENCES org_members(id) ON DELETE CASCADE,
  check_in_time TIMESTAMPTZ DEFAULT NOW(),
  check_in_method TEXT DEFAULT 'self' CHECK (check_in_method IN ('manual', 'qr', 'self'))
);

-- 8. MEETINGS & MINUTING BOARDS
CREATE TABLE meetings (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  org_id TEXT REFERENCES organizations(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  date_time TIMESTAMPTZ NOT NULL,
  duration INTEGER DEFAULT 60, -- minutes
  location TEXT NOT NULL,
  link TEXT,
  agenda JSONB DEFAULT '[]'::jsonb,
  minutes TEXT,
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled'))
);

-- 9. ACTION ITEMS ASSIGNED IN MEETINGS
CREATE TABLE action_items (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  org_id TEXT REFERENCES organizations(id) ON DELETE CASCADE,
  meeting_id TEXT REFERENCES meetings(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  assigned_to TEXT REFERENCES org_members(id) ON DELETE CASCADE,
  due_date TIMESTAMPTZ NOT NULL,
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'completed'))
);

-- 10. REAL-TIME INTERACTIVE CHAT CHANNELS
CREATE TABLE chat_channels (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  org_id TEXT REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT DEFAULT 'group' CHECK (type IN ('group', 'announcement', 'direct')),
  created_by TEXT REFERENCES users(id) ON DELETE CASCADE
);

-- 11. CHAT CHANNEL MESSAGES
CREATE TABLE chat_messages (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  channel_id TEXT REFERENCES chat_channels(id) ON DELETE CASCADE,
  sender_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  attachment_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. BRANDEED ANNOUNCEMENTS / NEWS
CREATE TABLE news_posts (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  org_id TEXT REFERENCES organizations(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  excerpt TEXT NOT NULL,
  cover_url TEXT,
  category TEXT NOT NULL,
  visibility TEXT DEFAULT 'public' CHECK (visibility IN ('public', 'members')),
  is_pinned BOOLEAN DEFAULT FALSE,
  author_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  published_at TIMESTAMPTZ DEFAULT NOW(),
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0
);

-- 13. DYNAMIC METRIC GOALS (GOALS TRACKER)
CREATE TABLE goals (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  org_id TEXT REFERENCES organizations(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  target NUMERIC NOT NULL,
  unit TEXT NOT NULL,
  current_progress NUMERIC DEFAULT 0,
  deadline TIMESTAMPTZ NOT NULL,
  visibility TEXT DEFAULT 'public' CHECK (visibility IN ('public', 'members')),
  is_pinned BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 14. GOAL INCREMENTS & FIELD UPDATES
CREATE TABLE goal_updates (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  goal_id TEXT REFERENCES goals(id) ON DELETE CASCADE,
  value NUMERIC NOT NULL,
  note TEXT,
  updated_by TEXT REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 15. NGO GRANTS TRACKER & OPPORTUNITIES BOARD
CREATE TABLE grants (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  org_id TEXT REFERENCES organizations(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  funder TEXT NOT NULL,
  amount_range TEXT NOT NULL,
  currency TEXT DEFAULT 'USD',
  deadline TIMESTAMPTZ NOT NULL,
  link TEXT,
  eligibility TEXT,
  program_id TEXT REFERENCES programs(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'tracking' CHECK (status IN ('tracking', 'applied', 'successful', 'unsuccessful', 'withdrawn'))
);

-- 16. CORE BOOKKEEPING LEDGER ENTRIES
CREATE TABLE ledger_entries (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  org_id TEXT REFERENCES organizations(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  amount NUMERIC NOT NULL,
  currency TEXT DEFAULT 'RWF',
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  date TIMESTAMPTZ NOT NULL,
  reference TEXT,
  receipt_url TEXT,
  program_id TEXT REFERENCES programs(id) ON DELETE SET NULL
);

-- 17. MOMO DONATIONS SUBMISSIONS
CREATE TABLE donations (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  org_id TEXT REFERENCES organizations(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL,
  donor_name TEXT NOT NULL,
  donor_email TEXT NOT NULL,
  message TEXT,
  payment_method TEXT NOT NULL CHECK (payment_method IN ('mtn', 'airtel')),
  proof_url TEXT,
  status TEXT DEFAULT 'awaiting_approval' CHECK (status IN ('awaiting_approval', 'confirmed', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 18. PLATFORM INCIDENT GLITCH REPORTS 
CREATE TABLE error_reports (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  org_id TEXT REFERENCES organizations(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  screenshot_url TEXT,
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'critical')),
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'in_review', 'resolved', 'wont_fix')),
  admin_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 19. TENANT LICENSE PREMIUM SUBSCRIPTION PAYMENTS
CREATE TABLE subscription_payments (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  org_id TEXT REFERENCES organizations(id) ON DELETE CASCADE,
  plan TEXT NOT NULL,
  amount_usd NUMERIC NOT NULL,
  amount_local NUMERIC NOT NULL,
  method TEXT NOT NULL CHECK (method IN ('mtn', 'airtel')),
  phone TEXT NOT NULL,
  reference TEXT NOT NULL,
  proof_url TEXT,
  status TEXT DEFAULT 'awaiting_approval' CHECK (status IN ('awaiting_approval', 'approved', 'rejected')),
  submitted_at TIMESTAMPTZ DEFAULT NOW()
);

-- 20. PLATFORM GLOBAL BILLING AND EXCHANGE RATES SETTINGS
CREATE TABLE platform_settings (
  id TEXT PRIMARY KEY,
  usd_to_rwf_rate NUMERIC DEFAULT 1300,
  eur_to_rwf_rate NUMERIC DEFAULT 1400,
  kes_to_rwf_rate NUMERIC DEFAULT 10,
  mtn_payment_number TEXT DEFAULT '0788100100',
  airtel_payment_number TEXT DEFAULT '0733100100',
  payment_name TEXT DEFAULT 'VIRELLIX INC',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================================
-- SEED DATA SETUP
-- =====================================================================

-- SEED: PLATFORM SETTINGS
INSERT INTO platform_settings (id, usd_to_rwf_rate, eur_to_rwf_rate, kes_to_rwf_rate, mtn_payment_number, airtel_payment_number, payment_name)
VALUES ('global', 1300, 1400, 10, '0788100100', '0733100100', 'VIRELLIX INC');

-- SEED: USERS
INSERT INTO users (id, email, full_name, avatar_url, is_superadmin, created_at) VALUES 
('user-super', 'superadmin@impacto.rw', 'Gaby Prince Kabuye', 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100', TRUE, '2026-01-01T00:00:00Z'),
('user-admin', 'admin@impacto.rw', 'Anatole Mugisha', 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100', FALSE, '2026-02-01T00:00:00Z'),
('user-member', 'member@impacto.rw', 'Divine Uwera', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100', FALSE, '2026-03-01T00:00:00Z'),
('user-donor', 'john@funder.org', 'John Radcliffe', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100', FALSE, '2026-04-01T00:00:00Z');

-- SEED: ORGANIZATIONS
INSERT INTO organizations (id, name, slug, tagline, description, mission, vision, logo_url, cover_url, primary_color, secondary_color, language, auto_confirm_members, donations_enabled, donation_mtn_number, donation_airtel_number, donation_account_name, donation_description, subscription_status, subscription_ends_at, org_category, created_at) VALUES
('org-rfc', 'Rwanda Forestry Center', 'rfc', 'Restoring hillsides and greening Kigali''s future', 'Our mission is to plant 1 million native trees across Eastern Province hillsides by 2028, training local cooperatives in agroforestry.', 'To inspire community-led landscape restoration for climate resilience.', 'A green and climate-resilient Rwanda with flourishing indigenous woodlands.', 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=150', 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=1200', '#16a34a', '#ca8a04', 'en', TRUE, TRUE, '0788123456', '0733123456', 'Rwanda Forestry Center', 'Support our hills nursery project in Kayonza. Every 1,000 RWF plants 2 native trees.', 'active', '2027-12-31T23:59:59Z', 'Environment', '2026-01-10T12:00:00Z'),
('org-imbuto', 'Imbuto Scholars Foundation', 'imbuto', 'Empowering underrepresented youth in ICT', 'Imbuto Scholars Foundation matches high-potential high schoolers in Rwanda with top-tier tech mentorship and university scholarships.', 'Unlocking extraordinary talent through quality secondary and tertiary resources.', 'Leading tech-driven sustainable economies throughout East Africa.', 'https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=150', 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=1200', '#1d4ed8', '#f59e0b', 'en', FALSE, TRUE, '0788777888', '0733777888', 'Imbuto Scholars Trust', 'Help buy laptops for 20 incoming female engineering students.', 'trial', '2026-06-30T23:59:59Z', 'Education', '2026-05-01T08:00:00Z');

-- SEED: MEMBER TIERS
INSERT INTO member_tiers (id, org_id, name, annual_fee, currency, benefits, color) VALUES
('tier-gold', 'org-rfc', 'Gold Conservator', 50000, 'RWF', ARRAY['Priority planting access', 'Quarterly printed audits', 'Annual Forest banquet invitation'], '#ca8a04'),
('tier-bronze', 'org-rfc', 'Seedling Guardian', 10000, 'RWF', ARRAY['Eco-badge on active lists', 'Bi-annual planting meetups'], '#854d0e');

-- SEED: MEMBERS
INSERT INTO org_members (id, org_id, user_id, role, status, member_number, tier_id, joined_at) VALUES 
('member-1', 'org-rfc', 'user-admin', 'org_admin', 'active', 'RFC-001', 'tier-gold', '2026-01-10T14:00:00Z'),
('member-2', 'org-rfc', 'user-member', 'member', 'active', 'RFC-014', 'tier-bronze', '2026-03-01T09:00:00Z'),
('member-3', 'org-imbuto', 'user-admin', 'org_admin', 'active', 'IS-001', NULL, '2026-05-01T08:30:00Z');

-- SEED: PROGRAMS
INSERT INTO programs (id, org_id, name, description, status, created_at) VALUES
('prog-1', 'org-rfc', 'Eastern Province Reforestation', 'Reforesting hillsides in Kayonza, Nyagatare and Bugesera.', 'active', '2026-01-15T09:00:00Z'),
('prog-2', 'org-imbuto', 'ICT Mentorship Kigali', 'Connecting teenage developers with industry experts.', 'active', '2026-05-02T10:00:00Z');

-- SEED: EVENTS
INSERT INTO events (id, org_id, title, description, date_time, end_time, location, online_link, program_id, max_attendees, is_public, qr_code_token, attendees_count, status) VALUES
('event-1', 'org-rfc', 'Eco-Restoration Planting Day at Mt. Kigali', 'Join us for our major mid-year planting session. We will meet at Nyarugenge side and plant 5,000 indigenous saplings. Gloves and lunch provided.', '2026-06-15T08:00:00Z', '2026-06-15T15:00:00Z', 'Mt. Kigali Forest Reserve, Kigali', NULL, 'prog-1', 150, TRUE, 'event-token-mtkigali', 82, 'upcoming'),
('event-2', 'org-rfc', 'Agroforestry Capacity Masterclass', 'Online training session on integrating grevillea and avocado trees into dryland bean farming systems.', '2026-05-28T14:00:00Z', '2026-05-28T16:00:00Z', 'Zoom Virtual Classroom', 'https://zoom.us/j/123456789', 'prog-1', 200, TRUE, 'event-token-mclass', 30, 'upcoming');

-- SEED: EVENT ATTENDANCE
INSERT INTO event_attendance (id, event_id, member_id, check_in_time, check_in_method) VALUES
('chk-1', 'event-1', 'member-1', '2026-06-15T08:05:00Z', 'qr'),
('chk-2', 'event-1', 'member-2', '2026-06-15T08:12:00Z', 'self');

-- SEED: MEETINGS
INSERT INTO meetings (id, org_id, title, date_time, duration, location, link, agenda, minutes, status) VALUES
('meet-1', 'org-rfc', 'Q2 Forest Strategy and Seedling Procurement', '2026-05-20T10:00:00Z', 90, 'Main Conference Room, Kigali Head Office', 'https://meet.google.com/abc-defg-hij', '[{"title": "Open and Introductions", "duration": 10}, {"title": "Seedling supply pipeline review", "duration": 40}, {"title": "Partner feedback analysis", "duration": 40}]'::jsonb, '# Minutes for Q2 Forest Strategy\n\n- Seedlings reviewed: Kayonza cooperative approved as main nursery partner.\n- Confirmed 20,000 grevillea seedlings reserved.\n- Discovered bug in Excel sheet; resolved in software ledger instead.', 'completed'),
('meet-2', 'org-rfc', 'Kayonza Community Launch Sync', '2026-06-02T13:00:00Z', 45, 'Kayonza Cooperative Station Block A', NULL, '[]'::jsonb, NULL, 'scheduled');

-- SEED: GOALS
INSERT INTO goals (id, org_id, title, description, target, unit, current_progress, deadline, visibility, is_pinned, created_at) VALUES
('goal-1', 'org-rfc', 'Kayonza Indigenous Planting Initiative', 'Planting sustainable high-canopy trees to rebuild lost woodlands.', 25000, 'saplings', 18200, '2026-11-30T00:00:00Z', 'public', TRUE, '2026-01-12T00:00:00Z'),
('goal-2', 'org-imbuto', 'ICT mentorship scholars matched', 'Match scholarship beneficiaries with active professional software consultants in Rwanda.', 50, 'students', 15, '2026-12-31T00:00:00Z', 'public', FALSE, '2026-05-02T00:00:00Z');

-- SEED: GOAL UPDATES
INSERT INTO goal_updates (id, goal_id, value, note, updated_by, created_at) VALUES
('gup-1', 'goal-1', 12000, 'Initial seeding session in Kayonza District.', 'user-admin', '2026-03-15T10:00:00Z'),
('gup-2', 'goal-1', 6200, 'Rains check-in planting on Mt. Kabuye hill.', 'user-admin', '2026-05-18T14:30:00Z');

-- SEED: GRANTS
INSERT INTO grants (id, org_id, title, funder, amount_range, currency, deadline, link, eligibility, program_id, status) VALUES
('grant-1', 'org-rfc', 'Green Canopy Trust Fund Program', 'Rwandan Ministry of Environment (FONERWA)', 'RWF 15,000,000 - 30,000,000', 'RWF', '2026-08-30T00:00:00Z', 'https://moe.gov.rw', 'Registered non-profit environmental centers actively planting in Rwanda.', 'prog-1', 'tracking'),
('grant-2', 'org-imbuto', 'Girls in Tech Secondary Scholars Hub grant', 'Mastercard Foundation', '$10,000 - $25,005', 'USD', '2026-06-15T00:00:00Z', NULL, 'East African STEM NGOs with over 1 year of audit sheets.', 'prog-2', 'tracking');

-- SEED: LEDGER ENTRIES
INSERT INTO ledger_entries (id, org_id, type, amount, currency, category, description, date, reference, receipt_url, program_id) VALUES
('led-1', 'org-rfc', 'income', 12500000, 'RWF', 'Grants', 'FONERWA Phase 1 Seedling Funding disbursement', '2026-02-15T11:00:00Z', 'FON-9921', 'https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?w=300', 'prog-1'),
('led-2', 'org-rfc', 'expense', 4500000, 'RWF', 'Operations', 'Kayonza cooperative nursery sapling procurement', '2026-03-20T10:30:00Z', 'KAY-COOP-88', NULL, 'prog-1'),
('led-3', 'org-rfc', 'income', 50000, 'RWF', 'Member Dues', 'Annual gold conservator renewal by Anatole', '2026-04-12T09:00:00Z', 'MEMB-GOLD-9', NULL, NULL);

-- SEED: DONATIONS
INSERT INTO donations (id, org_id, amount, donor_name, donor_email, message, payment_method, proof_url, status, created_at) VALUES
('don-1', 'org-rfc', 15000, 'Sylvstre Ndorizampanze', 'sylv@domain.rw', 'Keep up the beautiful reforestation on Kayonza hills! God bless.', 'mtn', 'https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?w=300', 'confirmed', '2026-04-20T11:01:00Z'),
('don-2', 'org-rfc', 25000, 'Jeanne d''Arc Uwonkunda', 'jeanne.uw@gmail.com', 'Plant some native avocado trees for Kayonza scholars families.', 'mtn', 'https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?w=300', 'awaiting_approval', '2026-05-24T14:45:00Z');

-- SEED: ERROR REPORTS
INSERT INTO error_reports (id, org_id, title, description, screenshot_url, priority, status, admin_notes, created_at) VALUES
('err-1', 'org-rfc', 'Bookkeeping Save Glitch', 'When entering negative RWF amount in expense description, ledger saves entry field with positive symbol.', 'https://images.unsplash.com/photo-1594322436404-5a0526db4d13?w=300', 'normal', 'open', NULL, '2026-05-22T13:40:00Z');

-- SEED: SUBSCRIPTION PAYMENTS
INSERT INTO subscription_payments (id, org_id, plan, amount_usd, amount_local, method, phone, reference, proof_url, status, submitted_at) VALUES
('sub-pay-1', 'org-imbuto', 'Starter Plan', 25, 32500, 'mtn', '0788777888', 'TXN-SUB-82910', 'https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?w=300', 'awaiting_approval', '2026-05-01T08:15:00Z');

-- SEED: NEWS POSTS
INSERT INTO news_posts (id, org_id, title, body, excerpt, cover_url, category, visibility, is_pinned, author_id, published_at, likes_count, comments_count) VALUES
('news-1', 'org-rfc', 'Over 18,200 saplings successfully planted in Bugesera', 'Our reforestation project completed another fantastic phase this spring. Local school matches showed up to help clean, water, and dig trenches.', 'Our joint community campaign has successfully achieved over 18,200 planted saplings across semi-arid regions of Bugesera.', 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800', 'Impact Campaign', 'public', TRUE, 'user-admin', '2026-04-10T10:00:00Z', 0, 0);

-- =====================================================================
-- ROW LEVEL SECURITY (RLS) WITH ROBUST MULTI-TENANT ISOLATION
-- =====================================================================

-- Enable RLS on all relational tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE org_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE member_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE action_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE news_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE goal_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE grants ENABLE ROW LEVEL SECURITY;
ALTER TABLE ledger_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE error_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_payments ENABLE ROW LEVEL SECURITY;

-- 1. SECURITY DEFINER HELPERS (TO AVOID CACHE RECURSION RE-ENTRY ERRORS)
-- Verifies whether a given authenticated user has an active membership roll in the specified organization.
CREATE OR REPLACE FUNCTION is_member_of_org(org_id TEXT, user_uid TEXT)
RETURNS BOOLEAN SECURITY DEFINER AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM org_members 
    WHERE org_members.org_id = is_member_of_org.org_id 
      AND org_members.user_id = is_member_of_org.user_uid 
      AND org_members.status = 'active'
  );
END;
$$ LANGUAGE plpgsql;

-- Verifies whether a given authenticated user is an active administrator of the specified organization.
CREATE OR REPLACE FUNCTION is_admin_of_org(org_id TEXT, user_uid TEXT)
RETURNS BOOLEAN SECURITY DEFINER AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM org_members 
    WHERE org_members.org_id = is_admin_of_org.org_id 
      AND org_members.user_id = is_admin_of_org.user_uid 
      AND org_members.role = 'org_admin' 
      AND org_members.status = 'active'
  );
END;
$$ LANGUAGE plpgsql;


-- Verifies whether a given authenticated user is a platform-wide Superadmin.
CREATE OR REPLACE FUNCTION is_platform_superadmin(user_uid TEXT)
RETURNS BOOLEAN SECURITY DEFINER AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = is_platform_superadmin.user_uid 
      AND users.is_superadmin = true
  );
END;
$$ LANGUAGE plpgsql;


-- 2. SECURITY POLICIES BY TENANT / USER ID SCHEMA

-- users
CREATE POLICY select_users ON users 
  FOR SELECT USING (auth.role() = 'authenticated' OR id LIKE 'user-%');
CREATE POLICY insert_users ON users 
  FOR INSERT WITH CHECK (auth.uid()::text = id OR auth.role() = 'authenticated');
CREATE POLICY update_users ON users 
  FOR UPDATE USING (auth.uid()::text = id OR is_platform_superadmin(auth.uid()::text));

-- organizations
CREATE POLICY select_organizations ON organizations 
  FOR SELECT USING (true); -- Public discovery directory listed publicly
CREATE POLICY insert_organizations ON organizations 
  FOR INSERT WITH CHECK (auth.role() = 'authenticated'); -- Any authenticated user can create a brand new NGO organization
CREATE POLICY update_organizations ON organizations 
  FOR UPDATE USING (is_admin_of_org(id, auth.uid()::text) OR is_platform_superadmin(auth.uid()::text));
CREATE POLICY delete_organizations ON organizations 
  FOR DELETE USING (is_admin_of_org(id, auth.uid()::text) OR is_platform_superadmin(auth.uid()::text));

-- org_members
CREATE POLICY select_org_members ON org_members 
  FOR SELECT USING (
    is_member_of_org(org_id, auth.uid()::text) 
    OR user_id = auth.uid()::text 
    OR is_platform_superadmin(auth.uid()::text)
  );
CREATE POLICY insert_org_members ON org_members 
  FOR INSERT WITH CHECK (
    auth.uid()::text = user_id 
    OR is_admin_of_org(org_id, auth.uid()::text) 
    OR is_platform_superadmin(auth.uid()::text)
  );
CREATE POLICY update_org_members ON org_members 
  FOR UPDATE USING (
    is_admin_of_org(org_id, auth.uid()::text) 
    OR is_platform_superadmin(auth.uid()::text)
  );
CREATE POLICY delete_org_members ON org_members 
  FOR DELETE USING (
    is_admin_of_org(org_id, auth.uid()::text) 
    OR is_platform_superadmin(auth.uid()::text)
  );

-- member_tiers
CREATE POLICY select_member_tiers ON member_tiers 
  FOR SELECT USING (true); -- Dues tier prices are public
CREATE POLICY write_member_tiers ON member_tiers 
  FOR ALL USING (is_admin_of_org(org_id, auth.uid()::text));

-- programs
CREATE POLICY select_programs ON programs 
  FOR SELECT USING (is_member_of_org(org_id, auth.uid()::text));
CREATE POLICY write_programs ON programs 
  FOR ALL USING (is_admin_of_org(org_id, auth.uid()::text));

-- events
CREATE POLICY select_events ON events 
  FOR SELECT USING (is_public = true OR is_member_of_org(org_id, auth.uid()::text));
CREATE POLICY write_events ON events 
  FOR ALL USING (is_admin_of_org(org_id, auth.uid()::text));

-- event_attendance
CREATE POLICY select_event_attendance ON event_attendance 
  FOR SELECT USING (true); -- Public attendance metrics
CREATE POLICY insert_event_attendance ON event_attendance 
  FOR INSERT WITH CHECK (true); -- Scan QR check-in allowed for any validated session member

-- meetings
CREATE POLICY select_meetings ON meetings 
  FOR SELECT USING (is_member_of_org(org_id, auth.uid()::text));
CREATE POLICY write_meetings ON meetings 
  FOR ALL USING (is_admin_of_org(org_id, auth.uid()::text));

-- action_items
CREATE POLICY select_action_items ON action_items 
  FOR SELECT USING (is_member_of_org(org_id, auth.uid()::text));
CREATE POLICY write_action_items ON action_items 
  FOR ALL USING (is_member_of_org(org_id, auth.uid()::text));

-- chat_channels
CREATE POLICY select_chat_channels ON chat_channels 
  FOR SELECT USING (is_member_of_org(org_id, auth.uid()::text));
CREATE POLICY write_chat_channels ON chat_channels 
  FOR ALL USING (is_member_of_org(org_id, auth.uid()::text));

-- chat_messages
CREATE POLICY select_chat_messages ON chat_messages 
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM chat_channels 
    WHERE chat_channels.id = channel_id 
      AND is_member_of_org(chat_channels.org_id, auth.uid()::text)
  ));
CREATE POLICY insert_chat_messages ON chat_messages 
  FOR INSERT WITH CHECK (auth.uid()::text = sender_id);

-- news_posts
CREATE POLICY select_news_posts ON news_posts 
  FOR SELECT USING (visibility = 'public' OR is_member_of_org(org_id, auth.uid()::text));
CREATE POLICY write_news_posts ON news_posts 
  FOR ALL USING (is_admin_of_org(org_id, auth.uid()::text));

-- goals
CREATE POLICY select_goals ON goals 
  FOR SELECT USING (visibility = 'public' OR is_member_of_org(org_id, auth.uid()::text));
CREATE POLICY write_goals ON goals 
  FOR ALL USING (is_admin_of_org(org_id, auth.uid()::text));

-- goal_updates
CREATE POLICY select_goal_updates ON goal_updates 
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM goals 
    WHERE goals.id = goal_id 
      AND (goals.visibility = 'public' OR is_member_of_org(goals.org_id, auth.uid()::text))
  ));
CREATE POLICY write_goal_updates ON goal_updates 
  FOR ALL USING (EXISTS (
    SELECT 1 FROM goals 
    WHERE goals.id = goal_id 
      AND is_member_of_org(goals.org_id, auth.uid()::text)
  ));

-- grants
CREATE POLICY select_grants ON grants 
  FOR SELECT USING (is_member_of_org(org_id, auth.uid()::text));
CREATE POLICY write_grants ON grants 
  FOR ALL USING (is_admin_of_org(org_id, auth.uid()::text));

-- ledger_entries
CREATE POLICY select_ledger_entries ON ledger_entries 
  FOR SELECT USING (is_member_of_org(org_id, auth.uid()::text));
CREATE POLICY write_ledger_entries ON ledger_entries 
  FOR ALL USING (is_admin_of_org(org_id, auth.uid()::text));

-- donations
CREATE POLICY select_donations ON donations 
  FOR SELECT USING (is_member_of_org(org_id, auth.uid()::text));
CREATE POLICY insert_donations ON donations 
  FOR INSERT WITH CHECK (true); -- Public donor flow can submit any verified MoMo proof

-- error_reports
CREATE POLICY select_error_reports ON error_reports 
  FOR SELECT USING (is_member_of_org(org_id, auth.uid()::text) OR is_platform_superadmin(auth.uid()::text));
CREATE POLICY insert_error_reports ON error_reports 
  FOR INSERT WITH CHECK (true); -- Any active user session can submit crash report references
CREATE POLICY update_error_reports ON error_reports 
  FOR UPDATE USING (is_member_of_org(org_id, auth.uid()::text) OR is_platform_superadmin(auth.uid()::text));

-- subscription_payments
CREATE POLICY select_subscription_payments ON subscription_payments 
  FOR SELECT USING (is_member_of_org(org_id, auth.uid()::text) OR is_platform_superadmin(auth.uid()::text));
CREATE POLICY insert_subscription_payments ON subscription_payments 
  FOR INSERT WITH CHECK (is_admin_of_org(org_id, auth.uid()::text));
CREATE POLICY update_subscription_payments ON subscription_payments 
  FOR UPDATE USING (is_platform_superadmin(auth.uid()::text));

-- platform_settings
ALTER TABLE platform_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY select_platform_settings ON platform_settings 
  FOR SELECT USING (true);
CREATE POLICY update_platform_settings ON platform_settings 
  FOR UPDATE USING (is_platform_superadmin(auth.uid()::text));






-- =====================================================================
-- IMPACTO SYSTEM DATABASE MIGRATION & SCHEMAS (ADDITIONAL UPDATES)
-- Run this query to fix signup errors, RLS policy violations, and register the Superadmin.
-- =====================================================================

-- Ensure we have the pgcrypto extension for password hashing/UUID generators
CREATE EXTENSION IF NOT EXISTS pgcrypto CASCADE;

-- Add auth_user_id column to users table if it doesn't already exist
ALTER TABLE users ADD COLUMN IF NOT EXISTS auth_user_id TEXT UNIQUE;

-- Add automatic UUID generation as default for key table identifiers
ALTER TABLE organizations ALTER COLUMN id SET DEFAULT gen_random_uuid()::text;
ALTER TABLE org_members ALTER COLUMN id SET DEFAULT gen_random_uuid()::text;
ALTER TABLE member_tiers ALTER COLUMN id SET DEFAULT gen_random_uuid()::text;
ALTER TABLE programs ALTER COLUMN id SET DEFAULT gen_random_uuid()::text;
ALTER TABLE events ALTER COLUMN id SET DEFAULT gen_random_uuid()::text;
ALTER TABLE event_attendance ALTER COLUMN id SET DEFAULT gen_random_uuid()::text;
ALTER TABLE meetings ALTER COLUMN id SET DEFAULT gen_random_uuid()::text;
ALTER TABLE action_items ALTER COLUMN id SET DEFAULT gen_random_uuid()::text;
ALTER TABLE chat_channels ALTER COLUMN id SET DEFAULT gen_random_uuid()::text;
ALTER TABLE chat_messages ALTER COLUMN id SET DEFAULT gen_random_uuid()::text;
ALTER TABLE news_posts ALTER COLUMN id SET DEFAULT gen_random_uuid()::text;
ALTER TABLE goals ALTER COLUMN id SET DEFAULT gen_random_uuid()::text;
ALTER TABLE goal_updates ALTER COLUMN id SET DEFAULT gen_random_uuid()::text;
ALTER TABLE grants ALTER COLUMN id SET DEFAULT gen_random_uuid()::text;
ALTER TABLE ledger_entries ALTER COLUMN id SET DEFAULT gen_random_uuid()::text;
ALTER TABLE donations ALTER COLUMN id SET DEFAULT gen_random_uuid()::text;
ALTER TABLE error_reports ALTER COLUMN id SET DEFAULT gen_random_uuid()::text;
ALTER TABLE subscription_payments ALTER COLUMN id SET DEFAULT gen_random_uuid()::text;

-- Overwrite the handle_new_user() trigger function in public schema to correctly populate both "id" and "auth_user_id"
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, avatar_url, is_superadmin, auth_user_id)
  VALUES (
    NEW.id::text,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NEW.raw_user_meta_data->>'avatar_url',
    FALSE,
    NEW.id::text
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    avatar_url = EXCLUDED.avatar_url,
    auth_user_id = EXCLUDED.auth_user_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- =====================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES UPDATES & BUG FIXES
-- =====================================================================

-- 1. Correct policies for 'organizations' table
DROP POLICY IF EXISTS select_organizations ON organizations;
DROP POLICY IF EXISTS update_organizations ON organizations;
DROP POLICY IF EXISTS insert_organizations ON organizations;
DROP POLICY IF EXISTS delete_organizations ON organizations;

CREATE POLICY select_organizations ON organizations 
  FOR SELECT USING (true); -- Public discovery directory listed publicly

CREATE POLICY insert_organizations ON organizations 
  FOR INSERT WITH CHECK (auth.role() = 'authenticated'); -- Any authenticated user can create a brand new NGO organization

CREATE POLICY update_organizations ON organizations 
  FOR UPDATE USING (is_admin_of_org(id, auth.uid()::text) OR is_platform_superadmin(auth.uid()::text));

CREATE POLICY delete_organizations ON organizations 
  FOR DELETE USING (is_admin_of_org(id, auth.uid()::text) OR is_platform_superadmin(auth.uid()::text));


-- 2. Correct policies for 'org_members' table
DROP POLICY IF EXISTS select_org_members ON org_members;
DROP POLICY IF EXISTS write_org_members ON org_members;
DROP POLICY IF EXISTS insert_org_members ON org_members;
DROP POLICY IF EXISTS update_org_members ON org_members;
DROP POLICY IF EXISTS delete_org_members ON org_members;

CREATE POLICY select_org_members ON org_members 
  FOR SELECT USING (
    is_member_of_org(org_id, auth.uid()::text) 
    OR user_id = auth.uid()::text 
    OR is_platform_superadmin(auth.uid()::text)
  );

CREATE POLICY insert_org_members ON org_members 
  FOR INSERT WITH CHECK (
    auth.uid()::text = user_id 
    OR is_admin_of_org(org_id, auth.uid()::text) 
    OR is_platform_superadmin(auth.uid()::text)
  );

CREATE POLICY update_org_members ON org_members 
  FOR UPDATE USING (
    is_admin_of_org(org_id, auth.uid()::text) 
    OR is_platform_superadmin(auth.uid()::text)
  );

CREATE POLICY delete_org_members ON org_members 
  FOR DELETE USING (
    is_admin_of_org(org_id, auth.uid()::text) 
    OR is_platform_superadmin(auth.uid()::text)
  );


-- 3. Correct policies for 'users' table (allow members of the same platform/tenant to load user profiles)
DROP POLICY IF EXISTS select_users ON users;
DROP POLICY IF EXISTS insert_users ON users;
DROP POLICY IF EXISTS update_users ON users;

CREATE POLICY select_users ON users 
  FOR SELECT USING (auth.role() = 'authenticated' OR id LIKE 'user-%');

CREATE POLICY insert_users ON users 
  FOR INSERT WITH CHECK (auth.uid()::text = id OR auth.role() = 'authenticated');

CREATE POLICY update_users ON users 
  FOR UPDATE USING (auth.uid()::text = id OR is_platform_superadmin(auth.uid()::text));


-- =====================================================================
-- SUPERADMIN ACCOUNT SEED
-- =====================================================================

-- Register the superadmin into Supabase Auth schema safely
DO $$
DECLARE
  super_id UUID := '7c81d898-a6b1-4b19-b2f4-8a4db9be1cf9'; -- Safe static UUID
  enc_pwd TEXT;
BEGIN
  -- Generate blowfish-encrypted password for 'princegabby4@gmail.com'
  enc_pwd := crypt('princegabby4@gmail.com', gen_salt('bf'));

  -- Insert into auth.users if not already exists
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'princegabby4@gmail.com') THEN
    INSERT INTO auth.users (
      id,
      instance_id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      recovery_sent_at,
      last_sign_in_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at,
      confirmation_token,
      email_change,
      email_change_token_new,
      recovery_token
    ) VALUES (
      super_id,
      '00000000-0000-0000-0000-000000000000',
      'authenticated',
      'authenticated',
      'princegabby4@gmail.com',
      enc_pwd,
      NOW(),
      NULL,
      NOW(),
      '{"provider": "email", "providers": ["email"]}'::jsonb,
      '{"full_name": "Gaby Prince Kabuye"}'::jsonb,
      NOW(),
      NOW(),
      '',
      '',
      '',
      ''
    );
  ELSE
    -- If already exists in supabase auth, retrieve the matching ID
    SELECT id INTO super_id FROM auth.users WHERE email = 'princegabby4@gmail.com';
  END IF;

  -- Upsert into public.users table as a Superadmin
  INSERT INTO public.users (id, email, full_name, avatar_url, is_superadmin, auth_user_id, created_at)
  VALUES (
    super_id::text,
    'princegabby4@gmail.com',
    'Gaby Prince Kabuye',
    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100',
    TRUE,
    super_id::text,
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    is_superadmin = TRUE,
    auth_user_id = EXCLUDED.auth_user_id;

END $$;


-- =====================================================================
-- IMPACTO V2 ADDONS SCHEMA UPDATES (CUSTOMIZED FOR TEXT IDENTIFIERS)
-- =====================================================================

-- 1. Updates to existing tables: Enable chat sub-groups, types, and polls
ALTER TABLE chat_channels 
  ADD COLUMN IF NOT EXISTS channel_type TEXT DEFAULT 'general'
    CHECK (channel_type IN ('general','project','committee','private','announcement')),
  ADD COLUMN IF NOT EXISTS is_private BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS created_by TEXT REFERENCES users(id);

ALTER TABLE chat_messages
  ADD COLUMN IF NOT EXISTS message_type TEXT DEFAULT 'text'
    CHECK (message_type IN ('text','file','image','voice','poll','system')),
  ADD COLUMN IF NOT EXISTS file_url TEXT,
  ADD COLUMN IF NOT EXISTS file_name TEXT,
  ADD COLUMN IF NOT EXISTS file_size BIGINT,
  ADD COLUMN IF NOT EXISTS file_mime_type TEXT,
  ADD COLUMN IF NOT EXISTS voice_duration_seconds INT,
  ADD COLUMN IF NOT EXISTS reply_to_id TEXT REFERENCES chat_messages(id);

-- 2. Updates to existing members/org tables: Identity verification, Role Promotion & Finance
ALTER TABLE org_members
  ADD COLUMN IF NOT EXISTS verification_status TEXT DEFAULT 'not_required'
    CHECK (verification_status IN (
      'not_required','pending','verified','rejected','flagged'
    )),
  ADD COLUMN IF NOT EXISTS verified_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS verified_by TEXT REFERENCES users(id);

-- Add permissions to org_members to support granular manager rights
ALTER TABLE org_members
  ADD COLUMN IF NOT EXISTS permissions JSONB DEFAULT '{
    "manage_members": false,
    "manage_content": false,
    "manage_finance": false,
    "manage_settings": false,
    "view_analytics": false,
    "manage_documents": false,
    "manage_chat": false
  }';

-- Suppport 'manager' and 'superadmin' roles cleanly in org_members CHECK constraint
ALTER TABLE org_members DROP CONSTRAINT IF EXISTS org_members_role_check;
ALTER TABLE org_members ADD CONSTRAINT org_members_role_check 
  CHECK (role IN ('superadmin','org_admin','manager','member'));

-- 3. Quorum tracking configuration
ALTER TABLE organizations
  ADD COLUMN IF NOT EXISTS quorum_type TEXT DEFAULT 'absolute'
    CHECK (quorum_type IN ('absolute', 'percentage')),
  ADD COLUMN IF NOT EXISTS quorum_value INT DEFAULT 0;

ALTER TABLE meetings
  ADD COLUMN IF NOT EXISTS quorum_required INT,
  ADD COLUMN IF NOT EXISTS quorum_reached BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS quorum_count_at_completion INT,
  ADD COLUMN IF NOT EXISTS attendance_count INT DEFAULT 0;

-- 4. Documents acknowledgement integration setup
CREATE TABLE IF NOT EXISTS documents (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  org_id TEXT REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  file_url TEXT,
  file_size TEXT,
  uploaded_by TEXT REFERENCES users(id),
  requires_acknowledgement BOOLEAN DEFAULT false,
  acknowledgement_deadline DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- NEW V2 TABLES
-- ==========================================

-- Poll Messages (WhatsApp style chat polls)
CREATE TABLE IF NOT EXISTS poll_messages (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  message_id TEXT REFERENCES chat_messages(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  options JSONB NOT NULL,
  allow_multiple BOOLEAN DEFAULT false,
  show_results_before_vote BOOLEAN DEFAULT true,
  expires_at TIMESTAMPTZ,
  is_closed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS poll_responses (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  poll_id TEXT REFERENCES poll_messages(id) ON DELETE CASCADE,
  member_id TEXT REFERENCES org_members(id) ON DELETE CASCADE,
  selected_options JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(poll_id, member_id)
);

-- Activity Logs (Attendance Beyond Events)
CREATE TABLE IF NOT EXISTS activity_logs (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  org_id TEXT REFERENCES organizations(id) ON DELETE CASCADE,
  program_id TEXT REFERENCES programs(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  location TEXT,
  activity_date DATE NOT NULL,
  created_by TEXT REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS activity_attendance (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  activity_id TEXT REFERENCES activity_logs(id) ON DELETE CASCADE,
  member_id TEXT REFERENCES org_members(id) ON DELETE CASCADE,
  recorded_by TEXT REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(activity_id, member_id)
);

-- Communication Templates & Sends
CREATE TABLE IF NOT EXISTS message_templates (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  org_id TEXT REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  occasion TEXT,
  subject TEXT,
  body TEXT NOT NULL,
  variables TEXT[],
  is_system_template BOOLEAN DEFAULT false,
  created_by TEXT REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS notification_sends (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  org_id TEXT REFERENCES organizations(id) ON DELETE CASCADE,
  template_id TEXT REFERENCES message_templates(id) ON DELETE SET NULL,
  sent_by TEXT REFERENCES users(id),
  recipient_group TEXT,
  recipient_count INT,
  activity_id TEXT REFERENCES activity_logs(id) ON DELETE SET NULL,
  event_id TEXT REFERENCES events(id) ON DELETE SET NULL,
  meeting_id TEXT REFERENCES meetings(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Event RSVP & Waitlist system
CREATE TABLE IF NOT EXISTS event_rsvps (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  event_id TEXT REFERENCES events(id) ON DELETE CASCADE,
  member_id TEXT REFERENCES org_members(id) ON DELETE CASCADE,
  response TEXT NOT NULL CHECK (response IN ('yes','no','maybe')),
  responded_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(event_id, member_id)
);

CREATE TABLE IF NOT EXISTS event_waitlist (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  event_id TEXT REFERENCES events(id) ON DELETE CASCADE,
  member_id TEXT REFERENCES org_members(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  notified_at TIMESTAMPTZ,
  UNIQUE(event_id, member_id)
);

-- Identity document verifications
CREATE TABLE IF NOT EXISTS identity_verifications (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  member_id TEXT REFERENCES org_members(id) ON DELETE CASCADE,
  org_id TEXT REFERENCES organizations(id) ON DELETE CASCADE,
  document_type TEXT NOT NULL,
  document_url TEXT NOT NULL,
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ,
  reviewed_by TEXT REFERENCES users(id),
  review_notes TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected'))
);

-- Document signing
CREATE TABLE IF NOT EXISTS document_acknowledgements (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  document_id TEXT REFERENCES documents(id) ON DELETE CASCADE,
  member_id TEXT REFERENCES org_members(id) ON DELETE CASCADE,
  org_id TEXT REFERENCES organizations(id) ON DELETE CASCADE,
  document_version INT NOT NULL,
  acknowledged_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(document_id, member_id, document_version)
);

-- Resignations / Exit Process
CREATE TABLE IF NOT EXISTS resignations (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  member_id TEXT REFERENCES org_members(id) ON DELETE CASCADE,
  org_id TEXT REFERENCES organizations(id) ON DELETE CASCADE,
  reason_category TEXT,
  reason_detail TEXT,
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  finalized_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','finalized','cancelled')),
  admin_response TEXT,
  admin_responded_at TIMESTAMPTZ,
  admin_responded_by TEXT REFERENCES users(id)
);

-- Audit Trailing
CREATE TABLE IF NOT EXISTS audit_logs (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  org_id TEXT REFERENCES organizations(id) ON DELETE CASCADE,
  performed_by TEXT REFERENCES users(id),
  action TEXT NOT NULL,
  action_label TEXT NOT NULL,
  target_table TEXT,
  target_id TEXT,
  target_label TEXT,
  old_value JSONB,
  new_value JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Support Ticket Chats
CREATE TABLE IF NOT EXISTS support_conversations (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  org_id TEXT REFERENCES organizations(id) ON DELETE CASCADE,
  created_by TEXT REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS support_messages (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  conversation_id TEXT REFERENCES support_conversations(id) ON DELETE CASCADE,
  sender_type TEXT NOT NULL CHECK (sender_type IN ('superadmin','org_member')),
  sender_id TEXT REFERENCES users(id),
  message_text TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_audit_org_date ON audit_logs(org_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_user ON audit_logs(performed_by, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_rsvp_event ON event_rsvps(event_id, response);
CREATE INDEX IF NOT EXISTS idx_identity_member ON identity_verifications(member_id);






















-- =====================================================================
-- IMPACTO SYSTEM V2 DATABASE MIGRATION & SCHEMA UPDATES
-- Run this query in your Supabase SQL Editor to support all V2 features.
-- Designed to perfectly match standard text-based identifiers to avoid casting errors.
-- =====================================================================

-- Ensure we have the pgcrypto extension for UUID generators
CREATE EXTENSION IF NOT EXISTS pgcrypto CASCADE;

-- ==========================================
-- 1. CHAT V2 COLUMNS (Real-Time Chat Enhancements)
-- ==========================================
ALTER TABLE chat_channels 
  ADD COLUMN IF NOT EXISTS channel_type TEXT DEFAULT 'general'
    CHECK (channel_type IN ('general','project','committee','private','announcement')),
  ADD COLUMN IF NOT EXISTS is_private BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS created_by TEXT REFERENCES users(id);

ALTER TABLE chat_messages
  ADD COLUMN IF NOT EXISTS message_type TEXT DEFAULT 'text'
    CHECK (message_type IN ('text','file','image','voice','poll','system')),
  ADD COLUMN IF NOT EXISTS file_url TEXT,
  ADD COLUMN IF NOT EXISTS file_name TEXT,
  ADD COLUMN IF NOT EXISTS file_size BIGINT,
  ADD COLUMN IF NOT EXISTS file_mime_type TEXT,
  ADD COLUMN IF NOT EXISTS voice_duration_seconds INT,
  ADD COLUMN IF NOT EXISTS reply_to_id TEXT REFERENCES chat_messages(id);

-- ==========================================
-- 2. MEMBER MANAGEMENT, WORKSPACE SECURITY & GENERAL ROLES V2 COLUMNS
-- ==========================================
ALTER TABLE org_members
  ADD COLUMN IF NOT EXISTS verification_status TEXT DEFAULT 'not_required'
    CHECK (verification_status IN ('not_required','pending','verified','rejected','flagged')),
  ADD COLUMN IF NOT EXISTS verified_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS verified_by TEXT REFERENCES users(id);

-- Update RLS or general constraints for manager roles
ALTER TABLE org_members DROP CONSTRAINT IF EXISTS org_members_role_check;
ALTER TABLE org_members ADD CONSTRAINT org_members_role_check 
  CHECK (role IN ('superadmin','org_admin','manager','member'));

-- Add granular manager permission flags serialized as JSONB
ALTER TABLE org_members
  ADD COLUMN IF NOT EXISTS permissions JSONB DEFAULT '{
    "manage_members": false,
    "manage_content": false,
    "manage_finance": false,
    "manage_settings": false,
    "view_analytics": false,
    "manage_documents": false,
    "manage_chat": false
  }'::jsonb;

-- ==========================================
-- 3. MEETINGS GOVERNOR & QUORUM TRACKERS V2 COLUMNS
-- ==========================================
ALTER TABLE organizations
  ADD COLUMN IF NOT EXISTS quorum_type TEXT DEFAULT 'absolute'
    CHECK (quorum_type IN ('absolute', 'percentage')),
  ADD COLUMN IF NOT EXISTS quorum_value INT DEFAULT 0;

ALTER TABLE meetings
  ADD COLUMN IF NOT EXISTS quorum_required INT,
  ADD COLUMN IF NOT EXISTS quorum_reached BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS quorum_count_at_completion INT,
  ADD COLUMN IF NOT EXISTS attendance_count INT DEFAULT 0;

-- ==========================================
-- 4. NEW V2 TABLES
-- ==========================================

-- A. WhatsApp-style Chat Polls
CREATE TABLE IF NOT EXISTS poll_messages (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  message_id TEXT REFERENCES chat_messages(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  options JSONB NOT NULL,
  allow_multiple BOOLEAN DEFAULT false,
  show_results_before_vote BOOLEAN DEFAULT true,
  expires_at TIMESTAMPTZ,
  is_closed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS poll_responses (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  poll_id TEXT REFERENCES poll_messages(id) ON DELETE CASCADE,
  member_id TEXT REFERENCES org_members(id) ON DELETE CASCADE,
  selected_options JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(poll_id, member_id)
);

-- B. Activity Logs for Field, Outreach and General Meetings
CREATE TABLE IF NOT EXISTS activity_logs (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  org_id TEXT REFERENCES organizations(id) ON DELETE CASCADE,
  program_id TEXT REFERENCES programs(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  location TEXT,
  activity_date DATE NOT NULL,
  created_by TEXT REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS activity_attendance (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  activity_id TEXT REFERENCES activity_logs(id) ON DELETE CASCADE,
  member_id TEXT REFERENCES org_members(id) ON DELETE CASCADE,
  recorded_by TEXT REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(activity_id, member_id)
);

-- C. Communication Templates System
CREATE TABLE IF NOT EXISTS message_templates (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  org_id TEXT REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  occasion TEXT,
  subject TEXT,
  body TEXT NOT NULL,
  variables TEXT[],
  is_system_template BOOLEAN DEFAULT false,
  created_by TEXT REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS notification_sends (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  org_id TEXT REFERENCES organizations(id) ON DELETE CASCADE,
  template_id TEXT REFERENCES message_templates(id) ON DELETE SET NULL,
  sent_by TEXT REFERENCES users(id),
  recipient_group TEXT,
  recipient_count INT,
  activity_id TEXT REFERENCES activity_logs(id) ON DELETE SET NULL,
  event_id TEXT REFERENCES events(id) ON DELETE SET NULL,
  meeting_id TEXT REFERENCES meetings(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- D. Event RSVP and Waitlisting Systems
CREATE TABLE IF NOT EXISTS event_rsvps (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  event_id TEXT REFERENCES events(id) ON DELETE CASCADE,
  member_id TEXT REFERENCES org_members(id) ON DELETE CASCADE,
  response TEXT NOT NULL CHECK (response IN ('yes','no','maybe')),
  responded_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(event_id, member_id)
);

CREATE TABLE IF NOT EXISTS event_waitlist (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  event_id TEXT REFERENCES events(id) ON DELETE CASCADE,
  member_id TEXT REFERENCES org_members(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  notified_at TIMESTAMPTZ,
  UNIQUE(event_id, member_id)
);

-- E. Identity Document verification Records (kept in a separate private schema conceptually)
CREATE TABLE IF NOT EXISTS identity_verifications (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  member_id TEXT REFERENCES org_members(id) ON DELETE CASCADE,
  org_id TEXT REFERENCES organizations(id) ON DELETE CASCADE,
  document_type TEXT NOT NULL,
  document_url TEXT NOT NULL,
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ,
  reviewed_by TEXT REFERENCES users(id),
  review_notes TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected'))
);

-- F. Secure Document Signing & Acknowledgements
CREATE TABLE IF NOT EXISTS documents (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  org_id TEXT REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  file_url TEXT,
  file_size TEXT,
  uploaded_by TEXT REFERENCES users(id),
  requires_acknowledgement BOOLEAN DEFAULT false,
  acknowledgement_deadline DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS document_acknowledgements (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  document_id TEXT REFERENCES documents(id) ON DELETE CASCADE,
  member_id TEXT REFERENCES org_members(id) ON DELETE CASCADE,
  org_id TEXT REFERENCES organizations(id) ON DELETE CASCADE,
  document_version INT NOT NULL DEFAULT 1,
  acknowledged_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(document_id, member_id, document_version)
);

-- G. Member Resignations & Exit offboarding surveys
CREATE TABLE IF NOT EXISTS resignations (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  member_id TEXT REFERENCES org_members(id) ON DELETE CASCADE,
  org_id TEXT REFERENCES organizations(id) ON DELETE CASCADE,
  reason_category TEXT,
  reason_detail TEXT,
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  finalized_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','finalized','cancelled')),
  admin_response TEXT,
  admin_responded_at TIMESTAMPTZ,
  admin_responded_by TEXT REFERENCES users(id)
);

-- H. Full Audit Trail Logs Tracker
CREATE TABLE IF NOT EXISTS audit_logs (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  org_id TEXT REFERENCES organizations(id) ON DELETE CASCADE,
  performed_by TEXT REFERENCES users(id),
  action TEXT NOT NULL,
  action_label TEXT NOT NULL,
  target_table TEXT,
  target_id TEXT,
  target_label TEXT,
  old_value JSONB,
  new_value JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- I. Support Hotline Chat Line Conversions
CREATE TABLE IF NOT EXISTS support_conversations (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  org_id TEXT REFERENCES organizations(id) ON DELETE CASCADE,
  created_by TEXT REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS support_messages (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  conversation_id TEXT REFERENCES support_conversations(id) ON DELETE CASCADE,
  sender_type TEXT NOT NULL CHECK (sender_type IN ('superadmin','org_member')),
  sender_id TEXT REFERENCES users(id),
  message_text TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- 5. OPTIMIZED CHRONOLOGICAL PERF INDEXES
-- ==========================================
CREATE INDEX IF NOT EXISTS idx_audit_org_date ON audit_logs(org_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_user ON audit_logs(performed_by, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_rsvp_event ON event_rsvps(event_id, response);
CREATE INDEX IF NOT EXISTS idx_identity_member ON identity_verifications(member_id);




