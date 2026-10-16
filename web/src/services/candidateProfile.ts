import type { Resource } from '@/types/api'
import type { CandidateProfile, CandidateProfilePayload } from '@/types/candidate'
import { download, http } from './http'

export async function getCandidateProfile() {
  const { data } = await http<Resource<CandidateProfile>>('/candidate-profile')

  return data
}

export async function updateCandidateProfile(payload: CandidateProfilePayload) {
  const { data } = await http<Resource<CandidateProfile>>('/candidate-profile', {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })

  return data
}

async function upload(path: string, field: string, file: File) {
  const body = new FormData()
  body.append(field, file)

  const { data } = await http<Resource<CandidateProfile>>(path, { method: 'POST', body })

  return data
}

async function remove(path: string) {
  const { data } = await http<Resource<CandidateProfile>>(path, { method: 'DELETE' })

  return data
}

export const uploadPhoto = (file: File) => upload('/candidate-profile/photo', 'photo', file)
export const deletePhoto = () => remove('/candidate-profile/photo')

export const uploadCv = (file: File) => upload('/candidate-profile/cv', 'cv', file)
export const deleteCv = () => remove('/candidate-profile/cv')

/** Downloads the candidate's own CV and saves it with its original name. */
export async function downloadCv(fallbackName = 'curriculum.pdf') {
  const { blob, filename } = await download('/candidate-profile/cv')
  const url = URL.createObjectURL(blob)
  const link = Object.assign(document.createElement('a'), {
    href: url,
    download: filename ?? fallbackName,
  })

  link.click()
  URL.revokeObjectURL(url)
}
