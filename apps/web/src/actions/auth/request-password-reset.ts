'use server'

import { requestPasswordReset as requestPasswordResetApi } from '@/api/users'

type RequestPasswordReset = {
  login: string
}

export async function requestPasswordReset({ login }: RequestPasswordReset) {
  try {
    const res = await requestPasswordResetApi({ login })
    if (res.status !== 200) {
      return { error: 'request_password_reset_error' }
    }
  } catch {
    return { error: 'request_password_reset_error' }
  }
}
