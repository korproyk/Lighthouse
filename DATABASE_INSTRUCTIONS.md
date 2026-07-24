# Database Instructions - Lighthouse App

## Overview

This project uses **Supabase** (hosted PostgreSQL) as its database backend. The database stores community health reports and AI chatbot conversation history.

---

## Tables

### 1. `health_reports`

Stores anonymous, community-contributed health symptom reports that appear as clusters on the Community map.

| Column       | Type                     | Default            | Notes                                    |
|--------------|--------------------------|--------------------|-----------------------------------------|
| `id`         | uuid                     | `gen_random_uuid()`| Primary key                             |
| `user_id`    | uuid                     | NULL               | References `auth.users(id)`, nullable   |
| `symptom`    | text                     | `'Other'`          | Addiction, Insomnia, Stress, Eye strain, Other  |
| `note`       | text                     | `''`               | Optional short note                     |
| `city`       | text                     | `''`               | Neighborhood / city name                |
| `lat`        | double precision         | (required)         | Latitude coordinate                     |
| `lng`        | double precision         | (required)         | Longitude coordinate                    |
| `created_at` | timestamptz              | `now()`            | Auto-populated timestamp                |

**Indexes:**
- `health_reports_created_at_idx` - DESC on `created_at`
- `health_reports_symptom_idx` - on `symptom`

**RLS Policies:**
- SELECT: Anyone (anon + authenticated) can read all reports
- INSERT (authenticated): User can insert with `user_id = auth.uid()` or `user_id IS NULL`
- INSERT (anon): Can only insert with `user_id IS NULL`

---

### 2. `chat_messages`

Stores messages exchanged between users and the Lumi AI companion for conversation persistence across sessions.

| Column       | Type                     | Default            | Notes                                    |
|--------------|--------------------------|--------------------|-----------------------------------------|
| `id`         | uuid                     | `gen_random_uuid()`| Primary key                             |
| `user_id`    | uuid                     | NULL               | References `auth.users(id)`, nullable   |
| `session_id` | text                     | `''`               | Client-generated session identifier     |
| `role`       | text                     | `'user'`           | Either `'user'` or `'bot'`              |
| `content`    | text                     | `''`               | The message text                        |
| `created_at` | timestamptz              | `now()`            | Auto-populated timestamp                |

**Indexes:**
- `chat_messages_session_idx` - on `(session_id, created_at)`
- `chat_messages_user_idx` - on `(user_id, created_at)`

**RLS Policies:**
- SELECT (authenticated): Users can only read their own messages (`user_id = auth.uid()`)
- SELECT (anon): Can only read rows where `user_id IS NULL`
- INSERT (authenticated): Can only insert with `user_id = auth.uid()`
- INSERT (anon): Can only insert with `user_id IS NULL`

---

## Security Model

- **Row Level Security (RLS)** is enabled on ALL tables
- Health reports are publicly readable (for the map view) but write-restricted
- Chat messages are private -- users can only access their own data
- Reports and messages are **immutable** (no UPDATE or DELETE policies)
- Foreign keys reference `auth.users(id)` with `ON DELETE SET NULL`

---

## Migration Files

Located in `supabase/migrations/`:

1. `20260502082726_create_health_reports.sql` - Creates the health_reports table
2. `20260502084759_create_chat_messages.sql` - Creates the chat_messages table

---

## Restoring the Database

To restore the database schema from the backup file:

1. Navigate to the Supabase SQL Editor (Dashboard > SQL Editor)
2. Paste the contents of `database-backup.sql`
3. Execute the SQL

Alternatively, the migration files in `supabase/migrations/` can be applied sequentially to recreate the schema.

---

## Environment Variables

The following environment variables are required (pre-configured in `.env`):

- `VITE_SUPABASE_URL` - Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Your Supabase anonymous/public key

---

## Client Library

The Supabase client is initialized in `src/lib/supabase.ts` using the environment variables above. All database queries go through this client which automatically handles authentication tokens and RLS enforcement.
