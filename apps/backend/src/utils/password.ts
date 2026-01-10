import bcrypt from 'bcryptjs'

export async function hashPassword(
  password: string,
  salt = 10
): Promise<string> {
  return await bcrypt.hash(password, salt)
}

export async function comparePassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return await bcrypt.compare(password, hashedPassword)
}
