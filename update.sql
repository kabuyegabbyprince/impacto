-- =====================================================================
-- IMPACTO SYSTEM DATABASE MIGRATION & SCHEMA UPDATES
-- =====================================================================

-- Goals system refinements: make target and unit optional, add start_value
ALTER TABLE goals ALTER COLUMN target DROP NOT NULL;
ALTER TABLE goals ALTER COLUMN unit DROP NOT NULL;
ALTER TABLE goals ADD COLUMN IF NOT EXISTS start_value INT DEFAULT 0;

-- Documents center: track who uploaded the document dynamically
ALTER TABLE "documents" ADD COLUMN IF NOT EXISTS uploader_name TEXT;
ALTER TABLE "documents" ALTER COLUMN requires_acknowledgement SET DEFAULT false;

-- V2 additions (restating columns if needed)
ALTER TABLE chat_channels ADD COLUMN IF NOT EXISTS channel_type TEXT DEFAULT 'general';
ALTER TABLE chat_messages ADD COLUMN IF NOT EXISTS message_type TEXT DEFAULT 'text';
ALTER TABLE chat_messages ADD COLUMN IF NOT EXISTS file_url TEXT;
ALTER TABLE chat_messages ADD COLUMN IF NOT EXISTS file_name TEXT;
ALTER TABLE chat_messages ADD COLUMN IF NOT EXISTS file_size BIGINT;
ALTER TABLE chat_messages ADD COLUMN IF NOT EXISTS file_mime_type TEXT;
ALTER TABLE chat_messages ADD COLUMN IF NOT EXISTS reply_to_id TEXT;

-- Soft-deletion columns to maintain database history and audit logging
ALTER TABLE goals ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE;
ALTER TABLE news_posts ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE;
ALTER TABLE events ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE;
ALTER TABLE goals ADD COLUMN IF NOT EXISTS last_edited_at TIMESTAMPTZ;
ALTER TABLE news_posts ADD COLUMN IF NOT EXISTS last_edited_at TIMESTAMPTZ;
ALTER TABLE events ADD COLUMN IF NOT EXISTS last_edited_at TIMESTAMPTZ;

