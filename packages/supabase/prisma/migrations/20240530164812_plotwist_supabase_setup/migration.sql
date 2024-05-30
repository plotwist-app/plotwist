-- CreateEnum
CREATE TYPE "languages" AS ENUM ('en-US', 'es-ES', 'fr-FR', 'it-IT', 'de-DE', 'pt-BR', 'ja-JP');

-- CreateEnum
CREATE TYPE "likeEntity" AS ENUM ('REVIEW', 'REPLY');

-- CreateEnum
CREATE TYPE "listVisibility" AS ENUM ('PUBLIC', 'NETWORK', 'PRIVATE');

-- CreateEnum
CREATE TYPE "mediaType" AS ENUM ('TV_SHOW', 'MOVIE');

-- CreateEnum
CREATE TYPE "status" AS ENUM ('WATCHING', 'PENDING', 'WATCHED');

-- CreateEnum
CREATE TYPE "subscriptionType" AS ENUM ('MEMBER', 'PRO');

-- CreateEnum
CREATE TYPE "mediaTypeEnum" AS ENUM ('TV_SHOW', 'MOVIE');

-- CreateTable
CREATE TABLE "followers" (
    "id" BIGSERIAL NOT NULL,
    "followerId" UUID DEFAULT gen_random_uuid(),
    "followedId" UUID DEFAULT gen_random_uuid(),
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "followers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "likes" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "entityType" "likeEntity" NOT NULL,
    "reviewId" UUID,
    "reviewReplyId" UUID,
    "userId" UUID NOT NULL,

    CONSTRAINT "likes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "listItems" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "listId" UUID NOT NULL,
    "title" TEXT,
    "overview" TEXT,
    "backdropPath" TEXT,
    "posterPath" TEXT,
    "tmdbId" BIGINT,
    "status" "status",
    "mediaType" "mediaType",

    CONSTRAINT "listItems_pkey" PRIMARY KEY ("id","listId")
);

-- CreateTable
CREATE TABLE "listLikes" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "listId" UUID DEFAULT gen_random_uuid(),
    "userId" UUID DEFAULT gen_random_uuid(),

    CONSTRAINT "listLikes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lists" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "name" VARCHAR,
    "userId" UUID NOT NULL,
    "description" TEXT,
    "coverPath" TEXT,
    "visibility" "listVisibility" NOT NULL,

    CONSTRAINT "lists_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "profiles" (
    "id" UUID NOT NULL,
    "email" TEXT DEFAULT '',
    "username" TEXT,
    "createdAt" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "bannetPath" TEXT,
    "subscription_type" "subscriptionType" DEFAULT 'MEMBER',
    "image_path" TEXT,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reviewReplies" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" UUID DEFAULT gen_random_uuid(),
    "reply" TEXT,
    "reviewId" UUID DEFAULT gen_random_uuid(),

    CONSTRAINT "review_reply_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reviews" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" UUID DEFAULT gen_random_uuid(),
    "tmdbId" BIGINT,
    "mediaType" "mediaType",
    "review" TEXT,
    "rating" SMALLINT,
    "tmdbTitle" VARCHAR,
    "tmdbPosterPath" TEXT,
    "tmdbOverview" TEXT,
    "language" "languages",

    CONSTRAINT "reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subscriptions" (
    "id" BIGSERIAL NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" UUID,
    "type" "subscriptionType",

    CONSTRAINT "subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "unique_id" ON "lists"("id");

-- CreateIndex
CREATE UNIQUE INDEX "profiles_email_key" ON "profiles"("email");

-- CreateIndex
CREATE UNIQUE INDEX "profiles_username_key" ON "profiles"("username");

-- AddForeignKey
ALTER TABLE "followers" ADD CONSTRAINT "followers_followedId_fkey" FOREIGN KEY ("followedId") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "followers" ADD CONSTRAINT "followers_followerId_fkey" FOREIGN KEY ("followerId") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "likes" ADD CONSTRAINT "public_likes_reviewId_fkey" FOREIGN KEY ("reviewId") REFERENCES "reviews"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "likes" ADD CONSTRAINT "public_likes_reviewReplyId_fkey" FOREIGN KEY ("reviewReplyId") REFERENCES "reviewReplies"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "likes" ADD CONSTRAINT "public_likes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "profiles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "listItems" ADD CONSTRAINT "public_listItems_listId_fkey" FOREIGN KEY ("listId") REFERENCES "lists"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "listLikes" ADD CONSTRAINT "listLikes_listId_fkey" FOREIGN KEY ("listId") REFERENCES "lists"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "listLikes" ADD CONSTRAINT "listLikes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "profiles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "lists" ADD CONSTRAINT "lists_userId_fkey" FOREIGN KEY ("userId") REFERENCES "profiles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "reviewReplies" ADD CONSTRAINT "public_reviewReplies_reviewId_fkey" FOREIGN KEY ("reviewId") REFERENCES "reviews"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "reviewReplies" ADD CONSTRAINT "public_reviewReplies_userId_fkey" FOREIGN KEY ("userId") REFERENCES "profiles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "public_reviews_userId_fkey" FOREIGN KEY ("userId") REFERENCES "profiles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "subscriptions" ADD CONSTRAINT "public_subscriptions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "profiles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
