ALTER TABLE "user_preferences" RENAME COLUMN "watch_providers" TO "watch_providers_ids";--> statement-breakpoint
ALTER TABLE "user_preferences" ADD COLUMN "watch_region" text;