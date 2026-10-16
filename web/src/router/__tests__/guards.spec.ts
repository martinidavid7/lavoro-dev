import { describe, expect, it } from 'vitest'
import type { RouteLocationNormalized, RouteMeta } from 'vue-router'
import { resolveAccess, safeRedirect } from '../guards'

const route = (meta: RouteMeta, fullPath = '/pagina') =>
  ({ meta, fullPath }) as RouteLocationNormalized

const guest = { isAuthenticated: false, role: null }
const candidate = { isAuthenticated: true, role: 'candidate' } as const
const company = { isAuthenticated: true, role: 'company' } as const

describe('resolveAccess', () => {
  it('lets everyone into public routes', () => {
    expect(resolveAccess(route({}), guest)).toBe(true)
    expect(resolveAccess(route({}), candidate)).toBe(true)
  })

  it('sends guests to the login page, remembering where they were going', () => {
    expect(resolveAccess(route({ requiresAuth: true }, '/profilo'), guest)).toEqual({
      name: 'login',
      query: { redirect: '/profilo' },
    })
    expect(resolveAccess(route({ role: 'company' }, '/offerte/nuova'), guest)).toEqual({
      name: 'login',
      query: { redirect: '/offerte/nuova' },
    })
  })

  it('only lets users with the required role in', () => {
    expect(resolveAccess(route({ role: 'company' }), company)).toBe(true)
    expect(resolveAccess(route({ role: 'company' }), candidate)).toEqual({ name: 'home' })
  })

  it('keeps logged in users out of guest-only pages', () => {
    expect(resolveAccess(route({ guestOnly: true }), guest)).toBe(true)
    expect(resolveAccess(route({ guestOnly: true }), candidate)).toEqual({ name: 'home' })
  })
})

describe('safeRedirect', () => {
  it('accepts paths inside the app', () => {
    expect(safeRedirect('/offerte/nuova?x=1')).toBe('/offerte/nuova?x=1')
  })

  it('falls back to the home page for anything else', () => {
    expect(safeRedirect(undefined)).toBe('/')
    expect(safeRedirect(['/a'])).toBe('/')
    expect(safeRedirect('https://evil.example')).toBe('/')
    expect(safeRedirect('//evil.example')).toBe('/')
  })
})
