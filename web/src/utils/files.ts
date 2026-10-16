/** Same limits as the API for logos and profile photos. */
export const IMAGE_MAX_BYTES = 1024 * 1024
export const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp']

/** Same limits as the API for CVs (POST /api/candidate-profile/cv). */
export const CV_MAX_BYTES = 5 * 1024 * 1024
export const CV_TYPES = ['application/pdf']

type FileInfo = Pick<File, 'type' | 'size'>

/**
 * Checks an image before uploading it; returns the error message, or null if it is valid.
 *
 * @param subject how the image is called in the message, e.g. "Il logo" or "La foto"
 */
export function validateImage(file: FileInfo, subject: string): string | null {
  if (!IMAGE_TYPES.includes(file.type)) return `${subject} deve essere un file JPG, PNG o WebP.`
  if (file.size > IMAGE_MAX_BYTES) return `${subject} non può superare 1 MB.`

  return null
}

/** Checks a CV before uploading it; returns the error message, or null if it is valid. */
export function validateCv(file: FileInfo): string | null {
  if (!CV_TYPES.includes(file.type)) return 'Il curriculum deve essere un file PDF.'
  if (file.size > CV_MAX_BYTES) return 'Il curriculum non può superare 5 MB.'

  return null
}
