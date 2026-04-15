DO $$ BEGIN
 CREATE TYPE "public"."status" AS ENUM('WATCHLIST', 'WATCHED', 'WATCHING');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user_items" (
	"id" uuid PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"tmdb_id" integer NOT NULL,
	"added_at" timestamp DEFAULT now() NOT NULL,
	"position" integer,
	"media_type" "media_type" NOT NULL,
	"status" "status" NOT NULL
);
--> statement-breakpoint
ALTER TABLE "list_items" ALTER COLUMN "tmdb_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "list_items" ALTER COLUMN "media_type" SET NOT NULL;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_items" ADD CONSTRAINT "user_items_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "list_items" DROP COLUMN IF EXISTS "title";--> statement-breakpoint
ALTER TABLE "list_items" DROP COLUMN IF EXISTS "overview";--> statement-breakpoint
ALTER TABLE "list_items" DROP COLUMN IF EXISTS "backdrop_path";--> statement-breakpoint
ALTER TABLE "list_items" DROP COLUMN IF EXISTS "poster_path";