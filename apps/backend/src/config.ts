import { z } from 'zod'

export const config = {
  cloudflare: loadCloudFlareEnvs(),
  db: loadDatabaseEnvs(),
  app: loadAppEnvs(),
  services: loadServicesEnvs(),
  redis: loadRedisEnvs(),
  sqs: loadSQSEnvs(),
  sqsQueues: loadSQSQueues(),
  featureFlags: loadFeatureFlags(),
  myAnimeList: loadMALEnvs(),
  openai: loadOpenAIEnvs(),
}

function loadRedisEnvs() {
  const schema = z.object({
    REDIS_URL: z.string().url(),
  })

  return schema.parse(process.env)
}

function loadServicesEnvs() {
  const schema = z.object({
    RESEND_API_KEY: z.string().optional().default('re_123'),
    STRIPE_SECRET_KEY: z.string().optional().default(''),
    STRIPE_WEBHOOK_SECRET: z.string().optional().default(''),
    TMDB_ACCESS_TOKEN: z.string(),
  })

  return schema.parse(process.env)
}

function loadDatabaseEnvs() {
  const schema = z.object({
    DATABASE_URL: z.string().url(),
  })

  return schema.parse(process.env)
}

function loadAppEnvs() {
  const schema = z.object({
    APP_ENV: z.enum(['dev', 'test', 'production']).optional().default('dev'),
    CLIENT_URL: z.string(),
    PORT: z.coerce.number().default(3333),
    BASE_URL: z.string().default('http://localhost:3333'),
    JWT_SECRET: z.string(),
  })

  return schema.parse(process.env)
}

function loadCloudFlareEnvs() {
  const schema = z.object({
    CLOUDFLARE_ACCESS_KEY_ID: z.string(),
    CLOUDFLARE_SECRET_ACCESS_KEY: z.string(),
    CLOUDFLARE_BUCKET: z.string(),
    CLOUDFLARE_ACCOUNT_ID: z.string(),
    CLOUDFLARE_PUBLIC_URL: z.string().url(),
  })

  return schema.parse(process.env)
}

function loadSQSEnvs() {
  const schema = z.object({
    AWS_REGION: z.string(),
    LOCALSTACK_ENDPOINT: z.string().url().optional(),
    AWS_ACCESS_KEY_ID: z.string(),
    AWS_SECRET_ACCESS_KEY: z.string(),
  })

  return schema.parse(process.env)
}

function loadSQSQueues() {
  const schema = z.object({
    IMPORT_MOVIES_QUEUE: z.string(),
    IMPORT_SERIES_QUEUE: z.string(),
  })

  return schema.parse(process.env)
}

function loadFeatureFlags() {
  const schema = z.object({
    ENABLE_IMPORT_MOVIES: z.string(),
    ENABLE_IMPORT_SERIES: z.string(),
    ENABLE_SQS: z.string(),
    ENABLE_CRON_JOBS: z.string().default('false'),
  })

  return schema.parse(process.env)
}

function loadMALEnvs() {
  const schema = z.object({
    MAL_CLIENT_ID: z.string(),
  })

  return schema.parse(process.env)
}

function loadOpenAIEnvs() {
  const schema = z.object({
    OPENAI_API_KEY: z.string(),
  })

  return schema.parse(process.env)
}
