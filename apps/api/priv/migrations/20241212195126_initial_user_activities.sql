DO $$ BEGIN
 CREATE TYPE "public"."activity_type" AS ENUM('CREATE_LIST', 'ADD_ITEM', 'UPDATE_ITEM', 'DELETE_ITEM', 'LIKE_REVIEW', 'LIKE_REPLY', 'LIKE_LIST', 'CREATE_REVIEW', 'CREATE_REPLY', 'FOLLOW_USER', 'UNFOLLOW_USER', 'UPDATE_PROFILE', 'WATCH_EPISODE', 'CHANGE_STATUS', 'DELETE_LIST');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user_activities" (
	"id" uuid PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"activity_type" "activity_type" NOT NULL,
	"entity_id" uuid,
	"entity_type" "like_entity",
	"metadata" varchar,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_activities" ADD CONSTRAINT "user_activities_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "user_activity_idx" ON "user_activities" USING btree ("user_id","created_at");


CREATE OR REPLACE FUNCTION delete_user_activities()
RETURNS TRIGGER AS $$
BEGIN
    DELETE FROM user_activities
    WHERE entity_id = OLD.id;
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;


CREATE TRIGGER on_delete_lists
AFTER DELETE ON lists
FOR EACH ROW
EXECUTE FUNCTION delete_user_activities();

CREATE TRIGGER on_delete_reviews
AFTER DELETE ON reviews
FOR EACH ROW
EXECUTE FUNCTION delete_user_activities();

CREATE TRIGGER on_delete_replies
AFTER DELETE ON review_replies
FOR EACH ROW
EXECUTE FUNCTION delete_user_activities();