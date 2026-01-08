import type { FastifyRequest } from 'fastify'

export async function verifyOptionalJwt(request: FastifyRequest) {
  try {
    await request.jwtVerify()
  } catch (err) {}
}
