CREATE INDEX "idx_followers_follower_id" ON "followers" USING btree ("follower_id");--> statement-breakpoint
CREATE INDEX "idx_followers_followed_id" ON "followers" USING btree ("followed_id");--> statement-breakpoint
CREATE INDEX "idx_reviews_user_rating" ON "reviews" USING btree ("user_id","rating");--> statement-breakpoint
CREATE INDEX "idx_user_episodes_user_id" ON "user_episodes" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_user_episodes_user_tmdb" ON "user_episodes" USING btree ("user_id","tmdb_id");--> statement-breakpoint
CREATE INDEX "idx_user_items_user_status" ON "user_items" USING btree ("user_id","status");--> statement-breakpoint
CREATE INDEX "idx_user_items_user_media_status" ON "user_items" USING btree ("user_id","media_type","status");