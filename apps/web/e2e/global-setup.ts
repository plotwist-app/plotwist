// globalSetup.js
import { FullConfig } from '@playwright/test'
import dotenv from 'dotenv'

export default async function globalSetup(config: FullConfig) {
  dotenv.config({
    path: '.env.local',
    override: true,
  })
}
