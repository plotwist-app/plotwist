-- Create user_watch_entries table for tracking rewatch history
CREATE TABLE IF NOT EXISTS "user_watch_entries" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_item_id" uuid NOT NULL REFERENCES "user_items"("id") ON DELETE CASCADE,
  "watched_at" timestamp DEFAULT now() NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL
);

-- Create index for faster lookups by user_item_id
CREATE INDEX IF NOT EXISTS "user_watch_entries_user_item_idx" ON "user_watch_entries" ("user_item_id");
