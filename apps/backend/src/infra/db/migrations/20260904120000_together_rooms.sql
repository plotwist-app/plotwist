CREATE TYPE "public"."together_mood" AS ENUM('FUN', 'SUSPENSE', 'COMFORT', 'ANY');--> statement-breakpoint
CREATE TYPE "public"."together_swipe_decision" AS ENUM('LIKE', 'PASS');--> statement-breakpoint
CREATE TABLE "together_rooms" (
	"id" uuid PRIMARY KEY NOT NULL,
	"code" varchar(8) NOT NULL,
	"host_user_id" uuid,
	"watch_provider_ids" integer[] DEFAULT '{}',
	"watch_region" varchar DEFAULT 'BR' NOT NULL,
	"max_runtime" integer,
	"mood" "together_mood" DEFAULT 'ANY' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "together_rooms_code_unique" UNIQUE("code")
);--> statement-breakpoint
CREATE TABLE "together_participants" (
	"id" uuid PRIMARY KEY NOT NULL,
	"room_id" uuid NOT NULL,
	"user_id" uuid,
	"display_name" varchar NOT NULL,
	"token_hash" varchar NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "together_participants_token_hash_unique" UNIQUE("token_hash")
);--> statement-breakpoint
CREATE TABLE "together_swipes" (
	"id" uuid PRIMARY KEY NOT NULL,
	"room_id" uuid NOT NULL,
	"participant_id" uuid NOT NULL,
	"tmdb_id" integer NOT NULL,
	"media_type" varchar NOT NULL,
	"decision" "together_swipe_decision" NOT NULL,
	"title" varchar NOT NULL,
	"poster_path" varchar,
	"vote_average" real,
	"release_date" varchar,
	"overview" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "together_swipes_participant_title_unique" UNIQUE("participant_id","tmdb_id","media_type")
);--> statement-breakpoint
ALTER TABLE "together_rooms" ADD CONSTRAINT "together_rooms_host_user_id_users_id_fk" FOREIGN KEY ("host_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "together_participants" ADD CONSTRAINT "together_participants_room_id_together_rooms_id_fk" FOREIGN KEY ("room_id") REFERENCES "public"."together_rooms"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "together_participants" ADD CONSTRAINT "together_participants_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "together_swipes" ADD CONSTRAINT "together_swipes_room_id_together_rooms_id_fk" FOREIGN KEY ("room_id") REFERENCES "public"."together_rooms"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "together_swipes" ADD CONSTRAINT "together_swipes_participant_id_together_participants_id_fk" FOREIGN KEY ("participant_id") REFERENCES "public"."together_participants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_together_rooms_code" ON "together_rooms" USING btree ("code");--> statement-breakpoint
CREATE INDEX "idx_together_participants_room" ON "together_participants" USING btree ("room_id");--> statement-breakpoint
CREATE INDEX "idx_together_swipes_room" ON "together_swipes" USING btree ("room_id");
