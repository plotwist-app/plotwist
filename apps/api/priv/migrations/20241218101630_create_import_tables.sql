DO $$ BEGIN
 CREATE TYPE "public"."import_item_status" AS ENUM('COMPLETED', 'FAILED', 'NOT_STARTED');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."import_status_enum" AS ENUM('PARTIAL', 'COMPLETED', 'FAILED', 'NOT_STARTED');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."providers_enum" AS ENUM('MY_ANIME_LIST', 'LETTERBOXD');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "import_movies" (
	"id" uuid PRIMARY KEY NOT NULL,
	"import_id" uuid NOT NULL,
	"name" varchar NOT NULL,
	"end_date" timestamp with time zone,
	"item_status" "status" NOT NULL,
	"import_status" "import_item_status" NOT NULL,
	"TMDB_ID" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "import_series" (
	"id" uuid PRIMARY KEY NOT NULL,
	"import_id" uuid NOT NULL,
	"name" varchar NOT NULL,
	"start_date" timestamp with time zone,
	"end_date" timestamp with time zone,
	"item_status" "status" NOT NULL,
	"import_status" "import_item_status" NOT NULL,
	"TMDB_ID" integer,
	"watched_episodes" integer,
	"series_episodes" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user_imports" (
	"id" uuid PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"items_count" integer NOT NULL,
	"import_status" "import_status_enum" NOT NULL,
	"provider" "providers_enum" NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "import_movies" ADD CONSTRAINT "import_movies_import_id_user_imports_id_fk" FOREIGN KEY ("import_id") REFERENCES "public"."user_imports"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "import_series" ADD CONSTRAINT "import_series_import_id_user_imports_id_fk" FOREIGN KEY ("import_id") REFERENCES "public"."user_imports"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_imports" ADD CONSTRAINT "user_imports_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
