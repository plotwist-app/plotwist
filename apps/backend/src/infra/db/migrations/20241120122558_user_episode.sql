CREATE TABLE IF NOT EXISTS "user_episodes" (
	"id" uuid PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"tmdb_id" integer NOT NULL,
	"season_number" integer NOT NULL,
	"episode_number" integer NOT NULL,
	"watched_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_episode_unique" UNIQUE("user_id","tmdb_id","season_number","episode_number")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_episodes" ADD CONSTRAINT "user_episodes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
