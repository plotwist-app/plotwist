ALTER TABLE "user_items" ADD COLUMN "updated_at" timestamp;

UPDATE "user_items" SET "updated_at" = "added_at";

ALTER TABLE "user_items"
ALTER COLUMN "updated_at" SET NOT NULL,
ALTER COLUMN "updated_at" SET DEFAULT NOW();
