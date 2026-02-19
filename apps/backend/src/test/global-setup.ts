import { drizzle } from 'drizzle-orm/postgres-js'
import { migrate } from 'drizzle-orm/postgres-js/migrator'
import postgres from 'postgres'
import {
  GenericContainer,
  type StartedTestContainer,
  Wait,
} from 'testcontainers'

let dbConfig: {
  host: string
  port: number
  user: string
  password: string
  database: string
  container: StartedTestContainer
}

let localstackConfig: {
  host: string
  port: number
  container: StartedTestContainer
}

let redisConfig: {
  host: string
  port: number
  container: StartedTestContainer
}

declare global {
  // eslint-disable-next-line no-var
  var __DB_CONFIG__: typeof dbConfig
  // eslint-disable-next-line no-var
  var __LOCALSTACK_CONFIG__: typeof localstackConfig
  // eslint-disable-next-line no-var
  var __REDIS_CONFIG__: typeof redisConfig
}

export async function setup() {
  // General
  process.env.APP_ENV = 'test'
  process.env.PORT = '3333'
  process.env.BASE_URL = 'http://localhost:3333'
  process.env.JWT_SECRET = 'secret'
  process.env.API_KEY = 'test-api-key-for-testing'

  // TMDB
  process.env.TMDB_ACCESS_TOKEN = 'sda'

  // Client
  process.env.CLIENT_URL = 'http://localhost:3000'

  // Cloudflare
  process.env.CLOUDFLARE_BUCKET = 'CLOUDFLARE_BUCKET'
  process.env.CLOUDFLARE_ACCESS_KEY_ID = 'CLOUDFLARE_ACCESS_KEY_ID'
  process.env.CLOUDFLARE_SECRET_ACCESS_KEY = 'CLOUDFLARE_SECRET_ACCESS_KEY'
  process.env.CLOUDFLARE_ACCOUNT_ID = 'CLOUDFLARE_ACCOUNT_ID'
  process.env.CLOUDFLARE_PUBLIC_URL = 'https://google.com'

  // SQS
  process.env.AWS_REGION = 'sa-east-1'
  process.env.AWS_ACCESS_KEY_ID = 'banana'
  process.env.AWS_SECRET_ACCESS_KEY = 'banana'

  // Queues
  process.env.IMPORT_MOVIES_QUEUE = 'import-movies-queue-test'
  process.env.IMPORT_SERIES_QUEUE = 'import-series-queue-test'

  // MAL API
  process.env.MAL_CLIENT_ID = 'banana'

  // Feature Flags
  process.env.ENABLE_SQS = 'true'
  process.env.ENABLE_IMPORT_MOVIES = 'true'
  process.env.ENABLE_IMPORT_SERIES = 'true'
  process.env.ENABLE_CRON_JOBS = 'false'

  // OpenAI
  process.env.OPENAI_API_KEY = 'open_api_key'

  await setupDatabase()
  await setupLocalStack()
  await setupRedis()

  return async () => {
    await global.__REDIS_CONFIG__?.container?.stop()
    await global.__LOCALSTACK_CONFIG__?.container?.stop()
    await global.__DB_CONFIG__?.container?.stop()
  }
}

async function setupDatabase() {
  const container = await new GenericContainer('bitnami/postgresql:latest')
    .withEnvironment({
      POSTGRES_PASSWORD: 'test',
      POSTGRES_DB: 'plotwist_db',
    })
    .withExposedPorts(5432)
    .withWaitStrategy(
      Wait.forLogMessage(/database system is ready to accept connections/i)
    )
    .start()

  dbConfig = {
    host: container.getHost(),
    port: container.getMappedPort(5432),
    user: 'postgres',
    password: 'test',
    database: 'plotwist_db',
    container,
  }

  const dbUrl = `postgres://${dbConfig.user}:${dbConfig.password}@${dbConfig.host}:${dbConfig.port}/${dbConfig.database}`
  process.env.DATABASE_URL = dbUrl

  global.__DB_CONFIG__ = dbConfig

  // Wait for database to be fully ready by attempting a connection
  const client = postgres(dbUrl)
  let retries = 0
  const maxRetries = 30
  while (retries < maxRetries) {
    try {
      await client`SELECT 1`
      break
    } catch (error) {
      if (retries === maxRetries - 1) {
        await client.end()
        throw error
      }
      await new Promise(resolve => setTimeout(resolve, 1000))
      retries++
    }
  }

  const db = drizzle(client)
  await migrate(db, { migrationsFolder: './src/infra/db/migrations' })
  await client.end()
}

async function setupLocalStack() {
  const container = await new GenericContainer('localstack/localstack:latest')
    .withEnvironment({
      SERVICES: 'sqs',
      DOCKER_HOST: 'unix:///var/run/docker.sock',
    })
    .withExposedPorts(4566)
    .withWaitStrategy(Wait.forLogMessage(/.*Ready.*/))
    .start()

  localstackConfig = {
    host: container.getHost(),
    port: container.getMappedPort(4566),
    container,
  }

  const localstackEndpoint = `http://${localstackConfig.host}:${localstackConfig.port}`
  process.env.LOCALSTACK_ENDPOINT = localstackEndpoint

  global.__LOCALSTACK_CONFIG__ = localstackConfig
}

async function setupRedis() {
  const container = await new GenericContainer('redis:latest')
    .withExposedPorts(6379)
    .withWaitStrategy(Wait.forLogMessage(/Ready to accept connections/i))
    .start()

  redisConfig = {
    host: container.getHost(),
    port: container.getMappedPort(6379),
    container,
  }

  const redisUrl = `redis://${redisConfig.host}:${redisConfig.port}`
  process.env.REDIS_URL = redisUrl

  global.__REDIS_CONFIG__ = redisConfig
}
