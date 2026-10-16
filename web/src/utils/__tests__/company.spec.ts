import { describe, expect, it } from 'vitest'
import { displayUrl, initials } from '../company'

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
