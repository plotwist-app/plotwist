CREATE TABLE "shared_urls" (
	"id" uuid PRIMARY KEY NOT NULL,
	"url" varchar NOT NULL,
	"hashed_url" varchar NOT NULL,
	"original_url" varchar NOT NULL,
	"user_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "shared_urls" ADD CONSTRAINT "shared_urls_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "shared_urls_url_idx" ON "shared_urls" USING btree ("url");--> statement-breakpoint
CREATE INDEX "shared_urls_user_id_idx" ON "shared_urls" USING btree ("user_id");