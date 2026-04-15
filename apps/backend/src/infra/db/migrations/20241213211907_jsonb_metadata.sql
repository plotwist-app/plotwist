ALTER TABLE user_activities
ALTER COLUMN metadata TYPE jsonb
USING metadata::jsonb;