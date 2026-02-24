ALTER TABLE "users" ALTER COLUMN "subscription_type" SET DEFAULT 'MEMBER';--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "subscription_type" SET NOT NULL;