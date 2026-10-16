import type { RouteLocationNormalized, RouteLocationRaw } from 'vue-router'
import type { UserRole } from '@/types/user'

declare module 'vue-router' {
  interface RouteMeta {
    /** Only for logged in users; guests are sent to the login page. */
    requiresAuth?: boolean
    /** Only for users with this role (implies requiresAuth). */
    role?: UserRole
    /** Only for guests, such as the login and registration pages. */
    guestOnly?: boolean
  }
}

interface Session {
  isAuthenticated: boolean
  role: UserRole | null
}

/**
 * Decides whether a navigation can go on (true) or where to redirect it.
 * Kept free of the store and the router so it can be unit tested.
 */
export function resolveAccess(
  to: RouteLocationNormalized,
  session: Session,
): true | RouteLocationRaw {
  const { requiresAuth, role, guestOnly } = to.meta

  if (guestOnly && session.isAuthenticated) return { name: 'home' }

  if ((requiresAuth || role) && !session.isAuthenticated) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }

  if (role && session.role !== role) return { name: 'home' }

  return true
}

/** The ?redirect= target after login, accepted only if it is a path inside the app. */
export function safeRedirect(value: unknown): string {
  return typeof value === 'string' && value.startsWith('/') && !value.startsWith('//') ? value : '/'
}
