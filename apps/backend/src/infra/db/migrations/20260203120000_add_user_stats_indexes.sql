-- Performance indexes for user statistics queries
-- These indexes significantly improve the performance of stats aggregations

-- Index for user_items: covers queries filtering by user_id + status (most common pattern)
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_user_items_user_status" 
  ON "user_items" ("user_id", "status");

-- Index for user_items: covers queries filtering by user_id + media_type + status
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_user_items_user_media_status" 
  ON "user_items" ("user_id", "media_type", "status");

-- Index for user_episodes: covers most-watched series query (GROUP BY tmdb_id WHERE user_id = ?)
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_user_episodes_user_id" 
  ON "user_episodes" ("user_id");

-- Index for user_episodes: covers runtime aggregations
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_user_episodes_user_tmdb" 
  ON "user_episodes" ("user_id", "tmdb_id");

-- Index for reviews: covers best reviews query (rating = 5 for a user)
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_reviews_user_rating" 
  ON "reviews" ("user_id", "rating");

-- Index for followers: covers follower/following count queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_followers_follower_id" 
  ON "followers" ("follower_id");

CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_followers_followed_id" 
  ON "followers" ("followed_id");
