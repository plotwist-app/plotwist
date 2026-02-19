DO $$ BEGIN
 CREATE TYPE "public"."subscription_status" AS ENUM('ACTIVE', 'CANCELED', 'EXPIRED', 'PENDING_CANCELLATION');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "subscriptions" ADD COLUMN IF NOT EXISTS "status" "subscription_status" DEFAULT 'ACTIVE' NOT NULL;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD COLUMN IF NOT EXISTS "canceled_at" timestamp;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD COLUMN IF NOT EXISTS "cancellation_reason" varchar;