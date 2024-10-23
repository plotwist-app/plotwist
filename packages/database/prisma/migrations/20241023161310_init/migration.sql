-- CreateEnum
CREATE TYPE "LANGUAGES" AS ENUM ('en-US', 'es-ES', 'fr-FR', 'it-IT', 'de-DE', 'pt-BR', 'ja-JP');

-- CreateEnum
CREATE TYPE "LIKE_ENTITY" AS ENUM ('REVIEW', 'REPLY');

-- CreateEnum
CREATE TYPE "LIST_VISIBILITY" AS ENUM ('PUBLIC', 'NETWORK', 'PRIVATE');

-- CreateEnum
CREATE TYPE "MEDIA_TYPE" AS ENUM ('TV_SHOW', 'MOVIE');

-- CreateEnum
CREATE TYPE "STATUS" AS ENUM ('WATCHING', 'PENDING', 'WATCHED');

-- CreateEnum
CREATE TYPE "SUBSCRIPTION_TYPE" AS ENUM ('MEMBER', 'PRO');

-- CreateEnum
CREATE TYPE "media_type_enum" AS ENUM ('TV_SHOW', 'MOVIE');

-- CreateTable
CREATE TABLE "followers" (
    "id" BIGSERIAL NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "follower_id" UUID,
    "followed_id" UUID,

    CONSTRAINT "followers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "likes" (
    "id" UUID NOT NULL,
    "entity_type" "LIKE_ENTITY" NOT NULL,
    "review_id" UUID,
    "review_reply_id" UUID,
    "user_id" UUID NOT NULL,

    CONSTRAINT "likes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "list_items" (
    "id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "list_id" UUID NOT NULL,
    "title" TEXT,
    "overview" TEXT,
    "backdrop_path" TEXT,
    "poster_path" TEXT,
    "tmdb_id" BIGINT,
    "media_type" "MEDIA_TYPE",
    "order" INTEGER,

    CONSTRAINT "list_items_pkey" PRIMARY KEY ("id","list_id")
);

-- CreateTable
CREATE TABLE "list_likes" (
    "id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "list_id" UUID,
    "user_id" UUID,

    CONSTRAINT "list_likes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lists" (
    "id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "name" VARCHAR,
    "user_id" UUID NOT NULL,
    "description" TEXT,
    "cover_path" TEXT,
    "visibility" "LIST_VISIBILITY" NOT NULL,

    CONSTRAINT "lists_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "profiles" (
    "id" UUID NOT NULL,
    "email" TEXT DEFAULT '',
    "username" TEXT,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "banner_path" TEXT,
    "subscription_type" "SUBSCRIPTION_TYPE" DEFAULT 'MEMBER',
    "image_path" TEXT,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recommendations" (
    "id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "receiver_user_id" UUID,
    "media_type" "MEDIA_TYPE",
    "tmdb_id" BIGINT,
    "sender_user_id" UUID,
    "message" TEXT,

    CONSTRAINT "recommendations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "review_replies" (
    "id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user_id" UUID,
    "reply" TEXT,
    "review_id" UUID,

    CONSTRAINT "review_reply_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reviews" (
    "id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user_id" UUID,
    "tmdb_id" BIGINT,
    "media_type" "MEDIA_TYPE",
    "review" TEXT,
    "rating" SMALLINT,
    "tmdb_title" VARCHAR,
    "tmdb_poster_path" TEXT,
    "tmdb_overview" TEXT,
    "language" "LANGUAGES",

    CONSTRAINT "reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subscriptions" (
    "id" BIGSERIAL NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user_id" UUID,
    "type" "SUBSCRIPTION_TYPE",

    CONSTRAINT "subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "watched_items" (
    "id" BIGSERIAL NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tmdb_id" BIGINT,
    "user_id" UUID,

    CONSTRAINT "watched_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "unique_id" ON "lists"("id");

-- CreateIndex
CREATE UNIQUE INDEX "profiles_email_key" ON "profiles"("email");

-- CreateIndex
CREATE UNIQUE INDEX "profiles_username_key" ON "profiles"("username");

-- AddForeignKey
ALTER TABLE "followers" ADD CONSTRAINT "followers_followed_id_fkey" FOREIGN KEY ("followed_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "followers" ADD CONSTRAINT "followers_follower_id_fkey" FOREIGN KEY ("follower_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "likes" ADD CONSTRAINT "public_likes_review_id_fkey" FOREIGN KEY ("review_id") REFERENCES "reviews"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "likes" ADD CONSTRAINT "public_likes_review_reply_id_fkey" FOREIGN KEY ("review_reply_id") REFERENCES "review_replies"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "likes" ADD CONSTRAINT "public_likes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "profiles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "list_items" ADD CONSTRAINT "public_list_items_list_id_fkey" FOREIGN KEY ("list_id") REFERENCES "lists"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "list_likes" ADD CONSTRAINT "list_likes_list_id_fkey" FOREIGN KEY ("list_id") REFERENCES "lists"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "list_likes" ADD CONSTRAINT "list_likes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "profiles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "lists" ADD CONSTRAINT "lists_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "profiles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "recommendations" ADD CONSTRAINT "recommendations_receiver_user_id_fkey" FOREIGN KEY ("receiver_user_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "recommendations" ADD CONSTRAINT "recommendations_sender_user_id_fkey" FOREIGN KEY ("sender_user_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "review_replies" ADD CONSTRAINT "public_review_replies_review_id_fkey" FOREIGN KEY ("review_id") REFERENCES "reviews"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "review_replies" ADD CONSTRAINT "public_review_replies_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "profiles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "public_reviews_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "profiles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "subscriptions" ADD CONSTRAINT "public_subscriptions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "profiles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "watched_items" ADD CONSTRAINT "watched_items_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "profiles"("id") ON DELETE NO ACTION ON UPDATE CASCADE;
