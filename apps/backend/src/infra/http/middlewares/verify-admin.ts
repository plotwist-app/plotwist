import { eq } from 'drizzle-orm'
import type { FastifyReply, FastifyRequest } from 'fastify'
import { db } from '@/infra/db'
import { schema } from '@/infra/db/schema'
import { verifyJwt } from './verify-jwt'

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS ?? '')
  .split(',')
  .map(e => e.trim().toLowerCase())
  .filter(Boolean)

export async function verifyAdmin(
  request: FastifyRequest,
  reply: FastifyReply
) {
  await verifyJwt(request, reply)
  if (reply.sent) return

  const userId = (request.user as { id?: string })?.id
  if (!userId) {
    return reply
      .status(403)
      .send({ message: 'Forbidden: admin access required' })
  }

  const [user] = await db
    .select({ email: schema.users.email })
    .from(schema.users)
    .where(eq(schema.users.id, userId))

  if (!user || !ADMIN_EMAILS.includes(user.email.toLowerCase())) {
    return reply
      .status(403)
      .send({ message: 'Forbidden: admin access required' })
  }
}
