DO $$ BEGIN
 CREATE TYPE "public"."social_platforms" AS ENUM('INSTAGRAM', 'TIKTOK', 'YOUTUBE', 'X');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "social_links" (
	"id" uuid PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
	"user_id" uuid NOT NULL,
	"platform" "social_platforms" NOT NULL,
	"url" varchar NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_platform_unique" UNIQUE("user_id","platform")
);
--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "created_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "biography" varchar;--> statement-breakpoint

DO $$ BEGIN
    ALTER TABLE "social_links" ADD CONSTRAINT "social_links_user_id_users_id_fk"
    FOREIGN KEY ("user_id") REFERENCES "public"."users"("id")
    ON DELETE CASCADE ON UPDATE NO ACTION;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;
