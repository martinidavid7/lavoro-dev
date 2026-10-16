/** Same limits as the API (POST /api/company-profile/logo). */
export const LOGO_MAX_BYTES = 1024 * 1024
export const LOGO_TYPES = ['image/jpeg', 'image/png', 'image/webp']

/** Checks a logo before uploading it; returns the error message, or null if it is valid. */
export function validateLogo(file: Pick<File, 'type' | 'size'>): string | null {
  if (!LOGO_TYPES.includes(file.type)) return 'Il logo deve essere un file JPG, PNG o WebP.'
  if (file.size > LOGO_MAX_BYTES) return 'Il logo non può superare 1 MB.'

  return null
}

/** Up to two initials, shown when a company has no logo: "Martini Software" → "MS". */
export function initials(name: string) {
  return name
    .split(/\s+/)
    .filter((word) => /^\p{L}/u.test(word))
    .slice(0, 2)
    .map((word) => word[0]!.toUpperCase())
    .join('')
}

/** The website as people read it: "https://www.example.com/" → "example.com". */
export function displayUrl(url: string) {
  return url.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '')
}
