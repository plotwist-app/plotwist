CREATE TYPE "public"."subscription_provider" AS ENUM('STRIPE', 'APPLE');--> statement-breakpoint
ALTER TABLE "subscriptions" ADD COLUMN "subscription_provider" "subscription_provider" NOT NULL;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD COLUMN "provider_subscription_id" varchar;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_provider_subscription_id_unique" UNIQUE("provider_subscription_id");