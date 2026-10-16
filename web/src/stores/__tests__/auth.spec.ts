import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import * as authApi from '@/services/auth'
import type { User } from '@/types/user'
import { useAuthStore } from '../auth'

vi.mock('@/services/auth')

const company: User = {
  id: 7,
  name: 'Acme S.r.l.',
  email: 'acme@example.com',
  role: 'company',
  role_label: 'Azienda',
}

describe('auth store', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    setActivePinia(createPinia())
  })

  it('loads the session only once, even with concurrent calls', async () => {
    vi.mocked(authApi.getCurrentUser).mockResolvedValue(company)
    const auth = useAuthStore()

    await Promise.all([auth.ensureLoaded(), auth.ensureLoaded()])
    await auth.ensureLoaded()

    expect(authApi.getCurrentUser).toHaveBeenCalledOnce()
    expect(auth.user).toEqual(company)
    expect(auth.isCompany).toBe(true)
  })

  it('treats an unreachable API as a guest and tries again later', async () => {
    vi.mocked(authApi.getCurrentUser)
      .mockRejectedValueOnce(new Error('offline'))
      .mockResolvedValueOnce(company)
    const auth = useAuthStore()

    await auth.ensureLoaded()
    expect(auth.isAuthenticated).toBe(false)

    await auth.ensureLoaded()
    expect(auth.user).toEqual(company)
  })

  it('logs in and out', async () => {
    vi.mocked(authApi.login).mockResolvedValue(company)
    const auth = useAuthStore()

    await expect(auth.login({ email: company.email, password: 'password' })).resolves.toEqual(
      company,
    )
    expect(auth.isAuthenticated).toBe(true)

    await auth.logout()
    expect(auth.user).toBeNull()
  })

  it('only lets the company that published a job posting manage it', () => {
    const auth = useAuthStore()

    expect(auth.canManage({ company: { id: 7 } })).toBe(false)

    auth.user = company

    expect(auth.canManage({ company: { id: 7 } })).toBe(true)
    expect(auth.canManage({ company: { id: 8 } })).toBe(false)
  })
})
