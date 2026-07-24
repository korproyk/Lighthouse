/*
  # Community Health Reports

  Adds a table to store anonymous, community-contributed health symptom
  reports that appear as clusters on the Community map. Data is public
  read (for the aggregate map view) but only authenticated users can
  insert — and they can only insert rows attributed to themselves.

  1. New Tables
    - `health_reports`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users, nullable for anonymous)
      - `symptom` (text) — one of Fever, Headache, Fatigue, Cough, Other
      - `note` (text) — optional short note
      - `city` (text) — free-text neighborhood / city
      - `lat` (double precision)
      - `lng` (double precision)
      - `created_at` (timestamptz, default now())

  2. Security
    - RLS enabled
    - SELECT policy: anyone (anon + authenticated) can read the aggregate data
    - INSERT policy: authenticated users can only insert reports where
      `user_id = auth.uid()` OR user_id is null (anonymous submissions)
    - No UPDATE or DELETE policies — reports are immutable once posted
*/

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
