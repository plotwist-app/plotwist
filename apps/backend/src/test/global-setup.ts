import { drizzle } from 'drizzle-orm/postgres-js'
import { migrate } from 'drizzle-orm/postgres-js/migrator'
import postgres from 'postgres'
import { GenericContainer, type StartedTestContainer } from 'testcontainers'

let dbConfig: {
  host: string
  port: number
  user: string
  password: string
  database: string
  container: StartedTestContainer
}

declare global {
  // eslint-disable-next-line no-var
  var __DB_CONFIG__: typeof dbConfig
}

export async function setup() {
  process.env.API_KEY = 'test-api-key-for-testing'
  await setupDatabase()

  return async () => {
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

  const client = postgres(dbUrl)
  const db = drizzle(client)
  await migrate(db, { migrationsFolder: './src/db/migrations' })
  await client.end()
}
