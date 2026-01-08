ALTER TABLE "lists" ALTER COLUMN "title" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "reviews" ALTER COLUMN "review" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "reviews" ALTER COLUMN "rating" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "reviews" ALTER COLUMN "has_spoilers" SET DEFAULT false;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "list_id_idx" ON "list_likes" USING btree ("list_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "list_user_idx" ON "list_likes" USING btree ("list_id","user_id");