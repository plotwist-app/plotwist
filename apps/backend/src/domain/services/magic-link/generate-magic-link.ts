import { randomBytes } from 'node:crypto'

import { withServiceTracing } from '@/infra/telemetry/with-service-tracing'
import { insertMagicToken } from '@/db/repositories/magic-tokens'

const FIFTEEN_MINUTES = new Date(Date.now() + 15 * 60000)

const generateMagicLinkTokenServiceImpl = async (userId: string) => {
  const token = randomBytes(32).toString('hex')
  await insertMagicToken({ token, userId, expiresAt: FIFTEEN_MINUTES })

  return { token }
}

export const generateMagicLinkTokenService = withServiceTracing(
  'generate-magic-link-token',
  generateMagicLinkTokenServiceImpl
)
