ALTER TABLE "followers" DROP CONSTRAINT "followers_follower_id_profiles_id_fk";
--> statement-breakpoint
ALTER TABLE "followers" DROP CONSTRAINT "followers_followed_id_profiles_id_fk";
--> statement-breakpoint
ALTER TABLE "likes" DROP CONSTRAINT "likes_profile_id_profiles_id_fk";
--> statement-breakpoint
ALTER TABLE "list_likes" DROP CONSTRAINT "list_likes_profile_id_profiles_id_fk";
--> statement-breakpoint
ALTER TABLE "lists" DROP CONSTRAINT "lists_profile_id_profiles_id_fk";
--> statement-breakpoint
ALTER TABLE "review_replies" DROP CONSTRAINT "review_replies_profile_id_profiles_id_fk";
--> statement-breakpoint
ALTER TABLE "reviews" DROP CONSTRAINT "reviews_profile_id_profiles_id_fk";
--> statement-breakpoint
ALTER TABLE "subscriptions" DROP CONSTRAINT "subscriptions_profile_id_profiles_id_fk";
--> statement-breakpoint
DROP INDEX IF EXISTS "profile_id_idx";--> statement-breakpoint
ALTER TABLE "likes" ADD COLUMN "user_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "list_likes" ADD COLUMN "user_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "lists" ADD COLUMN "user_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "review_replies" ADD COLUMN "user_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "reviews" ADD COLUMN "user_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD COLUMN "user_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "subscription_type" "subscription_type";--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "banner_path" varchar;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "image_path" varchar NOT NULL;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "followers" ADD CONSTRAINT "followers_follower_id_users_id_fk" FOREIGN KEY ("follower_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "followers" ADD CONSTRAINT "followers_followed_id_users_id_fk" FOREIGN KEY ("followed_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "likes" ADD CONSTRAINT "likes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "list_likes" ADD CONSTRAINT "list_likes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "lists" ADD CONSTRAINT "lists_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "review_replies" ADD CONSTRAINT "review_replies_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "reviews" ADD CONSTRAINT "reviews_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "user_id_idx" ON "lists" USING btree ("user_id");--> statement-breakpoint
ALTER TABLE "likes" DROP COLUMN IF EXISTS "profile_id";--> statement-breakpoint
ALTER TABLE "list_likes" DROP COLUMN IF EXISTS "profile_id";--> statement-breakpoint
ALTER TABLE "lists" DROP COLUMN IF EXISTS "profile_id";--> statement-breakpoint
ALTER TABLE "review_replies" DROP COLUMN IF EXISTS "profile_id";--> statement-breakpoint
ALTER TABLE "reviews" DROP COLUMN IF EXISTS "profile_id";--> statement-breakpoint
ALTER TABLE "subscriptions" DROP COLUMN IF EXISTS "profile_id";