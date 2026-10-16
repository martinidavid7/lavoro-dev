import type { Resource } from '@/types/api'
import type { LoginPayload, RegisterPayload, User } from '@/types/user'
import { ApiError, http } from './http'

/** The logged in user, or null for guests. */
export async function getCurrentUser(): Promise<User | null> {
  try {
    const { data } = await http<Resource<User>>('/user')

    return data
  } catch (e) {
    if (e instanceof ApiError && e.isUnauthenticated) return null
    throw e
  }
}

export async function login(payload: LoginPayload) {
  const { data } = await http<Resource<User>>('/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  })

  return data
}

export async function register(payload: RegisterPayload) {
  const { data } = await http<Resource<User>>('/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  })

  return data
}

export function logout() {
  return http<void>('/logout', { method: 'POST' })
}
