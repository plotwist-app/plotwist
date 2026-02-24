CREATE TABLE "user_watch_entries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_item_id" uuid NOT NULL,
	"watched_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "user_watch_entries" ADD CONSTRAINT "user_watch_entries_user_item_id_user_items_id_fk" FOREIGN KEY ("user_item_id") REFERENCES "public"."user_items"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "user_watch_entries_user_item_idx" ON "user_watch_entries" USING btree ("user_item_id");