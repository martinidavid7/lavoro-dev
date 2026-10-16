import { describe, expect, it } from 'vitest'
import { CV_MAX_BYTES, IMAGE_MAX_BYTES, validateCv, validateImage } from '../files'

describe('validateImage', () => {
  it('accepts JPG, PNG and WebP images up to 1 MB', () => {
    expect(validateImage({ type: 'image/png', size: IMAGE_MAX_BYTES }, 'Il logo')).toBeNull()
    expect(validateImage({ type: 'image/jpeg', size: 1000 }, 'Il logo')).toBeNull()
    expect(validateImage({ type: 'image/webp', size: 1000 }, 'Il logo')).toBeNull()
  })

  it('rejects other file types, naming the image in the message', () => {
    expect(validateImage({ type: 'application/pdf', size: 1000 }, 'La foto')).toBe(
      'La foto deve essere un file JPG, PNG o WebP.',
    )
    expect(validateImage({ type: 'image/svg+xml', size: 1000 }, 'Il logo')).not.toBeNull()
  })

  it('rejects images over 1 MB', () => {
    expect(validateImage({ type: 'image/png', size: IMAGE_MAX_BYTES + 1 }, 'Il logo')).toBe(
      'Il logo non può superare 1 MB.',
    )
  })
})

describe('validateCv', () => {
  it('accepts PDF files up to 5 MB', () => {
    expect(validateCv({ type: 'application/pdf', size: CV_MAX_BYTES })).toBeNull()
  })

  it('rejects other formats and bigger files', () => {
    expect(validateCv({ type: 'application/msword', size: 1000 })).toBe(
      'Il curriculum deve essere un file PDF.',
    )
    expect(validateCv({ type: 'application/pdf', size: CV_MAX_BYTES + 1 })).toBe(
      'Il curriculum non può superare 5 MB.',
    )
  })
})
