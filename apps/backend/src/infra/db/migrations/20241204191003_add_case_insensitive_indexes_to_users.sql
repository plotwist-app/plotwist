DROP INDEX IF EXISTS "email_idx";--> statement-breakpoint
DROP INDEX IF EXISTS "username_idx";--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "username_lower_idx" ON "users" USING btree (LOWER("username"));--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "email_lower_idx" ON "users" USING btree (LOWER("email"));