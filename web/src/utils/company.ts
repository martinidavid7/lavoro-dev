/** Up to two initials, shown when there is no logo or photo: "Martini Software" → "MS". */
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
