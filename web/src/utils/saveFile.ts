/** Makes the browser save a downloaded file. */
export function saveFile(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const link = Object.assign(document.createElement('a'), { href: url, download: filename })

  link.click()
  URL.revokeObjectURL(url)
}
