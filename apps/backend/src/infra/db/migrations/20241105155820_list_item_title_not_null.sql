ALTER TABLE "list_items" ALTER COLUMN "title" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "list_items" ALTER COLUMN "overview" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "list_items" DROP COLUMN IF EXISTS "backdrop_path";