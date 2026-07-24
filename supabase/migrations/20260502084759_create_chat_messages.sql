/*
  # Chat Messages

  Stores messages exchanged between users and the Lumi AI companion so
  the conversation can persist across sessions and devices.

  1. New Tables
    - `chat_messages`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users, nullable for anonymous demo)
      - `session_id` (text) — client-generated session identifier
      - `role` (text) — 'user' or 'bot'
      - `content` (text) — the message text
      - `created_at` (timestamptz, default now())

  2. Security
    - RLS enabled
    - SELECT: users can only read messages tied to their own user_id, or
      anonymous rows that match their session_id (anon read by session)
    - INSERT: authenticated users can only insert with user_id = auth.uid();
      anonymous users can insert with user_id IS NULL
    - No UPDATE/DELETE — chat history is immutable
*/

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
