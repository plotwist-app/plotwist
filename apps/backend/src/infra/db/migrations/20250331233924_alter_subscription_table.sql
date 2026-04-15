CREATE UNIQUE INDEX IF NOT EXISTS "active_subscription_idx" ON "subscriptions" USING btree ("user_id")
WHERE
  "subscriptions"."status" = 'ACTIVE';