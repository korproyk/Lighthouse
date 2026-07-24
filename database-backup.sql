-- ============================================================
-- DATABASE BACKUP - Lighthouse App
-- Generated: 2026-07-18
-- Platform: Supabase (PostgreSQL)
-- ============================================================

-- ============================================================
-- TABLE: health_reports
-- Purpose: Anonymous community health symptom reports for map clusters
-- ============================================================

CREATE TABLE IF NOT EXISTS health_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  symptom text NOT NULL DEFAULT 'Other',
  note text DEFAULT '',
  city text NOT NULL DEFAULT '',
  lat double precision NOT NULL,
  lng double precision NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS health_reports_created_at_idx ON health_reports (created_at DESC);
CREATE INDEX IF NOT EXISTS health_reports_symptom_idx ON health_reports (symptom);

ALTER TABLE health_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read health reports"
  ON health_reports FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Authenticated users can submit own reports"
  ON health_reports FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid() OR user_id IS NULL);

CREATE POLICY "Anonymous users can submit anonymous reports"
  ON health_reports FOR INSERT
  TO anon
  WITH CHECK (user_id IS NULL);


-- ============================================================
-- TABLE: chat_messages
-- Purpose: Stores Lumi AI companion conversation history
-- ============================================================

CREATE TABLE IF NOT EXISTS chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id text NOT NULL DEFAULT '',
  role text NOT NULL DEFAULT 'user',
  content text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS chat_messages_session_idx ON chat_messages (session_id, created_at);
CREATE INDEX IF NOT EXISTS chat_messages_user_idx ON chat_messages (user_id, created_at);

ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users read own messages"
  ON chat_messages FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Anonymous users read anonymous messages"
  ON chat_messages FOR SELECT
  TO anon
  USING (user_id IS NULL);

CREATE POLICY "Authenticated users insert own messages"
  ON chat_messages FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Anonymous users insert anonymous messages"
  ON chat_messages FOR INSERT
  TO anon
  WITH CHECK (user_id IS NULL);
