import { randomBytes, randomUUID } from 'node:crypto'
import { OAuth2Client } from 'google-auth-library'
import { config } from '@/config'
import { getUserByEmail, insertUser } from '@/db/repositories/user-repository'
import { DomainError } from '@/domain/errors/domain-error'
import { hashPassword } from '@/utils/password'

// Google OAuth client - uses the iOS client ID for verification
const googleClient = new OAuth2Client()

interface GoogleTokenPayload {
  sub: string
  email: string
  email_verified: boolean
  name?: string
  picture?: string
  given_name?: string
  family_name?: string
}

async function verifyGoogleToken(idToken: string): Promise<GoogleTokenPayload> {
  const ticket = await googleClient.verifyIdToken({
    idToken,
    audience: config.google?.GOOGLE_CLIENT_ID,
  })

  const payload = ticket.getPayload()
  if (!payload) {
    throw new Error('Invalid Google token payload')
  }

  return payload as GoogleTokenPayload
}

function generateRandomPassword(): string {
  return randomBytes(32).toString('hex')
}

function generateUsername(email: string, name?: string): string {
  const base = name
    ? name.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()
    : email
        .split('@')[0]
        .replace(/[^a-zA-Z0-9]/g, '-')
        .toLowerCase()

  return `${base}-${randomUUID().slice(0, 8)}`
}

export interface GoogleAuthInput {
  idToken: string
}

export interface GoogleAuthResult {
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

export async function googleAuthService(
  input: GoogleAuthInput
): Promise<GoogleAuthResult | DomainError> {
  try {
    // Verify the Google ID token
    const payload = await verifyGoogleToken(input.idToken)

    const { email, name, picture } = payload

    if (!email) {
      return new DomainError('Email not provided by Google authentication', 400)
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
    const username = generateUsername(email, name)

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
        avatarUrl: picture ?? newUser.avatarUrl,
        bannerUrl: newUser.bannerUrl,
        biography: newUser.biography,
        createdAt: newUser.createdAt,
        subscriptionType: 'MEMBER',
      },
      isNewUser: true,
      needsUsername: true, // New users should pick a username
    }
  } catch (error) {
    console.error('Google auth error:', error)
    return new DomainError('Google authentication failed', 400)
  }
}
