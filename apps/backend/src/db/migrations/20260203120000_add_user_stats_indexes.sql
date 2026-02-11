-- Ensure user_watch_entries table exists (safety net in case previous migration was skipped)
CREATE TABLE IF NOT EXISTS "user_watch_entries" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_item_id" uuid NOT NULL,
  "watched_at" timestamp DEFAULT now() NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL
);--> statement-breakpoint

DO $$ BEGIN
  ALTER TABLE "user_watch_entries"
    ADD CONSTRAINT "user_watch_entries_user_item_id_user_items_id_fk"
    FOREIGN KEY ("user_item_id") REFERENCES "public"."user_items"("id")
    ON DELETE cascade ON UPDATE no action;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;--> statement-breakpoint

CREATE INDEX IF NOT EXISTS "user_watch_entries_user_item_idx" ON "user_watch_entries" USING btree ("user_item_id");--> statement-breakpoint

-- Performance indexes for user statistics queries
CREATE INDEX IF NOT EXISTS "idx_user_items_user_status"
  ON "user_items" ("user_id", "status");--> statement-breakpoint

CREATE INDEX IF NOT EXISTS "idx_user_items_user_media_status"
  ON "user_items" ("user_id", "media_type", "status");--> statement-breakpoint

CREATE INDEX IF NOT EXISTS "idx_user_episodes_user_id"
  ON "user_episodes" ("user_id");--> statement-breakpoint

CREATE INDEX IF NOT EXISTS "idx_user_episodes_user_tmdb"
  ON "user_episodes" ("user_id", "tmdb_id");--> statement-breakpoint

CREATE INDEX IF NOT EXISTS "idx_reviews_user_rating"
  ON "reviews" ("user_id", "rating");--> statement-breakpoint

CREATE INDEX IF NOT EXISTS "idx_followers_follower_id"
  ON "followers" ("follower_id");--> statement-breakpoint

CREATE INDEX IF NOT EXISTS "idx_followers_followed_id"
  ON "followers" ("followed_id");
