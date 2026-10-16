import { describe, expect, it } from 'vitest'
import { displayUrl, initials, LOGO_MAX_BYTES, validateLogo } from '../company'

describe('validateLogo', () => {
  it('accepts JPG, PNG and WebP images up to 1 MB', () => {
    expect(validateLogo({ type: 'image/png', size: LOGO_MAX_BYTES })).toBeNull()
    expect(validateLogo({ type: 'image/jpeg', size: 1000 })).toBeNull()
    expect(validateLogo({ type: 'image/webp', size: 1000 })).toBeNull()
  })

  it('rejects other file types', () => {
    expect(validateLogo({ type: 'application/pdf', size: 1000 })).toBe(
      'Il logo deve essere un file JPG, PNG o WebP.',
    )
    expect(validateLogo({ type: 'image/svg+xml', size: 1000 })).not.toBeNull()
  })

  it('rejects files over 1 MB', () => {
    expect(validateLogo({ type: 'image/png', size: LOGO_MAX_BYTES + 1 })).toBe(
      'Il logo non può superare 1 MB.',
    )
  })
})

describe('initials', () => {
  it('takes the first letter of the first two words', () => {
    expect(initials('Martini Software')).toBe('MS')
    expect(initials('lavoro demo s.r.l.')).toBe('LD')
    expect(initials('Acme')).toBe('A')
  })

  it('skips words that do not start with a letter', () => {
    expect(initials('& Partners Italia')).toBe('PI')
  })
})

describe('displayUrl', () => {
  it('removes the protocol, www and the trailing slash', () => {
    expect(displayUrl('https://www.example.com/')).toBe('example.com')
    expect(displayUrl('http://example.com/lavora-con-noi')).toBe('example.com/lavora-con-noi')
  })
})
