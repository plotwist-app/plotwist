import { randomBytes, randomUUID } from 'node:crypto'
import jwt from 'jsonwebtoken'
import jwksClient from 'jwks-rsa'
import { getUserByEmail, insertUser } from '@/db/repositories/user-repository'
import { DomainError } from '@/domain/errors/domain-error'
import { hashPassword } from '@/utils/password'

const APPLE_JWKS_URI = 'https://appleid.apple.com/auth/keys'

const client = jwksClient({
  jwksUri: APPLE_JWKS_URI,
  cache: true,
  cacheMaxAge: 86400000, // 24 hours
})

interface AppleTokenPayload {
  iss: string
  aud: string
  exp: number
  iat: number
  sub: string
  email?: string
  email_verified?: boolean | string
  is_private_email?: boolean | string
  auth_time: number
  nonce_supported: boolean
}

function getKey(
  header: jwt.JwtHeader,
  callback: (err: Error | null, key?: string) => void
) {
  client.getSigningKey(
    header.kid,
    (err: Error | null, key: jwksClient.SigningKey | undefined) => {
      if (err) {
        callback(err)
        return
      }
      const signingKey = key?.getPublicKey()
      callback(null, signingKey)
    }
  )
}

async function verifyAppleToken(
  identityToken: string
): Promise<AppleTokenPayload> {
  return new Promise((resolve, reject) => {
    jwt.verify(
      identityToken,
      getKey,
      {
        algorithms: ['RS256'],
        issuer: 'https://appleid.apple.com',
      },
      (err: jwt.VerifyErrors | null, decoded: unknown) => {
        if (err) {
          reject(err)
          return
        }
        resolve(decoded as AppleTokenPayload)
      }
    )
  })
}

function generateRandomPassword(): string {
  return randomBytes(32).toString('hex')
}

function generateUsername(email?: string): string {
  if (email) {
    const prefix = email
      .split('@')[0]
      .replace(/[^a-zA-Z0-9]/g, '-')
      .toLowerCase()
    return `${prefix}-${randomUUID().slice(0, 8)}`
  }
  return `user-${randomUUID().slice(0, 12)}`
}

export interface AppleAuthInput {
  identityToken: string
  authorizationCode: string
  email?: string
  fullName?: {
    givenName?: string
    familyName?: string
  }
}

export interface AppleAuthResult {
  user: {
    id: string
    username: string
    email: string
    avatarUrl: string | null
    bannerUrl: string | null
    biography: string | null
    createdAt: Date
    subscriptionType: string
  }
  isNewUser: boolean
  needsUsername: boolean
}

export async function appleAuthService(
  input: AppleAuthInput
): Promise<AppleAuthResult | DomainError> {
  try {
    // Verify the Apple identity token
    const payload = await verifyAppleToken(input.identityToken)

    // Get email from token payload or from input (Apple only sends email on first auth)
    const email = payload.email || input.email

    if (!email) {
      return new DomainError('Email not provided by Apple authentication', 400)
    }

    // Check if user already exists
    const existingUsers = await getUserByEmail(email)

    if (existingUsers.length > 0) {
      // User exists, return for login
      const existingUser = existingUsers[0]
      return {
        user: {
          id: existingUser.id,
          username: existingUser.username,
          email: existingUser.email,
          avatarUrl: existingUser.avatarUrl,
          bannerUrl: existingUser.bannerUrl,
          biography: existingUser.biography,
          createdAt: existingUser.createdAt,
          subscriptionType: 'MEMBER',
        },
        isNewUser: false,
        needsUsername: false,
      }
    }

    // Create new user
    const randomPassword = generateRandomPassword()
    const hashedPassword = await hashPassword(randomPassword)
    const username = generateUsername(email)

    const [newUser] = await insertUser({
      email,
      password: hashedPassword,
      username,
    })

    return {
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        avatarUrl: newUser.avatarUrl,
        bannerUrl: newUser.bannerUrl,
        biography: newUser.biography,
        createdAt: newUser.createdAt,
        subscriptionType: 'MEMBER',
      },
      isNewUser: true,
      needsUsername: true, // New users should pick a username
    }
  } catch (error) {
    console.error('Apple auth error:', error)
    return new DomainError('Apple authentication failed', 400)
  }
}
