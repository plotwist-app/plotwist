'use server'

import { deleteSession } from '@/app/lib/session'

export async function logout() {
  deleteSession()
}
